import { db } from '@/db';
import { categories } from '@/db/schema';
import { CATEGORIES } from '@/constants/categories';
import { eq } from 'drizzle-orm';

// Map category string IDs to database auto-increment IDs
const CATEGORY_ID_MAP: Record<string, number> = {
	food: 1,
	transport: 2,
	shopping: 3,
	entertainment: 4,
	utilities: 5,
	health: 6,
	salary: 7,
	freelance: 8,
	gift: 9,
	investment: 10,
	other: 11,
};

// Reverse mapping
const ID_TO_CATEGORY_MAP: Record<number, string> = Object.fromEntries(
	Object.entries(CATEGORY_ID_MAP).map(([key, value]) => [value, key])
);

export const categoryStringToId = (categoryString: string): number => {
	return CATEGORY_ID_MAP[categoryString] || CATEGORY_ID_MAP['other'];
};

export const categoryIdToString = (categoryId: number): string => {
	return ID_TO_CATEGORY_MAP[categoryId] || 'other';
};

export const initializeCategories = async (): Promise<void> => {
	try {
		// Check if categories already exist
		const existingCategories = await db.select().from(categories);

		if (existingCategories.length === 0) {
			// Insert all categories with specific IDs
			const categoryInserts = CATEGORIES.map((category) => {
				const id = CATEGORY_ID_MAP[category.id];
				return {
					id,
					name: category.name,
					icon: category.icon,
					color: category.color,
					description: category.name,
				};
			});

			// Use a single transaction for all inserts
			await db.transaction(async (tx) => {
				for (const categoryData of categoryInserts) {
					await tx.insert(categories).values(categoryData);
				}
			});

			console.log('Categories initialized successfully');
		} else {
			console.log('Categories already exist, skipping initialization');
		}
	} catch (error) {
		console.error('Error initializing categories:', error);
	}
};
