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
      {Array(4).fill(0).map((_, i) => (
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

// Stats component with server data fetching - all categories
async function InventoryStats() {
  const stats = await getInventoryStats();
  
  // Extract stats for all categories
  const bakeryItems = stats.subcategoryBreakdown?.bakery || 0;
  const barItems = stats.subcategoryBreakdown?.bar || 0;
  const kitchenItems = stats.subcategoryBreakdown?.kitchen || 0;
  const merchandiseItems = stats.subcategoryBreakdown?.merchandise || 0;
  
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Items"
          value={stats.totalItems}
          description="Items across all categories"
          icon="📊"
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
            title="Bakery"
            value={bakeryItems}
            description="Bakery items"
            icon="🥐"
            href="/dashboard/bakery"
          />
          <DashboardCard
            title="Bar"
            value={barItems}
            description="Bar items"
            icon="🍺"
            href="/dashboard/bar"
          />
          <DashboardCard
            title="Kitchen"
            value={kitchenItems}
            description="Kitchen items"
            icon="🍳"
            href="/dashboard/kitchen"
          />
          <DashboardCard
            title="Merchandise"
            value={merchandiseItems}
            description="Merchandise items"
            icon="🛍️"
            href="/dashboard/merchandise"
          />
        </div>
      </div>
    </>
  );
}

export default async function InventoryPage({
  searchParams
}: {
  searchParams: { subcategory?: string }
}) {
  // Next.js 15 requires awaiting searchParams before use
  await searchParams;
  
  // Show content for all categories
  const pageTitle = "Inventory Management";
  const pageDescription = "Manage inventory across all departments";

  return (
    <div className="container py-8 space-y-8">
      <PageHeader
        title={pageTitle}
        description={pageDescription}
        breadcrumbs={[
          { label: "Inventory", href: "/inventory" }
        ]}
        actions={[AddItemAction, DailyUpdatesAction]}
      />
      
      <Suspense fallback={<InventoryStatsLoading />}>
        <InventoryStats />
      </Suspense>
      
      <Tabs defaultValue="bakery" className="mt-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bakery">Bakery</TabsTrigger>
          <TabsTrigger value="bar">Bar</TabsTrigger>
          <TabsTrigger value="kitchen">Kitchen</TabsTrigger>
          <TabsTrigger value="merchandise">Merchandise</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bakery">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Bakery Items</CardTitle>
                  <CardDescription>
                    Manage items in the bakery subcategory
                  </CardDescription>
                </div>
                <div className="w-full md:w-auto">
                  <Suspense fallback={<Skeleton className="h-10 w-[250px]" />}>
                    <SearchInventory subcategory="bakery" />
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
                <SubcategoryInventory subcategory="bakery" />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bar">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Bar Items</CardTitle>
                  <CardDescription>
                    Manage beer, wine, spirits, and other bar items
                  </CardDescription>
                </div>
                <div className="w-full md:w-auto">
                  <Suspense fallback={<Skeleton className="h-10 w-[250px]" />}>
                    <SearchInventory subcategory="beer" />
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
                <BarInventory />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="kitchen">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Kitchen Items</CardTitle>
                  <CardDescription>
                    Manage kitchen supplies, utensils, and ingredients
                  </CardDescription>
                </div>
                <div className="w-full md:w-auto">
                  <Suspense fallback={<Skeleton className="h-10 w-[250px]" />}>
                    <SearchInventory subcategory="other_kitchen" />
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
                <KitchenInventory />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="merchandise">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Merchandise Items</CardTitle>
                  <CardDescription>
                    Manage branded merchandise, retail items, and equipment
                  </CardDescription>
                </div>
                <div className="w-full md:w-auto">
                  <Suspense fallback={<Skeleton className="h-10 w-[250px]" />}>
                    <SearchInventory subcategory="merchandise" />
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
                <MerchandiseInventory />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Subcategory-specific inventory component with server data fetching
async function SubcategoryInventory({ subcategory }: { subcategory: string }) {
  const { getInventoryItemsBySubcategory } = await import("@/lib/actions/inventory");
  const items = await getInventoryItemsBySubcategory(subcategory);
  
  return (
    <div>
      <InventoryTable items={items} />
    </div>
  );
}

// Bar inventory component - handles multiple bar-related subcategories
async function BarInventory() {
  const { getInventoryItemsBySection } = await import("@/lib/actions/inventory");
  const items = await getInventoryItemsBySection('bar');
  
  return (
    <div>
      <InventoryTable items={items} />
    </div>
  );
}

// Merchandise inventory component
async function MerchandiseInventory() {
  const { getInventoryItemsBySection } = await import("@/lib/actions/inventory");
  const items = await getInventoryItemsBySection('merchandise');
  
  return (
    <div>
      <InventoryTable items={items} />
    </div>
  );
}

// Kitchen inventory component
async function KitchenInventory() {
  const { getInventoryItemsBySection } = await import("@/lib/actions/inventory");
  const items = await getInventoryItemsBySection('kitchen');
  
  return (
    <div>
      <InventoryTable items={items} />
    </div>
  );
} 