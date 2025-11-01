import {
	View,
	Text,
	StyleSheet,
	Pressable,
	ScrollView,
	Switch,
} from 'react-native';

import { Stack, router } from 'expo-router';
import { useThemeStore } from '@/store/theme';
import { useState } from 'react';
import {
	ChevronRight,
	Paintbrush,
	DollarSign,
	BarChart3,
	UserCircle,
	KeySquare,
	ShieldCheck,
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

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
];

export default function SettingsScreen() {
	const { theme } = useThemeStore();
	const [selectedCurrency, setSelectedCurrency] = useState('USD');
	const [reportPreferences, setReportPreferences] = useState({
		includeCategories: true,
		monthlyComparisons: true,
		showTrends: true,
		includeBudgets: true,
	});

	// Find the selected currency details
	const currentCurrency =
		currencies.find((c) => c.code === selectedCurrency) || currencies[0];

	const toggleSwitch = (key: keyof typeof reportPreferences) => {
		setReportPreferences((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

	return (
		<View
			style={[styles.container, { backgroundColor: theme.colors.background }]}
		>
			<Stack.Screen
				options={{
					title: 'Settings',
					headerStyle: { backgroundColor: theme.colors.primary },
					headerTitleStyle: {
						color: theme.colors.text,
						fontFamily: 'Poppins-SemiBold',
						fontSize: 20,
					},
					headerTintColor: theme.colors.text,
					headerTitleAlign: 'center',
				}}
			/>

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.contentContainer}
				showsVerticalScrollIndicator={false}
			>
				{/* Account & Security Section */}
				<Animated.View
					entering={FadeInUp.delay(50).duration(400)}
					style={styles.section}
				>
					<Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
						Account & Security
					</Text>

					{/* Edit Profile */}
					<Pressable
						style={({ pressed }) => [
							styles.settingsItem,
							{
								backgroundColor: theme.colors.surface,
								opacity: pressed ? 0.9 : 1,
							},
						]}
						onPress={() => router.push('/profile')}
					>
						<View style={styles.settingsItemContent}>
							<View
								style={[
									styles.iconContainer,
									{ backgroundColor: theme.colors.secondary + '20' },
								]}
							>
								<UserCircle size={20} color={theme.colors.secondary} />
							</View>
							<Text
								style={[styles.settingsItemTitle, { color: theme.colors.text }]}
							>
								Edit Profile
							</Text>
						</View>
						<ChevronRight size={20} color={theme.colors.textSecondary} />
					</Pressable>

					{/* Enable Authentication */}
					<Pressable
						style={({ pressed }) => [
							styles.settingsItem,
							{
								backgroundColor: theme.colors.surface,
								opacity: pressed ? 0.9 : 1,
							},
						]}
						onPress={() => router.push('/settings/authentication')}
					>
						<View style={styles.settingsItemContent}>
							<View
								style={[
									styles.iconContainer,
									{ backgroundColor: theme.colors.accent + '20' },
								]}
							>
								<ShieldCheck size={20} color={theme.colors.accent} />
							</View>
							<Text
								style={[styles.settingsItemTitle, { color: theme.colors.text }]}
							>
								Authentication
							</Text>
						</View>
						<ChevronRight size={20} color={theme.colors.textSecondary} />
					</Pressable>

					{/* Change Password */}
					<Pressable
						style={({ pressed }) => [
							styles.settingsItem,
							{
								backgroundColor: theme.colors.surface,
								opacity: pressed ? 0.9 : 1,
							},
						]}
						onPress={() => router.push('/settings/change-password')}
					>
						<View style={styles.settingsItemContent}>
							<View
								style={[
									styles.iconContainer,
									{ backgroundColor: theme.colors.primary + '20' },
								]}
							>
								<KeySquare size={20} color={theme.colors.primary} />
							</View>
							<Text
								style={[styles.settingsItemTitle, { color: theme.colors.text }]}
							>
								Change Password
							</Text>
						</View>
						<ChevronRight size={20} color={theme.colors.textSecondary} />
					</Pressable>
				</Animated.View>

				{/* Theme Settings Section */}
				<Animated.View
					entering={FadeInUp.delay(150).duration(400)}
					style={styles.section}
				>
					<Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
						Appearance
					</Text>
					<Pressable
						style={({ pressed }) => [
							styles.settingsItem,
							{
								backgroundColor: theme.colors.surface,
								opacity: pressed ? 0.9 : 1,
							},
						]}
						onPress={() => router.push('/settings/theme')}
					>
						<View style={styles.settingsItemContent}>
							<View
								style={[
									styles.iconContainer,
									{ backgroundColor: theme.colors.primary + '20' },
								]}
							>
								<Paintbrush size={20} color={theme.colors.primary} />
							</View>
							<Text
								style={[styles.settingsItemTitle, { color: theme.colors.text }]}
							>
								Theme
							</Text>
						</View>
						<ChevronRight size={20} color={theme.colors.textSecondary} />
					</Pressable>
				</Animated.View>

				{/* Currency Settings Section */}
				<Animated.View
					entering={FadeInUp.delay(250).duration(400)}
					style={styles.section}
				>
					<Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
						Currency
					</Text>
					<View
						style={[
							styles.settingsItem,
							{ backgroundColor: theme.colors.surface },
						]}
					>
						<View style={styles.settingsItemContent}>
							<View
								style={[
									styles.iconContainer,
									{ backgroundColor: theme.colors.accent + '20' },
								]}
							>
								<DollarSign size={20} color={theme.colors.accent} />
							</View>
							<View>
								<Text
									style={[
										styles.settingsItemTitle,
										{ color: theme.colors.text },
									]}
								>
									Currency Format
								</Text>
								<Text
									style={[
										styles.settingsItemSubtitle,
										{ color: theme.colors.textSecondary },
									]}
								>
									{currentCurrency.symbol} - {currentCurrency.name}
								</Text>
							</View>
						</View>
					</View>

					<View
						style={[
							styles.currencyGrid,
							{ backgroundColor: theme.colors.surface },
						]}
					>
						{currencies.map((currency) => (
							<Pressable
								key={currency.code}
								style={[
									styles.currencyOption,
									selectedCurrency === currency.code && [
										styles.selectedCurrency,
										{ borderColor: theme.colors.primary },
									],
								]}
								onPress={() => setSelectedCurrency(currency.code)}
							>
								<Text
									style={[
										styles.currencySymbol,
										{
											color:
												selectedCurrency === currency.code
													? theme.colors.primary
													: theme.colors.text,
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
													? theme.colors.primary
													: theme.colors.textSecondary,
										},
									]}
								>
									{currency.code}
								</Text>
							</Pressable>
						))}
					</View>
				</Animated.View>

				{/* Report Preferences Section */}
				<Animated.View
					entering={FadeInUp.delay(350).duration(400)}
					style={styles.section}
				>
					<Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
						Report Preferences
					</Text>
					<View
						style={[
							styles.settingsBox,
							{ backgroundColor: theme.colors.surface },
						]}
					>
						<View style={styles.settingsBoxHeader}>
							<View
								style={[
									styles.iconContainer,
									{ backgroundColor: theme.colors.secondary + '20' },
								]}
							>
								<BarChart3 size={20} color={theme.colors.secondary} />
							</View>
							<Text
								style={[styles.settingsBoxTitle, { color: theme.colors.text }]}
							>
								Customize Reports
							</Text>
						</View>

						{/* Report preference switches */}
						<View style={styles.preferencesContainer}>
							<View style={styles.preferenceItem}>
								<Text
									style={[styles.preferenceText, { color: theme.colors.text }]}
								>
									Include Categories
								</Text>
								<Switch
									trackColor={{
										false: theme.colors.border,
										true: theme.colors.primary,
									}}
									thumbColor='#FFFFFF'
									ios_backgroundColor={theme.colors.border}
									onValueChange={() => toggleSwitch('includeCategories')}
									value={reportPreferences.includeCategories}
								/>
							</View>

							<View style={styles.preferenceItem}>
								<Text
									style={[styles.preferenceText, { color: theme.colors.text }]}
								>
									Monthly Comparisons
								</Text>
								<Switch
									trackColor={{
										false: theme.colors.border,
										true: theme.colors.primary,
									}}
									thumbColor='#FFFFFF'
									ios_backgroundColor={theme.colors.border}
									onValueChange={() => toggleSwitch('monthlyComparisons')}
									value={reportPreferences.monthlyComparisons}
								/>
							</View>

							<View style={styles.preferenceItem}>
								<Text
									style={[styles.preferenceText, { color: theme.colors.text }]}
								>
									Show Trends
								</Text>
								<Switch
									trackColor={{
										false: theme.colors.border,
										true: theme.colors.primary,
									}}
									thumbColor='#FFFFFF'
									ios_backgroundColor={theme.colors.border}
									onValueChange={() => toggleSwitch('showTrends')}
									value={reportPreferences.showTrends}
								/>
							</View>

							<View style={styles.preferenceItem}>
								<Text
									style={[styles.preferenceText, { color: theme.colors.text }]}
								>
									Include Budgets
								</Text>
								<Switch
									trackColor={{
										false: theme.colors.border,
										true: theme.colors.primary,
									}}
									thumbColor='#FFFFFF'
									ios_backgroundColor={theme.colors.border}
									onValueChange={() => toggleSwitch('includeBudgets')}
									value={reportPreferences.includeBudgets}
								/>
							</View>
						</View>
					</View>
				</Animated.View>

				{/* App info or version */}
				<Text
					style={[styles.versionText, { color: theme.colors.textSecondary }]}
				>
					Expense Buddy v1.0.0
				</Text>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	contentContainer: {
		paddingHorizontal: 16,
		paddingBottom: 24,
		paddingTop: 8,
	},
	section: {
		marginVertical: 12,
	},
	sectionTitle: {
		fontSize: 16,
		fontFamily: 'Poppins-Medium',
		marginBottom: 8,
		marginLeft: 4,
	},
	settingsItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 16,
		borderRadius: 12,
		marginBottom: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	settingsItemContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	iconContainer: {
		width: 40,
		height: 40,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	settingsItemTitle: {
		fontSize: 16,
		fontFamily: 'Poppins-Medium',
	},
	settingsItemSubtitle: {
		fontSize: 13,
		fontFamily: 'Poppins-Regular',
		marginTop: 2,
	},
	currencyGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		borderRadius: 12,
		padding: 16,
		marginTop: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	currencyOption: {
		width: '23%',
		aspectRatio: 1,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 8,
		borderWidth: 1,
		borderColor: 'transparent',
		marginBottom: 8,
	},
	selectedCurrency: {
		borderWidth: 2,
		backgroundColor: 'rgba(99, 102, 241, 0.1)',
	},
	currencySymbol: {
		fontSize: 20,
		fontFamily: 'Poppins-Medium',
	},
	currencyCode: {
		fontSize: 12,
		fontFamily: 'Poppins-Regular',
		marginTop: 2,
	},
	settingsBox: {
		borderRadius: 12,
		overflow: 'hidden',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	settingsBoxHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: '#E5E7EB',
	},
	settingsBoxTitle: {
		fontSize: 16,
		fontFamily: 'Poppins-Medium',
	},
	preferencesContainer: {
		padding: 16,
	},
	preferenceItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 8,
	},
	preferenceText: {
		fontSize: 15,
		fontFamily: 'Poppins-Regular',
	},
	versionText: {
		textAlign: 'center',
		fontSize: 12,
		fontFamily: 'Poppins-Regular',
		marginTop: 24,
	},
});
