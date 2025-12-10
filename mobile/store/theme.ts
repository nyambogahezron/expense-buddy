import { create } from 'zustand';
import { Theme, themes } from '@/types/theme';

interface ThemeState {
	theme: Theme;
	isMenuOpen: boolean;
	openMenu: () => void;
	closeMenu: () => void;
	toggleMenu: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
	theme: themes.dark,
	isMenuOpen: false,

	openMenu: () =>
		set((state) => {
			if (state.isMenuOpen) return state;
			return { isMenuOpen: true };
		}),

	closeMenu: () =>
		set((state) => {
			if (!state.isMenuOpen) return state;
			return { isMenuOpen: false };
		}),

	toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
}));
