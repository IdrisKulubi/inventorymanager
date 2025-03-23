"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditInventoryForm } from "@/components/inventory/edit-item-form";
import { Pencil } from "lucide-react";
import { useState } from "react";

// Generic interface for any item that can be edited
interface EditableItem {
  id: number;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  [key: string]: any;
}

interface EditItemDialogProps {
  item: EditableItem;
  trigger?: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "link" | "ghost" | "destructive";
  size?: "sm" | "lg" | "icon";
}

export function EditItemDialog({ 
  item,
  trigger, 
  className,
  size = "sm", 
  variant = "default" 
}: EditItemDialogProps) {
  const [open, setOpen] = useState(false);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant={variant} size={size} className={className}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Item
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Inventory Item</DialogTitle>
          <DialogDescription>
            Edit {item.itemName} information. Make changes below to update the item.
          </DialogDescription>
        </DialogHeader>
        <EditInventoryForm 
          item={item}
          onSuccess={() => setOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
} 