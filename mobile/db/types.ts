// Database types
export interface Database {
	transaction: (
		callback: (tx: Transaction) => void,
		errorCallback?: (error: Error) => void,
		successCallback?: () => void
	) => void;
}

export interface Transaction {
	executeSql: (
		sqlStatement: string,
		args?: any[],
		callback?: (tx: Transaction, result: ResultSet) => void,
		errorCallback?: (tx: Transaction, error: Error) => boolean
	) => void;
}

export interface ResultSet {
	insertId?: number;
	rowsAffected: number;
	rows: {
		length: number;
		item: (index: number) => any;
		_array: any[];
	};
}

// Model types
export interface TransactionRecord {
	id: string;
	amount: number;
	date: string;
	category: string;
	type: 'income' | 'expense';
	description?: string;
	created_at: string;
	updated_at: string;
}

export interface CategoryRecord {
	id: string;
	name: string;
	icon: string;
	color: string;
	description?: string;
	created_at: string;
	updated_at: string;
}

export interface BudgetRecord {
	id: string;
	name: string;
	total_amount: number;
	period: 'weekly' | 'monthly' | 'yearly';
	start_date: string;
	end_date: string;
	created_at: string;
	updated_at: string;
}

export interface BudgetCategoryRecord {
	id: string;
	budget_id: string;
	category_id: string;
	amount: number;
	spent: number;
	created_at: string;
	updated_at: string;
}

export interface ShoppingListRecord {
	id: string;
	name: string;
	store?: string;
	created_at: string;
	updated_at: string;
}

export interface ShoppingItemRecord {
	id: string;
	list_id: string;
	name: string;
	quantity: number;
	estimated_cost: number;
	priority: 'low' | 'medium' | 'high';
	purchased: boolean;
	created_at: string;
	updated_at: string;
}
