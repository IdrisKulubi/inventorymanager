'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileDown, FileText, FileSpreadsheet } from 'lucide-react';

interface ProfitExportDialogProps {
  children: React.ReactNode;
}

export function ProfitExportDialog({ children }: ProfitExportDialogProps) {
  const [format, setFormat] = useState<'csv' | 'excel' | 'json'>('excel');
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = () => {
    // Generate URL to profit API with format parameter
    const exportUrl = `/api/reports/profit?format=${format}`;

    if (format === 'json') {
      // Open in new tab for JSON format
      window.open(exportUrl, '_blank');
    } else {
      // Trigger file download for CSV/Excel
      const link = document.createElement('a');
      link.href = exportUrl;
      link.download = `profit-report.${format === 'excel' ? 'xls' : 'csv'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // Close dialog after export
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Profit Report</DialogTitle>
          <DialogDescription>
            Choose your preferred format to export profit data.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <RadioGroup value={format} onValueChange={(value) => setFormat(value as 'csv' | 'excel' | 'json')}>
            <div className="flex items-center space-x-2 mb-4">
              <RadioGroupItem value="excel" id="excel" />
              <Label htmlFor="excel" className="flex items-center">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel (.xls)
                <span className="text-xs text-muted-foreground ml-2">
                  - Formatted report with totals
                </span>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 mb-4">
              <RadioGroupItem value="csv" id="csv" />
              <Label htmlFor="csv" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                CSV
                <span className="text-xs text-muted-foreground ml-2">
                  - Simple data format for any spreadsheet
                </span>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="json" id="json" />
              <Label htmlFor="json" className="flex items-center">
                <FileDown className="h-4 w-4 mr-2" />
                JSON
                <span className="text-xs text-muted-foreground ml-2">
                  - For developers or data analysis
                </span>
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            Export Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 