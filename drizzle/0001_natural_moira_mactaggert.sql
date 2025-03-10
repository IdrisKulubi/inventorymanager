CREATE TYPE "public"."expiry_status" AS ENUM('valid', 'expiring_soon', 'expired');--> statement-breakpoint
CREATE TYPE "public"."shelf_life_unit" AS ENUM('days', 'weeks', 'months', 'years');--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "order_quantity" integer;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "shelf_life_value" integer;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "shelf_life_unit" "shelf_life_unit";--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "expiry_status" "expiry_status";--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "supplier_email" text;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "supplier_phone" text;--> statement-breakpoint
ALTER TABLE "inventory_items" DROP COLUMN "shelf_life_days";