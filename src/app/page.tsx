import Link from 'next/link';
import { ChevronRight, Cake, Beer, UtensilsCrossed, ShoppingBag, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getInventoryStats } from '@/lib/actions/inventory';
import { PageHeader } from "@/components/ui/page-header";

export default async function HomePage() {
  const stats = await getInventoryStats();
  
  // Define section cards with icons, colors, and stats
  const sections = [
    {
      id: 'bakery',
      name: 'Bakery',
      description: 'Manage bakery ingredients, supplies, and products',
      icon: <Cake className="h-8 w-8" />,
      color: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
      stats: stats.subcategoryBreakdown.bakery,
      path: '/dashboard/bakery'
    },
    {
      id: 'bar',
      name: 'Bar',
      description: 'Track beer, wine, spirits, and other bar inventory',
      icon: <Beer className="h-8 w-8" />,
      color: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      stats: stats.subcategoryBreakdown.bar,
      path: '/dashboard/bar'
    },
    {
      id: 'kitchen',
      name: 'Kitchen',
      description: 'Manage kitchen supplies, utensils, and ingredients',
      icon: <UtensilsCrossed className="h-8 w-8" />,
      color: 'bg-green-100 text-green-800 hover:bg-green-200',
      stats: stats.subcategoryBreakdown.kitchen,
      path: '/dashboard/kitchen'
    },
    {
      id: 'merchandise',
      name: 'Merchandise',
      description: 'Track branded merchandise, retail items, and equipment',
      icon: <ShoppingBag className="h-8 w-8" />,
      color: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
      stats: stats.subcategoryBreakdown.merchandise,
      path: '/dashboard/merchandise'
    }
  ];

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex justify-between items-start mb-12">
          <PageHeader
            title="Inventory Manager"
            description="Your comprehensive solution for managing inventory across all departments"
          />
          <Link href="/how-to-use">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 whitespace-nowrap 
                         animate-bounce-subtle 
                         shadow-md shadow-blue-500/40 
                         hover:shadow-lg hover:shadow-blue-500/60 
                         transition-all duration-300"
              style={{
                animation: 'bounce-subtle 2s ease-in-out infinite'
              }}
            >
              <HelpCircle className="h-4 w-4" />
              How to Use
            </Button>
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {sections.map((section) => (
            <Link href={section.path} key={section.id} className="transform transition-all duration-200 hover:scale-105">
              <Card className={`h-full border-2 hover:shadow-lg cursor-pointer ${section.id === 'bakery' ? 'border-amber-200' : section.id === 'bar' ? 'border-blue-200' : section.id === 'kitchen' ? 'border-green-200' : 'border-purple-200'}`}>
                <CardHeader className={`rounded-t-lg ${section.color}`}>
                  <div className="flex items-center gap-3">
                    {section.icon}
                    <CardTitle>{section.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <CardDescription className="text-sm text-gray-600 mb-4">
                    {section.description}
                  </CardDescription>
                  <div className="text-2xl font-bold">{section.stats} items</div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full justify-between group">
                    View Dashboard 
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Updates</CardTitle>
              <CardDescription>
                Items that have been recently updated across all departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-4 rounded-md bg-gray-50">
                  <p className="text-sm font-medium">Summary</p>
                  <div className="grid grid-cols-2 mt-2 gap-y-2">
                    <div className="text-sm text-gray-500">Low Stock Items</div>
                    <div className="text-sm font-medium text-gray-900">{stats.lowStock}</div>
                    <div className="text-sm text-gray-500">Expiring Soon</div>
                    <div className="text-sm font-medium text-gray-900">{stats.expiringSoon}</div>
                    <div className="text-sm text-gray-500">Items Needing Order</div>
                    <div className="text-sm font-medium text-gray-900">{stats.needsOrdering}</div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/inventory">View All Inventory</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and operations for inventory management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="secondary" className="w-full text-left justify-start h-auto py-3 px-4">
                <Link href="/inventory/add">
                  <span className="flex flex-col items-start">
                    <span className="text-base font-medium">Add New Item</span>
                    <span className="text-xs text-gray-500">Create a new inventory item in any section</span>
                  </span>
                </Link>
              </Button>
              
              <Button asChild variant="secondary" className="w-full text-left justify-start h-auto py-3 px-4">
                <Link href="/inventory/daily-updates">
                  <span className="flex flex-col items-start">
                    <span className="text-base font-medium">Daily Updates</span>
                    <span className="text-xs text-gray-500">Record today&apos;s inventory changes</span>
                  </span>
                </Link>
              </Button>
              
              <Button asChild variant="secondary" className="w-full text-left justify-start h-auto py-3 px-4">
                <Link href="/inventory/reports">
                  <span className="flex flex-col items-start">
                    <span className="text-base font-medium">View Reports</span>
                    <span className="text-xs text-gray-500">See inventory analytics and reports</span>
                  </span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}