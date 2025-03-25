import { NextRequest, NextResponse } from "next/server";
import db from "@/db/drizzle";
import { sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];
    const format = searchParams.get('format') || 'csv'; // csv or json
    
    // Query for sales data
    const salesData = await db.execute(sql`
      WITH sales_data AS (
        SELECT 
          i.id,
          i.item_name,
          i.subcategory,
          il.date_stamp,
          il.quantity_before - il.quantity_after as quantity_sold,
          (il.quantity_before - il.quantity_after) * i.cost as cost_value,
          (il.quantity_before - il.quantity_after) * COALESCE(i.selling_price, 0) as selling_value
        FROM 
          inventory_logs il
        JOIN 
          inventory_items i ON il.item_id = i.id
        WHERE 
          il.action = 'stock_removed'
          AND il.reason = 'sale'
          AND il.date_stamp BETWEEN ${startDate} AND ${endDate}
          AND i.subcategory = 'bakery'
      )
      SELECT 
        item_name,
        subcategory,
        date_stamp,
        SUM(quantity_sold) as total_sold,
        SUM(cost_value) as total_cost,
        SUM(selling_value) as total_revenue,
        SUM(selling_value - cost_value) as profit
      FROM 
        sales_data
      GROUP BY 
        item_name, subcategory, date_stamp
      ORDER BY 
        date_stamp DESC, item_name
    `);

    // Format the data
    if (format === 'json') {
      return NextResponse.json({ 
        success: true, 
        data: salesData.rows,
        startDate,
        endDate
      });
    } else {
      // Create CSV content
      const rows = salesData.rows;
      const headers = ['item_name', 'subcategory', 'date_stamp', 'total_sold', 'total_cost', 'total_revenue', 'profit'];
      const csvContent = [
        headers.join(','),
        ...rows.map(row => 
          headers.map(header => {
            const value = row[header];
            // Handle strings with commas by quoting them
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      // Return CSV response
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="bakery-sales-${startDate}-to-${endDate}.csv"`
        }
      });
    }
  } catch (error) {
    console.error('Error generating sales report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate sales report' },
      { status: 500 }
    );
  }
} 