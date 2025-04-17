import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, BoxesIcon, ReceiptIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Inventory Reports",
  description: "View stock and sales reports for your inventory"
};

export default function ReportsPage() {
  const reportTypes = [
    {
      title: "Stock Reports",
      description: "View detailed stock reports by category and subcategory",
      icon: <BoxesIcon className="h-8 w-8 text-blue-500" />,
      href: "/reports/stock",
      color: "border-blue-200 hover:border-blue-300",
    },
    {
      title: "Sales Reports",
      description: "View detailed sales reports by category and subcategory",
      icon: <ReceiptIcon className="h-8 w-8 text-green-500" />,
      href: "/reports/sales",
      color: "border-green-200 hover:border-green-300",
    },
  ];

  return (
    <div className="container py-10 max-w-7xl">
      <PageHeader
        title="Inventory Reports"
        description="Generate and view detailed reports on your inventory"
        className="mb-8"
      />

      <div className="grid gap-8 md:grid-cols-2 mb-12">
        {reportTypes.map((report, index) => (
          <Link href={report.href} key={index}>
            <Card className={`h-full border-2 hover:shadow-lg cursor-pointer transition-all duration-200 ${report.color}`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {report.icon}
                  <CardTitle>{report.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-gray-600 mb-4">
                  {report.description}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full justify-between group">
                  View Reports
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports Help</CardTitle>
          <CardDescription>How to use the reports feature</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Stock Reports</h3>
            <p className="text-sm text-muted-foreground">
              Stock reports show current inventory levels, sales, balance, and waste for each item
              categorized by department and subcategory. Use these reports to track inventory turnover 
              and identify areas for optimization.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Sales Reports</h3>
            <p className="text-sm text-muted-foreground">
              Sales reports provide detailed insights into sales performance by category and item.
              These reports help track quantities sold, revenue, and identify top-performing products.
            </p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4 mt-4">
            <p className="text-sm font-medium">Tips:</p>
            <ul className="text-sm text-muted-foreground mt-2 list-disc list-inside space-y-1">
              <li>Use the dropdown filters to focus on specific departments or subcategories</li>
              <li>Export reports as CSV files for further analysis or record-keeping</li>
              <li>Schedule regular reviews of reports to optimize inventory management</li>
              <li>Compare reports over time to identify trends and seasonal patterns</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 