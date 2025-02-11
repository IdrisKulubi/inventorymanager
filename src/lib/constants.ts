export const INVENTORY_CATEGORIES = [
    'Fruits & Vegetables',
    'Dairy',
    'Bakery',
    'Meat',
    'Beverages',
    'Water',
    'Cream & Cheese',
    'Grocery',
    'Paper & Packaging',
    'Cleaning',
    'Ice Cream',
    'Chocolates',
    'Coffee',
    'Wine',
    'Beer',
    'Spirits',
    'Raw Materials',
    'Syrup & Sauce'
] as const;

export const INVENTORY_UNITS = [
    'kg',
    'g',
    'ltr',
    'ml',
    'pcs',
    'box',
    'pkt',
    'tin',
    'bottle',
    'crate',
    'sachet',
    'roll'
] as const;

// Type helpers if needed
export type InventoryCategory = typeof INVENTORY_CATEGORIES[number];
export type InventoryUnit = typeof INVENTORY_UNITS[number];