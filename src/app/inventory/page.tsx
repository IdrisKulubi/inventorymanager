import { Suspense } from "react";
import { getInventoryStats } from "@/lib/actions/inventory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardCard } from "@/components/inventory/dashboard-card";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { SearchInventory } from "@/components/inventory/search-inventory";
import { PageHeader } from "@/components/ui/page-header";
import { AddItemAction, DailyUpdatesAction } from "@/components/action-buttons";

// Loading component for Suspense
function InventoryStatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array(8).fill(0).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Stats component with server data fetching
async function InventoryStats() {
  const stats = await getInventoryStats();
  
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Items"
          value={stats.totalItems}
          description="Items in inventory"
          icon="📦"
          href="/inventory"
        />
        <DashboardCard
          title="Low Stock"
          value={stats.lowStock}
          description="Items below minimum level"
          variant="destructive"
          icon="⚠️"
          href="/inventory/filter/low-stock"
        />
        <DashboardCard
          title="Expiring Soon"
          value={stats.expiringSoon}
          description="Items expiring in 7 days"
          variant="warning"
          icon="⏱️"
          href="/inventory/filter/expiring"
        />
        <DashboardCard
          title="Needs Ordering"
          value={stats.needsOrdering}
          description="Items to reorder"
          variant="success"
          icon="🛒"
          href="/inventory/filter/needs-ordering"
        />
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Categories</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Beer Room"
            value={stats.categoryBreakdown.beerRoom}
            description="Beer room items"
            icon="🍺"
            href="/inventory/category/beer_room"
          />
          <DashboardCard
            title="Chocolate Room"
            value={stats.categoryBreakdown.chocolateRoom}
            description="Chocolate room items"
            icon="🍫"
            href="/inventory/category/chocolate_room"
          />
          <DashboardCard
            title="Kitchen"
            value={stats.categoryBreakdown.kitchen}
            description="Kitchen items"
            icon="🍽️"
            href="/inventory/category/kitchen"
          />
          <DashboardCard
            title="Fixed Assets"
            value={stats.categoryBreakdown.fixedAssets}
            description="Fixed assets items"
            icon="🏢"
            href="/inventory/category/fixed_assets"
          />
        </div>
      </div>
    </>
  );
}

export default function InventoryPage() {
  return (
    <div className="container py-8 space-y-8">
      <PageHeader
        title="Inventory Dashboard"
        description="Manage and monitor your inventory across all categories"
        breadcrumbs={[
          { label: "Inventory" }
        ]}
        actions={[AddItemAction, DailyUpdatesAction]}
      />
      
      <Suspense fallback={<InventoryStatsLoading />}>
        <InventoryStats />
      </Suspense>
      
      <Tabs defaultValue="all" className="mt-8">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="beer_room">Beer Room</TabsTrigger>
          <TabsTrigger value="chocolate_room">Chocolate Room</TabsTrigger>
          <TabsTrigger value="kitchen">Kitchen</TabsTrigger>
          <TabsTrigger value="fixed_assets">Fixed Assets</TabsTrigger>
        </TabsList>
        
        {["all", "beer_room", "chocolate_room", "kitchen", "fixed_assets"].map((category) => (
          <TabsContent key={category} value={category}>
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>{category === "all" ? "All Items" : 
                      category.split("_").map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(" ")
                    }</CardTitle>
                    <CardDescription>
                      {category === "all" 
                        ? "View and manage all inventory items" 
                        : `View and manage items in the ${category.replace(/_/g, " ")} category`}
                    </CardDescription>
                  </div>
                  <div className="w-full md:w-auto">
                    <Suspense fallback={<Skeleton className="h-10 w-[250px]" />}>
                      <SearchInventory category={category === "all" ? undefined : category} />
                    </Suspense>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Suspense 
                  fallback={
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  }
                >
                  <CategoryInventory category={category === "all" ? undefined : category} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// Category-specific inventory component with server data fetching
async function CategoryInventory({ category }: { category?: string }) {
  const { getInventoryItems } = await import("@/lib/actions/inventory");
  const items = await getInventoryItems(category);
  
  return (
    <div>
      <InventoryTable items={items} />
    </div>
  );
} 