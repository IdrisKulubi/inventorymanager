"use server";

import  db  from "@/db/drizzle";
import { inventoryItems } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { InventoryItem, NewInventoryItem } from "@/db/schema";

export async function addInventoryItem(item: NewInventoryItem) {
  try {
    await db.insert(inventoryItems).values(item);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error adding inventory item:", error);
    return { success: false, error: "Failed to add item" };
  }
}

export async function updateInventoryItem(id: number, item: Partial<InventoryItem>) {
  try {
    await db.update(inventoryItems)
      .set(item)
      .where(eq(inventoryItems.id, id));
    revalidatePath("/dashboard");
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
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    return { success: false, error: "Failed to delete item" };
  }
}

export async function getInventoryItems(category?: string, search?: string) {
  const query = db.select().from(inventoryItems);
  
  if (category && category !== "all") {
    query.where(eq(inventoryItems.category, category));
  }
  
  if (search) {
    query.where(sql`${inventoryItems.itemName} LIKE ${`%${search}%`}`);
  }

  return query.orderBy(inventoryItems.expiryDate);
}

export async function exportToCSV(items: InventoryItem[]) {
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

  return csvContent;
}

export async function getInventoryStats() {
  const items = await db.select().from(inventoryItems);
  
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const stats = {
    totalItems: items.length,
    totalCategories: new Set(items.map(item => item.category)).size,
    expiringSoon: items.filter(item => {
      const expiry = new Date(item.expiryDate);
      return expiry > now && expiry <= oneWeekFromNow;
    }).length,
    lowStock: items.filter(item => item.quantity < 10).length,
    expiryDistribution: Array(7).fill(0).map((_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count: items.filter(item => {
          const itemDate = new Date(item.expiryDate);
          return itemDate.toDateString() === date.toDateString();
        }).length
      };
    })
  };

  return stats;
} 