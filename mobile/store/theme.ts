import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Theme, ThemeType, themes } from '@/types/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeState {
	currentTheme: ThemeType;
	theme: Theme;
	isMenuOpen: boolean;
	isTransitioning: boolean;
	setTheme: (themeType: ThemeType) => void;
	setThemeWithTransition: (themeType: ThemeType, delay?: number) => void;
	openMenu: () => void;
	closeMenu: () => void;
	toggleMenu: () => void;
}

export const useThemeStore = create<ThemeState>()(
	persist(
		(set, get) => ({
			currentTheme: 'light',
			theme: themes.light,
			isMenuOpen: false,
			isTransitioning: false,

			setTheme: (themeType) => {
				set((state) => {
					if (state.currentTheme === themeType) return state;
					return {
						currentTheme: themeType,
						theme: themes[themeType],
					};
				});
			},

			setThemeWithTransition: (themeType, delay = 300) => {
				const { currentTheme, isTransitioning } = get();

				if (currentTheme === themeType || isTransitioning) return;
				set({ isTransitioning: true });

				// Apply the theme change after the specified delay
				setTimeout(() => {
					set({
						currentTheme: themeType,
						theme: themes[themeType],
						isTransitioning: false,
					});
				}, delay);
			},

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
		}),
		{
			name: 'expense-buddy-theme',
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state: ThemeState) => ({
				currentTheme: state.currentTheme,
				theme: state.theme,
			}),
		}
	)
);
