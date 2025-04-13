import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  Calendar, 
  BarChart, 
  Plus, 
  Minus, 
  RotateCcw, 
  Search, 
  Filter, 
  Tag, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Cake 
} from "lucide-react";

export default function HowToUsePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="How to Use Inventory Manager"
        description="A quick guide to help you get started with the inventory management system"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "How to Use" },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Welcome to the Inventory Manager! This guide will help you understand
            how to use the system effectively. The Inventory Manager is designed to
            help you track items across different departments, monitor stock levels,
            and manage inventory efficiently.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle>Inventory Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/50">
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <Search className="h-4 w-4" /> Finding Items
              </h3>
              <p className="text-sm text-muted-foreground">
                Use the search bar at the top of the inventory page to find specific items.
                You can search by name, category, or description.
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-muted/50">
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <Filter className="h-4 w-4" /> Filtering Items
              </h3>
              <p className="text-sm text-muted-foreground">
                Use filters to view low stock items, expiring items, or items that need ordering.
                Click on the filter buttons at the top of the inventory page.
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-muted/50">
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4" /> Categories & Subcategories
              </h3>
              <p className="text-sm text-muted-foreground">
                Items are organized by categories like Bakery, Bar, Kitchen, and Merchandise.
                Click on a category to see all items within it.
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-muted/50">
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <Plus className="h-4 w-4" /> Adding New Items
              </h3>
              <p className="text-sm text-muted-foreground">
                Click the &quot;Add Item&quot; button in the navbar to add a new inventory item.
                Fill in all required details including name, category, and quantity.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Daily Updates</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/50">
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <Plus className="h-4 w-4 text-green-500" /> Adding Stock
              </h3>
              <p className="text-sm text-muted-foreground">
                When new items arrive, go to Daily Updates and select &quot;Add Stock.&quot;
                Enter the quantity received and any relevant notes.
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-muted/50">
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <Minus className="h-4 w-4 text-red-500" /> Removing Stock
              </h3>
              <p className="text-sm text-muted-foreground">
                When items are used or sold, record this by selecting &quot;Remove Stock.&quot;
                Enter the quantity removed and reason (used, sold, damaged, etc.).
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-muted/50">
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <RotateCcw className="h-4 w-4 text-amber-500" /> Adjusting Counts
              </h3>
              <p className="text-sm text-muted-foreground">
                If actual stock doesn&apos;t match the system, use &quot;Adjust Count&quot; to
                update the quantity to match physical inventory.
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-muted/50">
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Low Stock & Expiring
              </h3>
              <p className="text-sm text-muted-foreground">
                The system automatically highlights items that are below minimum
                stock levels or are approaching their expiry date.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary" />
              <CardTitle>Analytics & Reports</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/50">
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4" /> Cost Tracking
              </h3>
              <p className="text-sm text-muted-foreground">
                The system calculates total inventory value based on cost per unit.
                You can view total value by category or for individual items.
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-muted/50">
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4" /> Usage Trends
              </h3>
              <p className="text-sm text-muted-foreground">
                Analytics show usage patterns over time, helping you predict
                when you&apos;ll need to reorder items.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Cake className="h-5 w-5 text-primary" />
              <CardTitle>Bakery-Specific Features</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/50">
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-500" /> Profit Margin
              </h3>
              <p className="text-sm text-muted-foreground">
                For bakery items, you can track both cost price and selling price
                to calculate profit margins.
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-muted/50">
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-500" /> Waste Management
              </h3>
              <p className="text-sm text-muted-foreground">
                Track wasted bakery items separately and analyze waste patterns 
                to minimize losses.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Tips for Best Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <ul className="list-disc list-inside space-y-2">
            <li>Update inventory counts regularly, ideally daily</li>
            <li>Set appropriate minimum stock levels for each item</li>
            <li>Use the notes field to record important information about items</li>
            <li>Check the dashboard regularly for alerts about low stock or expiring items</li>
            <li>Use the search and filter functions to quickly find what you need</li>
            <li>Review analytics monthly to identify trends and optimize inventory levels</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 