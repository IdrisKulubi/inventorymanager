export const INVENTORY_CATEGORIES = [
    'Fruits & Vegetables',
    'Dairy',
    'Bakery',
    'Meat',
    'Beverages',
  ] as const;
  
  export const INVENTORY_UNITS = [
    'kg',
    'g',
    'ltr',
    'ml',
    'pcs',
    'box',
  ] as const;
  
  // Type helpers if needed
  export type InventoryCategory = typeof INVENTORY_CATEGORIES[number];
  export type InventoryUnit = typeof INVENTORY_UNITS[number];