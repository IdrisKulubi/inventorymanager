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

// Stats component with server data fetching - bakery only
async function InventoryStats() {
  const stats = await getInventoryStats();
  
  // Extract bakery stats or set to 0 if unavailable
  const bakeryItems = stats.subcategoryBreakdown?.bakery || 0;
  
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Bakery Items"
          value={bakeryItems}
          description="Items in bakery inventory"
          icon="🥐"
          href="/inventory/subcategory/bakery"
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
        <div className="grid gap-4 md:grid-cols-1">
          <DashboardCard
            title="Bakery"
            value={bakeryItems}
            description="Bakery items"
            icon="🥐"
            href="/inventory/subcategory/bakery"
          />
          {/* Other categories removed to focus only on bakery */}
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
  
  // Always show bakery-focused content
  const pageTitle = "Bakery Items";
  const pageDescription = "Manage your bakery inventory";

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
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="bakery">Bakery</TabsTrigger>
        </TabsList>
        
        {/* Only bakery tab content */}
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