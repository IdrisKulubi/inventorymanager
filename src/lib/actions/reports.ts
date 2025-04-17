/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import db from "@/db/drizzle";
import { inventoryItems, inventoryLogs } from "@/db/schema";
import { and, eq, desc, between, inArray } from "drizzle-orm";

// Interface for stock report item
interface StockReportItem {
  id: number;
  name: string;
  subcategory: string;
  stock: number;
  sales: number;
  waste: number;
  balance: number;
}

// Interface for report parameters
interface ReportParams {
  category?: string;
  subcategory?: string;
  startDate?: string;
  endDate?: string;
}


export async function getStockReport(params: ReportParams) {
  try {
    // Create a query to get inventory items
    const query = db.select().from(inventoryItems);
    
    // Apply category filter if provided
    if (params.category) {
      query.where(eq(inventoryItems.category, params.category as any));
    }
    
    // Apply subcategory filter if provided
    if (params.subcategory) {
      query.where(eq(inventoryItems.subcategory, params.subcategory as any));
    }
    
    // Get inventory items that match the criteria
    const items = await query;
    
    // Calculate time period for logs (default to last 30 days if not specified)
    const endDate = params.endDate ? new Date(params.endDate) : new Date();
    const startDate = params.startDate ? new Date(params.startDate) : new Date(endDate);
    startDate.setDate(startDate.getDate() - 30); // Default to 30 days if no startDate
    
    // Get all logs for these items in the time period
    const itemIds = items.map(item => item.id);
    const logs = itemIds.length > 0 ? await db.select()
      .from(inventoryLogs)
      .where(
        and(
          // Use inArray for the list of item IDs
          inArray(inventoryLogs.itemId, itemIds),
          between(inventoryLogs.dateStamp, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0])
        )
      )
      .orderBy(desc(inventoryLogs.timestamp)) : [];
    
    // Process the data to create the report
    const reportItems: StockReportItem[] = items.map(item => {
      // Filter logs for this specific item
      const itemLogs = logs.filter(log => log.itemId === item.id);
      
      // Calculate sales from 'stock_removed' logs
      const sales = itemLogs
        .filter(log => log.action === 'stock_removed')
        .reduce((total, log) => {
          const change = log.quantityBefore !== null && log.quantityAfter !== null 
            ? log.quantityBefore - log.quantityAfter 
            : 0;
          return total + change;
        }, 0);
      
      // Calculate waste from 'count_adjustment' logs with a negative adjustment
      const waste = itemLogs
        .filter(log => log.action === 'count_adjustment' && 
                      log.quantityAfter !== null && 
                      log.quantityBefore !== null && 
                      log.quantityAfter < log.quantityBefore)
        .reduce((total, log) => {
          const change = log.quantityBefore !== null && log.quantityAfter !== null
            ? log.quantityBefore - log.quantityAfter
            : 0;
          return total + change;
        }, 0);
      
      // Calculate initial stock (current + sales + waste)
      const initialStock = item.quantity + sales + waste;
      
      return {
        id: item.id,
        name: item.itemName,
        subcategory: item.subcategory,
        stock: initialStock,
        sales,
        waste,
        balance: item.quantity
      };
    });
    
    return {
      success: true,
      items: reportItems,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  } catch (error) {
    console.error("Error generating stock report:", error);
    return { 
      success: false, 
      error: "Failed to generate stock report",
      items: []
    };
  }
}

/**
 * Get sales report data
 * Computes revenue, profit, and profit margin based on item costs and selling prices
 */
export async function getSalesReport(params: ReportParams) {
  try {
    // Create a query to get inventory items
    const query = db.select().from(inventoryItems);
    
    // Apply category filter if provided
    if (params.category) {
      query.where(eq(inventoryItems.category, params.category as any));
    }
    
    // Apply subcategory filter if provided
    if (params.subcategory) {
      query.where(eq(inventoryItems.subcategory, params.subcategory as any));
    }
    
    // Get inventory items that match the criteria
    const items = await query;
    
    // Calculate time period for logs (default to last 30 days if not specified)
    const endDate = params.endDate ? new Date(params.endDate) : new Date();
    const startDate = params.startDate ? new Date(params.startDate) : new Date(endDate);
    startDate.setDate(startDate.getDate() - 30); // Default to 30 days if no startDate
    
    // Get all logs for these items in the time period
    const itemIds = items.map(item => item.id);
    const logs = itemIds.length > 0 ? await db.select()
      .from(inventoryLogs)
      .where(
        and(
          // Use inArray for the list of item IDs
          inArray(inventoryLogs.itemId, itemIds),
          eq(inventoryLogs.action, 'stock_removed'),
          between(inventoryLogs.dateStamp, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0])
        )
      )
      .orderBy(desc(inventoryLogs.timestamp)) : [];
    
    // Process the data to create the report
    const reportItems = items.map(item => {
      // Filter logs for this specific item
      const itemLogs = logs.filter(log => log.itemId === item.id);
      
      // Calculate quantity sold from 'stock_removed' logs
      const quantitySold = itemLogs.reduce((total, log) => {
        const change = log.quantityBefore !== null && log.quantityAfter !== null 
          ? log.quantityBefore - log.quantityAfter 
          : 0;
        return total + change;
      }, 0);
      
      // Calculate revenue and profit
      const price = item.sellingPrice || 0;
      const cost = item.cost || 0;
      const revenue = price * quantitySold;
      const profit = revenue - (cost * quantitySold);
      const profitMargin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
      
      return {
        id: item.id,
        name: item.itemName,
        subcategory: item.subcategory,
        subtype: item.subcategory, // Use subcategory as subtype for consistency
        price,
        cost,
        quantitySold,
        revenue,
        profit,
        profitMargin
      };
    });
    
    // Calculate summary statistics
    const totalSales = reportItems.reduce((sum, item) => sum + item.revenue, 0);
    const totalItems = reportItems.reduce((sum, item) => sum + item.quantitySold, 0);
    const averagePrice = totalItems > 0 ? Math.round(totalSales / totalItems) : 0;
    
    // Find top selling item
    const topItem = reportItems.length > 0 
      ? reportItems.reduce((max, item) => item.quantitySold > max.quantitySold ? item : max, reportItems[0])
      : null;
    
    return {
      success: true,
      items: reportItems,
      summary: {
        totalSales,
        totalItems,
        averagePrice,
        topItem: topItem ? {
          name: topItem.name,
          quantity: topItem.quantitySold,
          revenue: topItem.revenue
        } : null
      },
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  } catch (error) {
    console.error("Error generating sales report:", error);
    return { 
      success: false, 
      error: "Failed to generate sales report",
      items: [],
      summary: {
        totalSales: 0,
        totalItems: 0,
        averagePrice: 0,
        topItem: null
      }
    };
  }
} 