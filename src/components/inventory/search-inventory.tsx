"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchInventoryProps {
  category?: string;
  subcategory?: string;
}

export function SearchInventory({ category, subcategory }: SearchInventoryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set("search", searchTerm);
    } else {
      params.delete("search");
    }
    
    // Handle different routing based on category or subcategory
    if (subcategory) {
      // If subcategory is specified, add it to the URL
      params.set("subcategory", subcategory);
      router.push(`/inventory?${params.toString()}`);
    } else if (category) {
      // If category is specified, use the category route
      router.push(`/inventory/category/${category}?${params.toString()}`);
    } else {
      // Default inventory route with search
      router.push(`/inventory?${params.toString()}`);
    }
  };
  
  return (
    <form onSubmit={handleSearch} className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search inventory..."
        className="pl-8 w-full md:w-[250px]"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </form>
  );
} 