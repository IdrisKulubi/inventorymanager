// Main inventory categories
export const INVENTORY_CATEGORIES = [
    'chocolate_room',
    'beer_room',
    'fixed_assets',
    'kitchen'
] as const;

// Subcategories mapped to main categories
export const INVENTORY_SUBCATEGORIES: Record<string, readonly string[]> = {
    chocolate_room: [
        'chocolates',
        'bakery',
        'barista',
        'other_chocolate'
    ],
    beer_room: [
        'beer',
        'whisky',
        'wine',
        'spirits',
        'other_alcohol'
    ],
    fixed_assets: [
        'chocolate_room_assets',
        'beer_room_assets',
        'kitchen_assets',
        'general_assets'
    ],
    kitchen: [
        'ingredients',
        'utensils',
        'appliances',
        'other_kitchen'
    ]
} as const;

// Display names for categories and subcategories
export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
    chocolate_room: 'Chocolate Room',
    beer_room: 'Beer Room',
    fixed_assets: 'Fixed Assets',
    kitchen: 'Kitchen'
};

export const SUBCATEGORY_DISPLAY_NAMES: Record<string, string> = {
    // Chocolate Room
    chocolates: 'Chocolates',
    bakery: 'Bakery',
    barista: 'Barista',
    other_chocolate: 'Other',
    
    // Beer Room
    beer: 'Beer',
    whisky: 'Whisky',
    wine: 'Wine',
    spirits: 'Spirits',
    other_alcohol: 'Other Alcohol',
    
    // Fixed Assets
    chocolate_room_assets: 'Chocolate Room Assets',
    beer_room_assets: 'Beer Room Assets',
    kitchen_assets: 'Kitchen Assets',
    general_assets: 'General Assets',
    
    // Kitchen
    ingredients: 'Ingredients',
    utensils: 'Utensils',
    appliances: 'Appliances',
    other_kitchen: 'Other Kitchen Items'
};

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
    'roll',
    'unit'
] as const;

// Type helpers
export type InventoryCategory = typeof INVENTORY_CATEGORIES[number];
export type InventorySubcategory = typeof INVENTORY_SUBCATEGORIES[keyof typeof INVENTORY_SUBCATEGORIES][number];
export type InventoryUnit = typeof INVENTORY_UNITS[number];