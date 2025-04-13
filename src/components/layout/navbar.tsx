"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddItemDialog } from "@/components/inventory/add-item-dialog";

const navLinks = [
  { name: "Dashboard", href: "/" },
  { name: "Inventory", href: "/inventory" },
  { name: "Bakery", href: "/inventory/subcategory/bakery" },
  { name: "Daily Updates", href: "/inventory/daily-updates" },
  { name: "Analytics", href: "/analytics" },
];

export function Navbar() {
  const pathname = usePathname();
  
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-md transition-all dark:bg-gray-950/90">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-700 via-amber-500 to-amber-800 bg-clip-text text-transparent dark:from-amber-200 dark:via-amber-400 dark:to-amber-300">
              Inventory Manager
            </h1>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === link.href 
                    ? "text-foreground" 
                    : "text-muted-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <AddItemDialog 
            className="hidden md:flex"
            trigger={
              <Button size="sm" variant="default">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            }
          />
          
          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary py-2",
                      pathname === link.href 
                        ? "text-foreground font-semibold" 
                        : "text-muted-foreground"
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="mt-4">
                  <AddItemDialog 
                    trigger={
                      <Button size="sm" variant="default" className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Item
                      </Button>
                    }
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}