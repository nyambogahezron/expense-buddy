import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	// Categories
	getAllCategories,
	getCategoryById,
	createCategory,
	updateCategory,
	deleteCategory,
	getCategoryWithAnalytics,
	searchCategories,
	getCategoriesWithSpending,
	getTopSpendingCategories,

	// Shopping
	getAllShoppingLists,
	getShoppingListById,
	createShoppingList,
	updateShoppingList,
	deleteShoppingList,
	addShoppingItem,
	updateShoppingItem,
	toggleItemPurchased,
	getShoppingListAnalytics,
	getShoppingListsByStore,
	searchShoppingItems,
	getCompletedShoppingLists,
	markAllItemsAsPurchased,
	duplicateShoppingList,

	// Transactions
	getAllTransactions,
	getTransactionById,
	createTransaction,
	updateTransaction,
	deleteTransaction,
	getTransactionsByCategory,
	getTransactionsByDateRange,
	getTransactionAnalytics,
	getRecentTransactions,
	searchTransactions,
	getLargestTransactions,
	getMonthlyTransactionSummary,

	// Budgets
	getAllBudgets,
	getBudgetById,
	createBudget,
	updateBudget,
	deleteBudget,

	// Analytics
	getAnalyticsData,
	getBudgetAnalysis,
	getExpensesByCategory,
	getIncomeVsExpenseTrend,
} from './db';

import { Category } from '@/types/category';
import { ShoppingList, ShoppingItem } from '@/types/shopping';
import { Transaction, TransactionCategory } from '@/types/transaction';
import { Budget } from '@/types/budget';

// Query Keys
export const QUERY_KEYS = {
	categories: ['categories'] as const,
	category: (id: string) => ['categories', id] as const,
	categoryAnalytics: (id: string, startDate?: string, endDate?: string) =>
		['categories', id, 'analytics', startDate, endDate] as const,
	categoriesWithSpending: (startDate?: string, endDate?: string) =>
		['categories', 'spending', startDate, endDate] as const,
	topSpendingCategories: (
		limit: number,
		startDate?: string,
		endDate?: string
	) => ['categories', 'top-spending', limit, startDate, endDate] as const,

	shoppingLists: ['shopping-lists'] as const,
	shoppingList: (id: string) => ['shopping-lists', id] as const,
	shoppingAnalytics: (listId?: string) =>
		['shopping', 'analytics', listId] as const,
	shoppingByStore: ['shopping', 'by-store'] as const,
	completedShoppingLists: ['shopping-lists', 'completed'] as const,

	transactions: ['transactions'] as const,
	transaction: (id: string) => ['transactions', id] as const,
	transactionsByCategory: (category: TransactionCategory) =>
		['transactions', 'by-category', category] as const,
	transactionsByDateRange: (startDate: string, endDate: string) =>
		['transactions', 'by-date-range', startDate, endDate] as const,
	transactionAnalytics: (startDate?: string, endDate?: string) =>
		['transactions', 'analytics', startDate, endDate] as const,
	recentTransactions: (limit: number, type?: 'income' | 'expense') =>
		['transactions', 'recent', limit, type] as const,
	largestTransactions: (limit: number, type?: 'income' | 'expense') =>
		['transactions', 'largest', limit, type] as const,
	monthlyTransactionSummary: (year: number) =>
		['transactions', 'monthly-summary', year] as const,

	budgets: ['budgets'] as const,
	budget: (id: string) => ['budgets', id] as const,
	budgetAnalysis: ['budgets', 'analysis'] as const,

	analytics: (startDate?: string, endDate?: string) =>
		['analytics', startDate, endDate] as const,
	expensesByCategory: (startDate?: string, endDate?: string) =>
		['analytics', 'expenses-by-category', startDate, endDate] as const,
	incomeVsExpenseTrend: (months: number) =>
		['analytics', 'income-vs-expense-trend', months] as const,
};

// Category Hooks
export const useCategories = () => {
	return useQuery({
		queryKey: QUERY_KEYS.categories,
		queryFn: getAllCategories,
	});
};

export const useCategory = (id: string) => {
	return useQuery({
		queryKey: QUERY_KEYS.category(id),
		queryFn: () => getCategoryById(id),
		enabled: !!id,
	});
};

export const useCategoryWithAnalytics = (
	id: string,
	startDate?: string,
	endDate?: string
) => {
	return useQuery({
		queryKey: QUERY_KEYS.categoryAnalytics(id, startDate, endDate),
		queryFn: () => getCategoryWithAnalytics(id, startDate, endDate),
		enabled: !!id,
	});
};

export const useCategoriesWithSpending = (
	startDate?: string,
	endDate?: string
) => {
	return useQuery({
		queryKey: QUERY_KEYS.categoriesWithSpending(startDate, endDate),
		queryFn: () => getCategoriesWithSpending(startDate, endDate),
	});
};

export const useTopSpendingCategories = (
	limit: number = 5,
	startDate?: string,
	endDate?: string
) => {
	return useQuery({
		queryKey: QUERY_KEYS.topSpendingCategories(limit, startDate, endDate),
		queryFn: () => getTopSpendingCategories(limit, startDate, endDate),
	});
};

export const useSearchCategories = (query: string) => {
	return useQuery({
		queryKey: ['categories', 'search', query],
		queryFn: () => searchCategories(query),
		enabled: query.length > 0,
	});
};

export const useCreateCategory = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createCategory,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
		},
	});
};

export const useUpdateCategory = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			category,
		}: {
			id: string;
			category: Partial<Omit<Category, 'id' | 'itemCount' | 'items'>>;
		}) => updateCategory(id, category),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.category(id) });
		},
	});
};

export const useDeleteCategory = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteCategory,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
		},
	});
};

// Shopping Hooks
export const useShoppingLists = () => {
	return useQuery({
		queryKey: QUERY_KEYS.shoppingLists,
		queryFn: getAllShoppingLists,
	});
};

export const useShoppingList = (id: string) => {
	return useQuery({
		queryKey: QUERY_KEYS.shoppingList(id),
		queryFn: () => getShoppingListById(id),
		enabled: !!id,
	});
};

export const useShoppingAnalytics = (listId?: string) => {
	return useQuery({
		queryKey: QUERY_KEYS.shoppingAnalytics(listId),
		queryFn: () => getShoppingListAnalytics(listId),
	});
};

export const useShoppingByStore = () => {
	return useQuery({
		queryKey: QUERY_KEYS.shoppingByStore,
		queryFn: getShoppingListsByStore,
	});
};

export const useCompletedShoppingLists = () => {
	return useQuery({
		queryKey: QUERY_KEYS.completedShoppingLists,
		queryFn: getCompletedShoppingLists,
	});
};

export const useSearchShoppingItems = (query: string) => {
	return useQuery({
		queryKey: ['shopping-items', 'search', query],
		queryFn: () => searchShoppingItems(query),
		enabled: query.length > 0,
	});
};

export const useCreateShoppingList = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createShoppingList,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.shoppingLists });
		},
	});
};

export const useUpdateShoppingList = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			list,
		}: {
			id: string;
			list: Partial<
				Omit<
					ShoppingList,
					| 'id'
					| 'createdAt'
					| 'updatedAt'
					| 'items'
					| 'totalEstimatedCost'
					| 'completed'
				>
			>;
		}) => updateShoppingList(id, list),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.shoppingLists });
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.shoppingList(id) });
		},
	});
};

export const useDeleteShoppingList = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteShoppingList,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.shoppingLists });
		},
	});
};

export const useAddShoppingItem = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			listId,
			item,
		}: {
			listId: string;
			item: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'>;
		}) => addShoppingItem(listId, item),
		onSuccess: (_, { listId }) => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.shoppingLists });
			queryClient.invalidateQueries({
				queryKey: QUERY_KEYS.shoppingList(listId),
			});
		},
	});
};

export const useUpdateShoppingItem = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			item,
		}: {
			id: string;
			item: Partial<Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'>>;
		}) => updateShoppingItem(id, item),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.shoppingLists });
		},
	});
};

export const useToggleItemPurchased = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, purchased }: { id: string; purchased: boolean }) =>
			toggleItemPurchased(id, purchased),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.shoppingLists });
		},
	});
};

export const useMarkAllItemsAsPurchased = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: markAllItemsAsPurchased,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.shoppingLists });
		},
	});
};

export const useDuplicateShoppingList = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ listId, newName }: { listId: string; newName?: string }) =>
			duplicateShoppingList(listId, newName),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.shoppingLists });
		},
	});
};

// Transaction Hooks
export const useTransactions = () => {
	return useQuery({
		queryKey: QUERY_KEYS.transactions,
		queryFn: getAllTransactions,
	});
};

export const useTransaction = (id: string) => {
	return useQuery({
		queryKey: QUERY_KEYS.transaction(id),
		queryFn: () => getTransactionById(id),
		enabled: !!id,
	});
};

export const useTransactionsByCategory = (category: TransactionCategory) => {
	return useQuery({
		queryKey: QUERY_KEYS.transactionsByCategory(category),
		queryFn: () => getTransactionsByCategory(category),
	});
};

export const useTransactionsByDateRange = (
	startDate: string,
	endDate: string
) => {
	return useQuery({
		queryKey: QUERY_KEYS.transactionsByDateRange(startDate, endDate),
		queryFn: () => getTransactionsByDateRange(startDate, endDate),
		enabled: !!startDate && !!endDate,
	});
};

export const useTransactionAnalytics = (
	startDate?: string,
	endDate?: string
) => {
	return useQuery({
		queryKey: QUERY_KEYS.transactionAnalytics(startDate, endDate),
		queryFn: () => getTransactionAnalytics(startDate, endDate),
	});
};

export const useRecentTransactions = (
	limit: number = 10,
	type?: 'income' | 'expense'
) => {
	return useQuery({
		queryKey: QUERY_KEYS.recentTransactions(limit, type),
		queryFn: () => getRecentTransactions(limit, type),
	});
};

export const useLargestTransactions = (
	limit: number = 10,
	type?: 'income' | 'expense'
) => {
	return useQuery({
		queryKey: QUERY_KEYS.largestTransactions(limit, type),
		queryFn: () => getLargestTransactions(limit, type),
	});
};

export const useMonthlyTransactionSummary = (year: number) => {
	return useQuery({
		queryKey: QUERY_KEYS.monthlyTransactionSummary(year),
		queryFn: () => getMonthlyTransactionSummary(year),
	});
};

export const useSearchTransactions = (
	query: string,
	type?: 'income' | 'expense'
) => {
	return useQuery({
		queryKey: ['transactions', 'search', query, type],
		queryFn: () => searchTransactions(query, type),
		enabled: query.length > 0,
	});
};

export const useCreateTransaction = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createTransaction,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
			queryClient.invalidateQueries({ queryKey: ['analytics'] });
		},
	});
};

export const useUpdateTransaction = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			transaction,
		}: {
			id: string;
			transaction: Partial<Omit<Transaction, 'id'>>;
		}) => updateTransaction(id, transaction),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transaction(id) });
			queryClient.invalidateQueries({ queryKey: ['analytics'] });
		},
	});
};

export const useDeleteTransaction = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteTransaction,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
			queryClient.invalidateQueries({ queryKey: ['analytics'] });
		},
	});
};

// Budget Hooks
export const useBudgets = () => {
	return useQuery({
		queryKey: QUERY_KEYS.budgets,
		queryFn: getAllBudgets,
	});
};

export const useBudget = (id: string) => {
	return useQuery({
		queryKey: QUERY_KEYS.budget(id),
		queryFn: () => getBudgetById(id),
		enabled: !!id,
	});
};

export const useBudgetAnalysis = () => {
	return useQuery({
		queryKey: QUERY_KEYS.budgetAnalysis,
		queryFn: getBudgetAnalysis,
	});
};

export const useCreateBudget = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createBudget,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.budgets });
		},
	});
};

export const useUpdateBudget = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			budget,
		}: {
			id: string;
			budget: Partial<Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>>;
		}) => updateBudget(id, budget),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.budgets });
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.budget(id) });
		},
	});
};

export const useDeleteBudget = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteBudget,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.budgets });
		},
	});
};

// Analytics Hooks
export const useAnalyticsData = (startDate?: string, endDate?: string) => {
	return useQuery({
		queryKey: QUERY_KEYS.analytics(startDate, endDate),
		queryFn: () => getAnalyticsData(startDate, endDate),
	});
};

export const useExpensesByCategory = (startDate?: string, endDate?: string) => {
	return useQuery({
		queryKey: QUERY_KEYS.expensesByCategory(startDate, endDate),
		queryFn: () => getExpensesByCategory(startDate, endDate),
	});
};

export const useIncomeVsExpenseTrend = (months: number = 12) => {
	return useQuery({
		queryKey: QUERY_KEYS.incomeVsExpenseTrend(months),
		queryFn: () => getIncomeVsExpenseTrend(months),
	});
};
