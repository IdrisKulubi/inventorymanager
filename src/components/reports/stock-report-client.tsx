/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Download, Filter, Printer, FileText, Cake, 
  Beer, UtensilsCrossed, ShoppingBag 
} from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { getStockReport } from '@/lib/actions/reports';

// Category options with proper mapping
const CATEGORIES = [
  { id: 'chocolate_room', label: 'Bakery', icon: <Cake className="h-4 w-4" /> },
  { id: 'beer_room', label: 'Beer', icon: <Beer className="h-4 w-4" /> },
  { id: 'kitchen', label: 'Kitchen', icon: <UtensilsCrossed className="h-4 w-4" /> },
  { id: 'fixed_assets', label: 'Merchandise', icon: <ShoppingBag className="h-4 w-4" /> },
];

// Subcategory mappings
const SUBCATEGORIES = {
  chocolate_room: [
    { id: 'chocolates', label: 'Chocolates' },
    { id: 'bakery', label: 'Bakery' },  
    { id: 'muffin', label: 'Muffin' },
    { id: 'cake', label: 'Cake' }, // Adjusted ID
    { id: 'chocolate_bowl', label: 'Chocolate Bowl' },
    { id: 'barista', label: 'Barista' },
    { id: 'croissant', label: 'Croissant' }, 
    { id: 'brownie', label: 'Brownie' },
    { id: 'other_chocolate', label: 'Other' },
    { id: 'chocolate_room_assets', label: 'Assets' },
  ],
  beer_room: [
    { id: 'beer', label: 'Beer' },
    { id: 'whisky', label: 'Whiskey' },
    { id: 'wine', label: 'Wine' },
    { id: 'spirits', label: 'Spirits' },
    { id: 'other_alcohol', label: 'Other' },
    { id: 'beer_room_assets', label: 'Assets' },
  ],
  kitchen: [
    { id: 'ingredients', label: 'Ingredients' },
    { id: 'utensils', label: 'Utensils' },
    { id: 'appliances', label: 'Appliances' },
    { id: 'other_kitchen', label: 'Other' },
    { id: 'kitchen_assets', label: 'Assets' },
  ],
  fixed_assets: [
    { id: 'general_assets', label: 'General Assets' },
  ]
};

// Define interface for report item data
interface StockReportItem {
  id: number;
  name: string;
  subcategory: string;
  stock: number;
  sales: number;
  waste: number;
  balance: number;
}

export function StockReportClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'chocolate_room'
  );
  
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(
    searchParams.get('subcategory') || 'all'
  );
  
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<StockReportItem[]>([]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedSubcategory && selectedSubcategory !== 'all') {
      params.set('subcategory', selectedSubcategory);
    }
    
    const newUrl = `/reports/stock?${params.toString()}`;
    router.replace(newUrl);
    
    // Fetch real data from the database
    fetchReportData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedSubcategory, router]);

  // Fetch real data from the database
  const fetchReportData = async () => {
    setLoading(true);
    
    try {
      const result = await getStockReport({
        category: selectedCategory,
        subcategory: selectedSubcategory !== 'all' ? selectedSubcategory : undefined
      });
      
      if (result.success) {
        setReportData(result.items);
      } else {
        console.error('Failed to fetch stock report:', result.error);
        setReportData([]);
      }
    } catch (error) {
      console.error('Error fetching stock report:', error);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSelectedSubcategory('all'); // Reset subcategory to 'all'
  };

  const handleSubcategoryChange = (value: string) => {
    setSelectedSubcategory(value);
  };

  const exportToCsv = () => {
    if (reportData.length === 0) return;
    
    // Format data for CSV
    const headers = ['Name', 'Category', 'Subcategory', 'Initial Stock', 'Sales', 'Waste', 'Balance'];
    const csvData = reportData.map(item => [
      item.name,
      selectedCategory,
      item.subcategory,
      item.stock,
      item.sales,
      item.waste,
      item.balance
    ]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `stock-report-${selectedCategory}-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const getCategoryLabel = (categoryId: string) => {
    return CATEGORIES.find(c => c.id === categoryId)?.label || categoryId;
  };

  return (
    <div className="container py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <Link href="/reports" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports
          </Link>
          <PageHeader
            title="Stock Report"
            description={`View detailed inventory stock levels, sales, and waste for ${getCategoryLabel(selectedCategory)}${selectedSubcategory !== 'all' ? ' - ' + selectedSubcategory : ''}`}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportToCsv}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-muted-foreground mr-2" />
            <CardTitle>Report Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/2">
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center">
                        {category.icon}
                        <span className="ml-2">{category.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-1/2">
              <label className="text-sm font-medium mb-2 block">Subcategory</label>
              <Select value={selectedSubcategory} onValueChange={handleSubcategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All subcategories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All subcategories</SelectItem>
                  {SUBCATEGORIES[selectedCategory as keyof typeof SUBCATEGORIES]?.map(subcategory => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Report content */}
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-muted-foreground mr-2" />
            <CardTitle>Stock Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            // Loading state
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : reportData.length > 0 ? (
            // Report table
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Initial Stock</TableHead>
                    <TableHead className="text-right">Sales</TableHead>
                    <TableHead className="text-right">Waste</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.subcategory}</TableCell>
                      <TableCell className="text-right">{item.stock}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{item.sales}</TableCell>
                      <TableCell className="text-right text-red-500">{item.waste}</TableCell>
                      <TableCell className="text-right font-medium">{item.balance}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            // Empty state
            <div className="text-center py-8">
              <p className="text-muted-foreground">No data available for the selected filters.</p>
              <p className="text-sm text-muted-foreground mt-2">Try selecting a different category or subcategory.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 