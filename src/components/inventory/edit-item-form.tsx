"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateInventoryItem } from "@/lib/actions/inventory";
import { formSchema } from "@/lib/validators";
import { INVENTORY_CATEGORIES, INVENTORY_UNITS } from "@/lib/constants";
import type { InventoryItem } from "@/db/schema";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function EditInventoryForm({ 
  item,
  onSuccess
}: { 
  item: InventoryItem;
  onSuccess: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...item,
      category: item.category as typeof INVENTORY_CATEGORIES[number],
      unit: item.unit as typeof INVENTORY_UNITS[number],
      purchaseDate: new Date(item.purchaseDate).toISOString().split('T')[0],
      supplierContact: item.supplierContact ?? "",
    }
  });

  useEffect(() => {
    form.reset({
      ...item,
      category: item.category as typeof INVENTORY_CATEGORIES[number],
      unit: item.unit as typeof INVENTORY_UNITS[number],
      purchaseDate: new Date(item.purchaseDate).toISOString().split('T')[0],
      supplierContact: item.supplierContact ?? "",
    });
  }, [item, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await updateInventoryItem(item.id, {
        ...values,
        brand: values.brand || undefined,
        supplierContact: values.supplierContact || undefined,
        purchaseDate: new Date(values.purchaseDate).toISOString(),
        expiryDate: new Date(new Date(values.purchaseDate).setDate(
          new Date(values.purchaseDate).getDate() + values.shelfLifeDays
        )).toISOString()
      });

      if (result.success) {
        toast.success("Item updated successfully");
        onSuccess();
      } else {
        toast.error("Failed to update item", {
          description: result.error
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INVENTORY_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="itemName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter item name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Convert to positive integer or 0
                      const quantity = Math.max(0, Math.floor(Number(value)) || 0);
                      field.onChange(quantity);
                    }}
                    onBlur={(e) => {
                      const value = e.target.value;
                      // Ensure empty input becomes 0
                      if (!value) {
                        field.onChange(0);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INVENTORY_UNITS.map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shelfLifeDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shelf Life (days)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder="Enter brand name" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="supplierContact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier Contact</FormLabel>
                <FormControl>
                  <Input placeholder="Enter supplier contact" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Update Item
          </Button>
          <Button variant="outline" type="button" onClick={onSuccess}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
} 