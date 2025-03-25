import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { InventoryLog } from '@/db/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InventoryLogsProps {
  logs: InventoryLog[];
  className?: string;
}

export function InventoryLogs({ logs, className }: InventoryLogsProps) {
  if (!logs || logs.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Stock History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <p className="text-sm text-muted-foreground">No stock history available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Stock History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}
                  </TableCell>
                  <TableCell>
                    {getActionBadge(log.action)}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {log.quantityBefore != null && log.quantityAfter != null && (
                      <>
                        {log.quantityBefore} → {log.quantityAfter}
                        {log.quantityAfter > log.quantityBefore && (
                          <span className="text-green-500 ml-1">
                            (+{log.quantityAfter - log.quantityBefore})
                          </span>
                        )}
                        {log.quantityAfter < log.quantityBefore && (
                          <span className="text-red-500 ml-1">
                            (-{log.quantityBefore - log.quantityAfter})
                          </span>
                        )}
                      </>
                    )}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {log.valueBefore != null && log.valueAfter != null && (
                      <>
                        Ksh{formatCurrency(log.valueBefore)} → Ksh{formatCurrency(log.valueAfter)}
                      </>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate" title={log.reason || ''}>
                      {log.reason}
                    </div>
                    {log.notes && (
                      <div className="text-xs text-muted-foreground max-w-[200px] truncate" title={log.notes}>
                        {log.notes}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{log.userName || 'System'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function getActionBadge(action: string) {
  switch (action) {
    case 'stock_added':
      return <Badge variant="success">Stock Added</Badge>;
    case 'stock_removed':
      return <Badge variant="destructive">Stock Removed</Badge>;
    case 'count_adjustment':
      return <Badge variant="secondary">Count Adjustment</Badge>;
    case 'item_created':
      return <Badge variant="outline">Item Created</Badge>;
    case 'item_updated':
      return <Badge variant="outline">Item Updated</Badge>;
    case 'item_deleted':
      return <Badge variant="destructive">Item Deleted</Badge>;
    default:
      return <Badge variant="outline">{action}</Badge>;
  }
}

function formatCurrency(value: number) {
  return (value / 100).toFixed(2);
} 