import { eq, like, and, between, desc, sql } from 'drizzle-orm';
import { Category } from '@/types/category';
import { categories, transactions } from '@/db/schema';
import { db } from '@/db';

const toModel = (record: typeof categories.$inferSelect): Category => ({
	id: record.id.toString(),
	name: record.name,
	icon: record.icon,
	color: record.color,
	description: record.description || '',
	itemCount: 0,
	items: [],
});

export const getAllCategories = async (): Promise<Category[]> => {
	const records = await db.select().from(categories).orderBy(categories.name);
	return records.map(toModel);
};

export const getCategoryById = async (id: string): Promise<Category | null> => {
	const records = await db
		.select()
		.from(categories)
		.where(eq(categories.id, parseInt(id)));

	return records.length > 0 ? toModel(records[0]) : null;
};

export const createCategory = async (
	category: Omit<Category, 'id' | 'itemCount' | 'items'>
): Promise<Category> => {
	const now = new Date();

	await db.insert(categories).values({
		name: category.name,
		icon: category.icon,
		color: category.color,
		description: category.description,
		createdAt: now,
		updatedAt: now,
	});

	const result = await db
		.select()
		.from(categories)
		.orderBy(categories.id)
		.limit(1);
	return toModel(result[0]);
};

export const updateCategory = async (
	id: string,
	category: Partial<Omit<Category, 'id' | 'itemCount' | 'items'>>
): Promise<void> => {
	const updates: Partial<typeof categories.$inferInsert> = {};

	if (category.name !== undefined) updates.name = category.name;
	if (category.icon !== undefined) updates.icon = category.icon;
	if (category.color !== undefined) updates.color = category.color;
	if (category.description !== undefined)
		updates.description = category.description;

	if (Object.keys(updates).length > 0) {
		updates.updatedAt = new Date();
		await db
			.update(categories)
			.set(updates)
			.where(eq(categories.id, parseInt(id)));
	}
};

export const deleteCategory = async (id: string): Promise<void> => {
	await db.delete(categories).where(eq(categories.id, parseInt(id)));
};

export const getCategoryItemCount = async (
	categoryId: string
): Promise<number> => {
	const result = await db
		.select({ count: sql<number>`count(*)` })
		.from(transactions)
		.where(eq(transactions.categoryId, parseInt(categoryId)));
	return result[0]?.count || 0;
};

export const getCategoryItems = async (
	categoryId: string
): Promise<Category['items']> => {
	const records = await db
		.select({
			id: transactions.id,
			name: transactions.description,
			amount: transactions.amount,
			date: transactions.date,
		})
		.from(transactions)
		.where(eq(transactions.categoryId, parseInt(categoryId)))
		.orderBy(transactions.date);

	return records.map((record) => ({
		id: record.id.toString(),
		name: record.name || '',
		amount: record.amount,
		date: record.date.toISOString(),
		tags: [],
	}));
};

export const getCategoryWithAnalytics = async (
	id: string,
	startDate?: string,
	endDate?: string
): Promise<
	Category & {
		totalSpent: number;
		totalTransactions: number;
		avgTransactionAmount: number;
		lastTransactionDate?: string;
	}
> => {
	const category = await getCategoryById(id);
	if (!category) {
		throw new Error('Category not found');
	}

	const start = startDate
		? new Date(startDate)
		: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
	const end = endDate ? new Date(endDate) : new Date();

	const analytics = await db
		.select({
			totalSpent: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
			totalTransactions: sql<number>`COUNT(*)`,
			avgAmount: sql<number>`COALESCE(AVG(${transactions.amount}), 0)`,
			lastDate: sql<string>`MAX(${transactions.date})`,
		})
		.from(transactions)
		.where(
			and(
				eq(transactions.categoryId, parseInt(id)),
				between(transactions.date, start, end)
			)
		);

	const result = analytics[0];

	return {
		...category,
		totalSpent: result.totalSpent || 0,
		totalTransactions: result.totalTransactions || 0,
		avgTransactionAmount: result.avgAmount || 0,
		lastTransactionDate: result.lastDate || undefined,
	};
};

export const searchCategories = async (query: string): Promise<Category[]> => {
	const records = await db
		.select()
		.from(categories)
		.where(like(categories.name, `%${query}%`))
		.orderBy(categories.name);

	return records.map(toModel);
};

export const getCategoriesWithSpending = async (
	startDate?: string,
	endDate?: string
): Promise<(Category & { totalSpent: number; transactionCount: number })[]> => {
	const start = startDate
		? new Date(startDate)
		: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
	const end = endDate ? new Date(endDate) : new Date();

	const categoriesWithSpending = await db
		.select({
			category: categories,
			totalSpent: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
			transactionCount: sql<number>`COUNT(${transactions.id})`,
		})
		.from(categories)
		.leftJoin(
			transactions,
			and(
				eq(categories.id, transactions.categoryId),
				between(transactions.date, start, end),
				eq(transactions.type, 'expense')
			)
		)
		.groupBy(categories.id)
		.orderBy(desc(sql`COALESCE(SUM(${transactions.amount}), 0)`));

	return categoriesWithSpending.map((record) => ({
		...toModel(record.category),
		totalSpent: record.totalSpent || 0,
		transactionCount: record.transactionCount || 0,
	}));
};

export const getTopSpendingCategories = async (
	limit: number = 5,
	startDate?: string,
	endDate?: string
): Promise<(Category & { totalSpent: number; percentage: number })[]> => {
	const start = startDate
		? new Date(startDate)
		: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
	const end = endDate ? new Date(endDate) : new Date();

	// Get total spending for percentage calculation
	const totalSpendingResult = await db
		.select({
			total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
		})
		.from(transactions)
		.where(
			and(
				between(transactions.date, start, end),
				eq(transactions.type, 'expense')
			)
		);

	const totalSpending = totalSpendingResult[0]?.total || 0;

	const topCategories = await db
		.select({
			category: categories,
			totalSpent: sql<number>`SUM(${transactions.amount})`,
		})
		.from(categories)
		.innerJoin(transactions, eq(categories.id, transactions.categoryId))
		.where(
			and(
				between(transactions.date, start, end),
				eq(transactions.type, 'expense')
			)
		)
		.groupBy(categories.id)
		.orderBy(desc(sql`SUM(${transactions.amount})`))
		.limit(limit);

	return topCategories.map((record) => ({
		...toModel(record.category),
		totalSpent: record.totalSpent,
		percentage:
			totalSpending > 0 ? (record.totalSpent / totalSpending) * 100 : 0,
	}));
};

export const getCategorySpendingTrend = async (
	categoryId: string,
	months: number = 12
): Promise<
	{ month: string; year: number; amount: number; transactionCount: number }[]
> => {
	const endDate = new Date();
	const startDate = new Date();
	startDate.setMonth(startDate.getMonth() - months);

	const trends = await db
		.select({
			month: sql<number>`strftime('%m', ${transactions.date})`,
			year: sql<number>`strftime('%Y', ${transactions.date})`,
			amount: sql<number>`SUM(${transactions.amount})`,
			transactionCount: sql<number>`COUNT(*)`,
		})
		.from(transactions)
		.where(
			and(
				eq(transactions.categoryId, parseInt(categoryId)),
				between(transactions.date, startDate, endDate)
			)
		)
		.groupBy(sql`strftime('%Y-%m', ${transactions.date})`)
		.orderBy(sql`strftime('%Y-%m', ${transactions.date})`);

	return trends.map((trend) => ({
		month: new Date(trend.year, trend.month - 1).toLocaleString('default', {
			month: 'long',
		}),
		year: trend.year,
		amount: trend.amount,
		transactionCount: trend.transactionCount,
	}));
};
