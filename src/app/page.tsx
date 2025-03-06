import { getInventoryItems } from "@/lib/actions/inventory";
import { InventoryDashboard } from "@/components/inventory/inventory-dashboard";

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
  console.log(params);
  // Get all inventory items
  const inventory = await getInventoryItems();

  return (
    <div className="p-6 space-y-6">
      <InventoryDashboard initialItems={inventory} />
    </div>
  );
}