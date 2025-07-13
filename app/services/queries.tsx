import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = 'http://localhost:8000/api';

const fetchData = async (url: string): Promise<any> => {
	const response = await fetch(url, {
		credentials: 'include',
	});
	return response.json();
};

export function useExpenses() {
	return useQuery({
		queryKey: ['expenses'],
		queryFn: async () => {
			const response = await fetchData(`${API_URL}/expenses/`);
			if (!response.ok) throw new Error('Network response was not ok');
			return response.json();
		},
	});
}

export function useExpenseCategories() {
	return useQuery({
		queryKey: ['expense-categories'],
		queryFn: async () => {
			const response = await fetchData(`${API_URL}/expense-categories/`);
			if (!response.ok) throw new Error('Network response was not ok');
			return response.json();
		},
	});
}

export function useExpenseSubcategories() {
	return useQuery({
		queryKey: ['expense-subcategories'],
		queryFn: async () => {
			const response = await fetchData(`${API_URL}/expense-subcategories/`);
			if (!response.ok) throw new Error('Network response was not ok');
			return response.json();
		},
	});
}

export function useAddExpense() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (newExpense) => {
			const response = await fetch(`${API_URL}/expenses/`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newExpense),
			});
			if (!response.ok) throw new Error('Failed to add expense');
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['expenses'] });
		},
	});
}
