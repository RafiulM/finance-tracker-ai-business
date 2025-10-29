import { drizzle } from 'drizzle-orm/node-postgres';
import * as authSchema from './schema/auth';
import * as businessSchema from './schema/business';
import * as financeSchema from './schema/finance';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}

export const db = drizzle(databaseUrl, {
    schema: {
        ...authSchema,
        ...businessSchema,
        ...financeSchema,
    },
});

// Export all schemas for easy importing
export * from './schema/auth';
export * from './schema/business';
export * from './schema/finance';