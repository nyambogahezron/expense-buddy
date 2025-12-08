import {
	View,
	Text,
	StyleSheet,
	Pressable,
	ScrollView,
	Platform,
	RefreshControl,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useThemeStore } from '@/store/theme';
import { useBudgetStore } from '@/store/budgets';
import { Plus, TrendingUp, AlertTriangle } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { useBudgetOverview } from '@/hooks/useBudgets';
import { formatCurrency, getBudgetStatus } from '@/utils/budgetHelpers';
import React, { useMemo, useCallback, useEffect, useState } from 'react';
import * as budgetDb from '@/services/db/budgets';
import { Budget, BudgetCategory } from '@/types/budget';

export default function BudgetsScreen() {
	const { theme } = useThemeStore();
	const { selectBudget } = useBudgetStore();
	const [allBudgets, setAllBudgets] = useState<Budget[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const overview = useBudgetOverview(allBudgets);

	// Load all budgets on component mount
	useEffect(() => {
		loadBudgets();
	}, []);

	const loadBudgets = async () => {
		try {
			setError(null);
			const budgets = await budgetDb.getAllBudgets();
			setAllBudgets(budgets);
		} catch (err) {
			console.error('Error loading budgets:', err);
			setError(err instanceof Error ? err.message : 'Failed to load budgets');
		} finally {
			setIsLoading(false);
		}
	};

	const refresh = async () => {
		if (refreshing) return; // Prevent multiple refreshes

		setRefreshing(true);
		try {
			await loadBudgets();
		} catch (err) {
			console.error('Error during refresh:', err);
		} finally {
			setRefreshing(false);
		}
	};

	const handleBudgetPress = useCallback(
		(budget: Budget) => {
			selectBudget(budget);
			router.push(`/budgets/${budget.id}`);
		},
		[selectBudget]
	);

	const handleAddBudget = useCallback(() => {
		router.push('/budgets/new');
	}, []);

	const budgetCards = useMemo(() => {
		if (!allBudgets || allBudgets.length === 0) {
			return [];
		}

		return allBudgets.map((budget: Budget, index: number) => {
			const totalSpent =
				budget.categories?.reduce(
					(sum: number, cat: BudgetCategory) => sum + (cat.spent || 0),
					0
				) || 0;
			const progress =
				budget.totalAmount > 0 ? (totalSpent / budget.totalAmount) * 100 : 0;
			const status = getBudgetStatus(budget);

			return (
				<Animated.View
					key={budget.id}
					entering={FadeInUp.delay(index * 100)}
					style={[
						styles.budgetCard,
						{
							backgroundColor: theme.colors.surface,
							borderColor: theme.colors.border,
						},
					]}
				>
					<Pressable
						onPress={() => handleBudgetPress(budget)}
						style={styles.budgetContent}
					>
						<View style={styles.budgetHeader}>
							<View style={styles.budgetTitleRow}>
								<Text style={[styles.budgetName, { color: theme.colors.text }]}>
									{budget.name}
								</Text>
								{status.status !== 'on-track' &&
									(status.status === 'over-budget' ? (
										<AlertTriangle size={20} color={theme.colors.error} />
									) : (
										<TrendingUp size={20} color='#F59E0B' />
									))}
							</View>
							<Text
								style={[styles.budgetAmount, { color: theme.colors.primary }]}
							>
								${budget.totalAmount.toLocaleString()}
							</Text>
						</View>

						<View style={styles.progressContainer}>
							<View
								style={[
									styles.progressBar,
									{ backgroundColor: theme.colors.border },
								]}
							>
								<View
									style={[
										styles.progressFill,
										{
											width: `${Math.min(progress, 100)}%`,
											backgroundColor:
												progress > 90
													? theme.colors.error
													: theme.colors.primary,
										},
									]}
								/>
							</View>
							<Text
								style={[
									styles.progressText,
									{ color: theme.colors.textSecondary },
								]}
							>
								${totalSpent.toLocaleString()} spent
							</Text>
						</View>

						<View style={styles.categoriesGrid}>
							{budget.categories?.map((category: BudgetCategory) => (
								<View
									key={category.id}
									style={[
										styles.categoryChip,
										{ backgroundColor: category.color + '20' },
									]}
								>
									<Text
										style={[styles.categoryName, { color: category.color }]}
									>
										{category.name}
									</Text>
									<Text
										style={[styles.categoryAmount, { color: category.color }]}
									>
										${(category.amount || 0).toLocaleString()}
									</Text>
								</View>
							)) || []}
						</View>
					</Pressable>
				</Animated.View>
			);
		});
	}, [allBudgets, theme, handleBudgetPress]);

	if (isLoading && allBudgets.length === 0) {
		return (
			<View
				style={[styles.container, { backgroundColor: theme.colors.background }]}
			>
				<StatusBar
					style={theme.name.toLocaleLowerCase() === 'light' ? 'dark' : 'light'}
				/>
				<View
					style={[
						styles.container,
						{ justifyContent: 'center', alignItems: 'center' },
					]}
				>
					<Text style={{ color: theme.colors.text }}>Loading budgets...</Text>
				</View>
			</View>
		);
	}

	if (error) {
		return (
			<View
				style={[styles.container, { backgroundColor: theme.colors.background }]}
			>
				<StatusBar
					style={theme.name.toLocaleLowerCase() === 'light' ? 'dark' : 'light'}
				/>
				<View
					style={[
						styles.container,
						{ justifyContent: 'center', alignItems: 'center' },
					]}
				>
					<Text
						style={{
							color: theme.colors.error,
							textAlign: 'center',
							paddingHorizontal: 20,
						}}
					>
						Error loading budgets: {error}
					</Text>
					<Pressable
						onPress={refresh}
						style={[
							styles.addButton,
							{
								backgroundColor: theme.colors.primary,
								marginTop: 20,
								paddingHorizontal: 20,
								paddingVertical: 10,
							},
						]}
					>
						<Text style={{ color: theme.colors.background }}>Retry</Text>
					</Pressable>
				</View>
			</View>
		);
	}

	return (
		<View
			style={[styles.container, { backgroundColor: theme.colors.background }]}
		>
			<StatusBar
				style={theme.name.toLocaleLowerCase() === 'light' ? 'dark' : 'light'}
			/>

			<Stack.Screen
				options={{
					headerShown: Platform.OS === 'web' ? false : true,
					header: () => {
						return (
							<View
								style={[
									styles.header,
									{ backgroundColor: theme.colors.primary },
								]}
							>
								<Text style={[styles.title, { color: theme.colors.border }]}>
									Budgets
								</Text>
								<Pressable
									onPress={handleAddBudget}
									style={[
										styles.addButton,
										{ backgroundColor: theme.colors.background },
									]}
								>
									<Plus size={24} color={theme.colors.primary} />
								</Pressable>
							</View>
						);
					},
				}}
			/>

			<ScrollView
				style={styles.content}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={refresh}
						tintColor={theme.colors.primary}
					/>
				}
			>
				{/* Empty state */}
				{!isLoading && (!allBudgets || allBudgets.length === 0) && (
					<View
						style={{
							flex: 1,
							justifyContent: 'center',
							alignItems: 'center',
							paddingVertical: 60,
						}}
					>
						<Text
							style={{
								color: theme.colors.textSecondary,
								fontSize: 18,
								textAlign: 'center',
							}}
						>
							No budgets found
						</Text>
						<Text
							style={{
								color: theme.colors.textSecondary,
								fontSize: 14,
								textAlign: 'center',
								marginTop: 8,
							}}
						>
							Create your first budget to get started
						</Text>
						<Pressable
							onPress={handleAddBudget}
							style={[
								styles.addButton,
								{
									backgroundColor: theme.colors.primary,
									marginTop: 20,
									paddingHorizontal: 20,
									paddingVertical: 10,
								},
							]}
						>
							<Text style={{ color: theme.colors.background }}>
								Create Budget
							</Text>
						</Pressable>
					</View>
				)}

				{/* Overview Stats */}
				{allBudgets.length > 0 && (
					<Animated.View
						entering={FadeInUp}
						style={[
							styles.overviewCard,
							{
								backgroundColor: theme.colors.surface,
								borderColor: theme.colors.border,
							},
						]}
					>
						<Text style={[styles.overviewTitle, { color: theme.colors.text }]}>
							Budget Overview
						</Text>
						<View style={styles.overviewStats}>
							<View style={styles.overviewStat}>
								<Text
									style={[
										styles.overviewValue,
										{ color: theme.colors.primary },
									]}
								>
									{formatCurrency(overview.totalBudgeted)}
								</Text>
								<Text
									style={[
										styles.overviewLabel,
										{ color: theme.colors.textSecondary },
									]}
								>
									Budgeted
								</Text>
							</View>
							<View style={styles.overviewStat}>
								<Text
									style={[styles.overviewValue, { color: theme.colors.text }]}
								>
									{formatCurrency(overview.totalSpent)}
								</Text>
								<Text
									style={[
										styles.overviewLabel,
										{ color: theme.colors.textSecondary },
									]}
								>
									Spent
								</Text>
							</View>
							<View style={styles.overviewStat}>
								<Text
									style={[
										styles.overviewValue,
										{
											color:
												overview.totalRemaining >= 0
													? theme.colors.primary
													: theme.colors.error,
										},
									]}
								>
									{formatCurrency(overview.totalRemaining)}
								</Text>
								<Text
									style={[
										styles.overviewLabel,
										{ color: theme.colors.textSecondary },
									]}
								>
									Remaining
								</Text>
							</View>
						</View>
					</Animated.View>
				)}

				{budgetCards}
			</ScrollView>
			{/* add butget fab  */}
			<Pressable
				onPress={handleAddBudget}
				style={[
					styles.addButton,
					{
						position: 'absolute',
						bottom: 20,
						right: 20,
						backgroundColor: theme.colors.primary,
					},
				]}
			>
				<Plus size={24} color={theme.colors.background} />
			</Pressable>
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
		paddingTop: 45,
	},
	title: {
		fontSize: 28,
		fontFamily: 'Inter-Bold',
	},
	addButton: {
		width: 40,
		height: 40,
		borderRadius: 24,
		justifyContent: 'center',
		alignItems: 'center',
	},
	content: {
		flex: 1,
		padding: 5,
		...(Platform.OS === 'web' && {
			maxWidth: 1200,
			marginHorizontal: 'auto',
			width: '100%',
		}),
	},
	budgetCard: {
		borderRadius: 8,
		padding: 20,
		marginBottom: 16,
		borderWidth: 1,
	},
	budgetContent: {
		gap: 16,
	},
	budgetHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	budgetName: {
		fontSize: 20,
		fontFamily: 'Inter-SemiBold',
	},
	budgetAmount: {
		fontSize: 20,
		fontFamily: 'Inter-Bold',
	},
	progressContainer: {
		gap: 8,
	},
	progressBar: {
		height: 8,
		borderRadius: 4,
		overflow: 'hidden',
	},
	progressFill: {
		height: '100%',
		borderRadius: 4,
	},
	progressText: {
		fontSize: 14,
		fontFamily: 'Inter-Regular',
	},
	categoriesGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	categoryChip: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 8,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	categoryName: {
		fontSize: 14,
		fontFamily: 'Inter-SemiBold',
	},
	categoryAmount: {
		fontSize: 14,
		fontFamily: 'Inter-Regular',
	},
	overviewCard: {
		borderRadius: 12,
		padding: 20,
		marginBottom: 20,
		borderWidth: 1,
	},
	overviewTitle: {
		fontSize: 18,
		fontFamily: 'Inter-SemiBold',
		marginBottom: 16,
	},
	overviewStats: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	overviewStat: {
		alignItems: 'center',
	},
	overviewValue: {
		fontSize: 18,
		fontFamily: 'Inter-Bold',
		marginBottom: 4,
	},
	overviewLabel: {
		fontSize: 14,
		fontFamily: 'Inter-Regular',
	},
	budgetTitleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		flex: 1,
	},
});
