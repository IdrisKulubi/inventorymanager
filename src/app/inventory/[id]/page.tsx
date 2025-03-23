import { notFound } from "next/navigation";
import db from "@/db/drizzle";
  import { InventoryItem, inventoryItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DailyCountForm } from "@/components/inventory/daily-count-form";
import { InventoryLogs } from "@/components/inventory/inventory-logs";
import { Calendar, Pencil, PackageCheck, Plus } from "lucide-react";
import { getItemLogs } from "@/lib/actions/logs";
import { PageHeader } from "@/components/ui/page-header";
import { AddItemDialog } from "@/components/inventory/add-item-dialog";

interface ItemPageProps {
  params: { id: string };
  searchParams: { tab?: string };
}

export default async function ItemPage({ params, searchParams }: ItemPageProps) {
  const itemId = parseInt(params.id);
  
  if (isNaN(itemId)) {
    notFound();
  }
  
  // Get item details
  const item = await db.query.inventoryItems.findFirst({
    where: eq(inventoryItems.id, itemId),
  });
  
  if (!item) {
    notFound();
  }
  
  // Get inventory logs
  const logsResult = await getItemLogs(itemId);
  const logs = logsResult.success ? logsResult.logs : [];
  
  // Set the active tab based on search params or default to "details"
  const activeTab = searchParams.tab || "details";
  
  return (
    <div className="container py-8 pb-24">
      <PageHeader
        title={item.itemName}
        description={`${item.category.replace(/_/g, ' ')} › ${item.subcategory?.replace(/_/g, ' ')}`}
        breadcrumbs={[
          { label: "Inventory", href: "/inventory" },
          { label: item.itemName }
        ]}
        backLink={{
          label: "Back to Inventory",
          href: "/inventory"
        }}
        actions={[
          {
            label: "Edit Item",
            href: `/inventory/${itemId}/edit`,
            icon: <Pencil className="mr-2 h-4 w-4" />,
          },
          {
            label: "Daily Updates",
            href: `/inventory/daily-updates`,
            icon: <Calendar className="mr-2 h-4 w-4" />,
            variant: "outline",
          },
          {
            component: (
              <AddItemDialog 
                variant="outline" 
                trigger={
                  <Button size="sm" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                }
              />
            )
          }
        ]}
      >
        {getStockStatusBadge(item)}
      </PageHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Stock Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Current Stock</h3>
              <p className="text-3xl font-bold">
                {item.quantity} <span className="text-base font-normal">{item.unit}</span>
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Stock Value</h3>
              <p className="text-2xl font-bold">
                Ksh{(item.stockValue ? item.stockValue / 100 : 0).toFixed(2)}
              </p>
              {item.cost && (
                <p className="text-sm text-muted-foreground">
                  Ksh{(item.cost / 100).toFixed(2)} per {item.unit}
                </p>
              )}
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Stock Status</h3>
              <div className="space-y-2">
                {item.minimumStockLevel && (
                  <div className="flex justify-between">
                    <span>Minimum Level:</span>
                    <span className="font-medium">{item.minimumStockLevel} {item.unit}</span>
                  </div>
                )}
                {item.orderQuantity && (
                  <div className="flex justify-between">
                    <span>Order Quantity:</span>
                    <span className="font-medium">{item.orderQuantity} {item.unit}</span>
                  </div>
                )}
                {item.expiryDate && (
                  <div className="flex justify-between">
                    <span>Expiry Date:</span>
                    <span className="font-medium">{format(new Date(item.expiryDate), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>
            </div>
            
            {item.supplierName && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Supplier Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Supplier:</span>
                      <span className="font-medium">{item.supplierName}</span>
                    </div>
                    {item.supplierContact && (
                      <div className="flex justify-between">
                        <span>Contact:</span>
                        <span className="font-medium">{item.supplierContact}</span>
                      </div>
                    )}
                    {item.supplierEmail && (
                      <div className="flex justify-between">
                        <span>Email:</span>
                        <a href={`mailto:${item.supplierEmail}`} className="font-medium text-blue-500 hover:underline">
                          {item.supplierEmail}
                        </a>
                      </div>
                    )}
                    {item.supplierPhone && (
                      <div className="flex justify-between">
                        <span>Phone:</span>
                        <a href={`tel:${item.supplierPhone}`} className="font-medium text-blue-500 hover:underline">
                          {item.supplierPhone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <div className="lg:col-span-2">
          <Tabs defaultValue={activeTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="count">Update Count</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Item Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Item Name</h3>
                      <p className="font-medium">{item.itemName}</p>
                    </div>
                    
                    {item.brand && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Brand</h3>
                        <p className="font-medium">{item.brand}</p>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Category</h3>
                      <p className="font-medium">{item.category.replace(/_/g, ' ')}</p>
                    </div>
                    
                    {item.subcategory && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Subcategory</h3>
                        <p className="font-medium">{item.subcategory.replace(/_/g, ' ')}</p>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Purchase Date</h3>
                      <p className="font-medium">{format(new Date(item.purchaseDate), 'MMM d, yyyy')}</p>
                    </div>
                    
                    {item.isFixedAsset && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Asset Location</h3>
                        <p className="font-medium">{item.assetLocation || 'Not specified'}</p>
                      </div>
                    )}
                    
                    {item.shelfLifeValue && item.shelfLifeUnit && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Shelf Life</h3>
                        <p className="font-medium">{item.shelfLifeValue} {item.shelfLifeUnit}</p>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Created At</h3>
                      <p className="font-medium">{format(new Date(item.createdAt || new Date()), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              <InventoryLogs logs={logs ?? []} />
            </TabsContent>
            
            <TabsContent value="count" className="mt-4">
              <DailyCountForm 
                itemId={item.id} 
                itemName={item.itemName} 
                currentQuantity={item.quantity} 
                unit={item.unit} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-md border-t p-4 shadow-lg">
        <div className="container flex justify-center md:justify-end gap-2">
          <Button 
            variant="outline"
            size="lg"
            asChild
          >
            <Link href={`/inventory/${itemId}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Item
            </Link>
          </Button>
          <Button 
            size="lg"
            asChild
          >
            <Link href={`/inventory/${itemId}?tab=count`}>
              <PackageCheck className="mr-2 h-4 w-4" />
              Update Count
            </Link>
          </Button>
          <AddItemDialog 
            variant="outline"
            trigger={
              <Button variant="outline" size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Add New Item
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
}

function getStockStatusBadge(item: InventoryItem) {
  // Check if item is expired
  if (item.expiryDate && new Date(item.expiryDate) < new Date()) {
    return <Badge variant="destructive">Expired</Badge>;
  }
  
  // Check if item is expiring soon (within 7 days)
  if (
    item.expiryDate && 
    new Date(item.expiryDate) > new Date() && 
    new Date(item.expiryDate) < new Date(new Date().setDate(new Date().getDate() + 7))
  ) {
    return <Badge variant="warning">Expiring Soon</Badge>;
  }
  
  // Check if item is below minimum stock level
  if (
    item.minimumStockLevel !== null && 
    item.minimumStockLevel !== undefined && 
    item.quantity <= item.minimumStockLevel
  ) {
    return <Badge variant="destructive">Low Stock</Badge>;
  }
  
  return null;
} 