"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { DeleteItemAlert } from "@/components/inventory/delete-item-alert";
import Link from "next/link";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define a custom interface that extends the database InventoryItem type
interface ExtendedInventoryItem {
  id: number;
  itemName: string;
  category: string;
  subcategory?: string | null;
  quantity: number;
  unit: string;
  brand?: string | null;
  stockValue?: number | null;
  expiryDate?: string | null;
  minimumStockLevel?: number | null;
  orderQuantity?: number | null;
  isFixedAsset: boolean | null;
  assetLocation?: string | null;
  supplierName?: string | null;
  supplierContact?: string | null;
  supplierEmail?: string | null;
  supplierPhone?: string | null;
  cost?: number | null;
  createdAt?: Date | null;
  purchaseDate?: Date | string | null;
  shelfLifeValue?: number | null;
  shelfLifeUnit?: string | null;
  expiryStatus?: string | null;
}

interface InventoryTableProps {
  items: ExtendedInventoryItem[] ;
  onItemUpdated?: () => void;
}

export function InventoryTable({ items, onItemUpdated }: InventoryTableProps) {
  const [itemToDelete, setItemToDelete] = useState<ExtendedInventoryItem | null>(null);
  
  // Add debug logs
  console.log("Items in InventoryTable:", items);
  console.log("First item structure:", items.length > 0 ? items[0] : "No items");
  
  const handleDeleteClick = (item: ExtendedInventoryItem) => {
    console.log("Item to delete:", item);
    setItemToDelete(item);
  };
  
  const handleDeleteComplete = () => {
    setItemToDelete(null);
    if (onItemUpdated) {
      onItemUpdated();
    }
  };
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Subcategory</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Value</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No items found.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <Link href={`/inventory/${item.id}`} className="hover:underline">
                    {item.itemName}
                  </Link>
                  {item.brand && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.brand}
                    </div>
                  )}
                </TableCell>
                <TableCell>{item.category.replace(/_/g, " ")}</TableCell>
                <TableCell>{item.subcategory?.replace(/_/g, " ")}</TableCell>
                <TableCell className="text-right">
                  <div className="font-medium">{item.quantity} {item.unit}</div>
                  {item.minimumStockLevel !== null && item.minimumStockLevel !== undefined && (
                    <div className="text-xs text-muted-foreground">
                      Min: {item.minimumStockLevel}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  ${item.stockValue?.toLocaleString() || "0"}
                </TableCell>
                <TableCell>
                  {getItemStatusBadge(item)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/inventory/${item.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/inventory/${item.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Item
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteClick(item)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Item
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {itemToDelete && (
        <DeleteItemAlert
          itemId={itemToDelete.id}
          itemName={itemToDelete.itemName}
          onSuccess={handleDeleteComplete}
        />
      )}
    </div>
  );
}

function getItemStatusBadge(item: ExtendedInventoryItem) {
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
  if (item.minimumStockLevel !== null && item.minimumStockLevel !== undefined && 
      item.quantity <= item.minimumStockLevel) {
    return <Badge variant="destructive">Low Stock</Badge>;
  }
  
  return <Badge variant="success">In Stock</Badge>;
} 