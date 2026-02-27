import { palette } from './design'

// Re-export old properties as aliases to our new premium palette to avoid breaking changes
export const Colors = {
	text: palette.text,
	background: palette.base,
	tint: palette.primary,
	icon: palette.textSecondary,
	tabIconDefault: palette.textMuted,
	tabIconSelected: palette.primary,
	primary: palette.primary,
	primaryDark: palette.primaryDark,
	secondary: palette.secondary,
	secondaryDark: palette.secondary,
	surface: palette.surface,
	error: palette.error,
	success: palette.success,
	textSecondary: palette.textSecondary,
	border: palette.border,
	disabled: palette.textMuted,
}
