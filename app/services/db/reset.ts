import { db } from '@/db';
import { transactions, categories } from '@/db/schema';
import { initializeCategories } from './init';

export const clearDatabase = async (): Promise<void> => {
	try {
		console.log('Clearing database...');

		// Delete all transactions first (due to foreign key constraints)
		await db.delete(transactions);

		// Delete all categories
		await db.delete(categories);

		console.log('Database cleared successfully');

		// Reinitialize categories
		await initializeCategories();

		console.log('Categories reinitialized');
	} catch (error) {
		console.error('Error clearing database:', error);
		throw error;
	}
};

export const resetCategories = async (): Promise<void> => {
	try {
		console.log('Resetting categories...');

		// Delete all categories
		await db.delete(categories);

		// Reinitialize categories
		await initializeCategories();

		console.log('Categories reset successfully');
	} catch (error) {
		console.error('Error resetting categories:', error);
		throw error;
	}
};
