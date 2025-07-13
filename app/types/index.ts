export * from './transaction';

export interface Category {
	id: number;
	name: string;
	icon: string;
	color: string;
	createdAt: Date;
}

export interface Expense {
	id: number;
	amount: number;
	description: string;
	categoryId: number;
	date: Date;
	createdAt: Date;
	category?: Category;
}

export interface Budget {
	id: number;
	amount: number;
	categoryId: number;
	startDate: Date;
	endDate: Date;
	createdAt: Date;
	category?: Category;
}

export interface TransactionSummary {
	totalIncome: number;
	totalExpense: number;
	balance: number;
	categorySummary: {
		[key: string]: number;
	};
}

export type FilterType = 'all' | 'income' | 'expense' | string;
