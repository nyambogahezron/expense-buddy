import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	Pressable,
	Platform,
	RefreshControl,
	ActivityIndicator,
} from 'react-native'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useBudgetStore } from '@/store/budgets';
import {
	ArrowLeft,
	Trash2,
	TrendingUp,
	Calendar,
	AlertTriangle,
} from 'lucide-react-native'
import { Feather } from '@expo/vector-icons'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'
import { formatCurrency, getBudgetStatus } from '@/utils/budgetHelpers';
import React, { useEffect, useState, useCallback } from 'react';
import * as budgetDb from '@/services/db/budgets';
import { Budget } from '@/types/budget';
import { design } from '@/constants/design'
import { AnimatedCard } from '@/components/ui/animated-card'
import { ProgressBar } from '@/components/ui/progress-bar'

export default function BudgetDetailScreen() {
	const { selectBudget } = useBudgetStore()
	const params = useLocalSearchParams()
	const [budget, setBudget] = useState<Budget | null>(null)
	const [budgetStats, setBudgetStats] = useState<any>(null)
	const [loading, setLoading] = useState(true)
	const [refreshing, setRefreshing] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const budgetId = typeof params.id === 'string' ? params.id : null

	const loadBudgetData = useCallback(async () => {
		if (!budgetId) {
			setLoading(false)
			return
		}
		try {
			setError(null)
			const budgetData = await budgetDb.getBudgetById(budgetId)

			if (!budgetData) {
				setError('Budget not found')
				setBudget(null)
				setBudgetStats(null)
				return
			}
			setBudget(budgetData)
			selectBudget(budgetData)

			try {
				const statsData = await budgetDb.getBudgetStats(budgetId)
				setBudgetStats(statsData)
			} catch (statsError) {
				setBudgetStats(null)
			}
		} catch (err) {
			setError('Failed to load budget')
			setBudget(null)
			setBudgetStats(null)
		} finally {
			setLoading(false)
		}
	}, [budgetId, selectBudget])

	useEffect(() => {
		let mounted = true
		let timeoutId = setTimeout(() => {
			if (mounted) {
				setLoading(false)
				setError('Loading timeout - please try again')
			}
		}, 10000)

		const initLoad = async () => {
			if (budgetId && mounted) {
				await loadBudgetData()
				if (timeoutId) clearTimeout(timeoutId)
			}
		}
		initLoad()

		return () => {
			mounted = false
			if (timeoutId) clearTimeout(timeoutId)
		}
	}, [budgetId, loadBudgetData])

	const refresh = async () => {
		if (refreshing) return
		setRefreshing(true)
		await loadBudgetData()
		setRefreshing(false)
	}

	const handleDelete = async () => {
		if (!budget) return
		try {
			await budgetDb.deleteBudget(budget.id)
			router.back()
		} catch (err) {
			setError('Failed to delete budget')
		}
	}

	const handleEdit = () => {
		if (budget) {
			selectBudget(budget)
			router.push(`/budgets/edit/${budget.id}`)
		}
	}

	if (loading) {
		return (
			<View style={styles.centerContainer}>
				<ActivityIndicator size='large' color={design.colors.primary} />
			</View>
		)
	}

	if (error || !budget) {
		return (
			<View style={styles.centerContainer}>
				<Text style={styles.errorText}>{error || 'Budget not found'}</Text>
			</View>
		)
	}

	const totalSpent = budget.categories.reduce(
		(sum: number, cat: any) => sum + cat.spent,
		0,
	)
	const remaining = budget.totalAmount - totalSpent
	const status = getBudgetStatus(budget)

	return (
		<View style={styles.container}>
			<Stack.Screen
				options={{
					headerShown: true,
					title: budget.name,
					headerStyle: { backgroundColor: design.colors.base },
					headerTintColor: design.colors.text,
					headerShadowVisible: false,
					headerLeft: () => (
						<Pressable onPress={() => router.back()} style={styles.headerBtn}>
							<ArrowLeft size={24} color={design.colors.text} />
						</Pressable>
					),
					headerRight: () => (
						<View style={styles.headerActions}>
							<Pressable onPress={handleEdit} style={styles.actionBtn}>
								<Feather
									name='edit-2'
									size={20}
									color={design.colors.textSecondary}
								/>
							</Pressable>
							<Pressable onPress={handleDelete} style={styles.actionBtn}>
								<Trash2 size={20} color={design.colors.error} />
							</Pressable>
						</View>
					),
				}}
			/>

			<ScrollView
				style={styles.content}
				contentContainerStyle={{ paddingBottom: 60 }}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={refresh}
						tintColor={design.colors.primary}
					/>
				}
			>
				<Animated.View
					entering={FadeInDown.duration(300).delay(100)}
					style={styles.contentWrapper}
				>
					<Animated.View
						style={[
							styles.statusBanner,
							{
								backgroundColor:
									status.status === 'over-budget'
										? design.colors.errorBg
										: status.status === 'warning'
											? '#F59E0B20'
											: design.colors.primary + '20',
							},
						]}
					>
						<View style={styles.statusContent}>
							{status.status === 'over-budget' ? (
								<AlertTriangle size={20} color={design.colors.error} />
							) : status.status === 'warning' ? (
								<TrendingUp size={20} color='#F59E0B' />
							) : (
								<Calendar size={20} color={design.colors.primary} />
							)}
							<Text
								style={[
									styles.statusText,
									{
										color:
											status.status === 'over-budget'
												? design.colors.error
												: status.status === 'warning'
													? '#F59E0B'
													: design.colors.primary,
									},
								]}
							>
								{status.message}
							</Text>
						</View>
						<Text style={styles.statusSubtext}>Period: {budget.period}</Text>
					</Animated.View>

					<AnimatedCard style={styles.summaryCard} withHaptic={false}>
						<View style={styles.summaryRow}>
							<Text style={styles.summaryLabel}>Total Budget</Text>
							<Text style={styles.summaryValue}>
								{formatCurrency(budget.totalAmount)}
							</Text>
						</View>
						<View style={styles.separator} />
						<View style={styles.summaryRow}>
							<Text style={styles.summaryLabel}>Total Spent</Text>
							<Text style={styles.summaryValue}>
								{formatCurrency(totalSpent)}
							</Text>
						</View>
						<View style={styles.separator} />
						<View style={styles.summaryRow}>
							<Text style={styles.summaryLabel}>Remaining</Text>
							<Text
								style={[
									styles.summaryValue,
									{
										color:
											remaining < 0
												? design.colors.error
												: design.colors.success,
									},
								]}
							>
								${remaining.toLocaleString()}
							</Text>
						</View>
					</AnimatedCard>

					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Categories Breakdown</Text>
						{budget.categories.map((category: any, index: number) => {
							const progress = (category.spent / category.amount) * 100
							return (
								<Animated.View
									key={category.id}
									entering={FadeInDown.duration(300).delay(150 + index * 50)}
								>
									<AnimatedCard style={styles.categoryCard} withHaptic={false}>
										<View style={styles.categoryHeader}>
											<View style={styles.categoryInfo}>
												<Text style={styles.categoryName}>{category.name}</Text>
												<Text style={styles.categoryAmount}>
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
																? design.colors.error
																: progress > 80
																	? design.colors.warning
																	: design.colors.success,
													},
												]}
											>
												{Math.round(progress)}%
											</Text>
										</View>
										<ProgressBar
											progress={progress}
											color={
												progress > 100
													? design.colors.error
													: progress > 80
														? design.colors.warning
														: design.colors.success
											}
										/>
									</AnimatedCard>
								</Animated.View>
							)
						})}
					</View>
				</Animated.View>
			</ScrollView>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: design.colors.base,
	},
	centerContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: design.colors.base,
	},
	errorText: {
		...design.typography.body,
		color: design.colors.error,
	},
	headerBtn: {
		paddingRight: 16,
	},
	headerActions: {
		flexDirection: 'row',
		gap: design.spacing.xs,
	},
	actionBtn: {
		padding: design.spacing.sm,
		backgroundColor: design.colors.surface,
		borderRadius: design.borderRadius.pill,
		marginLeft: 8,
	},
	content: {
		flex: 1,
		padding: design.spacing.lg,
	},
	contentWrapper: {
		...Platform.select({
			web: { maxWidth: 800, marginHorizontal: 'auto', width: '100%' },
		}),
	},
	statusBanner: {
		padding: design.spacing.lg,
		borderRadius: design.borderRadius.xl,
		marginBottom: design.spacing.xl,
	},
	statusContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: design.spacing.sm,
		marginBottom: design.spacing.xs,
	},
	statusText: {
		...design.typography.subtitle,
		flex: 1,
	},
	statusSubtext: {
		...design.typography.caption,
		color: design.colors.textSecondary,
		marginLeft: 28,
	},
	summaryCard: {
		padding: design.spacing.lg,
		marginBottom: design.spacing.xl,
		backgroundColor: design.colors.surface,
	},
	summaryRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: design.spacing.sm,
	},
	summaryLabel: {
		...design.typography.body,
		color: design.colors.textSecondary,
	},
	summaryValue: {
		...design.typography.subtitle,
		color: design.colors.text,
	},
	separator: {
		height: 1,
		backgroundColor: design.colors.borderDark,
		marginVertical: design.spacing.xs,
	},
	section: {
		marginBottom: design.spacing.xl,
	},
	sectionTitle: {
		...design.typography.h3,
		color: design.colors.text,
		marginBottom: design.spacing.md,
	},
	categoryCard: {
		padding: design.spacing.lg,
		marginBottom: design.spacing.md,
		backgroundColor: design.colors.surface,
	},
	categoryHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: design.spacing.sm,
	},
	categoryInfo: {
		flex: 1,
	},
	categoryName: {
		...design.typography.subtitle,
		color: design.colors.text,
		marginBottom: 4,
	},
	categoryAmount: {
		...design.typography.caption,
		color: design.colors.textSecondary,
	},
	categoryPercentage: {
		...design.typography.h3,
	},
})
