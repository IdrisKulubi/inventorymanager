import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { SearchInventory } from "@/components/inventory/search-inventory";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { AddItemAction, DailyUpdatesAction } from "@/components/action-buttons";

interface SubcategoryPageProps {
  params: {
    subcategory: string;
  };
  searchParams: {
    search?: string;
    expiring?: string;
    lowStock?: string;
  };
}

export default async function SubcategoryPage({
  params,
  searchParams,
}: SubcategoryPageProps) {
  // Properly await both params and searchParams
  const awaitedParams = await params;
  const awaitedSearchParams = await searchParams;
  
  const subcategory = awaitedParams.subcategory;
  const search = awaitedSearchParams.search;
  const expiring = awaitedSearchParams.expiring;
  const lowStock = awaitedSearchParams.lowStock;
  
  try {
    // Get items by subcategory
    const { getInventoryItemsBySubcategory } = await import("@/lib/actions/inventory");
    let items = await getInventoryItemsBySubcategory(subcategory, search);
    
    // Apply filters if specified
    if (expiring === "true") {
      items = items.filter(item => item.expiryStatus === "expiring_soon" || item.expiryStatus === "expired");
    }
    
    if (lowStock === "true") {
      items = items.filter(item => item.quantity <= (item.minimumStockLevel || 0));
    }
    
    // Format subcategory for display
    const formattedSubcategory = subcategory
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    
    // Apply filters if specified
    let filterDescription = "";
    if (expiring === "true") {
      filterDescription = "Expiring items in ";
    } else if (lowStock === "true") {
      filterDescription = "Low stock items in ";
    }
    
    return (
      <div className="container py-8 space-y-6">
        <PageHeader
          title={`${formattedSubcategory} Items`}
          description={`${filterDescription}${formattedSubcategory.toLowerCase()} subcategory`}
          breadcrumbs={[
            { label: "Inventory", href: "/inventory" },
            { label: formattedSubcategory }
          ]}
          actions={[AddItemAction, DailyUpdatesAction]}
        />
        
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {formattedSubcategory} Items
                  {expiring === "true" && (
                    <Badge variant="warning">Expiring</Badge>
                  )}
                  {lowStock === "true" && (
                    <Badge variant="destructive">Low Stock</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {items.length} items in {formattedSubcategory.toLowerCase()} subcategory
                </CardDescription>
              </div>
              <div className="w-full md:w-auto">
                <Suspense fallback={<Skeleton className="h-10 w-[250px]" />}>
                  <SearchInventory subcategory={subcategory} />
                </Suspense>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {items.length > 0 ? (
              <InventoryTable items={items} />
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">No items found in this subcategory</p>
                
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Error loading subcategory page:", error);
    return notFound();
  }
} 