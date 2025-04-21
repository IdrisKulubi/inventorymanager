/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import db from "@/db/drizzle";
import { inventoryItems } from "@/db/schema";
import { eq, sql, or, and} from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { InventoryItem, NewInventoryItem } from "@/db/schema";
import { InventoryFormValues } from "../validators";

export async function addInventoryItem(item: NewInventoryItem) {
  try {
    await db.insert(inventoryItems).values(item);
    
    // Revalidate the path to update the UI
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Error adding inventory item:", error);
    return { success: false, error: "Failed to add item" };
  }
}

export async function updateInventoryItem(values: InventoryFormValues & { id: number, expiryDate?: string }) {
  try {
    const { id, ...item } = values;
    
    await db.update(inventoryItems)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .set(item as any)
      .where(eq(inventoryItems.id, id));
    
    // Revalidate the path to update the UI
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Error updating inventory item:", error);
    return { success: false, error: "Failed to update item" };
  }
}

export async function deleteInventoryItem(id: number) {
  try {
    await db.delete(inventoryItems)
      .where(eq(inventoryItems.id, id));
    
    // Revalidate specific paths instead of the entire app
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    return { success: false, error: "Failed to delete item" };
  }
}

export async function getInventoryItems(category?: string, search?: string) {
  try {
    const query = db.select().from(inventoryItems);
    
    if (category) {
      if (category === "fixed_assets") {
        query.where(eq(inventoryItems.category, "fixed_assets"));
      } else if (category === "beer_room") {
        query.where(eq(inventoryItems.category, "beer_room"));
      } else if (category === "chocolate_room") {
        query.where(eq(inventoryItems.category, "chocolate_room"));
      } else if (category === "kitchen") {
        query.where(eq(inventoryItems.category, "kitchen"));
      }
    }
    
    if (search) {
      query.where(
        or(
          sql`${inventoryItems.itemName} ILIKE ${`%${search}%`}`,
          sql`${inventoryItems.brand} ILIKE ${`%${search}%`}`,
          sql`${inventoryItems.subcategory} ILIKE ${`%${search}%`}`
        )
      );
    }

    // Order by expiry date for consumables, and by name for fixed assets
    query.orderBy(
      sql`CASE WHEN ${inventoryItems.isFixedAsset} = true THEN 1 ELSE 0 END`,
      sql`CASE WHEN ${inventoryItems.expiryDate} IS NULL THEN 1 ELSE 0 END`,
      inventoryItems.expiryDate,
      inventoryItems.itemName
    );

    return await query;
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    return [];
  }
}

export async function getItemsNeedingOrder() {
  try {
    return await db.select()
      .from(inventoryItems)
      .where(
        and(
          sql`order_quantity > 0`,
          sql`quantity <= minimum_stock_level`
        )
      );
  } catch (error) {
    console.error("Error fetching items needing order:", error);
    return [];
  }
}

export async function exportToCSV(items: InventoryItem[]) {
  const csvContent = [
    ["ID", "Item", "Category", "Subcategory", "Quantity", "Order Quantity", "Unit", "Cost", "Shelf Life", "Expiry Date", "Expiry Status", "Supplier", "Email", "Phone", "Fixed Asset", "Location"],
    ...items.map(item => [
      item.id,
      item.itemName,
      item.category,
      item.subcategory,
      item.quantity,
      item.orderQuantity || "N/A",
      item.unit,
      item.cost ? `$${item.cost.toLocaleString()}` : "N/A",
      item.shelfLifeValue && item.shelfLifeUnit ? `${item.shelfLifeValue} ${item.shelfLifeUnit}` : "N/A",
      item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "N/A",
      item.expiryStatus || "N/A",
      item.supplierName || "N/A",
      item.supplierEmail || "N/A",
      item.supplierPhone || "N/A",
      item.isFixedAsset ? "Yes" : "No",
      item.assetLocation || "N/A"
    ])
  ].map(e => e.join(",")).join("\n");
  
  return csvContent;
}

export async function getInventoryStats() {
  try {
    const items = await db.select().from(inventoryItems);
    
    const now = new Date();

    // Count items by category
    const chocolateRoomItems = items.filter(item => item.category === 'chocolate_room' && !item.isFixedAsset).length;
    const beerRoomItems = items.filter(item => item.category === 'beer_room' && !item.isFixedAsset).length;
    const kitchenItems = items.filter(item => item.category === 'kitchen' && !item.isFixedAsset).length;
    const fixedAssets = items.filter(item => item.isFixedAsset).length;
    
    // Count subcategory items
    const bakeryItems = items.filter(item => item.subcategory === 'bakery').length;
    const barItems = items.filter(item => 
      ['beer', 'wine', 'spirits', 'other_alcohol'].includes(item.subcategory)
    ).length;
    const merchandiseItems = items.filter(item => 
      ['chocolate_room_assets', 'beer_room_assets', 'kitchen_assets', 'merchandise', 'general_assets'].includes(item.subcategory)
    ).length;

    // Count items by expiry status
    const expiredItems = items.filter(item => item.expiryStatus === 'expired').length;
    const validItems = items.filter(item => item.expiryStatus === 'valid').length;

    const stats = {
      totalItems: items.length,
      totalCategories: new Set(items.map(item => item.category)).size,
      expiringSoon: items.filter(item => {
        if (!item.expiryDate) return false;
        
        const today = new Date();
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(today.getDate() + 7);
        
        const expiryDate = new Date(item.expiryDate);
        return expiryDate >= today && expiryDate <= sevenDaysLater;
      }).length,
      expired: expiredItems,
      valid: validItems,
      lowStock: items.filter(item => 
        item.minimumStockLevel !== null && 
        item.quantity <= item.minimumStockLevel
      ).length,
      needsOrdering: items.filter(item => 
        item.minimumStockLevel !== null && 
        item.quantity <= item.minimumStockLevel && 
        item.orderQuantity !== null &&
        item.orderQuantity > 0
      ).length,
      categoryBreakdown: {
        chocolateRoom: chocolateRoomItems,
        beerRoom: beerRoomItems,
        kitchen: kitchenItems,
        fixedAssets: fixedAssets
      },
      subcategoryBreakdown: {
        bakery: bakeryItems,
        bar: barItems,
        kitchen: kitchenItems,
        merchandise: merchandiseItems
      },
      expiryDistribution: Array(7).fill(0).map((_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() + i);
        return {
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          count: items.filter(item => {
            if (!item.expiryDate) return false;
            const itemDate = new Date(item.expiryDate);
            return itemDate.toDateString() === date.toDateString();
          }).length
        };
      })
    };

    return stats;
  } catch (error) {
    console.error("Error fetching inventory stats:", error);
    return {
      totalItems: 0,
      totalCategories: 0,
      expiringSoon: 0,
      expired: 0,
      valid: 0,
      lowStock: 0,
      needsOrdering: 0,
      categoryBreakdown: {
        chocolateRoom: 0,
        beerRoom: 0,
        kitchen: 0,
        fixedAssets: 0
      },
      subcategoryBreakdown: {
        bakery: 0,
        bar: 0,
        kitchen: 0,
        merchandise: 0
      },
      expiryDistribution: []
    };
  }
}

export async function getSectionStats(section: string) {
  try {
    // For 'bar' section, we need to combine multiple subcategories
    const query = db.select().from(inventoryItems);
    
    if (section === 'bar') {
      query.where(
        or(
          eq(inventoryItems.subcategory, 'beer'),
          eq(inventoryItems.subcategory, 'wine'),
          eq(inventoryItems.subcategory, 'spirits'),
          eq(inventoryItems.subcategory, 'other_alcohol')
        )
      );
    } else if (section === 'merchandise') {
      query.where(
        or(
          eq(inventoryItems.subcategory, 'chocolate_room_assets'),
          eq(inventoryItems.subcategory, 'beer_room_assets'),
          eq(inventoryItems.subcategory, 'kitchen_assets'),
          eq(inventoryItems.subcategory, 'merchandise' as any),
          eq(inventoryItems.subcategory, 'general_assets')
        )
      );
    } else if (section === 'kitchen') {
      // Kitchen section should use kitchen-related subcategories from the enum
      query.where(
        or(
          eq(inventoryItems.subcategory, 'ingredients'),
          eq(inventoryItems.subcategory, 'utensils'),
          eq(inventoryItems.subcategory, 'appliances'),
          eq(inventoryItems.subcategory, 'other_kitchen')
        )
      );
    } else {
      // For other sections like 'bakery', just use direct subcategory match
      query.where(eq(inventoryItems.subcategory, section as any));
    }
    
    const items = await query;
    
    // Get current date and date 7 days from now for expiry calculations
    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);
    
    const stats = {
      totalItems: items.length,
      lowStock: items.filter(item => 
        item.minimumStockLevel !== null && 
        item.quantity <= item.minimumStockLevel
      ).length,
      expiringSoon: items.filter(item => {
        if (!item.expiryDate) return false;
        const expiryDate = new Date(item.expiryDate);
        return expiryDate >= today && expiryDate <= sevenDaysLater;
      }).length,
      needsOrdering: items.filter(item => 
        item.minimumStockLevel !== null && 
        item.quantity <= item.minimumStockLevel && 
        item.orderQuantity !== null &&
        item.orderQuantity > 0
      ).length,
      items: items
    };
    
    return stats;
  } catch (error) {
    console.error(`Error fetching ${section} stats:`, error);
    return {
      totalItems: 0,
      lowStock: 0,
      expiringSoon: 0,
      needsOrdering: 0,
      items: []
    };
  }
}

export async function getInventoryItemsBySubcategory(subcategory?: string, search?: string) {
  try {
    const query = db.select().from(inventoryItems);
    if (subcategory) {
      query.where(eq(inventoryItems.subcategory, subcategory as any)); // Using any as temporary fix until proper enum type is defined
    }
    
    if (search) {
      query.where(
        or(
          sql`${inventoryItems.itemName} ILIKE ${`%${search}%`}`,
          sql`${inventoryItems.brand} ILIKE ${`%${search}%`}`,
          sql`${inventoryItems.subcategory} ILIKE ${`%${search}%`}`
        )
      );
    }

    // Order by expiry date for consumables, and by name for fixed assets
    query.orderBy(
      sql`CASE WHEN ${inventoryItems.isFixedAsset} = true THEN 1 ELSE 0 END`,
      sql`CASE WHEN ${inventoryItems.expiryDate} IS NULL THEN 1 ELSE 0 END`,
      inventoryItems.expiryDate,
      inventoryItems.itemName
    );

    return await query;
  } catch (error) {
    console.error("Error fetching inventory items by subcategory:", error);
    return [];
  }
}

export async function getInventoryItemsBySection(section: string, search?: string) {
  try {
    const query = db.select().from(inventoryItems);
    
    if (section === 'bar') {
      query.where(
        or(
          eq(inventoryItems.subcategory, 'beer'),
          eq(inventoryItems.subcategory, 'wine'),
          eq(inventoryItems.subcategory, 'spirits'),
          eq(inventoryItems.subcategory, 'other_alcohol')
        )
      );
    } else if (section === 'merchandise') {
      query.where(
        or(
          eq(inventoryItems.subcategory, 'chocolate_room_assets'),
          eq(inventoryItems.subcategory, 'beer_room_assets'),
          eq(inventoryItems.subcategory, 'kitchen_assets'),
          eq(inventoryItems.subcategory, 'merchandise' as any),
          eq(inventoryItems.subcategory, 'general_assets')
        )
      );
    } else if (section === 'kitchen') {
      // Kitchen section should use kitchen-related subcategories from the enum
      query.where(
        or(
          eq(inventoryItems.subcategory, 'ingredients'),
          eq(inventoryItems.subcategory, 'utensils'),
          eq(inventoryItems.subcategory, 'appliances'),
          eq(inventoryItems.subcategory, 'other_kitchen')
        )
      );
    } else {
      // For other sections like 'bakery', just use direct subcategory match
      query.where(eq(inventoryItems.subcategory, section as any));
    }
    
    if (search) {
      query.where(
        or(
          sql`${inventoryItems.itemName} ILIKE ${`%${search}%`}`,
          sql`${inventoryItems.brand} ILIKE ${`%${search}%`}`,
          sql`${inventoryItems.subcategory} ILIKE ${`%${search}%`}`
        )
      );
    }

    // Order by expiry date for consumables, and by name for fixed assets
    query.orderBy(
      sql`CASE WHEN ${inventoryItems.isFixedAsset} = true THEN 1 ELSE 0 END`,
      sql`CASE WHEN ${inventoryItems.expiryDate} IS NULL THEN 1 ELSE 0 END`,
      inventoryItems.expiryDate,
      inventoryItems.itemName
    );

    return await query;
  } catch (error) {
    console.error(`Error fetching inventory items for section ${section}:`, error);
    return [];
  }
} 