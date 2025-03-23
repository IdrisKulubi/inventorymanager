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
import { AddInventoryForm } from "@/components/inventory/add-item-form";
import { Plus } from "lucide-react";
import { useState } from "react";

interface AddItemDialogProps {
  trigger?: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "link" | "ghost" | "destructive";
}

export function AddItemDialog({ 
  trigger, 
  className, 
  variant = "default" 
}: AddItemDialogProps) {
  const [open, setOpen] = useState(false);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant={variant} className={className}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Inventory Item</DialogTitle>
          <DialogDescription>
            Add a new item to your inventory. Fill out the form below to get started.
          </DialogDescription>
        </DialogHeader>
        <AddInventoryForm 
          onItemAdded={() => setOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
} 