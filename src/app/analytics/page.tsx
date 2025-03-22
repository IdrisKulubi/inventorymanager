import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { InventoryTurnoverView } from "@/components/analytics/inventory-turnover";

export const metadata = {
  title: "Inventory Analytics",
  description: "Advanced analytics and insights for your inventory",
};

export default function AnalyticsPage() {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Inventory Analytics</h1>
        <p className="text-muted-foreground">
          Get insights into inventory performance, usage patterns, and costs
        </p>
      </div>
      
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