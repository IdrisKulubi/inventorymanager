import { Metadata } from "next";
import db from "@/db/drizzle";
import { sql } from "drizzle-orm";
import { InventoryTable } from "@/components/inventory/inventory-table";
import {  addDays } from "date-fns";

// Define interface for our inventory items
interface ExtendedInventoryItem {
  id: number;
  itemName: string;
  category: string;
  subcategory?: string | null;
  quantity: number;
  unit: string;
  brand?: string | null;
  stockValue?: number | null;
  expiryDate?: string | null;
  minimumStockLevel?: number | null;
  orderQuantity?: number | null;
  isFixedAsset: boolean | null;
  assetLocation?: string | null;
  supplierName?: string | null;
  supplierContact?: string | null;
  supplierEmail?: string | null;
  supplierPhone?: string | null;
  cost?: number | null;
  createdAt?: Date | null;
  purchaseDate?: Date | string | null;
  shelfLifeValue?: number | null;
  shelfLifeUnit?: string | null;
  expiryStatus?: string | null;
}

export const metadata: Metadata = {
  title: "Filtered Inventory",
  description: "View filtered inventory items",
};

export default async function FilterPage({
  params,
}: {
  params: { filter: string };
}) {
  const { filter } = params;
  let items: ExtendedInventoryItem[] = [];
  let title = "";
  let description = "";
  
  // Set up query based on filter type
  if (filter === "expiring") {
    title = "Expiring Soon";
    description = "Items that will expire within the next 7 days";
    
    // Get items expiring in the next 7 days
    const sevenDaysFromNow = addDays(new Date(), 7).toISOString().split('T')[0];
    
    try {
      console.log("Executing expiring query");
      const result = await db.execute(sql`
        SELECT * FROM inventory_items 
        WHERE expiry_date <= ${sevenDaysFromNow} 
        AND expiry_date >= CURRENT_DATE
      `);
      
      // Map the raw results to our ExtendedInventoryItem interface
      items = result.rows.map(row => ({
        id: Number(row.id),
        itemName: String(row.item_name),
        category: String(row.category),
        subcategory: row.subcategory ? String(row.subcategory) : null,
        quantity: Number(row.quantity),
        unit: String(row.unit),
        stockValue: row.stock_value ? Number(row.stock_value) : null,
        expiryDate: row.expiry_date ? String(row.expiry_date) : null,
        minimumStockLevel: row.minimum_stock_level ? Number(row.minimum_stock_level) : null,
        isFixedAsset: row.is_fixed_asset ? Boolean(row.is_fixed_asset) : null,
        brand: row.brand ? String(row.brand) : null,
        orderQuantity: row.order_quantity ? Number(row.order_quantity) : null,
        assetLocation: row.asset_location ? String(row.asset_location) : null,
        supplierName: row.supplier_name ? String(row.supplier_name) : null,
        supplierContact: row.supplier_contact ? String(row.supplier_contact) : null,
        supplierEmail: row.supplier_email ? String(row.supplier_email) : null,
        supplierPhone: row.supplier_phone ? String(row.supplier_phone) : null,
        cost: row.cost ? Number(row.cost) : null,
        createdAt: row.created_at ? new Date(row.created_at as string) : null,
        purchaseDate: row.purchase_date ? String(row.purchase_date) : null,
        shelfLifeValue: row.shelf_life_value ? Number(row.shelf_life_value) : null,
        shelfLifeUnit: row.shelf_life_unit ? String(row.shelf_life_unit) : null,
        expiryStatus: row.expiry_status ? String(row.expiry_status) : null
      }));
      
      console.log(`Found ${items.length} expiring items`);
    } catch (error) {
      console.error("Error fetching expiring items:", error);
    }
  } else if (filter === "low-stock") {
    title = "Low Stock Items";
    description = "Items that are below their minimum stock level";
    
    try {
      console.log("Executing low-stock query");
      const result = await db.execute(sql`
        SELECT * FROM inventory_items 
        WHERE quantity <= minimum_stock_level 
        AND minimum_stock_level IS NOT NULL
      `);
      
      // Map the raw results to our ExtendedInventoryItem interface
      items = result.rows.map(row => ({
        id: Number(row.id),
        itemName: String(row.item_name),
        category: String(row.category),
        subcategory: row.subcategory ? String(row.subcategory) : null,
        quantity: Number(row.quantity),
        unit: String(row.unit),
        stockValue: row.stock_value ? Number(row.stock_value) : null,
        expiryDate: row.expiry_date ? String(row.expiry_date) : null,
        minimumStockLevel: row.minimum_stock_level ? Number(row.minimum_stock_level) : null,
        isFixedAsset: row.is_fixed_asset ? Boolean(row.is_fixed_asset) : null,
        brand: row.brand ? String(row.brand) : null,
        orderQuantity: row.order_quantity ? Number(row.order_quantity) : null,
        assetLocation: row.asset_location ? String(row.asset_location) : null,
        supplierName: row.supplier_name ? String(row.supplier_name) : null,
        supplierContact: row.supplier_contact ? String(row.supplier_contact) : null,
        supplierEmail: row.supplier_email ? String(row.supplier_email) : null,
        supplierPhone: row.supplier_phone ? String(row.supplier_phone) : null,
        cost: row.cost ? Number(row.cost) : null,
        createdAt: row.created_at ? new Date(row.created_at as string) : null,
        purchaseDate: row.purchase_date ? String(row.purchase_date) : null,
        shelfLifeValue: row.shelf_life_value ? Number(row.shelf_life_value) : null,
        shelfLifeUnit: row.shelf_life_unit ? String(row.shelf_life_unit) : null,
        expiryStatus: row.expiry_status ? String(row.expiry_status) : null
      }));
      
      console.log(`Found ${items.length} low stock items`);
    } catch (error) {
      console.error("Error fetching low stock items:", error);
    }
  } else if (filter === "needs-ordering") {
    title = "Items Needing Reorder";
    description = "Items that need to be reordered";
    
    try {
      console.log("Executing needs-ordering query");
      const result = await db.execute(sql`
        SELECT * FROM inventory_items 
        WHERE quantity <= minimum_stock_level 
        AND order_quantity IS NOT NULL 
        AND order_quantity > 0
      `);
      
      // Map the raw results to our ExtendedInventoryItem interface
      items = result.rows.map(row => ({
        id: Number(row.id),
        itemName: String(row.item_name),
        category: String(row.category),
        subcategory: row.subcategory ? String(row.subcategory) : null,
        quantity: Number(row.quantity),
        unit: String(row.unit),
        stockValue: row.stock_value ? Number(row.stock_value) : null,
        expiryDate: row.expiry_date ? String(row.expiry_date) : null,
        minimumStockLevel: row.minimum_stock_level ? Number(row.minimum_stock_level) : null,
        isFixedAsset: row.is_fixed_asset ? Boolean(row.is_fixed_asset) : null,
        brand: row.brand ? String(row.brand) : null,
        orderQuantity: row.order_quantity ? Number(row.order_quantity) : null,
        assetLocation: row.asset_location ? String(row.asset_location) : null,
        supplierName: row.supplier_name ? String(row.supplier_name) : null,
        supplierContact: row.supplier_contact ? String(row.supplier_contact) : null,
        supplierEmail: row.supplier_email ? String(row.supplier_email) : null,
        supplierPhone: row.supplier_phone ? String(row.supplier_phone) : null,
        cost: row.cost ? Number(row.cost) : null,
        createdAt: row.created_at ? new Date(row.created_at as string) : null,
        purchaseDate: row.purchase_date ? String(row.purchase_date) : null,
        shelfLifeValue: row.shelf_life_value ? Number(row.shelf_life_value) : null,
        shelfLifeUnit: row.shelf_life_unit ? String(row.shelf_life_unit) : null,
        expiryStatus: row.expiry_status ? String(row.expiry_status) : null
      }));
      
      console.log(`Found ${items.length} items needing reorder`);
    } catch (error) {
      console.error("Error fetching items needing reorder:", error);
    }
  }
  
  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      
      <div>
        <InventoryTable items={items} />
      </div>
    </div>
  );
} 