"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addInventoryItem } from "@/lib/actions/inventory";
import { z } from "zod";
import { formSchema } from "@/lib/validators";
import { INVENTORY_CATEGORIES, INVENTORY_UNITS } from "@/lib/constants";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Plus } from "lucide-react";

export function AddInventoryForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: INVENTORY_CATEGORIES[0],
      itemName: "",
      brand: "",
      quantity: 1,
      unit: INVENTORY_UNITS[0],
      purchaseDate: new Date().toISOString().split('T')[0],
      shelfLifeDays: 7,
      supplierContact: ""
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await addInventoryItem({
        ...values,
        purchaseDate: new Date(values.purchaseDate).toISOString(),
        expiryDate: new Date(new Date(values.purchaseDate).setDate(
          new Date(values.purchaseDate).getDate() + values.shelfLifeDays
        )).toISOString()
      });

      if (result.success) {
        toast.success("Item added successfully");
        form.reset();
      } else {
        toast.error("Failed to add item", {
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
                  <Input placeholder="Enter brand name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="supplierName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter supplier name" {...field} />
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
                  <Input placeholder="Email or phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Add Item
        </Button>
      </form>
    </Form>
  );
} 