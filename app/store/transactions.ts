import { create } from 'zustand';
import { Transaction, TransactionCategory } from '@/types/transaction';
import * as transactionService from '@/services/db/transactions';
import { initializeCategories } from '@/services/db/init';

interface TransactionStore {
	transactions: Transaction[];
	isLoading: boolean;
	error: string | null;
	searchQuery: string;
	selectedCategory: TransactionCategory | null;
	sortOrder: 'asc' | 'desc';

	// Actions
	loadTransactions: () => Promise<void>;
	addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
	updateTransaction: (
		id: string,
		transaction: Partial<Transaction>
	) => Promise<void>;
	deleteTransaction: (id: string) => Promise<void>;
	setSearchQuery: (query: string) => void;
	setSelectedCategory: (category: TransactionCategory | null) => void;
	setSortOrder: (order: 'asc' | 'desc') => void;
	resetDatabase: () => Promise<void>;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
	transactions: [],
	isLoading: false,
	error: null,
	searchQuery: '',
	selectedCategory: null,
	sortOrder: 'desc',

	loadTransactions: async () => {
		set({ isLoading: true, error: null });
		try {
			// Initialize categories first
			await initializeCategories();

			const transactions = await transactionService.getAllTransactions();
			set({ transactions, isLoading: false });
		} catch (error) {
			set({
				error:
					error instanceof Error
						? error.message
						: 'Failed to load transactions',
				isLoading: false,
			});
		}
	},

	addTransaction: async (transaction) => {
		// Optimistic update - add transaction immediately with temporary ID
		const tempTransaction = {
			...transaction,
			id: 'temp-' + Date.now(),
		};

		set((state) => ({
			transactions: [tempTransaction, ...state.transactions],
			error: null,
		}));

		try {
			const newTransaction = await transactionService.createTransaction(
				transaction
			);

			// Replace temp transaction with real one
			set((state) => ({
				transactions: state.transactions.map((t) =>
					t.id === tempTransaction.id ? newTransaction : t
				),
			}));
		} catch (error) {
			// Remove temp transaction on error
			set((state) => ({
				transactions: state.transactions.filter(
					(t) => t.id !== tempTransaction.id
				),
				error:
					error instanceof Error ? error.message : 'Failed to add transaction',
			}));
			throw error;
		}
	},

	updateTransaction: async (id, transaction) => {
		// Optimistic update - update immediately in UI
		const originalTransactions = get().transactions;
		set((state) => ({
			transactions: state.transactions.map((t) =>
				t.id === id ? { ...t, ...transaction } : t
			),
			error: null,
		}));

		try {
			await transactionService.updateTransaction(id, transaction);
			// Fetch the updated transaction to get the complete data
			const updatedTransaction = await transactionService.getTransactionById(
				id
			);
			if (updatedTransaction) {
				set((state) => ({
					transactions: state.transactions.map((t) =>
						t.id === id ? updatedTransaction : t
					),
				}));
			}
		} catch (error) {
			// Rollback on error
			set({
				transactions: originalTransactions,
				error:
					error instanceof Error
						? error.message
						: 'Failed to update transaction',
			});
		}
	},

	deleteTransaction: async (id) => {
		// Optimistic update - remove immediately from UI
		const originalTransactions = get().transactions;
		set((state) => ({
			transactions: state.transactions.filter((t) => t.id !== id),
			error: null,
		}));

		try {
			await transactionService.deleteTransaction(id);
			// Success - transaction already removed from UI
		} catch (error) {
			// Rollback on error - restore the original transactions
			set({
				transactions: originalTransactions,
				error:
					error instanceof Error
						? error.message
						: 'Failed to delete transaction',
			});
		}
	},

	setSearchQuery: (query) => {
		set({ searchQuery: query });
	},

	setSelectedCategory: (category) => {
		set({ selectedCategory: category });
	},

	setSortOrder: (order) => {
		set({ sortOrder: order });
	},

	resetDatabase: async () => {
		set({ isLoading: true, error: null });
		try {
			const { clearDatabase } = await import('@/services/db/reset');
			await clearDatabase();
			set({ transactions: [], isLoading: false });
		} catch (error) {
			set({
				error:
					error instanceof Error ? error.message : 'Failed to reset database',
				isLoading: false,
			});
		}
	},
}));
