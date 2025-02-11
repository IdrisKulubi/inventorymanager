import { pgTable, serial, text, integer, date, timestamp } from "drizzle-orm/pg-core";

export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  itemName: text("item_name").notNull(),
  brand: text("brand"),
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull(),
  purchaseDate: date("purchase_date").notNull(),
  shelfLifeDays: integer("shelf_life_days").notNull(),
  expiryDate: date("expiry_date").notNull(),
  supplierContact: text("supplier_contact"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type NewInventoryItem = typeof inventoryItems.$inferInsert;
