import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	Pressable,
	Platform,
	TextInput,
	Alert,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useThemeStore } from '@/store/theme';
import { useBudgetStore } from '@/store/budgets';
import { ArrowLeft, Save, DollarSign } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import * as budgetDb from '@/services/db/budgets';
import { Budget, BudgetCategory, BudgetPeriod } from '@/types/budget';

interface BudgetFormData {
	name: string;
	totalAmount: string;
	period: BudgetPeriod;
	startDate: string;
	endDate: string;
	categories: BudgetCategory[];
}

export default function EditBudgetScreen() {
	const { theme } = useThemeStore();
	const { selectBudget } = useBudgetStore();
	const params = useLocalSearchParams();
	const [budget, setBudget] = useState<Budget | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [formData, setFormData] = useState<BudgetFormData>({
		name: '',
		totalAmount: '',
		period: 'monthly',
		startDate: '',
		endDate: '',
		categories: [],
	});

	const budgetId = typeof params.id === 'string' ? params.id : null;

	useEffect(() => {
		if (budgetId) {
			loadBudgetData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [budgetId]);

	const loadBudgetData = async () => {
		if (!budgetId) return;

		try {
			setError(null);
			const budgetData = await budgetDb.getBudgetById(budgetId);

			if (budgetData) {
				setBudget(budgetData);
				setFormData({
					name: budgetData.name,
					totalAmount: budgetData.totalAmount.toString(),
					period: budgetData.period,
					startDate: budgetData.startDate.split('T')[0], // Convert to YYYY-MM-DD format
					endDate: budgetData.endDate.split('T')[0],
					categories: budgetData.categories,
				});
				selectBudget(budgetData);
			}
		} catch (err) {
			console.error('Error loading budget:', err);
			setError(err instanceof Error ? err.message : 'Failed to load budget');
		} finally {
			setLoading(false);
		}
	};

	const validateForm = (): boolean => {
		if (!formData.name.trim()) {
			Alert.alert('Error', 'Budget name is required');
			return false;
		}

		const amount = parseFloat(formData.totalAmount);
		if (isNaN(amount) || amount <= 0) {
			Alert.alert('Error', 'Please enter a valid budget amount');
			return false;
		}

		if (!formData.startDate || !formData.endDate) {
			Alert.alert('Error', 'Please select start and end dates');
			return false;
		}

		if (new Date(formData.endDate) <= new Date(formData.startDate)) {
			Alert.alert('Error', 'End date must be after start date');
			return false;
		}

		return true;
	};

	const handleSave = async () => {
		if (!validateForm() || !budgetId) return;

		setSaving(true);
		try {
			// Check if budget name already exists (excluding current budget)
			const nameExists = await budgetDb.checkBudgetNameExists(
				formData.name,
				budgetId
			);
			if (nameExists) {
				Alert.alert('Error', 'A budget with this name already exists');
				return;
			}

			const updatedBudget: Partial<Budget> = {
				name: formData.name,
				totalAmount: parseFloat(formData.totalAmount),
				period: formData.period,
				startDate: new Date(formData.startDate).toISOString(),
				endDate: new Date(formData.endDate).toISOString(),
				categories: formData.categories,
			};

			await budgetDb.updateBudget(budgetId, updatedBudget);

			Alert.alert('Success', 'Budget updated successfully', [
				{
					text: 'OK',
					onPress: () => router.back(),
				},
			]);
		} catch (err) {
			console.error('Error updating budget:', err);
			Alert.alert(
				'Error',
				err instanceof Error ? err.message : 'Failed to update budget'
			);
		} finally {
			setSaving(false);
		}
	};

	const updateCategoryAmount = (categoryId: string, amount: string) => {
		const numAmount = parseFloat(amount) || 0;
		setFormData((prev) => ({
			...prev,
			categories: prev.categories.map((cat) =>
				cat.id === categoryId ? { ...cat, amount: numAmount } : cat
			),
		}));

		// Update total amount
		const totalCategoryAmount = formData.categories.reduce((sum, cat) => {
			return sum + (cat.id === categoryId ? numAmount : cat.amount);
		}, 0);

		setFormData((prev) => ({
			...prev,
			totalAmount: totalCategoryAmount.toString(),
		}));
	};

	if (loading) {
		return (
			<View
				style={[styles.container, { backgroundColor: theme.colors.background }]}
			>
				<StatusBar
					style={theme.name.toLowerCase() === 'light' ? 'dark' : 'light'}
				/>
				<Text style={[styles.emptyState, { color: theme.colors.text }]}>
					Loading budget...
				</Text>
			</View>
		);
	}

	if (error || !budget) {
		return (
			<View
				style={[styles.container, { backgroundColor: theme.colors.background }]}
			>
				<StatusBar
					style={theme.name.toLowerCase() === 'light' ? 'dark' : 'light'}
				/>
				<Text style={[styles.emptyState, { color: theme.colors.error }]}>
					{error || 'Budget not found'}
				</Text>
			</View>
		);
	}

	return (
		<View
			style={[styles.container, { backgroundColor: theme.colors.background }]}
		>
			<StatusBar
				style={theme.name.toLowerCase() === 'light' ? 'dark' : 'light'}
			/>

			<Stack.Screen
				options={{
					headerShown: true,
					animation: 'fade',
					header: () => (
						<View
							style={[
								styles.header,
								{ backgroundColor: theme.colors.background },
							]}
						>
							<View style={styles.headerWrapper}>
								<Pressable
									onPress={() => router.back()}
									style={styles.backButton}
								>
									<ArrowLeft size={24} color={theme.colors.text} />
								</Pressable>
								<Text style={[styles.title, { color: theme.colors.text }]}>
									Edit Budget
								</Text>
								<Pressable
									onPress={handleSave}
									disabled={saving}
									style={[
										styles.saveButton,
										{
											backgroundColor: saving
												? theme.colors.textSecondary
												: theme.colors.primary,
										},
									]}
								>
									<Save size={20} color='#FFFFFF' />
								</Pressable>
							</View>
						</View>
					),
				}}
			/>

			<ScrollView style={styles.content}>
				<View style={styles.contentWrapper}>
					{/* Basic Information */}
					<Animated.View
						entering={FadeInUp}
						style={[
							styles.section,
							{
								backgroundColor: theme.colors.surface,
								borderColor: theme.colors.border,
							},
						]}
					>
						<Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
							Basic Information
						</Text>

						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: theme.colors.text }]}>
								Budget Name
							</Text>
							<TextInput
								style={[
									styles.textInput,
									{
										backgroundColor: theme.colors.background,
										borderColor: theme.colors.border,
										color: theme.colors.text,
									},
								]}
								value={formData.name}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, name: text }))
								}
								placeholder='Enter budget name'
								placeholderTextColor={theme.colors.textSecondary}
							/>
						</View>

						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: theme.colors.text }]}>
								Total Amount
							</Text>
							<View style={styles.amountInputContainer}>
								<DollarSign size={20} color={theme.colors.textSecondary} />
								<TextInput
									style={[
										styles.amountInput,
										{
											backgroundColor: theme.colors.background,
											borderColor: theme.colors.border,
											color: theme.colors.text,
										},
									]}
									value={formData.totalAmount}
									onChangeText={(text) =>
										setFormData((prev) => ({ ...prev, totalAmount: text }))
									}
									placeholder='0.00'
									placeholderTextColor={theme.colors.textSecondary}
									keyboardType='numeric'
								/>
							</View>
						</View>

						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: theme.colors.text }]}>
								Period
							</Text>
							<View style={styles.periodContainer}>
								{(
									['daily', 'weekly', 'monthly', 'yearly'] as BudgetPeriod[]
								).map((period) => (
									<Pressable
										key={period}
										onPress={() => setFormData((prev) => ({ ...prev, period }))}
										style={[
											styles.periodButton,
											{
												backgroundColor:
													formData.period === period
														? theme.colors.primary
														: theme.colors.background,
												borderColor: theme.colors.border,
											},
										]}
									>
										<Text
											style={[
												styles.periodText,
												{
													color:
														formData.period === period
															? '#FFFFFF'
															: theme.colors.text,
												},
											]}
										>
											{period.charAt(0).toUpperCase() + period.slice(1)}
										</Text>
									</Pressable>
								))}
							</View>
						</View>
					</Animated.View>

					{/* Categories */}
					<Animated.View
						entering={FadeInUp.delay(100)}
						style={[
							styles.section,
							{
								backgroundColor: theme.colors.surface,
								borderColor: theme.colors.border,
							},
						]}
					>
						<Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
							Categories
						</Text>

						{formData.categories.map((category, index) => (
							<View
								key={category.id}
								style={[
									styles.categoryItem,
									{
										backgroundColor: theme.colors.background,
										borderColor: theme.colors.border,
									},
								]}
							>
								<View style={styles.categoryInfo}>
									<Text
										style={[styles.categoryName, { color: theme.colors.text }]}
									>
										{category.name}
									</Text>
									<Text
										style={[
											styles.categorySpent,
											{ color: theme.colors.textSecondary },
										]}
									>
										${category.spent.toLocaleString()} spent
									</Text>
								</View>
								<View style={styles.categoryAmount}>
									<DollarSign size={16} color={theme.colors.textSecondary} />
									<TextInput
										style={[
											styles.categoryAmountInput,
											{
												backgroundColor: theme.colors.background,
												borderColor: theme.colors.border,
												color: theme.colors.text,
											},
										]}
										value={category.amount.toString()}
										onChangeText={(text) =>
											updateCategoryAmount(category.id, text)
										}
										keyboardType='numeric'
										placeholder='0.00'
										placeholderTextColor={theme.colors.textSecondary}
									/>
								</View>
							</View>
						))}
					</Animated.View>
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 20,
		paddingTop: 50,
	},
	headerWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		width: '100%',
		...Platform.select({
			web: {
				maxWidth: 1200,
				marginHorizontal: 'auto',
				width: '100%',
			},
		}),
	},
	backButton: {
		padding: 8,
	},
	title: {
		fontSize: 20,
		fontFamily: 'Inter-SemiBold',
		flex: 1,
		textAlign: 'center',
	},
	saveButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	content: {
		flex: 1,
		padding: 20,
	},
	contentWrapper: {
		...Platform.select({
			web: {
				maxWidth: 1200,
				marginHorizontal: 'auto',
				width: '100%',
			},
		}),
	},
	section: {
		borderRadius: 16,
		padding: 20,
		marginBottom: 20,
		borderWidth: 1,
	},
	sectionTitle: {
		fontSize: 18,
		fontFamily: 'Inter-SemiBold',
		marginBottom: 16,
	},
	inputGroup: {
		marginBottom: 16,
	},
	label: {
		fontSize: 16,
		fontFamily: 'Inter-SemiBold',
		marginBottom: 8,
	},
	textInput: {
		borderWidth: 1,
		borderRadius: 12,
		padding: 16,
		fontSize: 16,
		fontFamily: 'Inter-Regular',
	},
	amountInputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderRadius: 12,
		paddingHorizontal: 16,
	},
	amountInput: {
		flex: 1,
		padding: 16,
		fontSize: 16,
		fontFamily: 'Inter-Regular',
		borderWidth: 0,
	},
	periodContainer: {
		flexDirection: 'row',
		gap: 8,
		flexWrap: 'wrap',
	},
	periodButton: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 8,
		borderWidth: 1,
	},
	periodText: {
		fontSize: 14,
		fontFamily: 'Inter-SemiBold',
	},
	categoryItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
		marginBottom: 12,
	},
	categoryInfo: {
		flex: 1,
	},
	categoryName: {
		fontSize: 16,
		fontFamily: 'Inter-SemiBold',
		marginBottom: 4,
	},
	categorySpent: {
		fontSize: 14,
		fontFamily: 'Inter-Regular',
	},
	categoryAmount: {
		flexDirection: 'row',
		alignItems: 'center',
		width: 120,
	},
	categoryAmountInput: {
		flex: 1,
		padding: 8,
		fontSize: 14,
		fontFamily: 'Inter-Regular',
		borderWidth: 1,
		borderRadius: 8,
		marginLeft: 4,
		textAlign: 'right',
	},
	emptyState: {
		textAlign: 'center',
		fontSize: 16,
		fontFamily: 'Inter-Regular',
		marginTop: 50,
	},
});
