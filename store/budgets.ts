import { create } from 'zustand';
import { Budget } from '@/types/budget';
import * as budgetService from '@/services/db/budgets';

interface BudgetStore {
	budgets: Budget[];
	selectedBudget: Budget | null;
	budgetStats: any | null;
	isLoading: boolean;
	error: string | null;

	// Actions
	loadBudgets: () => Promise<void>;
	addBudget: (
		budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>
	) => Promise<void>;
	updateBudget: (
		id: string,
		budget: Partial<Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>>
	) => Promise<void>;
	deleteBudget: (id: string) => Promise<void>;
	selectBudget: (budget: Budget | null) => void;
	updateCategorySpent: (
		budgetId: string,
		categoryId: string,
		spent: number
	) => Promise<void>;
	getBudgetStats: (budgetId: string) => Promise<any>;
	getActiveBudgets: () => Promise<void>;
	checkBudgetNameExists: (name: string, excludeId?: string) => Promise<boolean>;
}

export const useBudgetStore = create<BudgetStore>((set, get) => ({
	budgets: [],
	selectedBudget: null,
	budgetStats: null,
	isLoading: false,
	error: null,

	loadBudgets: async () => {
		const state = get();
		if (state.isLoading) return; // Prevent multiple simultaneous calls

		set({ isLoading: true, error: null });
		try {
			const budgets = await budgetService.getAllBudgets();
			set({ budgets: budgets || [], isLoading: false });
		} catch (error) {
			console.error('Error loading budgets:', error);
			set({
				error:
					error instanceof Error ? error.message : 'Failed to load budgets',
				isLoading: false,
				budgets: [], // Set empty array to prevent undefined issues
			});
		}
	},

	addBudget: async (budget) => {
		set({ isLoading: true, error: null });
		try {
			const newBudget = await budgetService.createBudget(budget);
			set((state) => ({
				budgets: [...state.budgets, newBudget],
				isLoading: false,
			}));
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : 'Failed to add budget',
				isLoading: false,
			});
		}
	},

	updateBudget: async (id, budget) => {
		set({ isLoading: true, error: null });
		try {
			await budgetService.updateBudget(id, budget);
			const updatedBudget = await budgetService.getBudgetById(id);
			if (updatedBudget) {
				set((state) => ({
					budgets: state.budgets.map((b) => (b.id === id ? updatedBudget : b)),
					selectedBudget:
						state.selectedBudget?.id === id
							? updatedBudget
							: state.selectedBudget,
					isLoading: false,
				}));
			}
		} catch (error) {
			set({
				error:
					error instanceof Error ? error.message : 'Failed to update budget',
				isLoading: false,
			});
		}
	},

	deleteBudget: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await budgetService.deleteBudget(id);
			set((state) => ({
				budgets: state.budgets.filter((b) => b.id !== id),
				selectedBudget:
					state.selectedBudget?.id === id ? null : state.selectedBudget,
				isLoading: false,
			}));
		} catch (error) {
			set({
				error:
					error instanceof Error ? error.message : 'Failed to delete budget',
				isLoading: false,
			});
		}
	},

	selectBudget: (budget) => {
		set({ selectedBudget: budget });
	},

	updateCategorySpent: async (budgetId, categoryId, spent) => {
		set({ isLoading: true, error: null });
		try {
			await budgetService.updateCategorySpent(budgetId, categoryId, spent);
			const updatedBudget = await budgetService.getBudgetById(budgetId);
			if (updatedBudget) {
				set((state) => ({
					budgets: state.budgets.map((b) =>
						b.id === budgetId ? updatedBudget : b
					),
					selectedBudget:
						state.selectedBudget?.id === budgetId
							? updatedBudget
							: state.selectedBudget,
					isLoading: false,
				}));
			}
		} catch (error) {
			set({
				error:
					error instanceof Error
						? error.message
						: 'Failed to update category spent amount',
				isLoading: false,
			});
		}
	},

	getBudgetStats: async (budgetId) => {
		set({ isLoading: true, error: null });
		try {
			const stats = await budgetService.getBudgetStats(budgetId);
			set({ budgetStats: stats, isLoading: false });
			return stats;
		} catch (error) {
			set({
				error:
					error instanceof Error
						? error.message
						: 'Failed to load budget stats',
				isLoading: false,
			});
			return null;
		}
	},

	getActiveBudgets: async () => {
		const state = get();
		if (state.isLoading) return; // Prevent multiple simultaneous calls

		set({ isLoading: true, error: null });
		try {
			const activeBudgets = await budgetService.getActiveBudgets();
			set({ budgets: activeBudgets, isLoading: false });
		} catch (error) {
			console.error('Error loading active budgets:', error);
			set({
				error:
					error instanceof Error
						? error.message
						: 'Failed to load active budgets',
				isLoading: false,
				budgets: [], // Set empty array to prevent undefined issues
			});
		}
	},

	checkBudgetNameExists: async (name, excludeId) => {
		set({ isLoading: true, error: null });
		try {
			const exists = await budgetService.checkBudgetNameExists(name, excludeId);
			set({ isLoading: false });
			return exists;
		} catch (error) {
			set({
				error:
					error instanceof Error
						? error.message
						: 'Failed to check if budget name exists',
				isLoading: false,
			});
			return false;
		}
	},
}));
