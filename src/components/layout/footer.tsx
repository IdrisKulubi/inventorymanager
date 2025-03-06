"use client";

import { ThemeToggle } from "@/components/themes/theme-toggle";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t py-3 px-6 bg-background">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="text-xs text-muted-foreground">
          <p>© {currentYear} The Chocolate Room Hotel Inventory System</p>
          <p className="mt-1">Manage your hotel inventory with ease</p>
        </div>
        <div className="flex items-center space-x-4 mt-2 md:mt-0">
          <span className="text-xs text-muted-foreground mr-2">Toggle theme:</span>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
} 