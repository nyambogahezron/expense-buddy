export interface CategoryConstant {
	id: string;
	name: string;
	icon: string;
	color: string;
}

export const CATEGORIES: CategoryConstant[] = [
	{
		id: 'food',
		name: 'Food',
		icon: 'coffee',
		color: '#FF9800',
	},
	{
		id: 'transport',
		name: 'Transport',
		icon: 'truck',
		color: '#2196F3',
	},
	{
		id: 'shopping',
		name: 'Shopping',
		icon: 'shopping-bag',
		color: '#E91E63',
	},
	{
		id: 'entertainment',
		name: 'Fun',
		icon: 'film',
		color: '#673AB7',
	},
	{
		id: 'utilities',
		name: 'Bills',
		icon: 'home',
		color: '#795548',
	},
	{
		id: 'health',
		name: 'Health',
		icon: 'heart',
		color: '#F44336',
	},
	{
		id: 'salary',
		name: 'Salary',
		icon: 'briefcase',
		color: '#4CAF50',
	},
	{
		id: 'freelance',
		name: 'Freelance',
		icon: 'code',
		color: '#00BCD4',
	},
	{
		id: 'gift',
		name: 'Gift',
		icon: 'gift',
		color: '#9C27B0',
	},
	{
		id: 'investment',
		name: 'Investment',
		icon: 'trending-up',
		color: '#EC4899',
	},
	{
		id: 'other',
		name: 'Other',
		icon: 'help-circle',
		color: '#6B7280',
	},
];
