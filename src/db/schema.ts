import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

export const categories = sqliteTable('categories', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	icon: text('icon').notNull(),
	color: text('color').notNull(),
	description: text('description'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

export const transactions = sqliteTable('transactions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	amount: real('amount').notNull(),
	date: integer('date', { mode: 'timestamp' }).notNull(),
	categoryId: integer('category_id')
		.notNull()
		.references(() => categories.id),
	type: text('type', { enum: ['income', 'expense'] }).notNull(),
	description: text('description'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

export const budgets = sqliteTable('budgets', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	totalAmount: real('total_amount').notNull(),
	period: text('period', {
		enum: ['daily', 'weekly', 'monthly', 'yearly'],
	}).notNull(),
	startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
	endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

export const budgetCategories = sqliteTable('budget_categories', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	budgetId: integer('budget_id')
		.notNull()
		.references(() => budgets.id, { onDelete: 'cascade' }),
	categoryId: integer('category_id')
		.notNull()
		.references(() => categories.id, { onDelete: 'cascade' }),
	amount: real('amount').notNull(),
	spent: real('spent').notNull().default(0),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

export const shoppingLists = sqliteTable('shopping_lists', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	store: text('store'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

export const shoppingItems = sqliteTable('shopping_items', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	listId: integer('list_id')
		.notNull()
		.references(() => shoppingLists.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	quantity: integer('quantity').notNull().default(1),
	estimatedCost: real('estimated_cost').notNull(),
	priority: text('priority', { enum: ['low', 'medium', 'high'] })
		.notNull()
		.default('medium'),
	purchased: integer('purchased', { mode: 'boolean' }).notNull().default(false),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});
