'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { getVarianceReport } from '@/lib/actions/logs';
import { Loader2, FileDown, Calendar } from 'lucide-react';

interface VarianceRow {
  id: number;
  item_name: string;
  category: string;
  subcategory: string | null;
  date_stamp: string;
  added: number;
  removed: number;
  adjusted: number;
  daily_variance: number;
}

export function VarianceReport() {
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() - 7))
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<{
    variances: VarianceRow[];
    startDate: string;
    endDate: string;
  } | null>(null);

  async function loadReport() {
    if (!startDate || !endDate) return;
    
    setIsLoading(true);
    try {
      const result = await getVarianceReport(startDate, endDate);
      if (result.success && result.variances && result.startDate && result.endDate) {
        setData({
          variances: result.variances as unknown as VarianceRow[],
          startDate: result.startDate,
          endDate: result.endDate
        });
      } else {
        console.error('Error loading variance report:', 'success' in result ? result.error : 'Unknown error');
      }
    } catch (error) {
      console.error('Error loading variance report:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function exportCsv() {
    if (!data || !data.variances.length) return;
    
    // Create CSV content
    const headers = ['Date', 'Item', 'Category', 'Subcategory', 'Added', 'Removed', 'Adjusted', 'Daily Variance'];
    const csvContent = [
      headers.join(','),
      ...data.variances.map(row => [
        row.date_stamp,
        `"${row.item_name}"`,
        row.category,
        row.subcategory || '',
        row.added,
        row.removed,
        row.adjusted,
        row.daily_variance
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `variance-report-${data.startDate}-to-${data.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <CardTitle>Daily Variance Report</CardTitle>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2">
            <DatePicker
              date={startDate}
              onSelect={setStartDate}
              disabled={isLoading}
              label="Start Date"
              align="start"
            />
            <DatePicker
              date={endDate}
              onSelect={setEndDate}
              disabled={isLoading}
              label="End Date"
              align="start"
            />
          </div>
          <Button onClick={loadReport} disabled={isLoading || !startDate || !endDate} className="whitespace-nowrap">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data && data.variances.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-muted-foreground">
                Showing variance from {format(new Date(data.startDate), 'MMM d, yyyy')} to {format(new Date(data.endDate), 'MMM d, yyyy')}
              </div>
              <Button onClick={exportCsv} variant="outline" size="sm">
                <FileDown className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <ScrollArea className="h-[500px] w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Added</TableHead>
                    <TableHead className="text-right">Removed</TableHead>
                    <TableHead className="text-right">Adjusted</TableHead>
                    <TableHead className="text-right">Daily Variance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.variances.map((row, index) => (
                    <TableRow key={`${row.id}-${row.date_stamp}-${index}`}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {format(new Date(row.date_stamp), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>{row.item_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {row.category.replace('_', ' ')}
                          {row.subcategory && ` › ${row.subcategory.replace('_', ' ')}`}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {row.added > 0 ? <span className="text-green-500">+{row.added}</span> : '0'}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.removed > 0 ? <span className="text-red-500">-{row.removed}</span> : '0'}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.adjusted !== 0 ? (
                          <span className={row.adjusted > 0 ? 'text-yellow-500' : 'text-yellow-500'}>
                            {row.adjusted > 0 ? `+${row.adjusted}` : row.adjusted}
                          </span>
                        ) : '0'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span className={getDailyVarianceClass(row.daily_variance)}>
                          {row.daily_variance > 0 ? `+${row.daily_variance}` : row.daily_variance}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </>
        ) : data && data.variances.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg font-medium mb-2">No variance data found</p>
            <p className="text-sm text-muted-foreground">
              Try selecting a different date range or make sure you have inventory logs in the system.
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-lg font-medium mb-2">Select a date range to generate the report</p>
            <p className="text-sm text-muted-foreground">
              This report will show daily changes in inventory by item across the selected period.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getDailyVarianceClass(variance: number): string {
  if (variance > 0) return 'text-green-500';
  if (variance < 0) return 'text-red-500';
  return '';
} 