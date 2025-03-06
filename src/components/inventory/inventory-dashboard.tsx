"use client";

import { useState, useEffect } from "react";
import { InventoryItem } from "@/db/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryTable } from "./inventory-table";
import { AddInventoryForm } from "./add-item-form";
import { InventoryControls } from "./inventory-controls";
import { DashboardCard } from "./dashboard-card";
import { useInventory } from "@/hooks/use-inventory";
import { Skeleton } from "@/components/ui/skeleton";

interface InventoryDashboardProps {
  initialItems: InventoryItem[];
}

export function InventoryDashboard({ initialItems }: InventoryDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Use our custom hook for real-time data
  const { items, isLoading, mutate } = useInventory(selectedCategory !== "all" ? selectedCategory : undefined, searchTerm || undefined);
  
  // Initialize with server-rendered data, then switch to client-side data
  const [displayedItems, setDisplayedItems] = useState<InventoryItem[]>(initialItems);
  
  useEffect(() => {
    if (items.length > 0) {
      setDisplayedItems(items);
    }
  }, [items]);

  // Calculate stats for each category
  const chocolateRoomItems = displayedItems.filter(item => item.category === 'chocolate_room' && !item.isFixedAsset);
  const beerRoomItems = displayedItems.filter(item => item.category === 'beer_room' && !item.isFixedAsset);
  const kitchenItems = displayedItems.filter(item => item.category === 'kitchen' && !item.isFixedAsset);
  const fixedAssets = displayedItems.filter(item => item.isFixedAsset);

  // Calculate expiring soon items (within 7 days)
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const expiringSoon = displayedItems.filter(item => {
    if (!item.expiryDate) return false;
    const expiry = new Date(item.expiryDate);
    return expiry > now && expiry <= oneWeekFromNow;
  });

  // Calculate low stock items (less than 10 units)
  const lowStock = displayedItems.filter(item => !item.isFixedAsset && item.quantity < 10);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // Function to refresh data after add/edit/delete
  const refreshData = () => {
    mutate();
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Chocolate Room"
          value={chocolateRoomItems.length.toString()}
          description="Total items"
          icon="🍫"
        />
        <DashboardCard
          title="Beer Room"
          value={beerRoomItems.length.toString()}
          description="Total items"
          icon="🍺"
        />
        <DashboardCard
          title="Kitchen"
          value={kitchenItems.length.toString()}
          description="Total items"
          icon="🍽️"
        />
        <DashboardCard
          title="Fixed Assets"
          value={fixedAssets.length.toString()}
          description="Total assets"
          icon="🏢"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Expiring Soon"
          value={expiringSoon.length.toString()}
          description="Items expiring within 7 days"
          icon="⏱️"
          variant="warning"
        />
        <DashboardCard
          title="Low Stock"
          value={lowStock.length.toString()}
          description="Items with less than 10 units"
          icon="📉"
          variant="destructive"
        />
        <DashboardCard
          title="Total Items"
          value={displayedItems.length.toString()}
          description="All inventory items"
          icon="📦"
        />
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventory">Inventory List</TabsTrigger>
          <TabsTrigger value="add">Add New Item</TabsTrigger>
        </TabsList>
        
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>
                Manage your inventory items across all categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryControls 
                onSearch={handleSearch}
                onCategoryChange={handleCategoryChange}
                selectedCategory={selectedCategory}
              />
              <div className="mt-6">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <InventoryTable 
                    items={displayedItems} 
                    onItemUpdated={refreshData}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Inventory Item</CardTitle>
              <CardDescription>
                Add a new item to your inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddInventoryForm onItemAdded={refreshData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 