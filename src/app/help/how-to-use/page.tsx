import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, LayoutDashboard, Package, CalendarDays, BarChart3, Tag, Clipboard, FileEdit, ShoppingCart, Clock, List, Plus, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How to Use | Inventory Manager",
  description: "Learn how to use the Inventory Manager system.",
};

export default function HowToUsePage() {
  const sections = [
    {
      title: "Getting Started",
      description: "Basic navigation and orientation",
      icon: <LayoutDashboard className="h-6 w-6 text-blue-500" />,
      steps: [
        {
          title: "Dashboard",
          description: "Your starting point with an overview of all departments. Click on any card to view its section in detail.",
          icon: <LayoutDashboard className="h-5 w-5 text-blue-500" />,
        },
        {
          title: "Navigation Bar",
          description: "Use the top menu to quickly jump between Dashboard, Inventory, Daily Updates, and Analytics.",
          icon: <List className="h-5 w-5 text-blue-500" />,
        },
        {
          title: "Add Items",
          description: "Click the 'Add Item' button in the top right corner to add new inventory items from anywhere in the system.",
          icon: <Plus className="h-5 w-5 text-green-500" />,
        },
      ],
    },
    {
      title: "Inventory Management",
      description: "How to work with inventory items",
      icon: <Package className="h-6 w-6 text-purple-500" />,
      steps: [
        {
          title: "View Inventory",
          description: "See all items organized by category (Bakery, Bar, Kitchen, Merchandise). Filter by subcategories for focused views.",
          icon: <Tag className="h-5 w-5 text-purple-500" />,
        },
        {
          title: "Search",
          description: "Use the search bar to quickly find specific items by name, brand, or category.",
          icon: <Search className="h-5 w-5 text-purple-500" />,
        },
        {
          title: "Item Details",
          description: "Click on any item to see full details, including stock levels, expiry dates, and supplier information.",
          icon: <FileEdit className="h-5 w-5 text-purple-500" />,
        },
      ],
    },
    {
      title: "Daily Updates",
      description: "Recording and tracking inventory changes",
      icon: <CalendarDays className="h-6 w-6 text-amber-500" />,
      steps: [
        {
          title: "Add Stock",
          description: "Record new inventory arrivals with quantity, cost, and expiry information.",
          icon: <ShoppingCart className="h-5 w-5 text-amber-500" />,
        },
        {
          title: "Remove Stock",
          description: "Track consumption, sales, or wastage by recording stock removals.",
          icon: <Clipboard className="h-5 w-5 text-amber-500" />,
        },
        {
          title: "Count Adjustment",
          description: "Update inventory counts after physical stocktakes to maintain accuracy.",
          icon: <Clock className="h-5 w-5 text-amber-500" />,
        },
      ],
    },
    {
      title: "Analytics & Reports",
      description: "Understanding inventory performance",
      icon: <BarChart3 className="h-6 w-6 text-teal-500" />,
      steps: [
        {
          title: "Department Views",
          description: "See performance metrics for specific departments with visual charts and graphs.",
          icon: <BarChart3 className="h-5 w-5 text-teal-500" />,
        },
        {
          title: "Expiry Tracking",
          description: "Monitor items approaching their expiry date to minimize waste.",
          icon: <Clock className="h-5 w-5 text-red-500" />,
        },
        {
          title: "Stock Alerts",
          description: "View items that need reordering based on minimum stock levels.",
          icon: <ShoppingCart className="h-5 w-5 text-teal-500" />,
        },
      ],
    },
  ];

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-8 flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">How to Use Inventory Manager</h1>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
          Your step-by-step guide to efficiently manage inventory across all departments
        </p>
      </div>

      <div className="grid gap-8">
        {sections.map((section, idx) => (
          <Card key={idx} className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <div className="flex items-center gap-3">
                {section.icon}
                <div>
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {section.steps.map((step, stepIdx) => (
                  <div key={stepIdx} className="flex gap-4">
                    <div className="flex-shrink-0 flex items-start pt-1">
                      {step.icon}
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{step.title}</h3>
                      <p className="text-muted-foreground text-sm">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-12 bg-blue-50 dark:bg-blue-950/30 p-6 rounded-lg border border-blue-100 dark:border-blue-900">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          Need More Help?
        </h2>
        <p className="text-muted-foreground mb-4">
          If you need additional assistance or have specific questions about using the Inventory Manager, please contact your system administrator or refer to the full documentation.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button variant="outline" asChild>
            <Link href="/help/faq">
              Frequently Asked Questions
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/help/contact">
              Contact Support
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 