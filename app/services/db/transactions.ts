import { eq, and, between } from 'drizzle-orm';
import { db } from '@/db';
import { transactions, categories } from '@/db/schema';
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
