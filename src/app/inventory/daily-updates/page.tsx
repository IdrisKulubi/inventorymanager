import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDailyLogsSummary } from "@/lib/actions/logs";
import { getInventoryItems } from "@/lib/actions/inventory";
import { format } from "date-fns";
import { PageHeader } from "@/components/ui/page-header";
import { AddItemAction } from "@/components/action-buttons";
import Link from "next/link";
import { VarianceReport } from "@/components/inventory/variance-report";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Daily Inventory Updates",
  description: "Manage daily inventory counts and view stock variance",
};

async function DailySummaryCard() {
  const today = new Date();
  const summary = await getDailyLogsSummary(today);
  
  if (!summary.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error loading data</p>
        </CardContent>
      </Card>
    );
  }
  
  // Safely type and access the summary data
  const itemsAffected = typeof summary.itemsAffected === 'number' ? summary.itemsAffected : 0;
  
  // Define proper type for summary data
  interface SummaryItem {
    action: string;
    count: number;
    value_increase?: number;
    value_decrease?: number;
  }
  
  // Safely convert summary data to the correct type
  const summaryData: SummaryItem[] = Array.isArray(summary.summary) 
    ? summary.summary.map(item => ({
        action: String(item.action || ''),
        count: Number(item.count || 0),
        value_increase: typeof item.value_increase === 'number' ? item.value_increase : 0,
        value_decrease: typeof item.value_decrease === 'number' ? item.value_decrease : 0
      }))
    : [];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&pos;s Activity - {format(today, 'MMMM d, yyyy')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Items Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{itemsAffected}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Count Adjustments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryData.find(item => item.action === 'count_adjustment')?.count || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Stock Added</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {summaryData.find(item => item.action === 'stock_added')?.count || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Stock Removed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {summaryData.find(item => item.action === 'stock_removed')?.count || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}

async function CategoryCountsGrid({ category }: { category: string }) {
  const items = await getInventoryItems(category === 'all' ? undefined : category);
  
  if (!items || items.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-lg font-medium">No items found</p>
        <p className="text-sm text-muted-foreground">Try selecting a different category</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card key={item.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">{item.itemName}</CardTitle>
            <p className="text-sm text-muted-foreground">{item.subcategory?.replace(/_/g, ' ')}</p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold">{item.quantity}</div>
                <p className="text-sm text-muted-foreground">{item.unit}</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={`/inventory/${item.id}?tab=count`}>Update Count</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function DailyUpdatesPage() {
  return (
    <div className="container py-8">
      <PageHeader
        title="Daily Inventory Updates"
        description="Track daily counts, view stock history, and generate variance reports"
        breadcrumbs={[
          { label: "Inventory", href: "/inventory" },
          { label: "Daily Updates" },
        ]}
        actions={[AddItemAction]}
        backLink={{
          label: "Back to Inventory",
          href: "/inventory"
        }}
      />
      
      <div className="space-y-6">
        <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
          <DailySummaryCard />
        </Suspense>
        
        <Tabs defaultValue="variance" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="variance">Variance Report</TabsTrigger>
            <TabsTrigger value="counts">Daily Counts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="variance" className="mt-4">
            <VarianceReport />
          </TabsContent>
          
          <TabsContent value="counts" className="mt-4">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="beer_room">Beer Room</TabsTrigger>
                <TabsTrigger value="chocolate_room">Chocolate Room</TabsTrigger>
                <TabsTrigger value="kitchen">Kitchen</TabsTrigger>
                <TabsTrigger value="fixed_assets">Fixed Assets</TabsTrigger>
              </TabsList>
              
              {["all", "beer_room", "chocolate_room", "kitchen", "fixed_assets"].map((category) => (
                <TabsContent key={category} value={category} className="mt-4">
                  <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                    <CategoryCountsGrid category={category} />
                  </Suspense>
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 