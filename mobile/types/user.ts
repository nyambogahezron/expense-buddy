export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  joinDate: string;
  stats: {
    transactions: number;
    categories: number;
    totalSaved: number;
  };
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    currency: string;
  };
}

export const dummyUsers: User[] = [
  {
    id: '1',
    username: 'sarah_finance',
    email: 'sarah@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    bio: 'Personal finance enthusiast | Helping others achieve financial freedom',
    joinDate: '2023-09-15',
    stats: {
      transactions: 156,
      categories: 8,
      totalSaved: 12500,
    },
    preferences: {
      notifications: true,
      darkMode: false,
      currency: 'USD',
    },
  },
  {
    id: '2',
    username: 'alex_investor',
    email: 'alex@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    bio: 'Investment banker | Tech enthusiast | Coffee lover',
    joinDate: '2023-10-01',
    stats: {
      transactions: 89,
      categories: 6,
      totalSaved: 8900,
    },
    preferences: {
      notifications: true,
      darkMode: true,
      currency: 'EUR',
    },
  },
  {
    id: '3',
    username: 'emma_budget',
    email: 'emma@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    bio: 'Budgeting expert | Minimalist lifestyle advocate',
    joinDate: '2023-11-20',
    stats: {
      transactions: 234,
      categories: 10,
      totalSaved: 15600,
    },
    preferences: {
      notifications: false,
      darkMode: false,
      currency: 'GBP',
    },
  },
  {
    id: '4',
    username: 'mike_crypto',
    email: 'mike@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    bio: 'Cryptocurrency trader | Digital nomad',
    joinDate: '2024-01-05',
    stats: {
      transactions: 67,
      categories: 5,
      totalSaved: 5600,
    },
    preferences: {
      notifications: true,
      darkMode: true,
      currency: 'USD',
    },
  },
  {
    id: '5',
    username: 'lisa_savings',
    email: 'lisa@example.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
    bio: 'Saving for early retirement | Travel enthusiast',
    joinDate: '2024-02-10',
    stats: {
      transactions: 45,
      categories: 7,
      totalSaved: 3400,
    },
    preferences: {
      notifications: true,
      darkMode: false,
      currency: 'CAD',
    },
  },
];