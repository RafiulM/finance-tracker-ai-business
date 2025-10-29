CREATE TABLE "business" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"fiscal_start_date" timestamp NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"current_value" numeric(12, 2) NOT NULL,
	"purchase_value" numeric(12, 2) NOT NULL,
	"purchase_date" timestamp NOT NULL,
	"depreciation_rate" numeric(5, 2) DEFAULT '0',
	"location" text,
	"description" text,
	"documents" text[],
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expense" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"date" timestamp NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"notes" text,
	"payment_method" text,
	"tags" text[],
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"vendor" text NOT NULL,
	"receipt_url" text,
	"is_recurring" text DEFAULT 'once' NOT NULL,
	"is_tax_deductible" text DEFAULT 'yes' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "income" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"date" timestamp NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"notes" text,
	"payment_method" text,
	"tags" text[],
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"client" text NOT NULL,
	"invoice_number" text,
	"is_recurring" text DEFAULT 'once' NOT NULL,
	"tax_withheld" numeric(12, 2) DEFAULT '0'
);
--> statement-breakpoint
CREATE TABLE "transaction_category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"color" text DEFAULT '#22c55e',
	"description" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "business" ADD CONSTRAINT "business_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset" ADD CONSTRAINT "asset_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "income" ADD CONSTRAINT "income_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_category" ADD CONSTRAINT "transaction_category_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE cascade ON UPDATE no action;