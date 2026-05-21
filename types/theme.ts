import { palette } from '@/constants/design'

export type ThemeType = 'dark'

export interface Theme {
	id: ThemeType
	name: string
	colors: typeof palette
}

export const themes: Record<ThemeType, Theme> = {
	dark: {
		id: 'dark',
		name: 'Dark',
		colors: palette,
	},
}
