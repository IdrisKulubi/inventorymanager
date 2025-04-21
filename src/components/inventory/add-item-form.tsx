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
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AddInventoryFormProps {
  onItemAdded?: () => void;
}

export function AddInventoryForm({ onItemAdded }: AddInventoryFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(INVENTORY_CATEGORIES[0]);
  const [availableSubcategories, setAvailableSubcategories] = useState<readonly string[]>(
    INVENTORY_SUBCATEGORIES[INVENTORY_CATEGORIES[0]]
  );
  const [isFixedAsset, setIsFixedAsset] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: INVENTORY_CATEGORIES[0],
      subcategory: INVENTORY_SUBCATEGORIES[INVENTORY_CATEGORIES[0]][0],
      itemName: "",
      brand: "",
      quantity: 1,
      orderQuantity: 0,
      unit: INVENTORY_UNITS[0],
      purchaseDate: new Date().toISOString().split('T')[0],
      shelfLifeValue: 7,
      shelfLifeUnit: 'days',
      expiryStatus: 'valid',
      supplierEmail: "",
      supplierPhone: "",
      supplierContact: "",
      cost: 0,
      sellingPrice: 0,
      supplierName: "",
      isFixedAsset: false,
      assetLocation: ""
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
    } else {
      form.setValue('shelfLifeValue', 7);
      form.setValue('shelfLifeUnit', 'days');
      form.setValue('expiryStatus', 'valid');
    }
  }, [isFixedAsset, form]);

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

      const result = await addInventoryItem({
        ...values,
        purchaseDate: new Date(values.purchaseDate).toISOString(),
        expiryDate,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        subcategory: values.subcategory as any
      });

      if (result.success) {
        toast.success("Item added successfully");
        form.reset();
        // Reset to default values
        setSelectedCategory(INVENTORY_CATEGORIES[0]);
        setIsFixedAsset(false);
        
        // Call the onItemAdded callback if provided
        if (onItemAdded) {
          onItemAdded();
        }
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
    <Tabs defaultValue="consumable" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger 
          value="consumable" 
          onClick={() => setIsFixedAsset(false)}
        >
          Consumable Items
        </TabsTrigger>
        <TabsTrigger 
          value="fixed-asset" 
          onClick={() => setIsFixedAsset(true)}
        >
          Fixed Assets
        </TabsTrigger>
      </TabsList>

      <TabsContent value="consumable">
        <Card>
          <CardHeader>
            <CardTitle>Add Consumable Item</CardTitle>
            <CardDescription>
              Add items for Barista, Kitchen, or Beer Room
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
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
                          <Input placeholder="Enter brand name" {...field} value={field.value || ""} />
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
                              <SelectItem key={unit} value={unit}>
                                {SHELF_LIFE_UNIT_DISPLAY_NAMES[unit]}
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
                              <SelectItem key={status} value={status}>
                                {EXPIRY_STATUS_DISPLAY_NAMES[status]}
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
                    name="sellingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selling Price</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Enter selling price" 
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
                    name="supplierEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier Email</FormLabel>
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
                        <FormLabel>Supplier Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter supplier phone" {...field} />
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
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="fixed-asset">
        <Card>
          <CardHeader>
            <CardTitle>Add Fixed Asset</CardTitle>
            <CardDescription>
              Add fixed assets for Barista, Kitchen, or Beer Room
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
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
                          <Input placeholder="Enter brand name" {...field} value={field.value || ""} />
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
                          <Input 
                            placeholder="Enter asset location" 
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
                    name="sellingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selling Price (Optional for Merchandise)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Enter selling price" 
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
                    name="supplierEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier Email</FormLabel>
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
                        <FormLabel>Supplier Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter supplier phone" {...field} />
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
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Fixed Asset
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
} 