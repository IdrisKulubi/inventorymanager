'use server';

import { revalidatePath } from 'next/cache';
import { inventoryLogs, inventoryItems } from '@/db/schema';
import db from '@/db/drizzle';
import { eq, desc, sql } from 'drizzle-orm';
import { z } from 'zod';

// Validation schema for log creation
const logEntrySchema = z.object({
  itemId: z.number(),
  action: z.enum(['count_adjustment', 'stock_added', 'stock_removed', 'item_created', 'item_updated', 'item_deleted']),
  quantityBefore: z.number().optional(),
  quantityAfter: z.number().optional(),
  valueBefore: z.number().optional(),
  valueAfter: z.number().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  userId: z.string().optional(),
  userName: z.string().optional(),
});

export type LogEntry = z.infer<typeof logEntrySchema>;

// Create a new inventory log entry
export async function createLogEntry(data: LogEntry) {
  try {
    const validatedData = logEntrySchema.parse(data);
    
    // Get current date for date stamp
    const currentDate = new Date();
    const dateStamp = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    
    // Create the log entry
    const result = await db.insert(inventoryLogs).values({
      ...validatedData,
      dateStamp: dateStamp.toISOString(),
    }).returning();
    
    // Revalidate the inventory paths
    revalidatePath('/inventory');
    revalidatePath(`/inventory/${data.itemId}`);
    
    return { success: true, log: result[0] };
  } catch (error) {
    console.error('Error creating log entry:', error);
    return { success: false, error };
  }
}

// Get logs for a specific item
export async function getItemLogs(itemId: number) {
  try {
    const logs = await db.query.inventoryLogs.findMany({
      where: eq(inventoryLogs.itemId, itemId),
      orderBy: [desc(inventoryLogs.timestamp)],
    });
    
    return { success: true, logs };
  } catch (error) {
    console.error('Error getting item logs:', error);
    return { success: false, error };
  }
}

// Get daily logs summary
export async function getDailyLogsSummary(date?: Date) {
  try {
    // Get current date if not provided
    const targetDate = date || new Date();
    const dateString = targetDate.toISOString().split('T')[0];
    
    // Query logs for the specified date
    const logs = await db.execute(
      sql`SELECT 
            il.action, 
            COUNT(*) as count, 
            SUM(CASE WHEN il.value_after > il.value_before THEN il.value_after - il.value_before ELSE 0 END) as value_increase,
            SUM(CASE WHEN il.value_before > il.value_after THEN il.value_before - il.value_after ELSE 0 END) as value_decrease
          FROM 
            inventory_logs il
          WHERE 
            il.date_stamp = ${dateString}
          GROUP BY 
            il.action`
    );
    
    // Get count of items affected
    const itemsAffected = await db.execute(
      sql`SELECT COUNT(DISTINCT item_id) as items_affected
          FROM inventory_logs
          WHERE date_stamp = ${dateString}`
    );
    
    return { 
      success: true, 
      summary: logs.rows,
      itemsAffected: itemsAffected.rows[0]?.items_affected || 0,
      date: dateString
    };
  } catch (error) {
    console.error('Error getting daily logs summary:', error);
    return { success: false, error };
  }
}

// Update inventory count with log
export async function updateInventoryCountWithLog(
  itemId: number, 
  newQuantity: number, 
  reason: string,
  notes?: string,
  userName?: string
) {
  try {
    // Get current item data
    const item = await db.query.inventoryItems.findFirst({
      where: eq(inventoryItems.id, itemId),
    });
    
    if (!item) {
      return { success: false, error: 'Item not found' };
    }
    
    const quantityBefore = item.quantity;
    const stockValue = item.stockValue || 0;
    
    // Calculate new stock value if the cost exists
    const valuePerUnit = item.cost ? item.cost : (item.stockValue && item.quantity ? item.stockValue / item.quantity : 0);
    const newStockValue = valuePerUnit ? Math.round(valuePerUnit * newQuantity) : stockValue;
    
    // Determine action type
    const action = 
      newQuantity > quantityBefore ? 'stock_added' : 
      newQuantity < quantityBefore ? 'stock_removed' : 
      'count_adjustment';
    
    // Update the item
    await db.update(inventoryItems)
      .set({ 
        quantity: newQuantity,
        stockValue: newStockValue
      })
      .where(eq(inventoryItems.id, itemId));
    
    // Create a log entry
    await createLogEntry({
      itemId,
      action,
      quantityBefore,
      quantityAfter: newQuantity,
      valueBefore: stockValue,
      valueAfter: newStockValue,
      reason,
      notes,
      userName
    });
    
    return { success: true, newQuantity, newStockValue };
  } catch (error) {
    console.error('Error updating inventory count:', error);
    return { success: false, error };
  }
}

// Get variance report for a date range
export async function getVarianceReport(startDate: Date, endDate: Date, category?: string) {
  try {
    // Format dates for SQL query
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Build the query based on whether a category filter is provided
    let variancesQuery;
    
    if (category) {
      variancesQuery = sql`WITH daily_changes AS (
            SELECT 
              il.item_id,
              il.date_stamp,
              SUM(CASE WHEN il.action = 'stock_added' THEN il.quantity_after - il.quantity_before ELSE 0 END) as added,
              SUM(CASE WHEN il.action = 'stock_removed' THEN il.quantity_before - il.quantity_after ELSE 0 END) as removed,
              SUM(CASE WHEN il.action = 'count_adjustment' THEN 
                CASE WHEN il.quantity_after > il.quantity_before THEN il.quantity_after - il.quantity_before
                     ELSE il.quantity_before - il.quantity_after END
                ELSE 0 END) as adjusted
            FROM 
              inventory_logs il
            WHERE 
              il.date_stamp BETWEEN ${startDateStr} AND ${endDateStr}
            GROUP BY 
              il.item_id, il.date_stamp
          )
          SELECT 
            i.id,
            i.item_name,
            i.category,
            i.subcategory,
            dc.date_stamp,
            dc.added,
            dc.removed,
            dc.adjusted,
            (dc.added - dc.removed + 
              CASE WHEN dc.adjusted > 0 THEN dc.adjusted ELSE -dc.adjusted END) as daily_variance
          FROM 
            daily_changes dc
          JOIN 
            inventory_items i ON dc.item_id = i.id
          WHERE
            i.category = ${category}
          ORDER BY 
            dc.date_stamp DESC, i.category, i.item_name`;
    } else {
      variancesQuery = sql`WITH daily_changes AS (
            SELECT 
              il.item_id,
              il.date_stamp,
              SUM(CASE WHEN il.action = 'stock_added' THEN il.quantity_after - il.quantity_before ELSE 0 END) as added,
              SUM(CASE WHEN il.action = 'stock_removed' THEN il.quantity_before - il.quantity_after ELSE 0 END) as removed,
              SUM(CASE WHEN il.action = 'count_adjustment' THEN 
                CASE WHEN il.quantity_after > il.quantity_before THEN il.quantity_after - il.quantity_before
                     ELSE il.quantity_before - il.quantity_after END
                ELSE 0 END) as adjusted
            FROM 
              inventory_logs il
            WHERE 
              il.date_stamp BETWEEN ${startDateStr} AND ${endDateStr}
            GROUP BY 
              il.item_id, il.date_stamp
          )
          SELECT 
            i.id,
            i.item_name,
            i.category,
            i.subcategory,
            dc.date_stamp,
            dc.added,
            dc.removed,
            dc.adjusted,
            (dc.added - dc.removed + 
              CASE WHEN dc.adjusted > 0 THEN dc.adjusted ELSE -dc.adjusted END) as daily_variance
          FROM 
            daily_changes dc
          JOIN 
            inventory_items i ON dc.item_id = i.id
          ORDER BY 
            dc.date_stamp DESC, i.category, i.item_name`;
    }
    
    // Execute the query
    const variances = await db.execute(variancesQuery);
    
    return { 
      success: true, 
      variances: variances.rows,
      startDate: startDateStr,
      endDate: endDateStr,
      category
    };
  } catch (error) {
    console.error('Error getting variance report:', error);
    return { success: false, error };
  }
}

// Get statistics for analytics
export async function getInventoryTurnover(period: 'month' | 'quarter' | 'year' = 'month') {
  try {
    // Calculate start date based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
    }
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = now.toISOString().split('T')[0];
    
    // Query for turnover rate (items removed / average inventory)
    const turnoverData = await db.execute(
      sql`WITH daily_inventory AS (
            SELECT 
              il.item_id,
              il.date_stamp,
              LAST_VALUE(il.quantity_after) OVER (
                PARTITION BY il.item_id, il.date_stamp 
                ORDER BY il.timestamp
                RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
              ) as end_day_quantity
            FROM 
              inventory_logs il
            WHERE 
              il.date_stamp BETWEEN ${startDateStr} AND ${endDateStr}
            GROUP BY 
              il.item_id, il.date_stamp, il.timestamp, il.quantity_after
          ),
          item_averages AS (
            SELECT 
              item_id,
              AVG(end_day_quantity) as avg_inventory
            FROM 
              daily_inventory
            GROUP BY 
              item_id
          ),
          item_usage AS (
            SELECT 
              il.item_id,
              SUM(CASE WHEN il.action = 'stock_removed' THEN il.quantity_before - il.quantity_after ELSE 0 END) as total_removed
            FROM 
              inventory_logs il
            WHERE 
              il.date_stamp BETWEEN ${startDateStr} AND ${endDateStr}
            GROUP BY 
              il.item_id
          )
          SELECT 
            i.id,
            i.item_name,
            i.category,
            COALESCE(iu.total_removed, 0) as total_consumed,
            COALESCE(ia.avg_inventory, 0) as average_inventory,
            CASE 
              WHEN COALESCE(ia.avg_inventory, 0) > 0 
              THEN COALESCE(iu.total_removed, 0) / COALESCE(ia.avg_inventory, 1) 
              ELSE 0 
            END as turnover_rate
          FROM 
            inventory_items i
          LEFT JOIN 
            item_averages ia ON i.id = ia.item_id
          LEFT JOIN 
            item_usage iu ON i.id = iu.item_id
          WHERE
            COALESCE(iu.total_removed, 0) > 0
          ORDER BY 
            turnover_rate DESC`
    );
    
    return {
      success: true,
      turnoverData: turnoverData.rows,
      period,
      startDate: startDateStr,
      endDate: endDateStr
    };
    
  } catch (error) {
    console.error('Error getting inventory turnover:', error);
    return { success: false, error };
  }
} 