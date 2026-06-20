import { create } from 'zustand';

interface CategorySelectionState {
	selectedCategories: Set<string>;
	isLoading: boolean;
	error: string | null;
	toggleCategory: (categoryId: string) => void;
	selectCategories: (categoryIds: string[]) => void;
	clearSelection: () => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
}

export const useCategorySelection = create<CategorySelectionState>((set) => ({
	selectedCategories: new Set(),
	isLoading: false,
	error: null,

	toggleCategory: (categoryId) =>
		set((state) => {
			const newSelection = new Set(state.selectedCategories);
			if (newSelection.has(categoryId)) {
				newSelection.delete(categoryId);
			} else {
				newSelection.add(categoryId);
			}
			return { selectedCategories: newSelection };
		}),

	selectCategories: (categoryIds) =>
		set(() => ({
			selectedCategories: new Set(categoryIds),
		})),

	clearSelection: () =>
		set(() => ({
			selectedCategories: new Set(),
		})),

	setLoading: (loading) =>
		set(() => ({
			isLoading: loading,
		})),

	setError: (error) =>
		set(() => ({
			error,
		})),
}));
