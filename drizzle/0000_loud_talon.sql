CREATE TYPE "public"."inventory_category" AS ENUM('chocolate_room', 'beer_room', 'fixed_assets', 'kitchen');--> statement-breakpoint
CREATE TYPE "public"."inventory_subcategory" AS ENUM('chocolates', 'bakery', 'barista', 'other_chocolate', 'beer', 'whisky', 'wine', 'spirits', 'other_alcohol', 'chocolate_room_assets', 'beer_room_assets', 'kitchen_assets', 'general_assets', 'ingredients', 'utensils', 'appliances', 'other_kitchen');--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" "inventory_category" NOT NULL,
	"subcategory" "inventory_subcategory" NOT NULL,
	"item_name" text NOT NULL,
	"brand" text,
	"quantity" integer NOT NULL,
	"unit" text NOT NULL,
	"purchase_date" date NOT NULL,
	"shelf_life_days" integer,
	"expiry_date" date,
	"supplier_contact" text,
	"cost" integer,
	"supplier_name" text,
	"is_fixed_asset" boolean DEFAULT false,
	"asset_location" text,
	"created_at" timestamp DEFAULT now()
);
