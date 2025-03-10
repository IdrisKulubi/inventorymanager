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
    
    // Revalidate the path to update the UI
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    return { success: false, error: "Failed to delete item" };
  }
}

export async function getInventoryItems(category?: string, search?: string) {
  try {
    const query = db.select().from(inventoryItems);
    
    if (category && category !== "all") {
      if (category === "fixed-assets") {
        query.where(eq(inventoryItems.isFixedAsset, true));
      } else {
        query.where(
          and(
            eq(inventoryItems.category, category as "chocolate_room" | "beer_room" | "fixed_assets" | "kitchen"),
            eq(inventoryItems.isFixedAsset, false)
          )
        );
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

    // Count items by expiry status
    const expiredItems = items.filter(item => item.expiryStatus === 'expired').length;
    const expiringSoonItems = items.filter(item => item.expiryStatus === 'expiring_soon').length;
    const validItems = items.filter(item => item.expiryStatus === 'valid').length;

    const stats = {
      totalItems: items.length,
      totalCategories: new Set(items.map(item => item.category)).size,
      expiringSoon: expiringSoonItems,
      expired: expiredItems,
      valid: validItems,
      lowStock: items.filter(item => !item.isFixedAsset && item.quantity < 10).length,
      needsOrdering: items.filter(item => !item.isFixedAsset && item.orderQuantity && item.orderQuantity > 0).length,
      categoryBreakdown: {
        chocolateRoom: chocolateRoomItems,
        beerRoom: beerRoomItems,
        kitchen: kitchenItems,
        fixedAssets: fixedAssets
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
      expiryDistribution: []
    };
  }
} 