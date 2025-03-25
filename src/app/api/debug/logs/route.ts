import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    // Get recent logs for debugging
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    // Query all log data
    const allLogs = await db.execute(sql`
      SELECT 
        il.*,
        i.item_name,
        i.subcategory,
        i.category
      FROM 
        inventory_logs il
      JOIN 
        inventory_items i ON il.item_id = i.id
      WHERE 
        il.date_stamp >= ${thirtyDaysAgoStr}
      ORDER BY 
        il.timestamp DESC
      LIMIT 50
    `);

    // Get stock added logs specifically
    const stockAddedLogs = await db.execute(sql`
      SELECT 
        il.*,
        i.item_name,
        i.subcategory,
        i.category
      FROM 
        inventory_logs il
      JOIN 
        inventory_items i ON il.item_id = i.id
      WHERE 
        il.action = 'stock_added'
        AND i.subcategory = 'bakery'
        AND il.date_stamp >= ${thirtyDaysAgoStr}
      ORDER BY 
        il.timestamp DESC
    `);

    // Calculate stock in sum
    const stockInSummary = await db.execute(sql`
      SELECT 
        COALESCE(SUM(il.quantity_after - il.quantity_before), 0) as total,
        COUNT(*) as count
      FROM 
        inventory_logs il
      JOIN 
        inventory_items i ON il.item_id = i.id
      WHERE 
        il.action = 'stock_added'
        AND i.subcategory = 'bakery'
        AND il.date_stamp >= ${thirtyDaysAgoStr}
    `);

    return NextResponse.json({ 
      success: true,
      summary: stockInSummary.rows,
      stockAddedLogs: stockAddedLogs.rows,
      recentLogs: allLogs.rows,
      thirtyDaysAgo: thirtyDaysAgoStr
    });
  } catch (error) {
    console.error("Error in debug logs API:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
} 