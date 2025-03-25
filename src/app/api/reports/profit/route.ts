import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { sql } from "drizzle-orm";
import { format } from "date-fns";

export async function GET(request: Request) {
  const url = new URL(request.url);
  let startDate = url.searchParams.get('startDate');
  const exportFormat = url.searchParams.get('format') || 'json';
  
  // Default to 30 days ago if no start date provided
  if (!startDate) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    startDate = thirtyDaysAgo.toISOString().split('T')[0];
  }

  try {
    // Get profit data by item
    const profitDataResult = await db.execute(sql`
      SELECT 
        i.id,
        i.item_name as "itemName",
        i.category,
        i.subcategory,
        SUM(il.quantity_before - il.quantity_after) as quantity_sold,
        SUM(il.value_before - il.value_after) as cost_value,
        SUM((il.quantity_before - il.quantity_after) * i.selling_price) as selling_value,
        (SUM((il.quantity_before - il.quantity_after) * i.selling_price) - SUM(il.value_before - il.value_after)) as profit,
        CASE 
          WHEN SUM(il.value_before - il.value_after) > 0 
          THEN ((SUM((il.quantity_before - il.quantity_after) * i.selling_price) - SUM(il.value_before - il.value_after)) / SUM(il.value_before - il.value_after)) * 100 
          ELSE 0 
        END as profit_margin
      FROM 
        inventory_logs il
      JOIN 
        inventory_items i ON il.item_id = i.id
      WHERE 
        il.action = 'stock_removed'
        AND il.reason = 'sale'
        AND il.date_stamp >= ${startDate}
        AND i.subcategory = 'bakery'
      GROUP BY 
        i.id, i.item_name, i.category, i.subcategory
      ORDER BY 
        profit DESC
    `);
    
    // Process results to ensure proper number formatting
    const profitData = profitDataResult.rows.map(item => ({
      ...item,
      quantity_sold: Number(item.quantity_sold || 0),
      cost_value: Number(item.cost_value || 0),
      selling_value: Number(item.selling_value || 0),
      profit: Number(item.profit || 0),
      profit_margin: Number(item.profit_margin || 0)
    }));

    // Calculate overall totals
    const totalQuantitySold = profitData.reduce((sum, item) => sum + item.quantity_sold, 0);
    const totalCostValue = profitData.reduce((sum, item) => sum + item.cost_value, 0);
    const totalSellingValue = profitData.reduce((sum, item) => sum + item.selling_value, 0);
    const totalProfit = profitData.reduce((sum, item) => sum + item.profit, 0);
    const overallProfitMargin = totalCostValue > 0 ? (totalProfit / totalCostValue) * 100 : 0;

    // Format the response based on the requested export format
    if (exportFormat === 'csv') {
      // Create CSV content
      const csvRows = [
        ['Item ID', 'Item Name', 'Category', 'Subcategory', 'Quantity Sold', 'Cost Value (Ksh)', 'Selling Value (Ksh)', 'Profit (Ksh)', 'Profit Margin (%)'],
        ...profitData.map(item => [
          item.id,
          item.itemName,
          item.category || 'N/A',
          item.subcategory || 'N/A',
          item.quantity_sold,
          item.cost_value.toFixed(2),
          item.selling_value.toFixed(2),
          item.profit.toFixed(2),
          item.profit_margin.toFixed(2)
        ]),
        // Add a summary row
        ['', 'TOTALS', '', '', totalQuantitySold, totalCostValue.toFixed(2), totalSellingValue.toFixed(2), totalProfit.toFixed(2), overallProfitMargin.toFixed(2)]
      ];

      const csvContent = csvRows
        .map(row => row.map(cell => typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell).join(','))
        .join('\n');

      // Return CSV response
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="profit-report-${format(new Date(), 'yyyy-MM-dd')}.csv"`
        }
      });
    } else if (exportFormat === 'excel') {
      // For Excel, we'll send a more complex CSV that Excel can parse well
      const excelRows = [
        ['Profit Report', '', '', '', '', '', '', ''],
        [`Generated on: ${format(new Date(), 'MMM d, yyyy')}`, '', '', '', '', '', '', ''],
        ['Period:', `From ${format(new Date(startDate), 'MMM d, yyyy')} to ${format(new Date(), 'MMM d, yyyy')}`, '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['Item ID', 'Item Name', 'Category', 'Subcategory', 'Quantity Sold', 'Cost Value (Ksh)', 'Selling Value (Ksh)', 'Profit (Ksh)', 'Profit Margin (%)'],
        ...profitData.map(item => [
          item.id,
          item.itemName,
          item.category || 'N/A',
          item.subcategory || 'N/A',
          item.quantity_sold,
          item.cost_value.toFixed(2),
          item.selling_value.toFixed(2),
          item.profit.toFixed(2),
          `${item.profit_margin.toFixed(2)}%`
        ]),
        ['', '', '', '', '', '', '', ''],
        ['', 'SUMMARY', '', '', '', '', '', ''],
        ['', 'Total Items Sold:', totalQuantitySold, '', '', '', '', ''],
        ['', 'Total Cost Value:', `Ksh ${totalCostValue.toFixed(2)}`, '', '', '', '', ''],
        ['', 'Total Selling Value:', `Ksh ${totalSellingValue.toFixed(2)}`, '', '', '', '', ''],
        ['', 'Total Profit:', `Ksh ${totalProfit.toFixed(2)}`, '', '', '', '', ''],
        ['', 'Overall Profit Margin:', `${overallProfitMargin.toFixed(2)}%`, '', '', '', '', '']
      ];

      const excelContent = excelRows
        .map(row => row.map(cell => typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell).join(','))
        .join('\n');

      // Return Excel CSV response
      return new NextResponse(excelContent, {
        headers: {
          'Content-Type': 'application/vnd.ms-excel',
          'Content-Disposition': `attachment; filename="profit-report-${format(new Date(), 'yyyy-MM-dd')}.xls"`
        }
      });
    } else {
      // Return JSON response
      return NextResponse.json({
        success: true,
        period: {
          startDate,
          endDate: format(new Date(), 'yyyy-MM-dd')
        },
        items: profitData,
        summary: {
          totalItems: profitData.length,
          totalQuantitySold,
          totalCostValue,
          totalSellingValue,
          totalProfit,
          overallProfitMargin
        }
      });
    }
  } catch (error) {
    console.error("Error generating profit report:", error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
} 