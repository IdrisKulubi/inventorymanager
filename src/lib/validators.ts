import { z } from "zod";
import { INVENTORY_CATEGORIES, INVENTORY_UNITS, SHELF_LIFE_UNITS, EXPIRY_STATUS_OPTIONS } from "./constants";

// Base schema with common fields for all inventory items
const baseSchema = {
    category: z.enum(INVENTORY_CATEGORIES, {
        message: "Please select a valid category"
    }),
    subcategory: z.string().min(1, "Please select a valid subcategory"),
    itemName: z.string().min(1, "Item name is required"),
    brand: z.string().nullable(),
    quantity: z.number()
        .min(1, "Quantity must be at least 1")
        .max(10000, "Quantity cannot exceed 10000"),
    orderQuantity: z.number()
        .min(0, "Order quantity must be non-negative")
        .max(10000, "Order quantity cannot exceed 10000")
        .optional(),
    unit: z.enum(INVENTORY_UNITS, {
        message: "Please select a valid unit"
    }),
};

// Schema for consumable items (chocolate room, beer room, kitchen)
export const consumableItemSchema = z.object({
    ...baseSchema,
    purchaseDate: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: "Invalid date format"
    }),
    shelfLifeValue: z.number()
        .min(1, "Minimum value is 1")
        .max(100, "Maximum value is 100"),
    shelfLifeUnit: z.enum(SHELF_LIFE_UNITS, {
        message: "Please select a valid shelf life unit"
    }),
    expiryStatus: z.enum(EXPIRY_STATUS_OPTIONS, {
        message: "Please select a valid expiry status"
    }).optional(),
    supplierEmail: z.string()
        .email("Invalid email format")
        .optional(),
    supplierPhone: z.string()
        .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number format")
        .optional(),
    supplierContact: z.string().optional(),
    cost: z.number().min(0, "Cost must be positive"),
    sellingPrice: z.number().min(0, "Selling price must be positive").optional(),
    supplierName: z.string().min(1, "Supplier name is required"),
    isFixedAsset: z.literal(false),
    assetLocation: z.string().optional(),
});

// Schema for fixed assets
export const fixedAssetSchema = z.object({
    ...baseSchema,
    purchaseDate: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: "Invalid date format"
    }),
    shelfLifeValue: z.number().optional(),
    shelfLifeUnit: z.enum(SHELF_LIFE_UNITS, {
        message: "Please select a valid shelf life unit"
    }).optional(),
    expiryStatus: z.enum(EXPIRY_STATUS_OPTIONS, {
        message: "Please select a valid expiry status"
    }).optional(),
    supplierEmail: z.string()
        .email("Invalid email format")
        .optional(),
    supplierPhone: z.string()
        .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number format")
        .optional(),
    supplierContact: z.string().optional(),
    cost: z.number().min(0, "Cost must be positive"),
    sellingPrice: z.number().min(0, "Selling price must be positive").optional(),
    supplierName: z.string().min(1, "Supplier name is required"),
    isFixedAsset: z.literal(true),
    assetLocation: z.string().min(1, "Asset location is required"),
});

// Combined schema that can validate either type
export const formSchema = z.discriminatedUnion("isFixedAsset", [
    consumableItemSchema,
    fixedAssetSchema
]);

export type InventoryFormValues = z.infer<typeof formSchema>;