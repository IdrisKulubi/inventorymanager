"use client";

import { InventoryItem } from "@/db/schema";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { EditInventoryForm } from "./edit-item-form";

import { DeleteItemAlert } from "@/components/inventory/delete-item-alert";
import { SupplierDetails } from "./supplier-details";

function InventoryTableRow({ item }: { item: InventoryItem }) {
  const [isEditing, setIsEditing] = useState(false);

  const getExpiryStatus = (expiryDate: Date) => {
    const today = new Date();
    const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays < 0) return { label: "Expired", variant: "destructive" };
    if (diffDays <= 2) return { label: "Expiring Soon", variant: "destructive" };
    if (diffDays <= 5) return { label: "Low", variant: "warning" };
    return { label: "Fresh", variant: "success" };
  };

  const status = getExpiryStatus(new Date(item.expiryDate));



  return (
    <TableRow key={item.id} className={status.variant === "destructive" ? "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900" : ""}>
      <TableCell>
        <SupplierDetails
          name={item.supplierName}
          contact={item.supplierContact || undefined}
        />
      </TableCell>
      <TableCell>{item.category}</TableCell>
      <TableCell>{item.itemName}</TableCell>
      <TableCell className={item.quantity < 10 ? "text-red-600 font-bold" : ""}>
        {item.quantity} {item.unit}
      </TableCell>
      <TableCell>Ksh.{item.cost.toLocaleString()}</TableCell>
      <TableCell>
        <Badge variant={status.variant as BadgeProps["variant"]}>
          {status.label} ({new Date(item.expiryDate).toLocaleDateString('en-US')})
        </Badge>
      </TableCell>
      <TableCell>
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <EditInventoryForm 
              item={item} 
              onSuccess={() => setIsEditing(false)}
            />
          </DialogContent>
        </Dialog>
      </TableCell>
      <TableCell>
        <DeleteItemAlert itemId={item.id} itemName={item.itemName} />
      </TableCell>
    </TableRow>
  );
}

export function InventoryTable({ items }: { items: InventoryItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Supplier</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Item</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Cost</TableHead>
          <TableHead>Expiry Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <InventoryTableRow key={item.id} item={item} />
        ))}
      </TableBody>
    </Table>
  );
} 