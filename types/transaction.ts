export type TransactionCategory =
	| 'food'
	| 'transport'
	| 'shopping'
	| 'entertainment'
	| 'utilities'
	| 'health'
	| 'salary'
	| 'freelance'
	| 'gift'
	| 'investment'
	| 'other';

export interface Transaction {
	id: string;
	amount: number;
	date: string;
	category: TransactionCategory;
	type: 'income' | 'expense';
	description: string;
}

export const CATEGORIES: Record<
	TransactionCategory,
	{ label: string; color: string }
> = {
	food: { label: 'Food', color: '#EF4444' },
	transport: { label: 'Transport', color: '#F59E0B' },
	shopping: { label: 'Shopping', color: '#10B981' },
	entertainment: { label: 'Entertainment', color: '#6366F1' },
	utilities: { label: 'Bills', color: '#8B5CF6' },
	health: { label: 'Health', color: '#F44336' },
	salary: { label: 'Salary', color: '#3B82F6' },
	freelance: { label: 'Freelance', color: '#00BCD4' },
	gift: { label: 'Gift', color: '#9C27B0' },
	investment: { label: 'Investment', color: '#EC4899' },
	other: { label: 'Other', color: '#6B7280' },
};
