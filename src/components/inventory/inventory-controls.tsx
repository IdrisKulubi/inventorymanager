"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InventoryItem } from "@/db/schema";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function InventoryControls({ 
  items,
  initialSearch
}: { 
  items: InventoryItem[];
  initialSearch?: string;
}) {
  const router = useRouter();
  const categories = Array.from(new Set(items.map(item => item.category)));

  const handleCategoryChange = useCallback((category: string) => {
    const params = new URLSearchParams();
    if (category && category !== "all") params.set("category", category);
    if (initialSearch) params.set("q", initialSearch);
    router.push(`?${params.toString()}`);
  }, [router, initialSearch]);

  const handleExport = useCallback(() => {
    const csvContent = [
      ["ID", "Item Name", "Category", "Quantity", "Unit", "Expiry Date", "Supplier"],
      ...items.map(item => [
        item.id,
        item.itemName,
        item.category,
        item.quantity,
        item.unit,
        new Date(item.expiryDate).toLocaleDateString(),
        item.supplierContact
      ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory-export.csv";
    a.click();
  }, [items]);

  return (
    <div className="flex gap-4 mb-4">
      <Select onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map(category => (
            <SelectItem key={category} value={category}>{category}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button onClick={handleExport}>
        Export CSV
      </Button>
    </div>
  );
} 