import { notFound } from "next/navigation";
import db from "@/db/drizzle";
import { inventoryItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { EditInventoryForm } from "@/components/inventory/edit-item-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface EditItemPageProps {
  params: { id: string };
}

export default async function EditItemPage({ params }: EditItemPageProps) {
  // In Next.js 15, we need to await the params object before accessing properties
  const paramsData = await params;
  const itemId = parseInt(paramsData.id);
  
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
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="-ml-2 h-8 px-2">
          <Link href={`/inventory/${itemId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Item Details
          </Link>
        </Button>
        
        <h1 className="text-2xl font-bold tracking-tight mt-4">Edit Item</h1>
        <p className="text-muted-foreground">
          Update information for {item.itemName}
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Edit Item Details</CardTitle>
          <CardDescription>
            Update the information below and click save to apply your changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditInventoryForm 
            item={item} 
            returnUrl={`/inventory/${itemId}`}
          />
        </CardContent>
      </Card>
    </div>
  );
} 