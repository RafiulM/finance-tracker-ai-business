import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const business = pgTable("business", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    fiscalStartDate: timestamp("fiscal_start_date").notNull(),
    currency: text("currency").notNull().default("USD"),
    createdAt: timestamp("created_at")
        .$defaultFn(() => new Date())
        .notNull(),
    updatedAt: timestamp("updated_at")
        .$defaultFn(() => new Date())
        .notNull(),
});

export type BusinessSelect = typeof business.$inferSelect;
export type BusinessInsert = typeof business.$inferInsert;