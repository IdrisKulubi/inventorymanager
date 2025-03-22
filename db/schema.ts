import { pgTable, serial, text, integer, date, timestamp, pgEnum, boolean, foreignKey } from "drizzle-orm/pg-core";

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

// Define enum for shelf life unit
export const shelfLifeUnitEnum = pgEnum('shelf_life_unit', [
  'days',
  'weeks',
  'months',
  'years'
]);

// Define enum for expiry status
export const expiryStatusEnum = pgEnum('expiry_status', [
  'valid',
  'expiring_soon',
  'expired'
]);

export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  category: inventoryCategoryEnum("category").notNull(),
  subcategory: inventorySubcategoryEnum("subcategory").notNull(),
  itemName: text("item_name").notNull(),
  brand: text("brand"),
  quantity: integer("quantity").notNull(),
  orderQuantity: integer("order_quantity"),
  unit: text("unit").notNull(),
  purchaseDate: date("purchase_date").notNull(),
  shelfLifeValue: integer("shelf_life_value"),
  shelfLifeUnit: shelfLifeUnitEnum("shelf_life_unit"),
  expiryDate: date("expiry_date"),
  expiryStatus: expiryStatusEnum("expiry_status"),
  supplierEmail: text("supplier_email"),
  supplierPhone: text("supplier_phone"),
  supplierContact: text("supplier_contact"),
  cost: integer("cost"),
  supplierName: text("supplier_name"),
  isFixedAsset: boolean("is_fixed_asset").default(false),
  assetLocation: text("asset_location"),
  createdAt: timestamp("created_at").defaultNow(),
  minimumStockLevel: integer("minimum_stock_level"),
  stockValue: integer("stock_value"),
});

// Define enum for log action types
export const logActionEnum = pgEnum('log_action', [
  'count_adjustment',
  'stock_added',
  'stock_removed',
  'item_created',
  'item_updated',
  'item_deleted'
]);

// Create inventory logs table for tracking changes
export const inventoryLogs = pgTable("inventory_logs", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull().references(() => inventoryItems.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  action: logActionEnum("action").notNull(),
  quantityBefore: integer("quantity_before"),
  quantityAfter: integer("quantity_after"),
  valueBefore: integer("value_before"),
  valueAfter: integer("value_after"),
  reason: text("reason"),
  notes: text("notes"),
  userId: text("user_id"),
  userName: text("user_name"),
  dateStamp: date("date_stamp").notNull().defaultNow(),
});

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type NewInventoryItem = typeof inventoryItems.$inferInsert;
export type InventoryLog = typeof inventoryLogs.$inferSelect;
export type NewInventoryLog = typeof inventoryLogs.$inferInsert;
