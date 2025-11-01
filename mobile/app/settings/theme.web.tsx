import { View, StyleSheet, ScrollView } from 'react-native';
import { useThemeStore } from '@/store/theme';
import { ThemePreview } from '@/components/ThemePreview';
import { themes, ThemeType } from '@/types/theme';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Stack } from 'expo-router';

export default function SettingsScreen() {
	const { currentTheme, setTheme } = useThemeStore();
	const theme = themes[currentTheme];

	return (
		<ScrollView
			style={[styles.container, { backgroundColor: theme.colors.background }]}
			contentContainerStyle={styles.content}
		>
			<Stack.Screen
				options={{
					title: 'Theme Customization',
					headerStyle: {
						backgroundColor: theme.colors.primary,
					},
					headerTitleStyle: {
						color: theme.colors.text,
						fontFamily: 'Inter-SemiBold',
						fontSize: 20,
					},
					headerTintColor: theme.colors.text,
					headerTitleAlign: 'center',
				}}
			/>
			<View style={styles.section}>
				<Animated.View entering={FadeIn} style={styles.themesGrid}>
					{(Object.keys(themes) as ThemeType[]).map((themeKey) => (
						<ThemePreview
							key={themeKey}
							theme={themes[themeKey]}
							isSelected={currentTheme === themeKey}
							onSelect={() => setTheme(themeKey)}
						/>
					))}
				</Animated.View>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		padding: 20,
	},
	title: {
		fontSize: 24,
		fontFamily: 'Inter-Bold',
		marginBottom: 24,
	},
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 16,
		fontFamily: 'Inter-SemiBold',
		marginBottom: 16,
	},
	themesGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 16,
	},
});
