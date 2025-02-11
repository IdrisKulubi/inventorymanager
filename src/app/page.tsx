import { getInventoryItems, getInventoryStats } from "@/lib/actions/inventory";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { InventoryControls } from "@/components/inventory/inventory-controls";
import { DashboardCard } from "@/components/inventory/dashboard-card";
import { ExpiryChart } from "@/components/inventory/expiry-chart";
import { AddInventoryForm } from "@/components/inventory/add-item-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DashboardPageProps {
  searchParams?: Promise<{
    category?: string;
    q?: string;
  }>;
}

export default async function DashboardPage({
  searchParams
}: DashboardPageProps) {
  // Properly await the searchParams promise
  const params = await searchParams;
  
  const categoryFilter = params?.category || "all";
  const searchQuery = params?.q || "";
  
  const [inventory, stats] = await Promise.all([
    getInventoryItems(categoryFilter, searchQuery),
    getInventoryStats()
  ]);

  return (
    <div className="p-6 space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard 
          title="Total Items" 
          value={stats.totalItems}
          icon="📦"
        />
        <DashboardCard 
          title="Expiring Soon" 
          value={stats.expiringSoon}
          variant="destructive"
          icon="⏳"
        />
        <DashboardCard 
          title="Low Stock" 
          value={stats.lowStock}
          variant="warning"
          icon="📉"
        />
      </div>

      {/* Chart Section */}
      <Card>
        <CardHeader>
          <CardTitle>Expiry Overview</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ExpiryChart data={stats.expiryDistribution} />
        </CardContent>
      </Card>

      {/* Inventory Management Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Inventory Management</CardTitle>
            <p className="text-sm text-muted-foreground">
              {stats.totalItems} items across {stats.totalCategories} categories
            </p>
          </div>
          <Dialog>
            <DialogTitle>Add Item</DialogTitle>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <AddInventoryForm />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <InventoryControls 
            items={inventory} 
            initialSearch={searchQuery}
          />
          <InventoryTable items={inventory} />
        </CardContent>
      </Card>
    </div>
  );
}