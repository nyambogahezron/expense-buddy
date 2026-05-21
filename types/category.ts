export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  itemCount: number;
  items: CategoryItem[];
}

export interface CategoryItem {
  id: string;
  name: string;
  amount: number;
  date: string;
  tags: string[];
}

export const categories: Category[] = [
  {
    id: '1',
    name: 'Investments',
    icon: 'trending-up',
    description: 'Track your investment portfolio and returns',
    color: '#10B981',
    itemCount: 8,
    items: [
      {
        id: '1-1',
        name: 'Stock Purchase - AAPL',
        amount: 5000,
        date: '2024-02-15',
        tags: ['stocks', 'tech'],
      },
      {
        id: '1-2',
        name: 'ETF Investment',
        amount: 2500,
        date: '2024-02-14',
        tags: ['etf', 'diversification'],
      },
      // Add more items...
    ],
  },
  {
    id: '2',
    name: 'Savings',
    icon: 'piggy-bank',
    description: 'Monitor your savings goals and progress',
    color: '#6366F1',
    itemCount: 6,
    items: [
      {
        id: '2-1',
        name: 'Emergency Fund',
        amount: 10000,
        date: '2024-02-13',
        tags: ['emergency', 'savings'],
      },
      // Add more items...
    ],
  },
  // Add more categories...
];