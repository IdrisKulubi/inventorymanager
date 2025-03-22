import db from "@/db/drizzle";
import { inventoryItems } from "@/db/schema";
import { sql } from "drizzle-orm";
import { addDays } from "date-fns";
import { DashboardCard } from "@/components/inventory/dashboard-card";


export default async function Home() {
  // Get total items
  const totalItems = await db.select({
    count: sql<number>`count(*)`,
  }).from(inventoryItems);

  // Get total value
  const totalValue = await db.select({
    value: sql<number>`sum(stock_value)`,
  }).from(inventoryItems);

  // Get low stock items with improved query
  const lowStockResult = await db.execute(sql`
    SELECT COUNT(*) as count FROM inventory_items 
    WHERE quantity <= minimum_stock_level 
    AND minimum_stock_level IS NOT NULL
  `);
  const lowStockCount = Number(lowStockResult.rows[0]?.count || 0);

  // Get needs ordering items
  const needsOrderingResult = await db.execute(sql`
    SELECT COUNT(*) as count FROM inventory_items 
    WHERE order_quantity > 0 
    AND quantity <= minimum_stock_level
    AND minimum_stock_level IS NOT NULL
  `);
  const needsOrderingCount = Number(needsOrderingResult.rows[0]?.count || 0);

  // Get expiring soon items
  const sevenDaysFromNow = addDays(new Date(), 7);
  const expiringSoon = await db.select({
    count: sql<number>`count(*)`,
  })
  .from(inventoryItems)
  .where(sql`expiry_date <= ${sevenDaysFromNow} AND expiry_date >= CURRENT_DATE`);

  // Get category counts
  const beerRoomItems = await db.select({
    count: sql<number>`count(*)`,
  })
  .from(inventoryItems)
  .where(sql`category = 'beer_room'`);

  const chocolateRoomItems = await db.select({
    count: sql<number>`count(*)`,
  })
  .from(inventoryItems)
  .where(sql`category = 'chocolate_room'`);

  const kitchenItems = await db.select({
    count: sql<number>`count(*)`,
  })
  .from(inventoryItems)
  .where(sql`category = 'kitchen'`);

  const fixedAssets = await db.select({
    count: sql<number>`count(*)`,
  })
  .from(inventoryItems)
  .where(sql`category = 'fixed_assets'`);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your inventory status
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Items"
          value={totalItems[0].count}
          description="Items in inventory"
          icon="📦"
          href="/inventory"
        />
        <DashboardCard
          title="Total Value"
          value={`$${(totalValue[0].value || 0).toLocaleString()}`}
          description="Current inventory value"
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
          title="Expiring Soon"
          value={expiringSoon[0].count}
          description="Items expiring in 7 days"
          variant="warning"
          icon="⏱️"
          href="/inventory/filter/expiring"
        />
      </div>

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
          title="Daily Updates"
          value="Track"
          description="Daily counts and variance reports"
          variant="default"
          icon="📋"
          href="/inventory/daily-updates"
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
    </div>
  );
}