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
import { CATEGORY_DISPLAY_NAMES, SUBCATEGORY_DISPLAY_NAMES } from "@/lib/constants";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface InventoryTableRowProps {
  item: InventoryItem;
  onItemUpdated?: () => void;
}

function InventoryTableRow({ item, onItemUpdated }: InventoryTableRowProps) {
  const [isEditing, setIsEditing] = useState(false);

  const getExpiryStatus = (expiryDate: Date | null) => {
    if (!expiryDate) return { label: "N/A", variant: "secondary" };
    
    const today = new Date();
    const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays < 0) return { label: "Expired", variant: "destructive" };
    if (diffDays <= 2) return { label: "Expiring Soon", variant: "destructive" };
    if (diffDays <= 5) return { label: "Low", variant: "warning" };
    return { label: "Fresh", variant: "success" };
  };

  const status = item.expiryDate 
    ? getExpiryStatus(new Date(item.expiryDate)) 
    : { label: "N/A", variant: "secondary" };

  const isFixedAsset = item.isFixedAsset;

  const handleEditSuccess = () => {
    setIsEditing(false);
    if (onItemUpdated) {
      onItemUpdated();
    }
  };

  const handleDeleteSuccess = () => {
    if (onItemUpdated) {
      onItemUpdated();
    }
  };

  return (
    <TableRow 
      key={item.id} 
      className={status.variant === "destructive" && !isFixedAsset ? "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900" : ""}
    >
      <TableCell>
        <SupplierDetails
          name={item.supplierName || "N/A"}
          contact={item.supplierContact || undefined}
        />
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span>{CATEGORY_DISPLAY_NAMES[item.category] || item.category}</span>
          <span className="text-xs text-muted-foreground">
            {SUBCATEGORY_DISPLAY_NAMES[item.subcategory] || item.subcategory}
          </span>
        </div>
      </TableCell>
      <TableCell>{item.itemName}</TableCell>
      <TableCell className={!isFixedAsset && item.quantity < 10 ? "text-red-600 font-bold" : ""}>
        {item.quantity} {item.unit}
      </TableCell>
      <TableCell>{item.cost ? `Ksh.${item.cost.toLocaleString()}` : "N/A"}</TableCell>
      <TableCell>
        {isFixedAsset ? (
          <Badge variant="secondary">
            Fixed Asset
            {item.assetLocation && ` (${item.assetLocation})`}
          </Badge>
        ) : (
          <Badge variant={status.variant as BadgeProps["variant"]}>
            {status.label} {item.expiryDate && `(${new Date(item.expiryDate).toLocaleDateString('en-US')})`}
          </Badge>
        )}
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
              onSuccess={handleEditSuccess}
            />
          </DialogContent>
        </Dialog>
      </TableCell>
      <TableCell>
        <DeleteItemAlert 
          itemId={item.id} 
          itemName={item.itemName} 
          onSuccess={handleDeleteSuccess}
        />
      </TableCell>
    </TableRow>
  );
}

interface InventoryTableProps {
  items: InventoryItem[];
  onItemUpdated?: () => void;
}

export function InventoryTable({ items, onItemUpdated }: InventoryTableProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  
  const filteredItems = activeTab === "all" 
    ? items 
    : activeTab === "fixed-assets" 
      ? items.filter(item => item.isFixedAsset) 
      : items.filter(item => !item.isFixedAsset && item.category === activeTab);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="chocolate_room">Chocolate Room</TabsTrigger>
          <TabsTrigger value="beer_room">Beer Room</TabsTrigger>
          <TabsTrigger value="kitchen">Kitchen</TabsTrigger>
          <TabsTrigger value="fixed-assets">Fixed Assets</TabsTrigger>
        </TabsList>
      </Tabs>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Supplier</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>{activeTab === "fixed-assets" ? "Location" : "Expiry Status"}</TableHead>
            <TableHead colSpan={2}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No items found in this category
              </TableCell>
            </TableRow>
          ) : (
            filteredItems.map((item) => (
              <InventoryTableRow 
                key={item.id} 
                item={item} 
                onItemUpdated={onItemUpdated}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 