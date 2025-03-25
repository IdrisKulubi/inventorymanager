import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { sql } from "drizzle-orm";

export async function GET(request: Request) {
  const url = new URL(request.url);
  let startDate = url.searchParams.get('startDate');
  
  // Default to 30 days ago if no start date provided
  if (!startDate) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    startDate = thirtyDaysAgo.toISOString().split('T')[0];
  }
  
  try {
    // Get waste data
    const wasteItemsResult = await db.execute(sql`
      SELECT 
        i.id,
        i.item_name as "itemName",
        i.category,
        i.subcategory,
        il.quantity_before - il.quantity_after as quantity,
        (il.value_before - il.value_after) as value,
        il.date_stamp as date,
        il.reason
      FROM 
        inventory_logs il
      JOIN 
        inventory_items i ON il.item_id = i.id
      WHERE 
        il.action = 'stock_removed'
        AND il.reason = 'waste'
        AND il.date_stamp >= ${startDate}
        AND i.subcategory = 'bakery'
      ORDER BY 
        il.date_stamp DESC
    `);
    
    const wasteItems = wasteItemsResult.rows.map(item => ({
      ...item,
      quantity: Number(item.quantity),
      value: Number(item.value || 0)
    }));
    
    // Calculate totals
    const totalQuantity = wasteItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = wasteItems.reduce((sum, item) => sum + item.value, 0);
    
    return NextResponse.json({
      success: true,
      wasteItems,
      summary: {
        totalQuantity,
        totalValue
      }
    });
  } catch (error) {
    console.error("Error fetching waste data:", error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
} 