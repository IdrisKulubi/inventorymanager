CREATE TYPE "public"."expiry_status" AS ENUM('valid', 'expiring_soon', 'expired');--> statement-breakpoint
CREATE TYPE "public"."inventory_category" AS ENUM('chocolate_room', 'beer_room', 'fixed_assets', 'kitchen');--> statement-breakpoint
CREATE TYPE "public"."inventory_subcategory" AS ENUM('chocolates', 'bakery', 'barista', 'other_chocolate', 'beer', 'whisky', 'wine', 'spirits', 'other_alcohol', 'chocolate_room_assets', 'beer_room_assets', 'kitchen_assets', 'general_assets', 'ingredients', 'utensils', 'appliances', 'other_kitchen');--> statement-breakpoint
CREATE TYPE "public"."log_action" AS ENUM('count_adjustment', 'stock_added', 'stock_removed', 'item_created', 'item_updated', 'item_deleted');--> statement-breakpoint
CREATE TYPE "public"."shelf_life_unit" AS ENUM('days', 'weeks', 'months', 'years');--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" "inventory_category" NOT NULL,
	"subcategory" "inventory_subcategory" NOT NULL,
	"item_name" text NOT NULL,
	"brand" text,
	"quantity" integer NOT NULL,
	"order_quantity" integer,
	"unit" text NOT NULL,
	"purchase_date" date NOT NULL,
	"shelf_life_value" integer,
	"shelf_life_unit" "shelf_life_unit",
	"expiry_date" date,
	"expiry_status" "expiry_status",
	"supplier_email" text,
	"supplier_phone" text,
	"supplier_contact" text,
	"cost" integer,
	"supplier_name" text,
	"is_fixed_asset" boolean DEFAULT false,
	"asset_location" text,
	"created_at" timestamp DEFAULT now(),
	"minimum_stock_level" integer,
	"stock_value" integer
);
--> statement-breakpoint
CREATE TABLE "inventory_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"action" "log_action" NOT NULL,
	"quantity_before" integer,
	"quantity_after" integer,
	"value_before" integer,
	"value_after" integer,
	"reason" text,
	"notes" text,
	"user_id" text,
	"user_name" text,
	"date_stamp" date DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE no action ON UPDATE no action;