import db from "@/db/drizzle";
import { inventoryItems } from "@/db/schema";
import { sql } from "drizzle-orm";
import { DashboardCard } from "@/components/inventory/dashboard-card";
import { PageHeader } from "@/components/ui/page-header";
import { AddItemAction, DailyUpdatesAction } from "@/components/action-buttons";

export default async function Home() {
  // Get bakery items count
  const bakeryItems = await db.select({
    count: sql<number>`count(*)`,
  })
  .from(inventoryItems)
  .where(sql`subcategory = 'bakery'`);

  // Get bakery total value
  const bakeryValue = await db.select({
    value: sql<number>`sum(stock_value)`,
  })
  .from(inventoryItems)
  .where(sql`subcategory = 'bakery'`);

  // Get low stock bakery items
  const lowStockResult = await db.execute(sql`
    SELECT COUNT(*) as count FROM inventory_items 
    WHERE quantity <= minimum_stock_level 
    AND minimum_stock_level IS NOT NULL
    AND subcategory = 'bakery'
  `);
  const lowStockCount = Number(lowStockResult.rows[0]?.count || 0);

  // Get stats for stock movement in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  // Get stock added (in)
  const stockInResult = await db.execute(sql`
    SELECT COALESCE(SUM(il.quantity_after - il.quantity_before), 0) as total
    FROM inventory_logs il
    JOIN inventory_items i ON il.item_id = i.id
    WHERE il.action = 'stock_added'
    AND il.date_stamp >= ${thirtyDaysAgoStr}
    AND i.subcategory = 'bakery'
  `);
  const stockIn = Number(stockInResult.rows[0]?.total || 0);

  // Get stock sold
  const stockSoldResult = await db.execute(sql`
    SELECT COALESCE(SUM(il.quantity_before - il.quantity_after), 0) as total
    FROM inventory_logs il
    JOIN inventory_items i ON il.item_id = i.id
    WHERE il.action = 'stock_removed'
    AND il.reason = 'sale'
    AND il.date_stamp >= ${thirtyDaysAgoStr}
    AND i.subcategory = 'bakery'
  `);
  const stockSold = Number(stockSoldResult.rows[0]?.total || 0);

  // Get stock wasted
  const stockWastedResult = await db.execute(sql`
    SELECT COALESCE(SUM(il.quantity_before - il.quantity_after), 0) as total
    FROM inventory_logs il
    JOIN inventory_items i ON il.item_id = i.id
    WHERE il.action = 'stock_removed'
    AND il.reason = 'waste'
    AND il.date_stamp >= ${thirtyDaysAgoStr}
    AND i.subcategory = 'bakery'
  `);
  const stockWasted = Number(stockWastedResult.rows[0]?.total || 0);

  // Calculate sales value and profit
  const salesValueResult = await db.execute(sql`
    SELECT 
      COALESCE(SUM(il.value_before - il.value_after), 0) as cost_value,
      COALESCE(SUM((il.quantity_before - il.quantity_after) * i.selling_price), 0) as selling_value
    FROM inventory_logs il
    JOIN inventory_items i ON il.item_id = i.id
    WHERE il.action = 'stock_removed'
    AND il.reason = 'sale'
    AND il.date_stamp >= ${thirtyDaysAgoStr}
    AND i.subcategory = 'bakery'
  `);
  
  const costValue = Number(salesValueResult.rows[0]?.cost_value || 0);
  const sellingValue = Number(salesValueResult.rows[0]?.selling_value || 0);
  const profit = sellingValue - costValue;

  return (
    <div className="space-y-8 py-8">
      <PageHeader
        title="Bakery Dashboard"
        description="Overview of your bakery inventory status"
        actions={[AddItemAction, DailyUpdatesAction]}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Bakery Items"
          value={bakeryItems[0].count}
          description="Items in bakery inventory"
          icon="🥐"
          href="/inventory/subcategory/bakery"
        />
        <DashboardCard
          title="Total Value"
          value={`Ksh${(bakeryValue[0].value || 0).toLocaleString()}`}
          description="Current bakery inventory value"
          icon="💰"
        />
        <DashboardCard
          title="Low Stock"
          value={lowStockCount}
          description="Items below minimum level"
          variant="destructive"
          icon="⚠️"
          href="/inventory/filter/low-stock"
        />
        <DashboardCard
          title="Daily Updates"
          value="Update"
          description="Daily counts and variance reports"
          variant="default"
          icon="📋"
          href="/inventory/daily-updates"
        />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Last 30 Days Performance</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Stock In"
            value={stockIn}
            description="New items added to inventory"
            icon="📥"
            variant="success"
          />
          <DashboardCard
            title="Stock Sold"
            value={stockSold}
            description="Items sold from inventory"
            icon="🛒"
            variant="default"
            href="/api/reports/sales?format=csv"
          />
          <DashboardCard
            title="Stock Wasted"
            value={stockWasted}
            description="Items discarded or wasted"
            icon="🗑️"
            variant="destructive"
          />
          <DashboardCard
            title="Profit Margin"
            value={`${profit > 0 ? "+" : ""}Ksh${profit.toLocaleString()}`}
            description={`From Ksh${sellingValue.toLocaleString()} sales`}
            icon="📈"
            variant={profit > 0 ? "success" : "destructive"}
            href="/api/reports/sales?format=json"
          />
        </div>
      </div>
      
      {/* Other sections commented out for initial bakery focus
      <div>
        <h3 className="text-lg font-medium mb-4">Categories</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Beer Room"
            value={beerRoomItems[0].count}
            description="Beer room items"
            icon="🍺"
            href="/inventory/category/beer_room"
          />
          <DashboardCard
            title="Chocolate Room"
            value={chocolateRoomItems[0].count}
            description="Chocolate room items"
            icon="🍫"
            href="/inventory/category/chocolate_room"
          />
          <DashboardCard
            title="Kitchen"
            value={kitchenItems[0].count}
            description="Kitchen items"
            icon="🍽️"
            href="/inventory/category/kitchen"
          />
          <DashboardCard
            title="Fixed Assets"
            value={fixedAssets[0].count}
            description="Fixed assets items"
            icon="🏢"
            href="/inventory/category/fixed_assets"
          />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Needs Ordering"
          value={needsOrderingCount}
          description="Items to reorder"
          variant="success"
          icon="🛒"
          href="/inventory/filter/needs-ordering"
        />
        <DashboardCard
          title="Analytics"
          value="View"
          description="Inventory turnover and insights"
          variant="default"
          icon="📊"
          href="/analytics"
        />
      </div>
      */}
    </div>
  );
}