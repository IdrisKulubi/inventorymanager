import { z } from "zod";
import { INVENTORY_CATEGORIES, INVENTORY_UNITS } from "./constants";

export const formSchema = z.object({
    category: z.enum(INVENTORY_CATEGORIES, {
        message: "Please select a valid category"
    }),
    itemName: z.string().min(1, "Item name is required"),
    brand: z.string().nullable(),
    quantity: z.number()
        .min(1, "Quantity must be at least 1")
        .max(1000, "Quantity cannot exceed 1000"),
    unit: z.enum(INVENTORY_UNITS, {
        message: "Please select a valid unit"
    }),
    purchaseDate: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: "Invalid date format"
    }),
    shelfLifeDays: z.number()
        .min(1, "Minimum 1 day")
        .max(365, "Maximum 1 year"),
    supplierContact: z.string()
        .regex(/^(?:\+?[0-9]{10,15}|[^@]+@[^.]+\..+|[a-zA-Z][\sa-zA-Z-]{1,49})$/, 
            "Must be a valid phone number, email, or supplier name")
        .nullable()
});

export type InventoryFormValues = z.infer<typeof formSchema>;