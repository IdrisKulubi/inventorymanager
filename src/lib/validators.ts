import { z } from "zod";
import { INVENTORY_CATEGORIES,  INVENTORY_UNITS } from "./constants";

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
    shelfLifeDays: z.number()
        .min(1, "Minimum 1 day")
        .max(3650, "Maximum 10 years"),
    supplierContact: z.string()
        .regex(/^(\+?[0-9]{10,15}|[^@]+@[^\.]+\..+)?$/, "Invalid contact format")
        .optional(),
    cost: z.number().min(0, "Cost must be positive"),
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
    shelfLifeDays: z.number().optional(),
    supplierContact: z.string()
        .regex(/^(\+?[0-9]{10,15}|[^@]+@[^\.]+\..+)?$/, "Invalid contact format")
        .optional(),
    cost: z.number().min(0, "Cost must be positive"),
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