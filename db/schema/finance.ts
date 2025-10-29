import { pgTable, text, timestamp, uuid, decimal, integer } from "drizzle-orm/pg-core";
import { business } from "./business";

// Common fields for financial transactions
const financialTransactionFields = {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
        .notNull()
        .references(() => business.id, { onDelete: "cascade" }),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    date: timestamp("date").notNull(),
    category: text("category").notNull(),
    description: text("description").notNull(),
    notes: text("notes"),
    paymentMethod: text("payment_method"), // cash, card, bank transfer, etc.
    tags: text("tags").array(), // for additional categorization
    createdAt: timestamp("created_at")
        .$defaultFn(() => new Date())
        .notNull(),
    updatedAt: timestamp("updated_at")
        .$defaultFn(() => new Date())
        .notNull(),
};

// Expenses table
export const expense = pgTable("expense", {
    ...financialTransactionFields,
    vendor: text("vendor").notNull(),
    receiptUrl: text("receipt_url"), // URL to uploaded receipt image
    isRecurring: text("is_recurring", { enum: ["once", "monthly", "quarterly", "yearly"] }).default("once").notNull(),
    taxDeductible: text("is_tax_deductible", { enum: ["yes", "no", "partial"] }).default("yes").notNull(),
});

// Income table
export const income = pgTable("income", {
    ...financialTransactionFields,
    client: text("client").notNull(),
    invoiceNumber: text("invoice_number"),
    isRecurring: text("is_recurring", { enum: ["once", "monthly", "quarterly", "yearly"] }).default("once").notNull(),
    taxWithheld: decimal("tax_withheld", { precision: 12, scale: 2 }).default("0"),
});

// Assets table
export const asset = pgTable("asset", {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
        .notNull()
        .references(() => business.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type").notNull(), // equipment, property, vehicle, investment, etc.
    currentValue: decimal("current_value", { precision: 12, scale: 2 }).notNull(),
    purchaseValue: decimal("purchase_value", { precision: 12, scale: 2 }).notNull(),
    purchaseDate: timestamp("purchase_date").notNull(),
    depreciationRate: decimal("depreciation_rate", { precision: 5, scale: 2 }).default("0"),
    location: text("location"),
    description: text("description"),
    documents: text("documents").array(), // URLs to related documents
    createdAt: timestamp("created_at")
        .$defaultFn(() => new Date())
        .notNull(),
    updatedAt: timestamp("updated_at")
        .$defaultFn(() => new Date())
        .notNull(),
});

// Transaction categories table for predefined categories
export const transactionCategory = pgTable("transaction_category", {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
        .notNull()
        .references(() => business.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type", { enum: ["expense", "income"] }).notNull(),
    color: text("color").default("#22c55e"), // hex color for UI
    description: text("description"),
    createdAt: timestamp("created_at")
        .$defaultFn(() => new Date())
        .notNull(),
});

// Type exports
export type ExpenseSelect = typeof expense.$inferSelect;
export type ExpenseInsert = typeof expense.$inferInsert;
export type IncomeSelect = typeof income.$inferSelect;
export type IncomeInsert = typeof income.$inferInsert;
export type AssetSelect = typeof asset.$inferSelect;
export type AssetInsert = typeof asset.$inferInsert;
export type TransactionCategorySelect = typeof transactionCategory.$inferSelect;
export type TransactionCategoryInsert = typeof transactionCategory.$inferInsert;