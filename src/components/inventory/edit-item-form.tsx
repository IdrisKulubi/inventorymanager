"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateInventoryItem } from "@/lib/actions/inventory";
import { formSchema } from "@/lib/validators";
import { 
  INVENTORY_CATEGORIES, 
  INVENTORY_SUBCATEGORIES, 
  INVENTORY_UNITS,
  CATEGORY_DISPLAY_NAMES,
  SUBCATEGORY_DISPLAY_NAMES
} from "@/lib/constants";
import type { InventoryItem, inventorySubcategoryEnum } from "@/db/schema";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function EditInventoryForm({ 
  item,
  onSuccess
}: { 
  item: InventoryItem;
  onSuccess: () => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>(item.category);
  const [availableSubcategories, setAvailableSubcategories] = useState<readonly string[]>(
    INVENTORY_SUBCATEGORIES[item.category] || []
  );
  const [isFixedAsset, setIsFixedAsset] = useState(item.isFixedAsset || false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...item,
      category: item.category as typeof INVENTORY_CATEGORIES[number],
      subcategory: item.subcategory || INVENTORY_SUBCATEGORIES[item.category][0],
      unit: item.unit as typeof INVENTORY_UNITS[number],
      purchaseDate: new Date(item.purchaseDate).toISOString().split('T')[0],
      supplierContact: item.supplierContact ?? "",
      isFixedAsset: item.isFixedAsset || false,
      assetLocation: item.assetLocation ?? "",
      shelfLifeDays: item.shelfLifeDays ?? 7,
      cost: item.cost ?? 0,
      supplierName: item.supplierName ?? "",
    }
  });

  // Update subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      setAvailableSubcategories(INVENTORY_SUBCATEGORIES[selectedCategory]);
      form.setValue('subcategory', INVENTORY_SUBCATEGORIES[selectedCategory][0]);
    }
  }, [selectedCategory, form]);

  // Update form values when isFixedAsset changes
  useEffect(() => {
    form.setValue('isFixedAsset', isFixedAsset);
    
    // Reset shelf life days if it's a fixed asset
    if (isFixedAsset) {
      form.setValue('shelfLifeDays', undefined);
    } else if (!item.shelfLifeDays) {
      form.setValue('shelfLifeDays', 7);
    }
  }, [isFixedAsset, form, item.shelfLifeDays]);

  useEffect(() => {
    // Create a properly typed form reset object based on isFixedAsset
    const resetValues = {
      category: item.category as typeof INVENTORY_CATEGORIES[number],
      subcategory: item.subcategory || INVENTORY_SUBCATEGORIES[item.category][0],
      itemName: item.itemName,
      brand: item.brand || "",
      quantity: item.quantity,
      unit: item.unit as typeof INVENTORY_UNITS[number],
      purchaseDate: new Date(item.purchaseDate).toISOString().split('T')[0],
      supplierContact: item.supplierContact ?? "",
      cost: item.cost ?? 0,
      supplierName: item.supplierName ?? "",
      // The discriminated union fields
      isFixedAsset: Boolean(item.isFixedAsset),
      assetLocation: item.assetLocation ?? "",
      shelfLifeDays: item.shelfLifeDays ?? 7,
    };

    // Reset the form with the correct type based on isFixedAsset
    if (resetValues.isFixedAsset) {
      form.reset({
        ...resetValues,
        isFixedAsset: true,
        assetLocation: resetValues.assetLocation || "Default Location",
        shelfLifeDays: undefined,
      });
    } else {
      form.reset({
        ...resetValues,
        isFixedAsset: false,
        shelfLifeDays: resetValues.shelfLifeDays || 7,
      });
    }

    setIsFixedAsset(Boolean(item.isFixedAsset));
    setSelectedCategory(item.category);
  }, [item, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Calculate expiry date only for non-fixed assets
      const expiryDate = !values.isFixedAsset && values.shelfLifeDays
        ? new Date(new Date(values.purchaseDate).setDate(
            new Date(values.purchaseDate).getDate() + values.shelfLifeDays
          )).toISOString()
        : undefined;

      // Create a properly typed update object
      const updateData: Partial<InventoryItem> = {
        category: values.category,
        subcategory: values.subcategory as typeof inventorySubcategoryEnum.enumValues[number],
        itemName: values.itemName,
        brand: values.brand || null,
        quantity: values.quantity,
        unit: values.unit,
        purchaseDate: new Date(values.purchaseDate).toISOString(),
        expiryDate: expiryDate || null,
        supplierContact: values.supplierContact || null,
        cost: values.cost,
        supplierName: values.supplierName,
        isFixedAsset: values.isFixedAsset,
        assetLocation: values.assetLocation || null,
        shelfLifeDays: values.shelfLifeDays || null,
      };

      const result = await updateInventoryItem(item.id, updateData);

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
    <Tabs defaultValue={isFixedAsset ? "fixed-asset" : "consumable"} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger 
          value="consumable" 
          onClick={() => setIsFixedAsset(false)}
        >
          Consumable Item
        </TabsTrigger>
        <TabsTrigger 
          value="fixed-asset" 
          onClick={() => setIsFixedAsset(true)}
        >
          Fixed Asset
        </TabsTrigger>
      </TabsList>

      <TabsContent value="consumable">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedCategory(value);
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INVENTORY_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {CATEGORY_DISPLAY_NAMES[cat]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subcategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableSubcategories.map(subcat => (
                          <SelectItem key={subcat} value={subcat}>
                            {SUBCATEGORY_DISPLAY_NAMES[subcat]}
                          </SelectItem>
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
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter brand name" 
                        {...field} 
                        value={field.value || ""} 
                      />
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
                        placeholder="Enter quantity" 
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
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
                    <FormLabel>Shelf Life (Days)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter shelf life in days" 
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
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
                        placeholder="Enter cost" 
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
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
                    <FormLabel>Supplier Contact (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone or email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Item"
              )}
            </Button>
          </form>
        </Form>
      </TabsContent>

      <TabsContent value="fixed-asset">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedCategory(value);
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INVENTORY_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {CATEGORY_DISPLAY_NAMES[cat]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subcategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableSubcategories.map(subcat => (
                          <SelectItem key={subcat} value={subcat}>
                            {SUBCATEGORY_DISPLAY_NAMES[subcat]}
                          </SelectItem>
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
                    <FormLabel>Asset Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter asset name" {...field} />
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
                    <FormLabel>Brand (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter brand name" 
                        {...field} 
                        value={field.value || ""} 
                      />
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
                        placeholder="Enter quantity" 
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
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
                name="assetLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter asset location" {...field} />
                    </FormControl>
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
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter cost" 
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
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
                    <FormLabel>Supplier Contact (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone or email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Fixed Asset"
              )}
            </Button>
          </form>
        </Form>
      </TabsContent>
    </Tabs>
  );
} 