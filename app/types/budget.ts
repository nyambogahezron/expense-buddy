export type BudgetPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface BudgetCategory {
	id: string;
	name: string;
	amount: number;
	spent: number;
	color: string;
}

export interface Budget {
	id: string;
	name: string;
	totalAmount: number;
	period: BudgetPeriod;
	startDate: string;
	endDate: string;
	categories: BudgetCategory[];
	createdAt: string;
	updatedAt: string;
}

export const SAMPLE_BUDGETS: Budget[] = [
	{
		id: '1',
		name: 'Monthly Expenses',
		totalAmount: 3000,
		period: 'monthly',
		startDate: '2024-02-01',
		endDate: '2024-02-29',
		categories: [
			{
				id: '1',
				name: 'Groceries',
				amount: 500,
				spent: 320,
				color: '#10B981',
			},
			{
				id: '2',
				name: 'Transportation',
				amount: 200,
				spent: 150,
				color: '#F59E0B',
			},
			{
				id: '3',
				name: 'Entertainment',
				amount: 300,
				spent: 250,
				color: '#6366F1',
			},
			{
				id: '4',
				name: 'Utilities',
				amount: 400,
				spent: 380,
				color: '#EF4444',
			},
		],
		createdAt: '2024-01-31T00:00:00Z',
		updatedAt: '2024-02-15T00:00:00Z',
	},
];
