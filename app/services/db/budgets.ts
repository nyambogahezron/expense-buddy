import { eq, and, inArray, ne } from 'drizzle-orm';
import { db } from '@/db';
import { budgets, budgetCategories, categories } from '@/db/schema';
import { Budget, BudgetCategory } from '@/types/budget';

const toModel = async (
	budgetRecord: typeof budgets.$inferSelect,
	categoryRecords: Array<
		typeof budgetCategories.$inferSelect & {
			category: typeof categories.$inferSelect;
		}
	>
): Promise<Budget> => {
	const budgetCategories: BudgetCategory[] = categoryRecords.map((record) => ({
		id: record.categoryId.toString(),
		name: record.category.name,
		amount: record.amount,
		spent: record.spent,
		color: record.category.color,
	}));

	return {
		id: budgetRecord.id.toString(),
		name: budgetRecord.name,
		totalAmount: budgetRecord.totalAmount,
		period: budgetRecord.period as Budget['period'],
		startDate: budgetRecord.startDate.toISOString(),
		endDate: budgetRecord.endDate.toISOString(),
		categories: budgetCategories,
		createdAt: budgetRecord.createdAt.toISOString(),
		updatedAt: budgetRecord.updatedAt.toISOString(),
	};
};

export const getAllBudgets = async (): Promise<Budget[]> => {
	try {
		// Get all budgets
		const budgetRecords = await db
			.select()
			.from(budgets)
			.orderBy(budgets.startDate);

		if (budgetRecords.length === 0) {
			return [];
		}

		// Get all budget IDs for efficient category fetching
		const budgetIds = budgetRecords.map((budget) => budget.id);

		// Get all budget categories with category details in a single query
		const allCategoryRecords = await db
			.select({
				id: budgetCategories.id,
				budgetId: budgetCategories.budgetId,
				categoryId: budgetCategories.categoryId,
				amount: budgetCategories.amount,
				spent: budgetCategories.spent,
				createdAt: budgetCategories.createdAt,
				updatedAt: budgetCategories.updatedAt,
				category: {
					id: categories.id,
					name: categories.name,
					icon: categories.icon,
					color: categories.color,
					description: categories.description,
					createdAt: categories.createdAt,
					updatedAt: categories.updatedAt,
				},
			})
			.from(budgetCategories)
			.innerJoin(categories, eq(budgetCategories.categoryId, categories.id))
			.where(inArray(budgetCategories.budgetId, budgetIds));

		// Group categories by budget ID
		const categoriesByBudget = allCategoryRecords.reduce((acc, record) => {
			if (!acc[record.budgetId]) {
				acc[record.budgetId] = [];
			}
			acc[record.budgetId].push(record);
			return acc;
		}, {} as Record<number, typeof allCategoryRecords>);

		// Build budget objects
		const results: Budget[] = [];
		for (const budgetRecord of budgetRecords) {
			const categoryRecords = categoriesByBudget[budgetRecord.id] || [];
			results.push(await toModel(budgetRecord, categoryRecords));
		}

		return results;
	} catch (error) {
		console.error('Error fetching budgets:', error);
		throw new Error('Failed to fetch budgets');
	}
};

export const getBudgetById = async (id: string): Promise<Budget | null> => {
	try {
		const budgetRecords = await db
			.select()
			.from(budgets)
			.where(eq(budgets.id, parseInt(id)));

		if (budgetRecords.length === 0) {
			return null;
		}

		const categoryRecords = await db
			.select({
				id: budgetCategories.id,
				budgetId: budgetCategories.budgetId,
				categoryId: budgetCategories.categoryId,
				amount: budgetCategories.amount,
				spent: budgetCategories.spent,
				createdAt: budgetCategories.createdAt,
				updatedAt: budgetCategories.updatedAt,
				category: {
					id: categories.id,
					name: categories.name,
					icon: categories.icon,
					color: categories.color,
					description: categories.description,
					createdAt: categories.createdAt,
					updatedAt: categories.updatedAt,
				},
			})
			.from(budgetCategories)
			.innerJoin(categories, eq(budgetCategories.categoryId, categories.id))
			.where(eq(budgetCategories.budgetId, parseInt(id)));

		return toModel(budgetRecords[0], categoryRecords);
	} catch (error) {
		console.error('Error fetching budget by ID:', error);
		throw new Error('Failed to fetch budget');
	}
};

export const createBudget = async (
	budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Budget> => {
	try {
		const now = new Date();

		// Use a transaction to ensure data consistency
		const result = await db.transaction(async (tx) => {
			// Insert the budget
			const [newBudget] = await tx
				.insert(budgets)
				.values({
					name: budget.name,
					totalAmount: budget.totalAmount,
					period: budget.period,
					startDate: new Date(budget.startDate),
					endDate: new Date(budget.endDate),
					createdAt: now,
					updatedAt: now,
				})
				.returning();

			// Insert budget categories if any
			if (budget.categories.length > 0) {
				await tx.insert(budgetCategories).values(
					budget.categories.map((category) => ({
						budgetId: newBudget.id,
						categoryId: parseInt(category.id),
						amount: category.amount,
						spent: category.spent || 0,
						createdAt: now,
						updatedAt: now,
					}))
				);
			}

			return newBudget;
		});

		// Return the full budget with categories
		const fullBudget = await getBudgetById(result.id.toString());
		if (!fullBudget) {
			throw new Error('Failed to retrieve created budget');
		}

		return fullBudget;
	} catch (error) {
		console.error('Error creating budget:', error);
		throw new Error('Failed to create budget');
	}
};

export const updateBudget = async (
	id: string,
	budget: Partial<Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
	try {
		await db.transaction(async (tx) => {
			const updates: Partial<typeof budgets.$inferInsert> = {};

			if (budget.name !== undefined) updates.name = budget.name;
			if (budget.totalAmount !== undefined)
				updates.totalAmount = budget.totalAmount;
			if (budget.period !== undefined) updates.period = budget.period;
			if (budget.startDate !== undefined)
				updates.startDate = new Date(budget.startDate);
			if (budget.endDate !== undefined)
				updates.endDate = new Date(budget.endDate);

			if (Object.keys(updates).length > 0) {
				updates.updatedAt = new Date();
				await tx
					.update(budgets)
					.set(updates)
					.where(eq(budgets.id, parseInt(id)));
			}

			if (budget.categories) {
				const now = new Date();

				// Delete existing budget categories
				await tx
					.delete(budgetCategories)
					.where(eq(budgetCategories.budgetId, parseInt(id)));

				// Insert new budget categories
				if (budget.categories.length > 0) {
					await tx.insert(budgetCategories).values(
						budget.categories.map((category) => ({
							budgetId: parseInt(id),
							categoryId: parseInt(category.id),
							amount: category.amount,
							spent: category.spent || 0,
							createdAt: now,
							updatedAt: now,
						}))
					);
				}
			}
		});
	} catch (error) {
		console.error('Error updating budget:', error);
		throw new Error('Failed to update budget');
	}
};

export const deleteBudget = async (id: string): Promise<void> => {
	try {
		const result = await db.delete(budgets).where(eq(budgets.id, parseInt(id)));
		if (result.changes === 0) {
			throw new Error('Budget not found');
		}
	} catch (error) {
		console.error('Error deleting budget:', error);
		throw new Error('Failed to delete budget');
	}
};

export const updateCategorySpent = async (
	budgetId: string,
	categoryId: string,
	spent: number
): Promise<void> => {
	try {
		const result = await db
			.update(budgetCategories)
			.set({
				spent,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(budgetCategories.budgetId, parseInt(budgetId)),
					eq(budgetCategories.categoryId, parseInt(categoryId))
				)
			);

		if (result.changes === 0) {
			throw new Error('Budget category not found');
		}
	} catch (error) {
		console.error('Error updating category spent amount:', error);
		throw new Error('Failed to update category spent amount');
	}
};

/**
 * Get budgets for a specific date range
 */
export const getBudgetsByDateRange = async (
	startDate: string,
	endDate: string
): Promise<Budget[]> => {
	try {
		const budgetRecords = await db
			.select()
			.from(budgets)
			.where(
				and(
					eq(budgets.startDate, new Date(startDate)),
					eq(budgets.endDate, new Date(endDate))
				)
			)
			.orderBy(budgets.startDate);

		if (budgetRecords.length === 0) {
			return [];
		}

		const budgetIds = budgetRecords.map((budget) => budget.id);
		const allCategoryRecords = await db
			.select({
				id: budgetCategories.id,
				budgetId: budgetCategories.budgetId,
				categoryId: budgetCategories.categoryId,
				amount: budgetCategories.amount,
				spent: budgetCategories.spent,
				createdAt: budgetCategories.createdAt,
				updatedAt: budgetCategories.updatedAt,
				category: {
					id: categories.id,
					name: categories.name,
					icon: categories.icon,
					color: categories.color,
					description: categories.description,
					createdAt: categories.createdAt,
					updatedAt: categories.updatedAt,
				},
			})
			.from(budgetCategories)
			.innerJoin(categories, eq(budgetCategories.categoryId, categories.id))
			.where(inArray(budgetCategories.budgetId, budgetIds));

		const categoriesByBudget = allCategoryRecords.reduce((acc, record) => {
			if (!acc[record.budgetId]) {
				acc[record.budgetId] = [];
			}
			acc[record.budgetId].push(record);
			return acc;
		}, {} as Record<number, typeof allCategoryRecords>);

		const results: Budget[] = [];
		for (const budgetRecord of budgetRecords) {
			const categoryRecords = categoriesByBudget[budgetRecord.id] || [];
			results.push(await toModel(budgetRecord, categoryRecords));
		}

		return results;
	} catch (error) {
		console.error('Error fetching budgets by date range:', error);
		throw new Error('Failed to fetch budgets by date range');
	}
};

/**
 * Get current active budgets (budgets that include today's date)
 */
export const getActiveBudgets = async (): Promise<Budget[]> => {
	try {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const budgetRecords = await db
			.select()
			.from(budgets)
			.where(and(eq(budgets.startDate, today), eq(budgets.endDate, today)))
			.orderBy(budgets.startDate);

		if (budgetRecords.length === 0) {
			return [];
		}

		const budgetIds = budgetRecords.map((budget) => budget.id);
		const allCategoryRecords = await db
			.select({
				id: budgetCategories.id,
				budgetId: budgetCategories.budgetId,
				categoryId: budgetCategories.categoryId,
				amount: budgetCategories.amount,
				spent: budgetCategories.spent,
				createdAt: budgetCategories.createdAt,
				updatedAt: budgetCategories.updatedAt,
				category: {
					id: categories.id,
					name: categories.name,
					icon: categories.icon,
					color: categories.color,
					description: categories.description,
					createdAt: categories.createdAt,
					updatedAt: categories.updatedAt,
				},
			})
			.from(budgetCategories)
			.innerJoin(categories, eq(budgetCategories.categoryId, categories.id))
			.where(inArray(budgetCategories.budgetId, budgetIds));

		const categoriesByBudget = allCategoryRecords.reduce((acc, record) => {
			if (!acc[record.budgetId]) {
				acc[record.budgetId] = [];
			}
			acc[record.budgetId].push(record);
			return acc;
		}, {} as Record<number, typeof allCategoryRecords>);

		const results: Budget[] = [];
		for (const budgetRecord of budgetRecords) {
			const categoryRecords = categoriesByBudget[budgetRecord.id] || [];
			results.push(await toModel(budgetRecord, categoryRecords));
		}

		return results;
	} catch (error) {
		console.error('Error fetching active budgets:', error);
		throw new Error('Failed to fetch active budgets');
	}
};

/**
 * Get budget statistics
 */
export const getBudgetStats = async (
	budgetId: string
): Promise<{
	totalBudget: number;
	totalSpent: number;
	remaining: number;
	percentageUsed: number;
	overBudget: boolean;
	categoryBreakdown: Array<{
		categoryId: string;
		categoryName: string;
		budgeted: number;
		spent: number;
		remaining: number;
		percentageUsed: number;
		overBudget: boolean;
	}>;
}> => {
	try {
		const budget = await getBudgetById(budgetId);
		if (!budget) {
			throw new Error('Budget not found');
		}

		const totalBudget = budget.totalAmount;
		const totalSpent = budget.categories.reduce(
			(sum, cat) => sum + cat.spent,
			0
		);
		const remaining = totalBudget - totalSpent;
		const percentageUsed =
			totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
		const overBudget = totalSpent > totalBudget;

		const categoryBreakdown = budget.categories.map((category) => {
			const categoryRemaining = category.amount - category.spent;
			const categoryPercentageUsed =
				category.amount > 0 ? (category.spent / category.amount) * 100 : 0;
			const categoryOverBudget = category.spent > category.amount;

			return {
				categoryId: category.id,
				categoryName: category.name,
				budgeted: category.amount,
				spent: category.spent,
				remaining: categoryRemaining,
				percentageUsed: categoryPercentageUsed,
				overBudget: categoryOverBudget,
			};
		});

		return {
			totalBudget,
			totalSpent,
			remaining,
			percentageUsed,
			overBudget,
			categoryBreakdown,
		};
	} catch (error) {
		console.error('Error calculating budget stats:', error);
		throw new Error('Failed to calculate budget statistics');
	}
};

/**
 * Check if a budget name already exists
 */
export const checkBudgetNameExists = async (
	name: string,
	excludeId?: string
): Promise<boolean> => {
	try {
		let result;

		if (excludeId) {
			// Exclude the current budget when updating (check if name exists but not for this ID)
			result = await db
				.select({ id: budgets.id })
				.from(budgets)
				.where(
					and(eq(budgets.name, name), ne(budgets.id, parseInt(excludeId)))
				);
		} else {
			result = await db
				.select({ id: budgets.id })
				.from(budgets)
				.where(eq(budgets.name, name));
		}

		return result.length > 0;
	} catch (error) {
		console.error('Error checking budget name:', error);
		return false;
	}
};
