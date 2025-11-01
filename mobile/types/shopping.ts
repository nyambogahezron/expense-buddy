export type Priority = 'low' | 'medium' | 'high';

export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  estimatedCost: number;
  priority: Priority;
  store?: string;
  purchased: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  totalEstimatedCost: number;
  store?: string;
  createdAt: string;
  updatedAt: string;
  completed: boolean;
}

export const SAMPLE_SHOPPING_LISTS: ShoppingList[] = [
  {
    id: '1',
    name: 'Weekly Groceries',
    items: [
      {
        id: '1',
        name: 'Milk',
        category: 'Dairy',
        quantity: 2,
        estimatedCost: 5.99,
        priority: 'high',
        store: 'Walmart',
        purchased: false,
        createdAt: '2024-02-15T00:00:00Z',
        updatedAt: '2024-02-15T00:00:00Z',
      },
      {
        id: '2',
        name: 'Bread',
        category: 'Bakery',
        quantity: 1,
        estimatedCost: 3.99,
        priority: 'medium',
        store: 'Walmart',
        purchased: true,
        createdAt: '2024-02-15T00:00:00Z',
        updatedAt: '2024-02-15T00:00:00Z',
      },
    ],
    totalEstimatedCost: 9.98,
    store: 'Walmart',
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z',
    completed: false,
  },
];