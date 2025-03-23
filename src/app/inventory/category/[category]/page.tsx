import Link from "next/link";
import db from "@/db/drizzle";
import { sql } from "drizzle-orm";
import { addDays, format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card,  CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

interface InventoryItem {
  id: number;
  itemName: string;
  category: string;
  subcategory?: string | null;
  quantity: number;
  stockValue?: number | null;
  expiryDate?: string | null;
  minimumStockLevel?: number | null;
}

interface Subcategory {
  subcategory: string | null;
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { category: string };
  searchParams: { filter?: string; subcategory?: string };
}) {
 
  const { category } = params;
  const { filter, subcategory } = searchParams;
  
  let title = "";
  let description = "";
  let items: InventoryItem[] = [];
  
  // Set up query based on filter type
  if (filter === "expiring") {
    title = "Expiring Soon";
    description = "Items that will expire within the next 7 days";
    
    // Get items expiring in the next 7 days
    const sevenDaysFromNow = addDays(new Date(), 7).toISOString().split('T')[0];
    
    try {
      items = await db.query.inventoryItems.findMany({
        where: sql`category = ${category} AND expiry_date <= ${sevenDaysFromNow} AND expiry_date >= CURRENT_DATE`,
      });
    } catch (error) {
      console.error("Error fetching expiring items:", error);
    }
  } else if (filter === "low-stock") {
    title = "Low Stock Items";
    description = "Items that are below their minimum stock level";
    
    try {
      items = await db.query.inventoryItems.findMany({
        where: sql`category = ${category} AND quantity <= minimum_stock_level`,
      });
    } catch (error) {
      console.error("Error fetching low stock items:", error);
    }
  } else if (subcategory) {
    title = subcategory.replace(/_/g, " ");
    description = `Items in the ${subcategory.replace(/_/g, " ")} subcategory`;
    
    try {
      items = await db.query.inventoryItems.findMany({ 
        where: sql`category = ${category} AND subcategory = ${subcategory}`, 
      });
    } catch (error) {
      console.error("Error fetching subcategory items:", error);
    }
  } else {
    title = category.replace(/_/g, " ");
    description = `All items in the ${category.replace(/_/g, " ")} category`;
    
    try {
      // Use raw SQL to avoid type issues
      const result = await db.execute(sql`
        SELECT * FROM inventory_items WHERE category = ${category}
      `);
      
      // Map the raw results to our InventoryItem interface
      items = result.rows.map(row => ({
        id: Number(row.id),
        itemName: String(row.item_name),
        category: String(row.category),
        subcategory: row.subcategory ? String(row.subcategory) : null,
        quantity: Number(row.quantity),
        stockValue: row.stock_value ? Number(row.stock_value) : null,
        expiryDate: row.expiry_date ? String(row.expiry_date) : null,
        minimumStockLevel: row.minimum_stock_level ? Number(row.minimum_stock_level) : null
      }));
      
    } catch (error) {
      console.error("Error fetching category items:", error);
    }
  }
  
  // Get subcategories for this category
  let subcategories: Subcategory[] = [];
  try {
    const result = await db.execute(sql`
      SELECT DISTINCT subcategory FROM inventory_items WHERE category = ${category}
    `);
    subcategories = result.rows.map(row => ({
      subcategory: row.subcategory ? String(row.subcategory) : null
    }));
  } catch (error) {
    console.error("Error fetching subcategories:", error);
  }
  
  // Only return 404 if we're not filtering and there are no items
  if (items.length === 0 && !subcategory && !filter) {
    // Instead of returning 404, let's show an empty state
    // notFound();
  }
  
  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/inventory">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      
      {!subcategory && !filter && subcategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">Subcategories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {subcategories.map((sub) => (
              <Link 
                key={sub.subcategory} 
                href={`/inventory/category/${category}?subcategory=${sub.subcategory}`}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      {sub.subcategory?.replace(/_/g, " ")}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      <div>
        <h2 className="text-lg font-medium mb-4">Items</h2>
        {items.length > 0 ? (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Subcategory</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  {filter === "expiring" && <TableHead>Expiry Date</TableHead>}
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <Link href={`/inventory/${item.id}`} className="hover:underline">
                        {item.itemName}
                      </Link>
                    </TableCell>
                    <TableCell>{item.subcategory?.replace(/_/g, " ")}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      ${item.stockValue?.toLocaleString() || "0"}
                    </TableCell>
                    {filter === "expiring" && (
                      <TableCell>
                        {item.expiryDate && format(new Date(item.expiryDate), "MMM d, yyyy")}
                      </TableCell>
                    )}
                    <TableCell>
                      {getItemStatusBadge(item)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <div className="text-center p-8 border rounded-md bg-muted/10">
            <h3 className="text-lg font-medium mb-2">No items found</h3>
            <p className="text-muted-foreground mb-4">
              There are no items in this category yet.
            </p>
           
          </div>
        )}
      </div>
    </div>
  );
}

function getItemStatusBadge(item: InventoryItem) {
  // Check for expiry
  if (item.expiryDate) {
    const today = new Date();
    const expiryDate = new Date(item.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    if (daysUntilExpiry <= 7) {
      return <Badge variant="warning">Expiring Soon</Badge>;
    }
  }
  
  // Check for low stock
  if (item.minimumStockLevel && item.quantity <= item.minimumStockLevel) {
    return <Badge variant="destructive">Low Stock</Badge>;
  }
  
  return <Badge variant="success">In Stock</Badge>;
} 