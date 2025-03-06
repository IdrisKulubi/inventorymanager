import { pgTable, serial, text, integer, date, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";

// Define enums for categories and subcategories
export const inventoryCategoryEnum = pgEnum('inventory_category', [
  'chocolate_room',
  'beer_room',
  'fixed_assets',
  'kitchen'
]);

export const inventorySubcategoryEnum = pgEnum('inventory_subcategory', [
  // Chocolate Room subcategories
  'chocolates',
  'bakery',
  'barista',
  'other_chocolate',
  
  // Beer Room subcategories
  'beer',
  'whisky',
  'wine',
  'spirits',
  'other_alcohol',
  
  // Fixed Assets subcategories
  'chocolate_room_assets',
  'beer_room_assets',
  'kitchen_assets',
  'general_assets',
  
  // Kitchen subcategories
  'ingredients',
  'utensils',
  'appliances',
  'other_kitchen'
]);

export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  category: inventoryCategoryEnum("category").notNull(),
  subcategory: inventorySubcategoryEnum("subcategory").notNull(),
  itemName: text("item_name").notNull(),
  brand: text("brand"),
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull(),
  purchaseDate: date("purchase_date").notNull(),
  shelfLifeDays: integer("shelf_life_days"),
  expiryDate: date("expiry_date"),
  supplierContact: text("supplier_contact"),
  cost: integer("cost"),
  supplierName: text("supplier_name"),
  isFixedAsset: boolean("is_fixed_asset").default(false),
  assetLocation: text("asset_location"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type NewInventoryItem = typeof inventoryItems.$inferInsert;
