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
  SUBCATEGORY_DISPLAY_NAMES,
  SHELF_LIFE_UNITS,
  SHELF_LIFE_UNIT_DISPLAY_NAMES,
  EXPIRY_STATUS_OPTIONS,
  EXPIRY_STATUS_DISPLAY_NAMES
} from "@/lib/constants";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

// Interface that can accept both InventoryItem from the database and the ExtendedInventoryItem type
interface EditableInventoryItem {
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
  isFixedAsset?: boolean | null;
  assetLocation?: string | null;
  supplierName?: string | null;
  supplierContact?: string | null;
  supplierEmail?: string | null;
  supplierPhone?: string | null;
  cost?: number | null;
  createdAt?: Date | null;
  purchaseDate: Date | string;
  shelfLifeValue?: number | null;
  shelfLifeUnit?: string | null;
  expiryStatus?: string | null;
}

interface EditInventoryFormProps { 
  item: EditableInventoryItem;
  returnUrl?: string;
  onSuccess?: () => void; // Make this optional
}

export function EditInventoryForm({ 
  item,
  returnUrl,
  onSuccess
}: EditInventoryFormProps) {
  const router = useRouter();
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
      supplierEmail: item.supplierEmail ?? "",
      supplierPhone: item.supplierPhone ?? "",
      isFixedAsset: item.isFixedAsset || false,
      assetLocation: item.assetLocation ?? "",
      shelfLifeValue: item.shelfLifeValue ?? 7,
      shelfLifeUnit: (item.shelfLifeUnit as "days" | "weeks" | "months" | "years") ?? "days",
      expiryStatus: (item.expiryStatus as "valid" | "expiring_soon" | "expired") ?? "valid", 
      orderQuantity: item.orderQuantity ?? 0,
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
    
    // Reset shelf life values if it's a fixed asset
    if (isFixedAsset) {
      form.setValue('shelfLifeValue', undefined);
      form.setValue('shelfLifeUnit', undefined);
      form.setValue('expiryStatus', undefined);
    } else if (!form.getValues('shelfLifeValue')) {
      form.setValue('shelfLifeValue', 7);
      form.setValue('shelfLifeUnit', 'days' as const);
      form.setValue('expiryStatus', 'valid' as const);
    }
  }, [isFixedAsset, form]);

  useEffect(() => {
    // Format purchaseDate properly if it's a Date object
    const purchaseDate = item.purchaseDate instanceof Date 
      ? item.purchaseDate.toISOString().split('T')[0]
      : typeof item.purchaseDate === 'string'
        ? new Date(item.purchaseDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
    
    // Reset form when item changes
    const resetValues = {
      category: item.category as typeof INVENTORY_CATEGORIES[number],
      subcategory: item.subcategory || INVENTORY_SUBCATEGORIES[item.category][0],
      itemName: item.itemName,
      brand: item.brand || "",
      quantity: item.quantity,
      unit: item.unit as typeof INVENTORY_UNITS[number],
      purchaseDate: purchaseDate,
      supplierContact: item.supplierContact || "",
      supplierEmail: item.supplierEmail || "",
      supplierPhone: item.supplierPhone || "",
      cost: item.cost || 0,
      supplierName: item.supplierName || "",
      isFixedAsset: Boolean(item.isFixedAsset),
      assetLocation: item.assetLocation ?? "",
      shelfLifeValue: item.shelfLifeValue ?? 7,
      shelfLifeUnit: (item.shelfLifeUnit as "days" | "weeks" | "months" | "years") ?? 'days',
      expiryStatus: (item.expiryStatus as "valid" | "expiring_soon" | "expired") ?? 'valid',
      orderQuantity: item.orderQuantity ?? 0,
    };

    if (isFixedAsset) {
      form.reset({
        ...resetValues,
        isFixedAsset: true,
        assetLocation: resetValues.assetLocation || "Default Location",
        shelfLifeValue: undefined,
        shelfLifeUnit: undefined,
        expiryStatus: undefined,
      });
    } else {
      form.reset({
        ...resetValues,
        isFixedAsset: false,
        shelfLifeValue: resetValues.shelfLifeValue || 7,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        shelfLifeUnit: (resetValues.shelfLifeUnit as any) || 'days',
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expiryStatus: (resetValues.expiryStatus as any) || 'valid',
      });
    }
  }, [item, form, isFixedAsset]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Calculate expiry date based on shelf life value and unit
      let expiryDate: string | undefined = undefined;
      
      if (!values.isFixedAsset && values.shelfLifeValue && values.shelfLifeUnit) {
        const purchaseDate = new Date(values.purchaseDate);
        let daysToAdd = values.shelfLifeValue;
        
        // Convert shelf life to days based on the unit
        switch (values.shelfLifeUnit) {
          case 'weeks':
            daysToAdd = values.shelfLifeValue * 7;
            break;
          case 'months':
            daysToAdd = values.shelfLifeValue * 30;
            break;
          case 'years':
            daysToAdd = values.shelfLifeValue * 365;
            break;
        }
        
        expiryDate = new Date(purchaseDate.setDate(purchaseDate.getDate() + daysToAdd)).toISOString();
      }

      const result = await updateInventoryItem({
        ...values,
        id: item.id,
        purchaseDate: new Date(values.purchaseDate).toISOString(),
        expiryDate,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        subcategory: values.subcategory as any
      });

      if (result.success) {
        toast.success("Item updated successfully");
        
        // Handle navigation based on what was provided
        if (onSuccess) {
          onSuccess();
        } else if (returnUrl) {
          router.push(returnUrl);
        }
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
                name="shelfLifeValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shelf Life Value</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter shelf life value" 
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
                name="shelfLifeUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shelf Life Unit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select shelf life unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SHELF_LIFE_UNITS.map(unit => (
                          <SelectItem key={unit} value={unit}>{SHELF_LIFE_UNIT_DISPLAY_NAMES[unit]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiryStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select expiry status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EXPIRY_STATUS_OPTIONS.map(status => (
                          <SelectItem key={status} value={status}>{EXPIRY_STATUS_DISPLAY_NAMES[status]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

              <FormField
                control={form.control}
                name="supplierEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Email (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter supplier email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplierPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter supplier phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="orderQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Quantity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter order quantity" 
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
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

              <FormField
                control={form.control}
                name="supplierEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Email (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter supplier email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplierPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter supplier phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="orderQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Quantity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter order quantity" 
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
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