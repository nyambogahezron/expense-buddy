import { eq, and, between, sql, desc, inArray } from 'drizzle-orm';
import { db } from '@/db';
import {
	transactions,
	categories,
	budgets,
	budgetCategories,
} from '@/db/schema';

export interface AnalyticsData {
	totalIncome: number;
	totalExpenses: number;
	netIncome: number;
	transactionCount: number;
	avgTransactionAmount: number;
	categoryBreakdown: CategoryAnalytics[];
	monthlyTrends: MonthlyTrend[];
	budgetAnalysis: BudgetAnalysis[];
	topExpenseCategories: TopCategory[];
	recentTransactions: RecentTransaction[];
}

export interface CategoryAnalytics {
	categoryId: string;
	categoryName: string;
	totalAmount: number;
	transactionCount: number;
	percentage: number;
	color: string;
	icon: string;
}

export interface MonthlyTrend {
	month: string;
	year: number;
	income: number;
	expenses: number;
	net: number;
	transactionCount: number;
}

export interface BudgetAnalysis {
	budgetId: string;
	budgetName: string;
	totalBudget: number;
	totalSpent: number;
	remaining: number;
	utilizationRate: number;
	categories: BudgetCategoryAnalysis[];
}

export interface BudgetCategoryAnalysis {
	categoryId: string;
	categoryName: string;
	budgetAmount: number;
	spentAmount: number;
	remaining: number;
	utilizationRate: number;
	color: string;
}

export interface TopCategory {
	categoryId: string;
	categoryName: string;
	totalAmount: number;
	transactionCount: number;
	color: string;
	icon: string;
}

export interface RecentTransaction {
	id: string;
	amount: number;
	date: string;
	categoryName: string;
	categoryColor: string;
	type: 'income' | 'expense';
	description: string;
}

export const getAnalyticsData = async (
	startDate?: string,
	endDate?: string
): Promise<AnalyticsData> => {
	const start = startDate
		? new Date(startDate)
		: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 year ago
	const end = endDate ? new Date(endDate) : new Date();

	// Get all transactions within date range
	const transactionRecords = await db
		.select({
			id: transactions.id,
			amount: transactions.amount,
			type: transactions.type,
			date: transactions.date,
			categoryId: transactions.categoryId,
			description: transactions.description,
			categoryName: categories.name,
			categoryColor: categories.color,
			categoryIcon: categories.icon,
		})
		.from(transactions)
		.innerJoin(categories, eq(transactions.categoryId, categories.id))
		.where(between(transactions.date, start, end))
		.orderBy(desc(transactions.date));

	// Calculate basic metrics
	const totalIncome = transactionRecords
		.filter((t) => t.type === 'income')
		.reduce((sum, t) => sum + t.amount, 0);

	const totalExpenses = transactionRecords
		.filter((t) => t.type === 'expense')
		.reduce((sum, t) => sum + t.amount, 0);

	const netIncome = totalIncome - totalExpenses;
	const transactionCount = transactionRecords.length;
	const avgTransactionAmount =
		transactionCount > 0 ? (totalIncome + totalExpenses) / transactionCount : 0;

	// Category breakdown
	const categoryMap = new Map<string, CategoryAnalytics>();
	transactionRecords.forEach((transaction) => {
		const key = transaction.categoryId.toString();
		if (!categoryMap.has(key)) {
			categoryMap.set(key, {
				categoryId: key,
				categoryName: transaction.categoryName,
				totalAmount: 0,
				transactionCount: 0,
				percentage: 0,
				color: transaction.categoryColor,
				icon: transaction.categoryIcon,
			});
		}
		const category = categoryMap.get(key)!;
		category.totalAmount += transaction.amount;
		category.transactionCount += 1;
	});

	const categoryBreakdown = Array.from(categoryMap.values());
	const totalAmount = categoryBreakdown.reduce(
		(sum, cat) => sum + cat.totalAmount,
		0
	);
	categoryBreakdown.forEach((cat) => {
		cat.percentage =
			totalAmount > 0 ? (cat.totalAmount / totalAmount) * 100 : 0;
	});

	// Monthly trends
	const monthlyMap = new Map<string, MonthlyTrend>();
	transactionRecords.forEach((transaction) => {
		const date = new Date(transaction.date);
		const key = `${date.getFullYear()}-${date.getMonth()}`;
		if (!monthlyMap.has(key)) {
			monthlyMap.set(key, {
				month: date.toLocaleString('default', { month: 'long' }),
				year: date.getFullYear(),
				income: 0,
				expenses: 0,
				net: 0,
				transactionCount: 0,
			});
		}
		const trend = monthlyMap.get(key)!;
		if (transaction.type === 'income') {
			trend.income += transaction.amount;
		} else {
			trend.expenses += transaction.amount;
		}
		trend.transactionCount += 1;
	});

	const monthlyTrends = Array.from(monthlyMap.values());
	monthlyTrends.forEach((trend) => {
		trend.net = trend.income - trend.expenses;
	});
	monthlyTrends.sort(
		(a, b) =>
			a.year - b.year ||
			new Date(`${a.month} 1, ${a.year}`).getMonth() -
				new Date(`${b.month} 1, ${b.year}`).getMonth()
	);

	// Budget analysis
	const budgetAnalysis = await getBudgetAnalysis();

	// Top expense categories
	const topExpenseCategories = categoryBreakdown
		.filter((cat) => {
			return transactionRecords.some(
				(t) =>
					t.categoryId.toString() === cat.categoryId && t.type === 'expense'
			);
		})
		.sort((a, b) => b.totalAmount - a.totalAmount)
		.slice(0, 5)
		.map((cat) => ({
			categoryId: cat.categoryId,
			categoryName: cat.categoryName,
			totalAmount: cat.totalAmount,
			transactionCount: cat.transactionCount,
			color: cat.color,
			icon: cat.icon,
		}));

	// Recent transactions
	const recentTransactions = transactionRecords.slice(0, 10).map((t) => ({
		id: t.id.toString(),
		amount: t.amount,
		date: t.date.toISOString(),
		categoryName: t.categoryName,
		categoryColor: t.categoryColor,
		type: t.type,
		description: t.description || '',
	}));

	return {
		totalIncome,
		totalExpenses,
		netIncome,
		transactionCount,
		avgTransactionAmount,
		categoryBreakdown,
		monthlyTrends,
		budgetAnalysis,
		topExpenseCategories,
		recentTransactions,
	};
};

export const getBudgetAnalysis = async (): Promise<BudgetAnalysis[]> => {
	const budgetRecords = await db
		.select({
			budgetId: budgets.id,
			budgetName: budgets.name,
			totalAmount: budgets.totalAmount,
			startDate: budgets.startDate,
			endDate: budgets.endDate,
		})
		.from(budgets)
		.orderBy(desc(budgets.startDate));

	const analysis: BudgetAnalysis[] = [];

	for (const budget of budgetRecords) {
		// Get budget categories
		const budgetCategoryRecords = await db
			.select({
				categoryId: budgetCategories.categoryId,
				categoryName: categories.name,
				budgetAmount: budgetCategories.amount,
				spentAmount: budgetCategories.spent,
				categoryColor: categories.color,
			})
			.from(budgetCategories)
			.innerJoin(categories, eq(budgetCategories.categoryId, categories.id))
			.where(eq(budgetCategories.budgetId, budget.budgetId));

		// Calculate actual spending for the budget period
		const actualSpending = await db
			.select({
				categoryId: transactions.categoryId,
				totalSpent: sql<number>`SUM(${transactions.amount})`,
			})
			.from(transactions)
			.where(
				and(
					between(transactions.date, budget.startDate, budget.endDate),
					eq(transactions.type, 'expense'),
					inArray(
						transactions.categoryId,
						budgetCategoryRecords.map((bc) => bc.categoryId)
					)
				)
			)
			.groupBy(transactions.categoryId);

		const spendingMap = new Map(
			actualSpending.map((s) => [s.categoryId, s.totalSpent])
		);

		const budgetCategoryAnalysis: BudgetCategoryAnalysis[] =
			budgetCategoryRecords.map((bc) => {
				const actualSpent = spendingMap.get(bc.categoryId) || 0;
				return {
					categoryId: bc.categoryId.toString(),
					categoryName: bc.categoryName,
					budgetAmount: bc.budgetAmount,
					spentAmount: actualSpent,
					remaining: bc.budgetAmount - actualSpent,
					utilizationRate:
						bc.budgetAmount > 0 ? (actualSpent / bc.budgetAmount) * 100 : 0,
					color: bc.categoryColor,
				};
			});

		const totalSpent = budgetCategoryAnalysis.reduce(
			(sum, cat) => sum + cat.spentAmount,
			0
		);

		analysis.push({
			budgetId: budget.budgetId.toString(),
			budgetName: budget.budgetName,
			totalBudget: budget.totalAmount,
			totalSpent,
			remaining: budget.totalAmount - totalSpent,
			utilizationRate:
				budget.totalAmount > 0 ? (totalSpent / budget.totalAmount) * 100 : 0,
			categories: budgetCategoryAnalysis,
		});
	}

	return analysis;
};

export const getCategorySpendingTrend = async (
	categoryId: string,
	months: number = 12
): Promise<MonthlyTrend[]> => {
	const endDate = new Date();
	const startDate = new Date();
	startDate.setMonth(startDate.getMonth() - months);

	const records = await db
		.select({
			amount: transactions.amount,
			date: transactions.date,
			type: transactions.type,
		})
		.from(transactions)
		.where(
			and(
				eq(transactions.categoryId, parseInt(categoryId)),
				between(transactions.date, startDate, endDate)
			)
		)
		.orderBy(transactions.date);

	const monthlyMap = new Map<string, MonthlyTrend>();
	records.forEach((transaction) => {
		const date = new Date(transaction.date);
		const key = `${date.getFullYear()}-${date.getMonth()}`;
		if (!monthlyMap.has(key)) {
			monthlyMap.set(key, {
				month: date.toLocaleString('default', { month: 'long' }),
				year: date.getFullYear(),
				income: 0,
				expenses: 0,
				net: 0,
				transactionCount: 0,
			});
		}
		const trend = monthlyMap.get(key)!;
		if (transaction.type === 'income') {
			trend.income += transaction.amount;
		} else {
			trend.expenses += transaction.amount;
		}
		trend.transactionCount += 1;
	});

	const trends = Array.from(monthlyMap.values());
	trends.forEach((trend) => {
		trend.net = trend.income - trend.expenses;
	});

	return trends.sort(
		(a, b) =>
			a.year - b.year ||
			new Date(`${a.month} 1, ${a.year}`).getMonth() -
				new Date(`${b.month} 1, ${b.year}`).getMonth()
	);
};

export const getExpensesByCategory = async (
	startDate?: string,
	endDate?: string
): Promise<CategoryAnalytics[]> => {
	const start = startDate
		? new Date(startDate)
		: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
	const end = endDate ? new Date(endDate) : new Date();

	const records = await db
		.select({
			categoryId: transactions.categoryId,
			categoryName: categories.name,
			categoryColor: categories.color,
			categoryIcon: categories.icon,
			totalAmount: sql<number>`SUM(${transactions.amount})`,
			transactionCount: sql<number>`COUNT(*)`,
		})
		.from(transactions)
		.innerJoin(categories, eq(transactions.categoryId, categories.id))
		.where(
			and(
				between(transactions.date, start, end),
				eq(transactions.type, 'expense')
			)
		)
		.groupBy(
			transactions.categoryId,
			categories.name,
			categories.color,
			categories.icon
		)
		.orderBy(desc(sql`SUM(${transactions.amount})`));

	const totalExpenses = records.reduce(
		(sum, record) => sum + record.totalAmount,
		0
	);

	return records.map((record) => ({
		categoryId: record.categoryId.toString(),
		categoryName: record.categoryName,
		totalAmount: record.totalAmount,
		transactionCount: record.transactionCount,
		percentage:
			totalExpenses > 0 ? (record.totalAmount / totalExpenses) * 100 : 0,
		color: record.categoryColor,
		icon: record.categoryIcon,
	}));
};

export const getIncomeVsExpenseTrend = async (
	months: number = 12
): Promise<MonthlyTrend[]> => {
	const endDate = new Date();
	const startDate = new Date();
	startDate.setMonth(startDate.getMonth() - months);

	const records = await db
		.select({
			amount: transactions.amount,
			date: transactions.date,
			type: transactions.type,
		})
		.from(transactions)
		.where(between(transactions.date, startDate, endDate))
		.orderBy(transactions.date);

	const monthlyMap = new Map<string, MonthlyTrend>();
	records.forEach((transaction) => {
		const date = new Date(transaction.date);
		const key = `${date.getFullYear()}-${date.getMonth()}`;
		if (!monthlyMap.has(key)) {
			monthlyMap.set(key, {
				month: date.toLocaleString('default', { month: 'long' }),
				year: date.getFullYear(),
				income: 0,
				expenses: 0,
				net: 0,
				transactionCount: 0,
			});
		}
		const trend = monthlyMap.get(key)!;
		if (transaction.type === 'income') {
			trend.income += transaction.amount;
		} else {
			trend.expenses += transaction.amount;
		}
		trend.transactionCount += 1;
	});

	const trends = Array.from(monthlyMap.values());
	trends.forEach((trend) => {
		trend.net = trend.income - trend.expenses;
	});

	return trends.sort(
		(a, b) =>
			a.year - b.year ||
			new Date(`${a.month} 1, ${a.year}`).getMonth() -
				new Date(`${b.month} 1, ${b.year}`).getMonth()
	);
};
