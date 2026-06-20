import { eq, and, between, desc, sql, like } from 'drizzle-orm';
import { db } from '@/db';
import { transactions } from '@/db/schema';
import { Transaction, TransactionCategory } from '@/types/transaction';
import { categoryStringToId, categoryIdToString } from './init';

const toModel = (record: typeof transactions.$inferSelect): Transaction => ({
	id: record.id.toString(),
	amount: record.amount,
	date: record.date.toISOString(),
	category: categoryIdToString(record.categoryId) as TransactionCategory,
	type: record.type,
	description: record.description || '',
});

export const getAllTransactions = async (): Promise<Transaction[]> => {
	const records = await db
		.select()
		.from(transactions)
		.orderBy(transactions.date);
	return records.map(toModel);
};

export const getTransactionById = async (
	id: string
): Promise<Transaction | null> => {
	const records = await db
		.select()
		.from(transactions)
		.where(eq(transactions.id, parseInt(id)));
	return records.length > 0 ? toModel(records[0]) : null;
};

export const createTransaction = async (
	transaction: Omit<Transaction, 'id'>
): Promise<Transaction> => {
	const now = new Date();

	const insertResult = await db.insert(transactions).values({
		amount: transaction.amount,
		date: new Date(transaction.date),
		categoryId: categoryStringToId(transaction.category),
		type: transaction.type,
		description: transaction.description,
		createdAt: now,
		updatedAt: now,
	});

	// Get the last inserted row ID and fetch the transaction
	const lastInsertRowId = insertResult.lastInsertRowId;
	const result = await db
		.select()
		.from(transactions)
		.where(eq(transactions.id, Number(lastInsertRowId)));

	return toModel(result[0]);
};

export const updateTransaction = async (
	id: string,
	transaction: Partial<Omit<Transaction, 'id'>>
): Promise<void> => {
	const updates: Partial<typeof transactions.$inferInsert> = {};

	if (transaction.amount !== undefined) updates.amount = transaction.amount;
	if (transaction.date !== undefined) updates.date = new Date(transaction.date);
	if (transaction.category !== undefined)
		updates.categoryId = categoryStringToId(transaction.category);
	if (transaction.type !== undefined) updates.type = transaction.type;
	if (transaction.description !== undefined)
		updates.description = transaction.description;

	if (Object.keys(updates).length > 0) {
		updates.updatedAt = new Date();
		await db
			.update(transactions)
			.set(updates)
			.where(eq(transactions.id, parseInt(id)));
	}
};

export const deleteTransaction = async (id: string): Promise<void> => {
	await db.delete(transactions).where(eq(transactions.id, parseInt(id)));
};

export const getTransactionsByCategory = async (
	category: TransactionCategory
): Promise<Transaction[]> => {
	const records = await db
		.select()
		.from(transactions)
		.where(eq(transactions.categoryId, categoryStringToId(category)))
		.orderBy(transactions.date);
	return records.map(toModel);
};

export const getTransactionsByDateRange = async (
	startDate: string,
	endDate: string
): Promise<Transaction[]> => {
	const records = await db
		.select()
		.from(transactions)
		.where(between(transactions.date, new Date(startDate), new Date(endDate)))
		.orderBy(transactions.date);
	return records.map(toModel);
};

export const getTransactionAnalytics = async (
	startDate?: string,
	endDate?: string
): Promise<{
	totalIncome: number;
	totalExpenses: number;
	netIncome: number;
	transactionCount: number;
	avgTransactionAmount: number;
	incomeTransactionCount: number;
	expenseTransactionCount: number;
}> => {
	const start = startDate
		? new Date(startDate)
		: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
	const end = endDate ? new Date(endDate) : new Date();

	const analytics = await db
		.select({
			totalAmount: sql<number>`SUM(${transactions.amount})`,
			totalIncome: sql<number>`SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END)`,
			totalExpenses: sql<number>`SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END)`,
			transactionCount: sql<number>`COUNT(*)`,
			incomeCount: sql<number>`SUM(CASE WHEN ${transactions.type} = 'income' THEN 1 ELSE 0 END)`,
			expenseCount: sql<number>`SUM(CASE WHEN ${transactions.type} = 'expense' THEN 1 ELSE 0 END)`,
		})
		.from(transactions)
		.where(between(transactions.date, start, end));

	const result = analytics[0];

	return {
		totalIncome: result?.totalIncome || 0,
		totalExpenses: result?.totalExpenses || 0,
		netIncome: (result?.totalIncome || 0) - (result?.totalExpenses || 0),
		transactionCount: result?.transactionCount || 0,
		avgTransactionAmount: result?.transactionCount
			? (result.totalAmount || 0) / result.transactionCount
			: 0,
		incomeTransactionCount: result?.incomeCount || 0,
		expenseTransactionCount: result?.expenseCount || 0,
	};
};

export const getRecentTransactions = async (
	limit: number = 10,
	type?: 'income' | 'expense'
): Promise<Transaction[]> => {
	const whereCondition = type ? eq(transactions.type, type) : undefined;

	const records = await db
		.select()
		.from(transactions)
		.where(whereCondition)
		.orderBy(desc(transactions.date))
		.limit(limit);

	return records.map(toModel);
};

export const searchTransactions = async (
	query: string,
	type?: 'income' | 'expense'
): Promise<Transaction[]> => {
	const conditions = [like(transactions.description, `%${query}%`)];

	if (type) {
		conditions.push(eq(transactions.type, type));
	}

	const records = await db
		.select()
		.from(transactions)
		.where(and(...conditions))
		.orderBy(desc(transactions.date));

	return records.map(toModel);
};

export const getTransactionsByAmountRange = async (
	minAmount: number,
	maxAmount: number,
	type?: 'income' | 'expense'
): Promise<Transaction[]> => {
	const conditions = [
		and(
			sql`${transactions.amount} >= ${minAmount}`,
			sql`${transactions.amount} <= ${maxAmount}`
		),
	];

	if (type) {
		conditions.push(eq(transactions.type, type));
	}

	const records = await db
		.select()
		.from(transactions)
		.where(and(...conditions))
		.orderBy(desc(transactions.amount));

	return records.map(toModel);
};

export const getLargestTransactions = async (
	limit: number = 10,
	type?: 'income' | 'expense'
): Promise<Transaction[]> => {
	const whereCondition = type ? eq(transactions.type, type) : undefined;

	const records = await db
		.select()
		.from(transactions)
		.where(whereCondition)
		.orderBy(desc(transactions.amount))
		.limit(limit);

	return records.map(toModel);
};

export const getTransactionFrequency = async (
	categoryId?: string,
	type?: 'income' | 'expense'
): Promise<{ date: string; count: number; totalAmount: number }[]> => {
	const conditions = [];

	if (categoryId) {
		conditions.push(eq(transactions.categoryId, parseInt(categoryId)));
	}

	if (type) {
		conditions.push(eq(transactions.type, type));
	}

	const frequency = await db
		.select({
			date: sql<string>`DATE(${transactions.date})`,
			count: sql<number>`COUNT(*)`,
			totalAmount: sql<number>`SUM(${transactions.amount})`,
		})
		.from(transactions)
		.where(conditions.length > 0 ? and(...conditions) : undefined)
		.groupBy(sql`DATE(${transactions.date})`)
		.orderBy(sql`DATE(${transactions.date})`);

	return frequency;
};

export const getDuplicateTransactions = async (): Promise<Transaction[][]> => {
	// Find transactions with same amount, date, and category
	const duplicates = await db
		.select({
			amount: transactions.amount,
			date: transactions.date,
			categoryId: transactions.categoryId,
			count: sql<number>`COUNT(*)`,
		})
		.from(transactions)
		.groupBy(transactions.amount, transactions.date, transactions.categoryId)
		.having(sql`COUNT(*) > 1`);

	const duplicateGroups: Transaction[][] = [];

	for (const duplicate of duplicates) {
		const group = await db
			.select()
			.from(transactions)
			.where(
				and(
					eq(transactions.amount, duplicate.amount),
					eq(transactions.date, duplicate.date),
					eq(transactions.categoryId, duplicate.categoryId)
				)
			)
			.orderBy(transactions.createdAt);

		duplicateGroups.push(group.map(toModel));
	}

	return duplicateGroups;
};

export const bulkDeleteTransactions = async (ids: string[]): Promise<void> => {
	const numericIds = ids.map((id) => parseInt(id));
	await db
		.delete(transactions)
		.where(sql`${transactions.id} IN (${numericIds.join(',')})`);
};

export const getMonthlyTransactionSummary = async (
	year: number
): Promise<
	{ month: number; income: number; expenses: number; count: number }[]
> => {
	const summary = await db
		.select({
			month: sql<number>`strftime('%m', ${transactions.date})`,
			income: sql<number>`SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END)`,
			expenses: sql<number>`SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END)`,
			count: sql<number>`COUNT(*)`,
		})
		.from(transactions)
		.where(sql`strftime('%Y', ${transactions.date}) = ${year.toString()}`)
		.groupBy(sql`strftime('%m', ${transactions.date})`)
		.orderBy(sql`strftime('%m', ${transactions.date})`);

	return summary;
};
