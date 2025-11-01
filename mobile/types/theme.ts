export type ThemeType = 'light' | 'dark' | 'nature' | 'ocean' | 'sunset';

export interface Theme {
  id: ThemeType;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    error: string;
  };
  gradients?: {
    primary: string[];
    secondary: string[];
  };
}

export const themes: Record<ThemeType, Theme> = {
  light: {
    id: 'light',
    name: 'Light',
    colors: {
      primary: '#6366F1',
      secondary: '#8B5CF6',
      accent: '#F59E0B',
      background: '#F9FAFB',
      surface: '#FFFFFF',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      success: '#10B981',
      error: '#EF4444',
    },
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    colors: {
      primary: '#818CF8',
      secondary: '#A78BFA',
      accent: '#FBBF24',
      background: '#111827',
      surface: '#1F2937',
      text: '#F9FAFB',
      textSecondary: '#9CA3AF',
      border: '#374151',
      success: '#34D399',
      error: '#F87171',
    },
  },
  nature: {
    id: 'nature',
    name: 'Nature',
    colors: {
      primary: '#059669',
      secondary: '#10B981',
      accent: '#F59E0B',
      background: '#ECFDF5',
      surface: '#FFFFFF',
      text: '#064E3B',
      textSecondary: '#065F46',
      border: '#D1FAE5',
      success: '#10B981',
      error: '#EF4444',
    },
    gradients: {
      primary: ['#059669', '#10B981'],
      secondary: ['#047857', '#059669'],
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      primary: '#0EA5E9',
      secondary: '#38BDF8',
      accent: '#F59E0B',
      background: '#F0F9FF',
      surface: '#FFFFFF',
      text: '#0C4A6E',
      textSecondary: '#0369A1',
      border: '#E0F2FE',
      success: '#10B981',
      error: '#EF4444',
    },
    gradients: {
      primary: ['#0EA5E9', '#38BDF8'],
      secondary: ['#0284C7', '#0EA5E9'],
    },
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      primary: '#F97316',
      secondary: '#FB923C',
      accent: '#F59E0B',
      background: '#FFF7ED',
      surface: '#FFFFFF',
      text: '#7C2D12',
      textSecondary: '#9A3412',
      border: '#FFEDD5',
      success: '#10B981',
      error: '#EF4444',
    },
    gradients: {
      primary: ['#F97316', '#FB923C'],
      secondary: ['#EA580C', '#F97316'],
    },
  },
};