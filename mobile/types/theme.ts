export type ThemeType = 'dark';

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
}

export const themes: Record<ThemeType, Theme> = {
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
};