import React, { Suspense } from 'react';
import { StockReportClient } from '@/components/reports/stock-report-client';
import { Skeleton } from '@/components/ui/skeleton';

// Loading skeleton for the stock report page
function LoadingFallback() {
  return (
    <div className="container py-8 max-w-7xl space-y-8">
      {/* Simulate header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full mt-1" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      {/* Simulate filters */}
      <Skeleton className="h-40 w-full" />
      {/* Simulate table/content area */}
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

export default function StockReportPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <StockReportClient />
    </Suspense>
  );
} 