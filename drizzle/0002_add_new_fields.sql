-- Create new enums
CREATE TYPE "shelf_life_unit" AS ENUM ('days', 'weeks', 'months', 'years');
CREATE TYPE "expiry_status" AS ENUM ('valid', 'expiring_soon', 'expired');

-- Add new columns to inventory_items table
ALTER TABLE "inventory_items" 
  ADD COLUMN "order_quantity" integer,
  ADD COLUMN "shelf_life_value" integer,
  ADD COLUMN "shelf_life_unit" "shelf_life_unit",
  ADD COLUMN "expiry_status" "expiry_status",
  ADD COLUMN "supplier_email" text,
  ADD COLUMN "supplier_phone" text;

-- Migrate data from shelf_life_days to shelf_life_value and shelf_life_unit
UPDATE "inventory_items"
SET 
  "shelf_life_value" = "shelf_life_days",
  "shelf_life_unit" = 'days'
WHERE "shelf_life_days" IS NOT NULL;

-- Set default expiry status based on expiry date
UPDATE "inventory_items"
SET "expiry_status" = 
  CASE 
    WHEN "expiry_date" IS NULL THEN NULL
    WHEN "expiry_date" < CURRENT_DATE THEN 'expired'
    WHEN "expiry_date" < (CURRENT_DATE + INTERVAL '7 days') THEN 'expiring_soon'
    ELSE 'valid'
  END
WHERE "expiry_date" IS NOT NULL;

-- Extract email and phone from supplier_contact if possible
UPDATE "inventory_items"
SET 
  "supplier_email" = 
    CASE 
      WHEN "supplier_contact" LIKE '%@%.%' THEN "supplier_contact"
      ELSE NULL
    END,
  "supplier_phone" = 
    CASE 
      WHEN "supplier_contact" ~ '^[0-9+]+$' THEN "supplier_contact"
      ELSE NULL
    END
WHERE "supplier_contact" IS NOT NULL; 