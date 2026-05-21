import { create } from 'zustand';
import { ShoppingList, ShoppingItem } from '@/types/shopping';
import * as shoppingService from '@/services/db/shopping';

interface ShoppingStore {
	lists: ShoppingList[];
	selectedList: ShoppingList | null;
	isLoading: boolean;
	error: string | null;

	// Actions
	loadLists: () => Promise<void>;
	addList: (
		list: Omit<
			ShoppingList,
			| 'id'
			| 'createdAt'
			| 'updatedAt'
			| 'items'
			| 'totalEstimatedCost'
			| 'completed'
		>
	) => Promise<void>;
	updateList: (
		id: string,
		list: Partial<
			Omit<
				ShoppingList,
				| 'id'
				| 'createdAt'
				| 'updatedAt'
				| 'items'
				| 'totalEstimatedCost'
				| 'completed'
			>
		>
	) => Promise<void>;
	deleteList: (id: string) => Promise<void>;
	selectList: (list: ShoppingList | null) => void;
	addItem: (
		listId: string,
		item: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'>
	) => Promise<void>;
	updateItem: (
		listId: string,
		itemId: string,
		item: Partial<Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'>>
	) => Promise<void>;
	deleteItem: (listId: string, itemId: string) => Promise<void>;
	toggleItemPurchased: (listId: string, itemId: string) => Promise<void>;
}

export const useShoppingStore = create<ShoppingStore>((set, get) => ({
	lists: [],
	selectedList: null,
	isLoading: false,
	error: null,

	loadLists: async () => {
		set({ isLoading: true, error: null });
		try {
			const lists = await shoppingService.getAllShoppingLists();
			set({ lists, isLoading: false });
		} catch (error) {
			set({
				error:
					error instanceof Error
						? error.message
						: 'Failed to load shopping lists',
				isLoading: false,
			});
		}
	},

	addList: async (list) => {
		set({ isLoading: true, error: null });
		try {
			const newList = await shoppingService.createShoppingList(list);
			set((state) => ({
				lists: [...state.lists, newList],
				isLoading: false,
			}));
		} catch (error) {
			set({
				error:
					error instanceof Error
						? error.message
						: 'Failed to add shopping list',
				isLoading: false,
			});
		}
	},

	updateList: async (id, list) => {
		set({ isLoading: true, error: null });
		try {
			await shoppingService.updateShoppingList(id, list);
			const updatedList = await shoppingService.getShoppingListById(id);
			if (updatedList) {
				set((state) => ({
					lists: state.lists.map((l) => (l.id === id ? updatedList : l)),
					selectedList:
						state.selectedList?.id === id ? updatedList : state.selectedList,
					isLoading: false,
				}));
			}
		} catch (error) {
			set({
				error:
					error instanceof Error
						? error.message
						: 'Failed to update shopping list',
				isLoading: false,
			});
		}
	},

	deleteList: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await shoppingService.deleteShoppingList(id);
			set((state) => ({
				lists: state.lists.filter((l) => l.id !== id),
				selectedList: state.selectedList?.id === id ? null : state.selectedList,
				isLoading: false,
			}));
		} catch (error) {
			set({
				error:
					error instanceof Error
						? error.message
						: 'Failed to delete shopping list',
				isLoading: false,
			});
		}
	},

	selectList: (list) => {
		set({ selectedList: list });
	},

	addItem: async (listId, item) => {
		set({ isLoading: true, error: null });
		try {
			const newItem = await shoppingService.addShoppingItem(listId, item);
			const updatedList = await shoppingService.getShoppingListById(listId);
			if (updatedList) {
				set((state) => ({
					lists: state.lists.map((l) => (l.id === listId ? updatedList : l)),
					selectedList:
						state.selectedList?.id === listId
							? updatedList
							: state.selectedList,
					isLoading: false,
				}));
			}
		} catch (error) {
			set({
				error:
					error instanceof Error
						? error.message
						: 'Failed to add shopping item',
				isLoading: false,
			});
		}
	},

	updateItem: async (listId, itemId, item) => {
		set({ isLoading: true, error: null });
		try {
			await shoppingService.updateShoppingItem(itemId, item);
			const updatedList = await shoppingService.getShoppingListById(listId);
			if (updatedList) {
				set((state) => ({
					lists: state.lists.map((l) => (l.id === listId ? updatedList : l)),
					selectedList:
						state.selectedList?.id === listId
							? updatedList
							: state.selectedList,
					isLoading: false,
				}));
			}
		} catch (error) {
			set({
				error:
					error instanceof Error
						? error.message
						: 'Failed to update shopping item',
				isLoading: false,
			});
		}
	},

	deleteItem: async (listId, itemId) => {
		set({ isLoading: true, error: null });
		try {
			await shoppingService.deleteShoppingItem(itemId);
			const updatedList = await shoppingService.getShoppingListById(listId);
			if (updatedList) {
				set((state) => ({
					lists: state.lists.map((l) => (l.id === listId ? updatedList : l)),
					selectedList:
						state.selectedList?.id === listId
							? updatedList
							: state.selectedList,
					isLoading: false,
				}));
			}
		} catch (error) {
			set({
				error:
					error instanceof Error
						? error.message
						: 'Failed to delete shopping item',
				isLoading: false,
			});
		}
	},

	toggleItemPurchased: async (listId, itemId) => {
		set({ isLoading: true, error: null });
		try {
			const list = get().lists.find((l) => l.id === listId);
			const item = list?.items.find((i) => i.id === itemId);
			if (item) {
				await shoppingService.toggleItemPurchased(itemId, !item.purchased);
				const updatedList = await shoppingService.getShoppingListById(listId);
				if (updatedList) {
					set((state) => ({
						lists: state.lists.map((l) => (l.id === listId ? updatedList : l)),
						selectedList:
							state.selectedList?.id === listId
								? updatedList
								: state.selectedList,
						isLoading: false,
					}));
				}
			}
		} catch (error) {
			set({
				error:
					error instanceof Error
						? error.message
						: 'Failed to toggle item purchased status',
				isLoading: false,
			});
		}
	},
}));
