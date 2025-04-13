import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { getSectionStats } from '@/lib/actions/inventory';
import { SectionDashboard } from '@/components/dashboard/SectionDashboard';

export const dynamic = 'force-dynamic';

async function KitchenDashboardContent() {
  const stats = await getSectionStats('kitchen');
  
  return (
    <SectionDashboard
      section="kitchen"
      title="Kitchen Inventory"
      description="Manage kitchen supplies, utensils, and ingredients"
      stats={{
        totalItems: stats.totalItems,
        lowStock: stats.lowStock,
        expiringSoon: stats.expiringSoon,
        needsOrdering: stats.needsOrdering
      }}
      items={stats.items}
    />
  );
}

export default function KitchenDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col gap-5 p-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-4 w-[350px]" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
      </div>
    }>
      <KitchenDashboardContent />
    </Suspense>
  );
} 