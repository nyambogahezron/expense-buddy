import { create } from 'zustand';
import { Theme, themes } from '@/types/theme';

interface ThemeState {
	theme: Theme
}

export const useThemeStore = create<ThemeState>((set) => ({
	theme: themes.dark,
}))

