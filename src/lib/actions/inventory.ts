"use server";

import  db  from "@/db/drizzle";
import { inventoryItems } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function addInventoryItem(item: typeof inventoryItems.$inferInsert) {
  try {
    await db.insert(inventoryItems).values(item);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error adding inventory item:", error);
    return { success: false, error: "Failed to add item" };
  }
}

export async function getInventoryItems() {
  return db.query.inventoryItems.findMany({
    orderBy: (items) => [items.expiryDate]
  });
} 