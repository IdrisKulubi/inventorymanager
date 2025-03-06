"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CATEGORY_DISPLAY_NAMES } from "@/lib/constants";
import { Download, Search } from "lucide-react";
import { useState } from "react";

export function InventoryControls({ 
  onSearch,
  onCategoryChange,
  selectedCategory = "all"
}: { 
  onSearch: (term: string) => void;
  onCategoryChange: (category: string) => void;
  selectedCategory?: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Search inventory..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="secondary">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>

      <div className="flex flex-wrap gap-4">
        <Select 
          value={selectedCategory} 
          onValueChange={onCategoryChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="chocolate_room">{CATEGORY_DISPLAY_NAMES.chocolate_room}</SelectItem>
            <SelectItem value="beer_room">{CATEGORY_DISPLAY_NAMES.beer_room}</SelectItem>
            <SelectItem value="kitchen">{CATEGORY_DISPLAY_NAMES.kitchen}</SelectItem>
            <SelectItem value="fixed-assets">Fixed Assets</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
} 