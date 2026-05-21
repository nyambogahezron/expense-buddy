import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const expo = SQLite.openDatabaseSync('expense-buddy.db');

export const db = drizzle(expo, { schema });

export type Database = typeof db;
export type Budget = typeof schema.budgets.$inferSelect;
export type NewBudget = typeof schema.budgets.$inferInsert;
export type Category = typeof schema.categories.$inferSelect;
export type NewCategory = typeof schema.categories.$inferInsert;
export type BudgetCategory = typeof schema.budgetCategories.$inferSelect;
export type NewBudgetCategory = typeof schema.budgetCategories.$inferInsert;
export type Transaction = typeof schema.transactions.$inferSelect;
export type NewTransaction = typeof schema.transactions.$inferInsert;
