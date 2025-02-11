CREATE TABLE "inventory_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"item_name" text NOT NULL,
	"brand" text,
	"quantity" integer NOT NULL,
	"unit" text NOT NULL,
	"purchase_date" date NOT NULL,
	"shelf_life_days" integer NOT NULL,
	"expiry_date" date NOT NULL,
	"supplier_contact" text,
	"created_at" timestamp DEFAULT now()
);
