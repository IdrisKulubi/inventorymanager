import { z } from "zod";

export const formSchema = z.object({
    category: z.string().min(1),
    itemName: z.string().min(1),
    brand: z.string().optional(),
    quantity: z.number().min(1),
    unit: z.string().min(1),
    purchaseDate: z.string().min(1),
    shelfLifeDays: z.number().min(1),
    supplierContact: z.string().optional(),
  });