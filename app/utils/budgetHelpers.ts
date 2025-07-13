import { Budget, BudgetPeriod } from '@/types/budget';

/**
 * Calculate the next end date based on the period and start date
 */
export const calculateEndDate = (
	startDate: Date,
	period: BudgetPeriod
): Date => {
	const endDate = new Date(startDate);

	switch (period) {
		case 'daily':
			endDate.setDate(endDate.getDate() + 1);
			break;
		case 'weekly':
			endDate.setDate(endDate.getDate() + 7);
			break;
		case 'monthly':
			endDate.setMonth(endDate.getMonth() + 1);
			break;
		case 'yearly':
			endDate.setFullYear(endDate.getFullYear() + 1);
			break;
	}

	return endDate;
};

/**
 * Check if a budget is currently active (current date is within the budget period)
 */
export const isBudgetActive = (budget: Budget): boolean => {
	const now = new Date();
	const startDate = new Date(budget.startDate);
	const endDate = new Date(budget.endDate);

	return now >= startDate && now <= endDate;
};

/**
 * Calculate the remaining days in a budget period
 */
export const getRemainingDays = (budget: Budget): number => {
	const now = new Date();
	const endDate = new Date(budget.endDate);

	if (now > endDate) return 0;

	const diffTime = endDate.getTime() - now.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	return Math.max(0, diffDays);
};

/**
 * Calculate the percentage of time elapsed in the budget period
 */
export const getTimeElapsedPercentage = (budget: Budget): number => {
	const now = new Date();
	const startDate = new Date(budget.startDate);
	const endDate = new Date(budget.endDate);

	if (now <= startDate) return 0;
	if (now >= endDate) return 100;

	const totalTime = endDate.getTime() - startDate.getTime();
	const elapsedTime = now.getTime() - startDate.getTime();

	return Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
};

/**
 * Get the budget status based on spending
 */
export const getBudgetStatus = (
	budget: Budget
): {
	status: 'on-track' | 'warning' | 'over-budget';
	message: string;
} => {
	const totalSpent = budget.categories.reduce((sum, cat) => sum + cat.spent, 0);
	const spentPercentage = (totalSpent / budget.totalAmount) * 100;
	const timeElapsed = getTimeElapsedPercentage(budget);

	if (spentPercentage > 100) {
		return {
			status: 'over-budget',
			message: 'Budget exceeded',
		};
	}

	if (spentPercentage > timeElapsed + 10) {
		return {
			status: 'warning',
			message: 'Spending ahead of schedule',
		};
	}

	return {
		status: 'on-track',
		message: 'On track',
	};
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: currency,
	}).format(amount);
};

/**
 * Calculate the daily spending allowance based on remaining budget and days
 */
export const getDailySpendingAllowance = (budget: Budget): number => {
	const totalSpent = budget.categories.reduce((sum, cat) => sum + cat.spent, 0);
	const remaining = budget.totalAmount - totalSpent;
	const remainingDays = getRemainingDays(budget);

	if (remainingDays <= 0) return 0;

	return remaining / remainingDays;
};

/**
 * Validate budget data
 */
export const validateBudget = (
	budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>
): {
	isValid: boolean;
	errors: string[];
} => {
	const errors: string[] = [];

	if (!budget.name.trim()) {
		errors.push('Budget name is required');
	}

	if (budget.totalAmount <= 0) {
		errors.push('Total amount must be greater than 0');
	}

	const startDate = new Date(budget.startDate);
	const endDate = new Date(budget.endDate);

	if (endDate <= startDate) {
		errors.push('End date must be after start date');
	}

	const totalCategoryAmount = budget.categories.reduce(
		(sum, cat) => sum + cat.amount,
		0
	);
	if (totalCategoryAmount > budget.totalAmount) {
		errors.push('Total category amounts cannot exceed budget total');
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
};

/**
 * Generate suggested budget amounts based on category history
 */
export const generateSuggestedAmounts = (
	categoryHistory: Array<{ categoryId: string; averageSpending: number }>,
	totalBudget: number
): Array<{ categoryId: string; suggestedAmount: number }> => {
	const totalHistoricalSpending = categoryHistory.reduce(
		(sum, cat) => sum + cat.averageSpending,
		0
	);

	if (totalHistoricalSpending === 0) {
		// Equal distribution if no history
		const amountPerCategory = totalBudget / categoryHistory.length;
		return categoryHistory.map((cat) => ({
			categoryId: cat.categoryId,
			suggestedAmount: amountPerCategory,
		}));
	}

	// Proportional distribution based on history
	return categoryHistory.map((cat) => ({
		categoryId: cat.categoryId,
		suggestedAmount:
			(cat.averageSpending / totalHistoricalSpending) * totalBudget,
	}));
};
