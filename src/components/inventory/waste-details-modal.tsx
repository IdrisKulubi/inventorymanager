'use client';

import { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Download } from 'lucide-react';

interface WasteDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface WasteItem {
  id: number;
  itemName: string;
  quantity: number;
  value: number;
  date: string;
  reason: string;
  category?: string;
  subcategory?: string;
}

export function WasteDetailsModal({ open, onOpenChange }: WasteDetailsModalProps) {
  const [wasteItems, setWasteItems] = useState<WasteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchWasteData();
    }
  }, [open]);

  const fetchWasteData = async () => {
    setLoading(true);
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const response = await fetch(`/api/inventory/waste?startDate=${thirtyDaysAgo.toISOString().split('T')[0]}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch waste data');
      }
      
      const data = await response.json();
      setWasteItems(data.wasteItems || []);
    } catch (err) {
      console.error('Error fetching waste data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    // Create CSV content
    const csvRows = [
      ['ID', 'Item Name', 'Category', 'Subcategory', 'Quantity', 'Value (Ksh)', 'Date', 'Reason'],
      ...wasteItems.map(item => [
        item.id,
        item.itemName,
        item.category || 'N/A',
        item.subcategory || 'N/A',
        item.quantity,
        item.value,
        item.date,
        item.reason || 'N/A'
      ])
    ];

    const csvContent = csvRows
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `waste-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate totals
  const totalQuantity = wasteItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = wasteItems.reduce((sum, item) => sum + item.value, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Wasted Stock Details (Last 30 Days)</DialogTitle>
          <DialogDescription>
            Items that have been discarded or wasted from inventory
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Loading waste data...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-red-500">Error: {error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchWasteData}>
              Retry
            </Button>
          </div>
        ) : wasteItems.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No wasted items in the last 30 days</p>
          </div>
        ) : (
          <>
            <Table>
              <TableCaption>Wasted items from the last 30 days</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Value (Ksh)</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wasteItems.map((item) => (
                  <TableRow key={`${item.id}-${item.date}`}>
                    <TableCell className="font-medium">{item.itemName}</TableCell>
                    <TableCell>{item.subcategory || item.category || 'N/A'}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.value.toLocaleString()}</TableCell>
                    <TableCell>{format(new Date(item.date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{item.reason || 'N/A'}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold bg-muted/50">
                  <TableCell colSpan={2}>Total</TableCell>
                  <TableCell className="text-right">{totalQuantity}</TableCell>
                  <TableCell className="text-right">{totalValue.toLocaleString()}</TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={wasteItems.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="default" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 