import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import db from "@/db/drizzle";
import { sql } from "drizzle-orm";
import { PageHeader } from "@/components/ui/page-header";
import { AddItemAction, DailyUpdatesAction } from "@/components/action-buttons";

interface FilterPageProps {
  params: { filter: string };
}

// Define the shape of our processed inventory items
interface ProcessedItem {
  id: number;
  itemName: string;
  category: string;
  subcategory: string;
  quantity: number;
  minimumStockLevel: number | null;
  stockValue: number | null;
  orderQuantity: number | null;
  expiryDate: string | null;
  cost: number | null;
  sellingPrice: number | null;
  expiryStatus: string | null;
}

export default async function FilterPage({ params }: FilterPageProps) {
  // Properly await params in Next.js 15
  const awaitedParams = await params;
  const filter = awaitedParams.filter;
  
  let title = "";
  let description = "";
  let items = [];
  
  console.log(`Processing filter: ${filter}`);
  
  try {
    if (filter === "low-stock") {
      title = "Low Stock Items";
      description = "Items that are below their minimum stock level";
      
      // Get all bakery items below minimum stock level
      const result = await db.execute(sql`
        SELECT * FROM inventory_items 
        WHERE quantity <= minimum_stock_level 
        AND minimum_stock_level IS NOT NULL 
        AND subcategory = 'bakery'
      `);
      
      items = result.rows;
      console.log(`Found ${items.length} low stock items`);
      
    } else if (filter === "expiring") {
      title = "Expiring Items";
      description = "Items that will expire soon";
      
      // Get current date and date 7 days from now
      const today = new Date();
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(today.getDate() + 7);
      
      const todayFormatted = today.toISOString().split('T')[0];
      const sevenDaysLaterFormatted = sevenDaysLater.toISOString().split('T')[0];
      
      // Get all bakery items expiring in the next 7 days
      const result = await db.execute(sql`
        SELECT * FROM inventory_items 
        WHERE expiry_date IS NOT NULL
        AND expiry_date >= ${todayFormatted}
        AND expiry_date <= ${sevenDaysLaterFormatted}
        AND subcategory = 'bakery'
      `);
      
      items = result.rows;
      console.log(`Found ${items.length} expiring items`);
      
    } else if (filter === "needs-ordering") {
      title = "Items Needing Order";
      description = "Items that need to be reordered based on minimum stock levels";
      
      // Get all bakery items that need ordering
      const result = await db.execute(sql`
        SELECT * FROM inventory_items 
        WHERE quantity <= minimum_stock_level 
        AND order_quantity > 0
        AND subcategory = 'bakery'
      `);
      
      items = result.rows;
      console.log(`Found ${items.length} items needing order`);
      
    } else {
      return notFound();
    }
    
    // Convert snake_case to camelCase for properties
    items = items.map(item => ({
      id: item.id,
      itemName: item.item_name,
      category: item.category,
      subcategory: item.subcategory,
      quantity: item.quantity,
      minimumStockLevel: item.minimum_stock_level,
      stockValue: item.stock_value,
      orderQuantity: item.order_quantity,
      expiryDate: item.expiry_date,
      cost: item.cost,
      sellingPrice: item.selling_price,
      expiryStatus: item.expiry_status
    })) as ProcessedItem[];
    
    return (
      <div className="container py-8 space-y-6">
        <PageHeader
          title={title}
          description={description}
          breadcrumbs={[
            { label: "Inventory", href: "/inventory" },
            { label: title }
          ]}
          backLink={{
            label: "Back to Inventory",
            href: "/inventory"
          }}
          actions={[AddItemAction, DailyUpdatesAction]}
        />
        
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {items.length} {filter === "low-stock" && "low stock"} 
              {filter === "expiring" && "expiring"} 
              {filter === "needs-ordering" && "needing order"} items found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    {filter === "low-stock" && (
                      <TableHead className="text-right">Min. Level</TableHead>
                    )}
                    {filter === "expiring" && (
                      <TableHead>Expiry Date</TableHead>
                    )}
                    {filter === "needs-ordering" && (
                      <TableHead className="text-right">Order Quantity</TableHead>
                    )}
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item: ProcessedItem) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <Link href={`/inventory/${item.id}`} className="hover:underline">
                          {item.itemName}
                        </Link>
                      </TableCell>
                      <TableCell>{item.subcategory}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      {filter === "low-stock" && (
                        <TableCell className="text-right">{item.minimumStockLevel}</TableCell>
                      )}
                      {filter === "expiring" && (
                        <TableCell>
                          {item.expiryDate && format(new Date(item.expiryDate), "MMM d, yyyy")}
                        </TableCell>
                      )}
                      {filter === "needs-ordering" && (
                        <TableCell className="text-right">{item.orderQuantity}</TableCell>
                      )}
                      <TableCell className="text-right">
                        Ksh{item.stockValue?.toLocaleString() || "0"}
                      </TableCell>
                      <TableCell>
                        {filter === "low-stock" && (
                          <Badge variant="destructive">Low Stock</Badge>
                        )}
                        {filter === "expiring" && (
                          <Badge variant="warning">Expiring Soon</Badge>
                        )}
                        {filter === "needs-ordering" && (
                          <Badge variant="outline">Order Needed</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No {filter.replace('-', ' ')} items found</p>
                <h1>No items found</h1> 
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error(`Error processing ${filter} filter:`, error);
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-500">An error occurred while processing your request.</p>
        <Button asChild className="mt-4">
          <Link href="/inventory">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Link>
        </Button>
      </div>
    );
  }
} 