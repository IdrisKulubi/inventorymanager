'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { getInventoryTurnover } from '@/lib/actions/logs';

interface TurnoverItem {
  id: number;
  item_name: string;
  category: string;
  total_consumed: number;
  average_inventory: number;
  turnover_rate: number;
}

export function InventoryTurnoverView() {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<TurnoverItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const result = await getInventoryTurnover(period);
        if (result.success && result.turnoverData) {
          setData(result.turnoverData as unknown as TurnoverItem[]);
          setError(null);
        } else {
          setError('Error loading turnover data');
          console.error('Error loading turnover data:', result.error);
        }
      } catch (err) {
        setError('Failed to load inventory turnover data');
        console.error('Error in inventory turnover:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [period]);

  function handleExport() {
    if (!data || data.length === 0) return;
    
    // Create CSV content
    const headers = ['Item', 'Category', 'Total Consumed', 'Average Inventory', 'Turnover Rate'];
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        `"${item.item_name}"`,
        item.category,
        item.total_consumed,
        item.average_inventory.toFixed(2),
        item.turnover_rate.toFixed(2)
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inventory-turnover-${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const getTurnoverRating = (rate: number) => {
    if (rate >= 6) return { label: 'Excellent', color: 'bg-green-500' };
    if (rate >= 4) return { label: 'Good', color: 'bg-emerald-500' };
    if (rate >= 2) return { label: 'Average', color: 'bg-yellow-500' };
    if (rate > 0) return { label: 'Low', color: 'bg-red-500' };
    return { label: 'No Data', color: 'bg-gray-400' };
  };

  // Calculate turnover metrics for visualization
  const calculateMetrics = () => {
    if (!data || data.length === 0) return null;
    
    // Calculate average turnover rate
    const averageTurnover = data.reduce((sum, item) => sum + item.turnover_rate, 0) / data.length;
    
    // Calculate high and low turnover items
    const highTurnover = data.filter(item => item.turnover_rate >= 4).length;
    const lowTurnover = data.filter(item => item.turnover_rate < 2 && item.turnover_rate > 0).length;
    
    // Calculate items with no movement
    const noMovement = data.filter(item => item.turnover_rate === 0).length;
    
    return {
      averageTurnover,
      highTurnover,
      lowTurnover,
      noMovement,
      totalItems: data.length
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <Tabs value={period} onValueChange={(v) => setPeriod(v as 'month' | 'quarter' | 'year')} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="month">Last Month</TabsTrigger>
            <TabsTrigger value="quarter">Last Quarter</TabsTrigger>
            <TabsTrigger value="year">Last Year</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExport}
          disabled={!data || data.length === 0 || isLoading}
        >
          <FileDown className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>
      
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Turnover Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.averageTurnover.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Times per {period}</p>
              <div className="mt-4 h-2 w-full rounded-full bg-gray-200">
                <div 
                  className="h-2 rounded-full bg-blue-500" 
                  style={{ width: `${Math.min(metrics.averageTurnover * 12.5, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">High Turnover Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">{metrics.highTurnover}</div>
              <p className="text-xs text-muted-foreground">{((metrics.highTurnover / metrics.totalItems) * 100).toFixed(1)}% of inventory</p>
              <div className="mt-4 h-2 w-full rounded-full bg-gray-200">
                <div 
                  className="h-2 rounded-full bg-emerald-500" 
                  style={{ width: `${(metrics.highTurnover / metrics.totalItems) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Low Turnover Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{metrics.lowTurnover}</div>
              <p className="text-xs text-muted-foreground">{((metrics.lowTurnover / metrics.totalItems) * 100).toFixed(1)}% of inventory</p>
              <div className="mt-4 h-2 w-full rounded-full bg-gray-200">
                <div 
                  className="h-2 rounded-full bg-yellow-500" 
                  style={{ width: `${(metrics.lowTurnover / metrics.totalItems) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">No Movement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{metrics.noMovement}</div>
              <p className="text-xs text-muted-foreground">{((metrics.noMovement / metrics.totalItems) * 100).toFixed(1)}% of inventory</p>
              <div className="mt-4 h-2 w-full rounded-full bg-gray-200">
                <div 
                  className="h-2 rounded-full bg-red-500" 
                  style={{ width: `${(metrics.noMovement / metrics.totalItems) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Inventory Turnover Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : !data || data.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg font-medium mb-2">No turnover data available</p>
              <p className="text-sm text-muted-foreground">
                Try selecting a different time period or make sure you have inventory logs in the system.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Total Consumed</TableHead>
                    <TableHead className="text-right">Avg. Inventory</TableHead>
                    <TableHead className="text-right">Turnover Rate</TableHead>
                    <TableHead>Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => {
                    const rating = getTurnoverRating(item.turnover_rate);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.item_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {item.category.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{item.total_consumed}</TableCell>
                        <TableCell className="text-right">{item.average_inventory.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{item.turnover_rate.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={rating.color}>
                            {rating.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Understanding Inventory Turnover</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Inventory Turnover Ratio</strong> measures how many times your inventory is sold and replaced in a given period.
            </p>
            <p>
              <strong>Calculation:</strong> Total Items Consumed ÷ Average Inventory
            </p>
            <p>
              <strong>Interpretation:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>High ratio (4+):</strong> Efficient inventory management, good sales, or potentially insufficient inventory</li>
              <li><strong>Low ratio (0-2):</strong> Overstocking, obsolescence, or weak sales</li>
              <li><strong>Optimal range:</strong> Industry-specific, but generally between 2-6</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 