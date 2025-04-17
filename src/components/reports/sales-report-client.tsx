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
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Download, Filter, Printer, DollarSign, Cake, 
  Beer, UtensilsCrossed, ShoppingBag, BarChart, 
  FileText
} from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { getSalesReport } from '@/lib/actions/reports';

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
    { id: 'barista', label: 'Barista' },
    { id: 'other_chocolate', label: 'Other' },
  ],
  beer_room: [
    { id: 'beer', label: 'Beer' },
    { id: 'whisky', label: 'Whiskey' },
    { id: 'wine', label: 'Wine' },
    { id: 'spirits', label: 'Spirits' },
    { id: 'other_alcohol', label: 'Other' },
  ],
  kitchen: [
    { id: 'ingredients', label: 'Ingredients' },
    { id: 'utensils', label: 'Utensils' },
    { id: 'appliances', label: 'Appliances' },
    { id: 'other_kitchen', label: 'Other' },
  ],
  fixed_assets: [
    { id: 'general_assets', label: 'General Assets' },
  ]
};

// Time periods for filtering
const TIME_PERIODS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'quarter', label: 'This Quarter' },
  { id: 'year', label: 'This Year' },
];

// Define interface for the sales report item data
interface SalesReportItem {
  id: number;
  name: string;
  subcategory: string;
  subtype: string;
  price: number;
  cost: number;
  quantitySold: number;
  revenue: number;
  profit: number;
  profitMargin: number;
}

// Define interface for the summary data state
interface SalesSummaryData {
  totalSales: number;
  totalItems: number;
  averagePrice: number;
  topItem: { name: string; quantity: number; revenue: number } | null;
}

// Define interface for the reduce accumulator
interface SubtypeSalesAccumulator {
  [subtype: string]: {
    revenue: number;
    quantity: number;
    profit: number;
  };
}

export function SalesReportClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'chocolate_room'
  );
  
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(
    searchParams.get('subcategory') || 'all'
  );
  
  const [selectedPeriod, setSelectedPeriod] = useState<string>(
    searchParams.get('period') || 'month'
  );
  
  const [viewType, setViewType] = useState<string>(
    searchParams.get('view') || 'detail'
  );
  
  const [loading, setLoading] = useState(false);
  // Use the defined interface for reportData state
  const [reportData, setReportData] = useState<SalesReportItem[]>([]);
  // Use the defined interface for summaryData state
  const [summaryData, setSummaryData] = useState<SalesSummaryData>({
    totalSales: 0,
    totalItems: 0,
    averagePrice: 0,
    topItem: null,
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedSubcategory && selectedSubcategory !== 'all') {
      params.set('subcategory', selectedSubcategory);
    }
    if (selectedPeriod) params.set('period', selectedPeriod);
    if (viewType) params.set('view', viewType);
    
    const newUrl = `/reports/sales?${params.toString()}`;
    router.replace(newUrl);
    
    // Fetch real data from the database
    fetchSalesData();
  }, [selectedCategory, selectedSubcategory, selectedPeriod, viewType, router]);

  // Calculate date range based on selected period
  const getDateRangeFromPeriod = (period: string): { startDate: string, endDate: string } => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'today':
        // Start and end are the same day
        break;
      case 'yesterday':
        startDate.setDate(startDate.getDate() - 1);
        endDate.setDate(endDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        // Default to last 30 days
        startDate.setDate(startDate.getDate() - 30);
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  // Fetch real sales data from the database
  const fetchSalesData = async () => {
    setLoading(true);

    try {
      const { startDate, endDate } = getDateRangeFromPeriod(selectedPeriod);
      
      const result = await getSalesReport({
        category: selectedCategory,
        subcategory: selectedSubcategory !== 'all' ? selectedSubcategory : undefined,
        startDate,
        endDate
      });
      
      if (result.success) {
        setReportData(result.items);
        setSummaryData(result.summary);
      } else {
        console.error('Failed to fetch sales report:', result.error);
        setReportData([]);
        setSummaryData({
          totalSales: 0,
          totalItems: 0,
          averagePrice: 0,
          topItem: null
        });
      }
    } catch (error) {
      console.error('Error fetching sales report:', error);
      setReportData([]);
      setSummaryData({
        totalSales: 0,
        totalItems: 0,
        averagePrice: 0,
        topItem: null
      });
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

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
  };

  const handleViewTypeChange = (value: string) => {
    setViewType(value);
  };

  const exportToCsv = () => {
    if (reportData.length === 0) return;
    
    // Format data for CSV
    const headers = ['Name', 'Category', 'Type', 'Price', 'Cost', 'Quantity Sold', 'Revenue', 'Profit', 'Profit Margin (%)'];
    const csvData = reportData.map(item => [
      item.name,
      selectedCategory,
      item.subtype,
      item.price,
      item.cost,
      item.quantitySold,
      item.revenue,
      item.profit,
      item.profitMargin
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
    link.setAttribute('download', `sales-report-${selectedCategory}-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const getCategoryLabel = (categoryId: string) => {
    return CATEGORIES.find(c => c.id === categoryId)?.label || categoryId;
  };

  const getPeriodLabel = (periodId: string) => {
    return TIME_PERIODS.find(p => p.id === periodId)?.label || periodId;
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
            title="Sales Report"
            description={`View detailed sales performance for ${getCategoryLabel(selectedCategory)}${selectedSubcategory !== 'all' ? ' - ' + selectedSubcategory : ''} (${getPeriodLabel(selectedPeriod)})`}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
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
            
            <div>
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
            
            <div>
              <label className="text-sm font-medium mb-2 block">Time Period</label>
              <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_PERIODS.map(period => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Sales summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-blue-50 dark:bg-blue-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <DollarSign className="h-5 w-5 text-blue-500 mr-1" />
              {loading ? <Skeleton className="h-8 w-24" /> : summaryData.totalSales.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 dark:bg-green-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Items Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-24" /> : summaryData.totalItems.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-amber-50 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <DollarSign className="h-5 w-5 text-amber-500 mr-1" />
              {loading ? <Skeleton className="h-8 w-24" /> : summaryData.averagePrice.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 dark:bg-purple-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Best Seller</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div>
                <div className="font-medium truncate">{summaryData.topItem?.name || 'None'}</div>
                <div className="text-sm text-muted-foreground">{summaryData.topItem?.quantity || 0} items</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Report content */}
      <Tabs value={viewType} onValueChange={handleViewTypeChange} className="mb-8">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="detail">
            <FileText className="h-4 w-4 mr-2" />
            Detailed View
          </TabsTrigger>
          <TabsTrigger value="summary">
            <BarChart className="h-4 w-4 mr-2" />
            Summary View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="detail">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-muted-foreground mr-2" />
                <CardTitle>Sales Detail</CardTitle>
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
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                        <TableHead className="text-right">Qty Sold</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Profit</TableHead>
                        <TableHead className="text-right">Margin %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.subtype}</TableCell>
                          <TableCell className="text-right">Ksh{item.price}</TableCell>
                          <TableCell className="text-right text-muted-foreground">Ksh{item.cost}</TableCell>
                          <TableCell className="text-right">{item.quantitySold}</TableCell>
                          <TableCell className="text-right">Ksh{item.revenue}</TableCell>
                          <TableCell className="text-right text-green-600">Ksh{item.profit}</TableCell>
                          <TableCell className="text-right font-medium">{item.profitMargin}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                // Empty state
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No sales data available for the selected filters.</p>
                  <p className="text-sm text-muted-foreground mt-2">Try selecting a different category, subcategory, or time period.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <BarChart className="h-5 w-5 text-muted-foreground mr-2" />
                <CardTitle>Sales Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-60 w-full" />
                </div>
              ) : reportData.length > 0 ? (
                <div className="space-y-6">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h3 className="text-sm font-medium mb-3">Sales by Item Type</h3>
                    <div className="space-y-3">
                      {/* Group and aggregate by subtype */}
                      {Object.entries(
                        // Provide the explicit type for the reduce accumulator initial value
                        reportData.reduce((acc, item) => {
                          if (!acc[item.subtype]) {
                            acc[item.subtype] = { 
                              revenue: 0, 
                              quantity: 0,
                              profit: 0
                            };
                          }
                          acc[item.subtype].revenue += item.revenue;
                          acc[item.subtype].quantity += item.quantitySold;
                          acc[item.subtype].profit += item.profit;
                          return acc;
                        }, {} as SubtypeSalesAccumulator)
                      ).map(([subtype, data]) => {
                        // 'data' is now correctly typed
                        const percentage = summaryData.totalSales > 0 
                          ? Math.round((data.revenue / summaryData.totalSales) * 100) 
                          : 0;
                        return (
                          <div key={subtype} className="flex flex-col">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium capitalize">
                                {subtype}
                              </span>
                              <span className="text-sm">
                                {data.quantity} items | Ksh{data.revenue.toLocaleString()}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h3 className="text-sm font-medium mb-3">Top 5 Items by Revenue</h3>
                    <div className="space-y-3">
                      {/* Sort by revenue and take top 5 */}
                      {reportData
                        .sort((a, b) => b.revenue - a.revenue)
                        .slice(0, 5)
                        .map(item => {
                          const percentage = summaryData.totalSales > 0
                            ? Math.round((item.revenue / summaryData.totalSales) * 100)
                            : 0;
                          return (
                            <div key={item.id} className="flex flex-col">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">
                                  {item.name}
                                </span>
                                <span className="text-sm">
                                  Ksh{item.revenue.toLocaleString()} ({percentage}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div 
                                  className="bg-green-500 h-2.5 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No sales data available for the selected filters.</p>
                  <p className="text-sm text-muted-foreground mt-2">Try selecting a different category, subcategory, or time period.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 