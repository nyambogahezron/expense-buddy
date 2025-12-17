import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	Pressable,
	Platform,
	RefreshControl,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useThemeStore } from '@/store/theme';
import { useBudgetStore } from '@/store/budgets';
import {
	ArrowLeft,
	CreditCard as Edit2,
	Trash,
	TrendingUp,
	Calendar,
	AlertTriangle,
} from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { formatCurrency, getBudgetStatus } from '@/utils/budgetHelpers';
import React, { useEffect, useState, useCallback } from 'react';
import * as budgetDb from '@/services/db/budgets';
import { Budget } from '@/types/budget';

export default function BudgetDetailScreen() {
	const { theme } = useThemeStore();
	const { selectBudget } = useBudgetStore();
	const params = useLocalSearchParams();
	const [budget, setBudget] = useState<Budget | null>(null);
	const [budgetStats, setBudgetStats] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const budgetId = typeof params.id === 'string' ? params.id : null;

	const loadBudgetData = useCallback(async () => {
		if (!budgetId) {
			setLoading(false);
			return;
		}

		try {
			setError(null);
			const budgetData = await budgetDb.getBudgetById(budgetId);

			if (!budgetData) {
				setError('Budget not found');
				setBudget(null);
				setBudgetStats(null);
				return;
			}

			setBudget(budgetData);
			selectBudget(budgetData);

			// Load stats separately to avoid blocking UI
			try {
				const statsData = await budgetDb.getBudgetStats(budgetId);
				setBudgetStats(statsData);
			} catch (statsError) {
				console.warn('Error loading budget stats:', statsError);
				// Don't fail the whole operation if stats fail
				setBudgetStats(null);
			}
		} catch (err) {
			console.error('Error loading budget:', err);
			setError(err instanceof Error ? err.message : 'Failed to load budget');
			setBudget(null);
			setBudgetStats(null);
		} finally {
			setLoading(false);
		}
	}, [budgetId, selectBudget]);

	useEffect(() => {
		let mounted = true;
		let timeoutId: ReturnType<typeof setTimeout>;

		const initLoad = async () => {
			if (budgetId && mounted) {
				// Set a timeout to prevent infinite loading
				timeoutId = setTimeout(() => {
					if (mounted) {
						console.warn('Budget loading timeout');
						setLoading(false);
						setError('Loading timeout - please try again');
					}
				}, 10000); // 10 second timeout

				await loadBudgetData();
				if (timeoutId) clearTimeout(timeoutId);
			}
		};

		initLoad();

		return () => {
			mounted = false;
			if (timeoutId) clearTimeout(timeoutId);
		};
	}, [budgetId, loadBudgetData]);

	const refresh = async () => {
		if (refreshing) return; // Prevent multiple refreshes

		setRefreshing(true);
		try {
			await loadBudgetData();
		} catch (err) {
			console.error('Error during refresh:', err);
		} finally {
			setRefreshing(false);
		}
	};

	const handleDelete = async () => {
		if (!budget) return;

		try {
			await budgetDb.deleteBudget(budget.id);
			router.back();
		} catch (err) {
			console.error('Error deleting budget:', err);
			setError(err instanceof Error ? err.message : 'Failed to delete budget');
		}
	};

	const handleEdit = () => {
		if (budget) {
			selectBudget(budget);
			router.push(`/budgets/edit/${budget.id}`);
		}
	};

	if (loading) {
		return (
			<View
				style={[styles.container, { backgroundColor: theme.colors.background }]}
			>
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
				<Text style={[styles.emptyState, { color: theme.colors.error }]}>
					{error || 'Budget not found'}
				</Text>
			</View>
		);
	}

	const totalSpent = budget.categories.reduce(
		(sum: number, cat: any) => sum + cat.spent,
		0
	);
	const remaining = budget.totalAmount - totalSpent;
	const status = getBudgetStatus(budget);

	return (
		<View
			style={[styles.container, { backgroundColor: theme.colors.background }]}
		>
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
									{budget.name}
								</Text>
								<View style={styles.actions}>
									<Pressable
										onPress={handleEdit}
										style={[
											styles.actionButton,
											{ backgroundColor: theme.colors.primary },
										]}
									>
										<Edit2 size={20} color='#FFFFFF' />
									</Pressable>
									<Pressable
										onPress={handleDelete}
										style={[
											styles.actionButton,
											{ backgroundColor: theme.colors.error },
										]}
									>
										<Trash size={20} color='#FFFFFF' />
									</Pressable>
								</View>
							</View>
						</View>
					),
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
				<View style={styles.contentWrapper}>
					{/* Status Banner */}
					<Animated.View
						entering={FadeIn.delay(100)}
						style={[
							styles.statusBanner,
							{
								backgroundColor:
									status.status === 'over-budget'
										? theme.colors.error + '20'
										: status.status === 'warning'
										? '#F59E0B20'
										: theme.colors.primary + '20',
								borderColor:
									status.status === 'over-budget'
										? theme.colors.error
										: status.status === 'warning'
										? '#F59E0B'
										: theme.colors.primary,
							},
						]}
					>
						<View style={styles.statusContent}>
							{status.status === 'over-budget' ? (
								<AlertTriangle size={20} color={theme.colors.error} />
							) : status.status === 'warning' ? (
								<TrendingUp size={20} color='#F59E0B' />
							) : (
								<Calendar size={20} color={theme.colors.primary} />
							)}
							<Text
								style={[
									styles.statusText,
									{
										color:
											status.status === 'over-budget'
												? theme.colors.error
												: status.status === 'warning'
												? '#F59E0B'
												: theme.colors.primary,
									},
								]}
							>
								{status.message}
							</Text>
						</View>
						{budgetStats && (
							<Text
								style={[
									styles.statusSubtext,
									{ color: theme.colors.textSecondary },
								]}
							>
								Budget period: {budget.period}
							</Text>
						)}
					</Animated.View>

					<Animated.View
						entering={FadeIn}
						style={[
							styles.summaryCard,
							{
								backgroundColor: theme.colors.surface,
								borderColor: theme.colors.border,
							},
						]}
					>
						<View style={styles.summaryRow}>
							<Text
								style={[
									styles.summaryLabel,
									{ color: theme.colors.textSecondary },
								]}
							>
								Total Budget
							</Text>
							<Text style={[styles.summaryValue, { color: theme.colors.text }]}>
								{formatCurrency(budget.totalAmount)}
							</Text>
						</View>
						<View style={styles.summaryRow}>
							<Text
								style={[
									styles.summaryLabel,
									{ color: theme.colors.textSecondary },
								]}
							>
								Total Spent
							</Text>
							<Text style={[styles.summaryValue, { color: theme.colors.text }]}>
								{formatCurrency(totalSpent)}
							</Text>
						</View>
						<View style={styles.summaryRow}>
							<Text
								style={[
									styles.summaryLabel,
									{ color: theme.colors.textSecondary },
								]}
							>
								Remaining
							</Text>
							<Text
								style={[
									styles.summaryValue,
									{
										color:
											remaining < 0 ? theme.colors.error : theme.colors.success,
									},
								]}
							>
								${remaining.toLocaleString()}
							</Text>
						</View>
					</Animated.View>

					<View style={styles.section}>
						<Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
							Categories
						</Text>
						{budget.categories.map((category: any) => {
							const progress = (category.spent / category.amount) * 100;
							return (
								<Animated.View
									key={category.id}
									entering={FadeIn}
									style={[
										styles.categoryCard,
										{
											backgroundColor: theme.colors.surface,
											borderColor: theme.colors.border,
										},
									]}
								>
									<View style={styles.categoryHeader}>
										<View style={styles.categoryInfo}>
											<Text
												style={[
													styles.categoryName,
													{ color: theme.colors.text },
												]}
											>
												{category.name}
											</Text>
											<Text
												style={[
													styles.categoryAmount,
													{ color: theme.colors.textSecondary },
												]}
											>
												${category.spent.toLocaleString()} of $
												{category.amount.toLocaleString()}
											</Text>
										</View>
										<Text
											style={[
												styles.categoryPercentage,
												{
													color:
														progress > 100
															? theme.colors.error
															: progress > 80
															? theme.colors.accent
															: theme.colors.success,
												},
											]}
										>
											{Math.round(progress)}%
										</Text>
									</View>
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
														progress > 100
															? theme.colors.error
															: progress > 80
															? theme.colors.accent
															: theme.colors.success,
												},
											]}
										/>
									</View>
								</Animated.View>
							);
						})}
					</View>
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
	actions: {
		flexDirection: 'row',
		gap: 8,
	},
	actionButton: {
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
	summaryCard: {
		padding: 20,
		borderRadius: 16,
		borderWidth: 1,
		marginBottom: 24,
	},
	summaryRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	summaryLabel: {
		fontSize: 16,
		fontFamily: 'Inter-Regular',
	},
	summaryValue: {
		fontSize: 18,
		fontFamily: 'Inter-Bold',
	},
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 18,
		fontFamily: 'Inter-SemiBold',
		marginBottom: 16,
	},
	categoryCard: {
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
		marginBottom: 12,
	},
	categoryHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
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
	categoryAmount: {
		fontSize: 14,
		fontFamily: 'Inter-Regular',
	},
	categoryPercentage: {
		fontSize: 16,
		fontFamily: 'Inter-Bold',
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
	emptyState: {
		textAlign: 'center',
		fontSize: 16,
		fontFamily: 'Inter-Regular',
		marginTop: 50,
	},
	statusBanner: {
		borderRadius: 16,
		padding: 16,
		marginBottom: 20,
		borderWidth: 1,
	},
	statusContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		marginBottom: 4,
	},
	statusText: {
		fontSize: 16,
		fontFamily: 'Inter-SemiBold',
		flex: 1,
	},
	statusSubtext: {
		fontSize: 14,
		fontFamily: 'Inter-Regular',
		marginLeft: 32,
	},
});
