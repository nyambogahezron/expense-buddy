import { create } from 'zustand';
import { Category } from '@/types/category';
import { Transaction } from '@/types/transaction';
import * as categoryService from '@/services/db/categories';
import * as transactionService from '@/services/db/transactions';

interface CategoryStore {
	categories: Category[];
	selectedCategory: Category | null;
	isLoading: boolean;
	error: string | null;

	// Actions
	loadCategories: () => Promise<void>;
	addCategory: (
		category: Omit<Category, 'id' | 'itemCount' | 'items'>
	) => Promise<void>;
	updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
	deleteCategory: (id: string) => Promise<void>;
	selectCategory: (category: Category | null) => void;
	addTransaction: (
		categoryId: string,
		transaction: Omit<Transaction, 'id'>
	) => Promise<void>;
	updateTransaction: (
		categoryId: string,
		transactionId: string,
		transaction: Partial<Transaction>
	) => Promise<void>;
	deleteTransaction: (
		categoryId: string,
		transactionId: string
	) => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
	categories: [],
	selectedCategory: null,
	isLoading: false,
	error: null,

	loadCategories: async () => {
		set({ isLoading: true, error: null });
		try {
			const categories = await categoryService.getAllCategories();
			// Load item counts and items for each category
			const categoriesWithItems = await Promise.all(
				categories.map(async (category) => {
					const itemCount = await categoryService.getCategoryItemCount(
						category.id
					);
					const items = await categoryService.getCategoryItems(category.id);
					return {
						...category,
						itemCount,
						items,
					};
				})
			);
			set({ categories: categoriesWithItems, isLoading: false });
		} catch (error) {
			set({
				error:
					error instanceof Error ? error.message : 'Failed to load categories',
				isLoading: false,
			});
		}
	},

	addCategory: async (category) => {
		set({ isLoading: true, error: null });
		try {
			const newCategory = await categoryService.createCategory(category);
			set((state) => ({
				categories: [
					...state.categories,
					{ ...newCategory, itemCount: 0, items: [] },
				],
				isLoading: false,
			}));
		} catch (error) {
			set({
				error:
					error instanceof Error ? error.message : 'Failed to add category',
				isLoading: false,
			});
		}
	},

	updateCategory: async (id, category) => {
		set({ isLoading: true, error: null });
		try {
			await categoryService.updateCategory(id, category);
			const updatedCategory = await categoryService.getCategoryById(id);
			if (updatedCategory) {
				const itemCount = await categoryService.getCategoryItemCount(id);
				const items = await categoryService.getCategoryItems(id);
				set((state) => ({
					categories: state.categories.map((c) =>
						c.id === id ? { ...updatedCategory, itemCount, items } : c
					),
					isLoading: false,
				}));
			}
		} catch (error) {
			set({
				error:
					error instanceof Error ? error.message : 'Failed to update category',
				isLoading: false,
			});
		}
	},

	deleteCategory: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await categoryService.deleteCategory(id);
			set((state) => ({
				categories: state.categories.filter((c) => c.id !== id),
				selectedCategory:
					state.selectedCategory?.id === id ? null : state.selectedCategory,
				isLoading: false,
			}));
		} catch (error) {
			set({
				error:
					error instanceof Error ? error.message : 'Failed to delete category',
				isLoading: false,
			});
		}
	},

	selectCategory: (category) => {
		set({ selectedCategory: category });
	},

	addTransaction: async (categoryId, transaction) => {
		set({ isLoading: true, error: null });
		try {
			const newTransaction = await transactionService.createTransaction({
				...transaction,
				category: categoryId as any, // TODO: Fix type casting
			});

			// Update category items
			const items = await categoryService.getCategoryItems(categoryId);
			const itemCount = await categoryService.getCategoryItemCount(categoryId);

			set((state) => ({
				categories: state.categories.map((c) =>
					c.id === categoryId
						? {
								...c,
								items: [...items],
								itemCount,
						  }
						: c
				),
				isLoading: false,
			}));
		} catch (error) {
			set({
				error:
					error instanceof Error ? error.message : 'Failed to add transaction',
				isLoading: false,
			});
		}
	},

	updateTransaction: async (categoryId, transactionId, transaction) => {
		set({ isLoading: true, error: null });
		try {
			await transactionService.updateTransaction(transactionId, transaction);

			// Update category items
			const items = await categoryService.getCategoryItems(categoryId);
			const itemCount = await categoryService.getCategoryItemCount(categoryId);

			set((state) => ({
				categories: state.categories.map((c) =>
					c.id === categoryId
						? {
								...c,
								items: [...items],
								itemCount,
						  }
						: c
				),
				isLoading: false,
			}));
		} catch (error) {
			set({
				error:
					error instanceof Error
						? error.message
						: 'Failed to update transaction',
				isLoading: false,
			});
		}
	},

	deleteTransaction: async (categoryId, transactionId) => {
		set({ isLoading: true, error: null });
		try {
			await transactionService.deleteTransaction(transactionId);

			// Update category items
			const items = await categoryService.getCategoryItems(categoryId);
			const itemCount = await categoryService.getCategoryItemCount(categoryId);

			set((state) => ({
				categories: state.categories.map((c) =>
					c.id === categoryId
						? {
								...c,
								items: [...items],
								itemCount,
						  }
						: c
				),
				isLoading: false,
			}));
		} catch (error) {
			set({
				error:
					error instanceof Error
						? error.message
						: 'Failed to delete transaction',
				isLoading: false,
			});
		}
	},
}));
