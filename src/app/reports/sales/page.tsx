import React, { Suspense } from 'react';
import { SalesReportClient } from '@/components/reports/sales-report-client';
import { Skeleton } from '@/components/ui/skeleton'; // Assuming you have a Skeleton component

// Simple loading component
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
      {/* Simulate summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      {/* Simulate tabs */}
      <Skeleton className="h-10 w-full" />
      {/* Simulate table/content area */}
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

export default function SalesReportPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SalesReportClient />
    </Suspense>
  );
} 