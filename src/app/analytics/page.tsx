import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { InventoryTurnoverView } from "@/components/analytics/inventory-turnover";
import { PageHeader } from "@/components/ui/page-header";
import { AddItemAction } from "@/components/action-buttons";

export const metadata = {
  title: "Inventory Analytics",
  description: "Advanced analytics and insights for your inventory",
};

export default function AnalyticsPage() {
  return (
    <div className="container py-8">
      <PageHeader
        title="Inventory Analytics"
        description="Get insights into inventory performance, usage patterns, and costs"
        breadcrumbs={[
          { label: "Analytics" }
        ]}
        backLink={{
          label: "Back to Dashboard",
          href: "/"
        }}
        actions={[AddItemAction]}
      />
      
      <div className="space-y-6">
        <Tabs defaultValue="turnover" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="turnover">Inventory Turnover</TabsTrigger>
            <TabsTrigger value="cost">Cost Analysis</TabsTrigger>
            <TabsTrigger value="seasonal">Seasonal Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="turnover" className="mt-4">
            <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
              <InventoryTurnoverView />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="cost" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">Cost analysis will be implemented in the next phase.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="seasonal" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">Seasonal trend analysis will be implemented in the next phase.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 