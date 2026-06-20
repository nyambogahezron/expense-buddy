import {
	View,
	Text,
	StyleSheet,
	Pressable,
	ScrollView,
	Switch,
} from 'react-native'

import { Stack, router } from 'expo-router';
import { useThemeStore } from '@/store/theme';
import { useState } from 'react';
import {
	ChevronRight,
	DollarSign,
	BarChart3,
	UserCircle,
	ArrowLeft,
} from 'lucide-react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { design } from '@/constants/design'
import { AnimatedCard } from '@/components/ui/animated-card'

// List of available currencies
const currencies = [
	{ code: 'USD', symbol: '$', name: 'US Dollar' },
	{ code: 'EUR', symbol: '€', name: 'Euro' },
	{ code: 'GBP', symbol: '£', name: 'British Pound' },
	{ code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
	{ code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
	{ code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
	{ code: 'INR', symbol: '₹', name: 'Indian Rupee' },
	{ code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
]

export default function SettingsScreen() {
	const [selectedCurrency, setSelectedCurrency] = useState('USD')
	const [reportPreferences, setReportPreferences] = useState({
		includeCategories: true,
		monthlyComparisons: true,
		showTrends: true,
		includeBudgets: true,
	})

	const currentCurrency =
		currencies.find((c) => c.code === selectedCurrency) || currencies[0]

	const toggleSwitch = (key: keyof typeof reportPreferences) => {
		setReportPreferences((prev) => ({
			...prev,
			[key]: !prev[key],
		}))
	}

	return (
		<View style={styles.container}>
			<Stack.Screen
				options={{
					title: 'App Settings',
					headerStyle: { backgroundColor: design.colors.base },
					headerTintColor: design.colors.text,
					headerShadowVisible: false,
					headerLeft: () => (
						<Pressable onPress={() => router.back()} style={styles.headerBtn}>
							<ArrowLeft size={24} color={design.colors.text} />
						</Pressable>
					),
				}}
			/>

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.contentContainer}
				showsVerticalScrollIndicator={false}
			>
				<Animated.View
					entering={FadeInDown.delay(50).duration(400)}
					style={styles.section}
				>
					<Text style={styles.sectionTitle}>Account</Text>
					<AnimatedCard
						style={styles.settingsItem}
						onPress={() => router.push('/(tabs)/profile')}
					>
						<View style={styles.settingsItemContent}>
							<View
								style={[
									styles.iconContainer,
									{ backgroundColor: design.colors.primary + '20' },
								]}
							>
								<UserCircle size={20} color={design.colors.primary} />
							</View>
							<Text style={styles.settingsItemTitle}>Edit Profile (Tab)</Text>
						</View>
						<ChevronRight size={20} color={design.colors.textSecondary} />
					</AnimatedCard>
				</Animated.View>

				<Animated.View
					entering={FadeInDown.delay(150).duration(400)}
					style={styles.section}
				>
					<Text style={styles.sectionTitle}>Currency</Text>
					<View style={styles.currencyHeader}>
						<View style={styles.settingsItemContent}>
							<View
								style={[
									styles.iconContainer,
									{ backgroundColor: design.colors.success + '20' },
								]}
							>
								<DollarSign size={20} color={design.colors.success} />
							</View>
							<View>
								<Text style={styles.settingsItemTitle}>Currency Format</Text>
								<Text style={styles.settingsItemSubtitle}>
									{currentCurrency.symbol} - {currentCurrency.name}
								</Text>
							</View>
						</View>
					</View>

					<View style={styles.currencyGrid}>
						{currencies.map((currency) => (
							<Pressable
								key={currency.code}
								style={[
									styles.currencyOption,
									selectedCurrency === currency.code && styles.selectedCurrency,
								]}
								onPress={() => setSelectedCurrency(currency.code)}
							>
								<Text
									style={[
										styles.currencySymbol,
										{
											color:
												selectedCurrency === currency.code
													? design.colors.primary
													: design.colors.text,
										},
									]}
								>
									{currency.symbol}
								</Text>
								<Text
									style={[
										styles.currencyCode,
										{
											color:
												selectedCurrency === currency.code
													? design.colors.primary
													: design.colors.textSecondary,
										},
									]}
								>
									{currency.code}
								</Text>
							</Pressable>
						))}
					</View>
				</Animated.View>

				<Animated.View
					entering={FadeInDown.delay(250).duration(400)}
					style={styles.section}
				>
					<Text style={styles.sectionTitle}>Report Preferences</Text>
					<AnimatedCard style={styles.settingsBox} withHaptic={false}>
						<View style={styles.settingsBoxHeader}>
							<View
								style={[
									styles.iconContainer,
									{ backgroundColor: design.colors.warning + '20' },
								]}
							>
								<BarChart3 size={20} color={design.colors.warning} />
							</View>
							<Text style={styles.settingsItemTitle}>Customize Reports</Text>
						</View>

						<View style={styles.preferencesContainer}>
							<View style={styles.preferenceItem}>
								<Text style={styles.preferenceText}>Include Categories</Text>
								<Switch
									trackColor={{
										false: design.colors.borderDark,
										true: design.colors.primary,
									}}
									thumbColor='#FFFFFF'
									ios_backgroundColor={design.colors.borderDark}
									onValueChange={() => toggleSwitch('includeCategories')}
									value={reportPreferences.includeCategories}
								/>
							</View>
							<View style={styles.separator} />

							<View style={styles.preferenceItem}>
								<Text style={styles.preferenceText}>Monthly Comparisons</Text>
								<Switch
									trackColor={{
										false: design.colors.borderDark,
										true: design.colors.primary,
									}}
									thumbColor='#FFFFFF'
									ios_backgroundColor={design.colors.borderDark}
									onValueChange={() => toggleSwitch('monthlyComparisons')}
									value={reportPreferences.monthlyComparisons}
								/>
							</View>
							<View style={styles.separator} />

							<View style={styles.preferenceItem}>
								<Text style={styles.preferenceText}>Show Trends</Text>
								<Switch
									trackColor={{
										false: design.colors.borderDark,
										true: design.colors.primary,
									}}
									thumbColor='#FFFFFF'
									ios_backgroundColor={design.colors.borderDark}
									onValueChange={() => toggleSwitch('showTrends')}
									value={reportPreferences.showTrends}
								/>
							</View>
							<View style={styles.separator} />

							<View style={styles.preferenceItem}>
								<Text style={styles.preferenceText}>Include Budgets</Text>
								<Switch
									trackColor={{
										false: design.colors.borderDark,
										true: design.colors.primary,
									}}
									thumbColor='#FFFFFF'
									ios_backgroundColor={design.colors.borderDark}
									onValueChange={() => toggleSwitch('includeBudgets')}
									value={reportPreferences.includeBudgets}
								/>
							</View>
						</View>
					</AnimatedCard>
				</Animated.View>

				<Text style={styles.versionText}>Expense Buddy v1.0.0</Text>
			</ScrollView>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: design.colors.base,
	},
	headerBtn: {
		paddingRight: 16,
	},
	scrollView: {
		flex: 1,
	},
	contentContainer: {
		padding: design.spacing.lg,
		paddingBottom: 40,
	},
	section: {
		marginBottom: design.spacing.xl,
	},
	sectionTitle: {
		...design.typography.h3,
		color: design.colors.text,
		marginBottom: design.spacing.md,
		marginLeft: 4,
	},
	settingsItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: design.spacing.md,
		backgroundColor: design.colors.surface,
	},
	settingsItemContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: design.spacing.md,
	},
	iconContainer: {
		width: 40,
		height: 40,
		borderRadius: design.borderRadius.lg,
		alignItems: 'center',
		justifyContent: 'center',
	},
	settingsItemTitle: {
		...design.typography.subtitle,
		color: design.colors.text,
	},
	settingsItemSubtitle: {
		...design.typography.caption,
		color: design.colors.textSecondary,
		marginTop: 2,
	},
	currencyHeader: {
		backgroundColor: design.colors.surface,
		padding: design.spacing.md,
		borderRadius: design.borderRadius.xl,
		marginBottom: design.spacing.sm,
		borderWidth: 1,
		borderColor: design.colors.border,
	},
	currencyGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		gap: 8,
	},
	currencyOption: {
		width: '23%',
		aspectRatio: 1,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: design.borderRadius.lg,
		backgroundColor: design.colors.surface,
		borderWidth: 1,
		borderColor: design.colors.border,
	},
	selectedCurrency: {
		borderColor: design.colors.primary,
		backgroundColor: design.colors.primary + '15',
	},
	currencySymbol: {
		...design.typography.h3,
	},
	currencyCode: {
		...design.typography.caption,
		marginTop: 2,
	},
	settingsBox: {
		padding: 0,
		overflow: 'hidden',
		backgroundColor: design.colors.surface,
	},
	settingsBoxHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: design.spacing.md,
		padding: design.spacing.md,
		borderBottomWidth: 1,
		borderBottomColor: design.colors.borderDark,
	},
	preferencesContainer: {
		paddingHorizontal: design.spacing.lg,
	},
	preferenceItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: design.spacing.md,
	},
	preferenceText: {
		...design.typography.body,
		color: design.colors.text,
	},
	separator: {
		height: 1,
		backgroundColor: design.colors.borderDark,
	},
	versionText: {
		textAlign: 'center',
		...design.typography.caption,
		color: design.colors.textMuted,
		marginTop: design.spacing.xl,
	},
})
