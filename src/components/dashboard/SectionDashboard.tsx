/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { CalendarIcon, PlusCircle, ArchiveIcon, AlertTriangleIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchInventory } from '@/components/inventory/search-inventory';
import { InventoryTable } from '@/components/inventory/inventory-table';
import { AddItemAction, DailyUpdatesAction } from '@/components/action-buttons';

export interface SectionStats {
  totalItems: number;
  lowStock: number;
  expiringSoon: number;
  needsOrdering: number;
}

interface SectionDashboardProps {
  section: 'bakery' | 'bar' | 'kitchen' | 'merchandise';
  title: string;
  description: string;
  stats: SectionStats;
  items:any;
  isLoading?: boolean;
}

export function SectionDashboard({ 
  section, 
  title, 
  description, 
  stats, 
  items,
  isLoading = false 
}: SectionDashboardProps) {
  const sectionColor = {
    bakery: 'bg-amber-100 text-amber-800',
    bar: 'bg-blue-100 text-blue-800',
    kitchen: 'bg-green-100 text-green-800',
    merchandise: 'bg-purple-100 text-purple-800',
  }[section];

  return (
    <div className="flex flex-col gap-5 p-8">
      <PageHeader
        title={title}
        description={description}
        actions={[AddItemAction, DailyUpdatesAction]}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <ArchiveIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalItems}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold">{stats.lowStock}</div>
                {stats.lowStock > 0 && (
                  <Link href={`/inventory/filter/low-stock?section=${section}`}>
                    <Badge variant="destructive">View Items</Badge>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <CalendarIcon className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold">{stats.expiringSoon}</div>
                {stats.expiringSoon > 0 && (
                  <Link href={`/inventory/filter/expiring?section=${section}`}>
                    <Badge variant="warning">View Items</Badge>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Need Ordering</CardTitle>
            <PlusCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold">{stats.needsOrdering}</div>
                {stats.needsOrdering > 0 && (
                  <Link href={`/inventory/filter/needs-ordering?section=${section}`}>
                    <Badge variant="outline">View Items</Badge>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className={`mr-2 inline-block px-2 py-1 text-sm rounded-md ${sectionColor}`}>
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </span>
                Inventory Items
              </CardTitle>
              <CardDescription>
                Manage {section} inventory items and check status
              </CardDescription>
              <SearchInventory subcategory={section} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <InventoryTable items={items} />
              )}
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href={`/inventory/add?subcategory=${section}`}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add {section.charAt(0).toUpperCase() + section.slice(1)} Item
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="low-stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Items</CardTitle>
              <CardDescription>
                Items that need to be restocked soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <InventoryTable 
                  items={items.filter((item: any) => 
                    item.minimumStockLevel !== null && 
                    item.quantity <= item.minimumStockLevel
                  )} 
                />
              )}
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline">
                <Link href={`/inventory/filter/low-stock?section=${section}`}>
                  View All Low Stock Items
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="expiring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expiring Soon</CardTitle>
              <CardDescription>
                Items that will expire in the next 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <InventoryTable 
                  items={items.filter((item: any) => item.expiryStatus === 'expiring_soon')} 
                />
              )}
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline">
                <Link href={`/inventory/filter/expiring?section=${section}`}>
                  View All Expiring Items
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 