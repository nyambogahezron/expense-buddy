import React, { useEffect, useState } from 'react'
import {
	StyleSheet,
	View,
	Text,
	ActivityIndicator,
	TouchableOpacity,
	Platform,
	ScrollView,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'
import { useRouter, useLocalSearchParams, Stack } from 'expo-router'
import { Transaction } from '@/types/transaction'
import * as transactionService from '@/services/db/transactions'
import { CATEGORIES } from '@/constants/categories'
import { formatCurrency, formatDate } from '@/utils/helpers'
import { design } from '@/constants/design'
import { useTransactionStore } from '@/store/transactions'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AnimatedCard } from '@/components/ui/animated-card'

export default function TransactionsDetails() {
	const route = useRouter()
	const { deleteTransaction } = useTransactionStore()
	const insets = useSafeAreaInsets()

	const { id } = useLocalSearchParams() as { id: string }
	const [transaction, setTransaction] = useState<Transaction | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [deleting, setDeleting] = useState(false)

	useEffect(() => {
		const fetchTransaction = async () => {
			try {
				const data = await transactionService.getTransactionById(id)
				if (data) {
					setTransaction(data)
				} else {
					setError('Transaction not found')
				}
			} catch (err) {
				setError('Failed to load transaction details')
			} finally {
				setLoading(false)
			}
		}
		fetchTransaction()
	}, [id])

	const handleDelete = async () => {
		if (!transaction) return
		try {
			setDeleting(true)
			await deleteTransaction(transaction.id)
			route.push('/(tabs)/expenses')
		} catch (err) {
			setError('Failed to delete transaction')
		} finally {
			setDeleting(false)
		}
	}

	const getCategoryDetails = (categoryId: string) => {
		return (
			CATEGORIES.find((cat) => cat.id === categoryId) || {
				name: categoryId,
				icon: 'tag',
				color: design.colors.textMuted,
			}
		)
	}

	if (loading) {
		return (
			<View style={styles.centerContainer}>
				<ActivityIndicator size='large' color={design.colors.primary} />
			</View>
		)
	}

	if (error || !transaction) {
		return (
			<View style={styles.centerContainer}>
				<Text style={styles.errorText}>{error || 'Transaction not found'}</Text>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => route.push('/(tabs)/expenses')}
				>
					<Text style={styles.backButtonText}>Go Back</Text>
				</TouchableOpacity>
			</View>
		)
	}

	const category = getCategoryDetails(transaction.category)
	const isIncome = transaction.type === 'income'

	return (
		<View style={styles.container}>
			<Stack.Screen
				options={{
					headerShown: true,
					title: 'Details',
					headerStyle: { backgroundColor: design.colors.base },
					headerTintColor: design.colors.text,
					headerShadowVisible: false,
					headerRight: () => (
						<View style={styles.headerActions}>
							<TouchableOpacity
								style={styles.actionBtn}
								onPress={() =>
									route.push(`/transactions/edit/${transaction.id}`)
								}
							>
								<Feather
									name='edit-2'
									size={20}
									color={design.colors.textSecondary}
								/>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.actionBtn}
								onPress={handleDelete}
								disabled={deleting}
							>
								{deleting ? (
									<ActivityIndicator size='small' color={design.colors.error} />
								) : (
									<Feather
										name='trash-2'
										size={20}
										color={design.colors.error}
									/>
								)}
							</TouchableOpacity>
						</View>
					),
				}}
			/>

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<Animated.View
					entering={FadeInDown.duration(300).delay(100)}
					style={[
						styles.amountContainer,
						{
							backgroundColor: isIncome
								? design.colors.successBg
								: design.colors.errorBg,
						},
					]}
				>
					<View
						style={[
							styles.typeBadge,
							{
								backgroundColor: isIncome
									? design.colors.success + '20'
									: design.colors.error + '20',
							},
						]}
					>
						<Text
							style={[
								styles.typeBadgeText,
								{
									color: isIncome ? design.colors.success : design.colors.error,
								},
							]}
						>
							{isIncome ? 'Income' : 'Expense'}
						</Text>
					</View>
					<Text
						style={[
							styles.amount,
							{ color: isIncome ? design.colors.success : design.colors.error },
						]}
					>
						{isIncome ? '+' : '-'}${formatCurrency(transaction.amount)}
					</Text>
					<Text style={styles.date}>{formatDate(transaction.date)}</Text>
				</Animated.View>

				<Animated.View entering={FadeInDown.duration(300).delay(200)}>
					<AnimatedCard style={styles.detailsCard} withHaptic={false}>
						<View style={styles.detailRow}>
							<View
								style={[
									styles.iconBox,
									{ backgroundColor: category.color + '20' },
								]}
							>
								<Feather
									name={category.icon as any}
									size={20}
									color={category.color}
								/>
							</View>
							<View style={styles.detailContent}>
								<Text style={styles.detailLabel}>Category</Text>
								<Text style={styles.detailValue}>{category.name}</Text>
							</View>
						</View>

						<View style={styles.separator} />

						<View style={styles.detailRow}>
							<View
								style={[
									styles.iconBox,
									{ backgroundColor: design.colors.primary + '20' },
								]}
							>
								<Feather
									name='align-left'
									size={20}
									color={design.colors.primary}
								/>
							</View>
							<View style={styles.detailContent}>
								<Text style={styles.detailLabel}>Description</Text>
								<Text style={styles.detailValue}>
									{transaction.description}
								</Text>
							</View>
						</View>

						<View style={styles.separator} />

						<View style={styles.detailRow}>
							<View
								style={[
									styles.iconBox,
									{ backgroundColor: design.colors.secondary + '20' },
								]}
							>
								<Feather
									name='calendar'
									size={20}
									color={design.colors.secondary}
								/>
							</View>
							<View style={styles.detailContent}>
								<Text style={styles.detailLabel}>Date & Time</Text>
								<Text style={styles.detailValue}>
									{formatDate(transaction.date, true)}
								</Text>
							</View>
						</View>
					</AnimatedCard>
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
		marginBottom: design.spacing.md,
	},
	headerActions: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: design.spacing.xs,
	},
	actionBtn: {
		padding: design.spacing.sm,
		borderRadius: design.borderRadius.pill,
		backgroundColor: design.colors.surface,
		marginLeft: design.spacing.xs,
	},
	backButton: {
		paddingVertical: design.spacing.sm,
		paddingHorizontal: design.spacing.lg,
		backgroundColor: design.colors.surface,
		borderRadius: design.borderRadius.pill,
	},
	backButtonText: {
		...design.typography.caption,
		color: design.colors.text,
	},
	scrollView: {
		flex: 1,
	},
	content: {
		padding: design.spacing.lg,
		...Platform.select({
			web: { maxWidth: 800, marginHorizontal: 'auto', width: '100%' },
		}),
	},
	amountContainer: {
		borderRadius: design.borderRadius.xl,
		padding: design.spacing.xl,
		alignItems: 'center',
		marginBottom: design.spacing.xl,
	},
	typeBadge: {
		paddingHorizontal: design.spacing.md,
		paddingVertical: design.spacing.xs,
		borderRadius: design.borderRadius.pill,
		marginBottom: design.spacing.sm,
	},
	typeBadgeText: {
		...design.typography.caption,
		textTransform: 'uppercase',
		letterSpacing: 1,
	},
	amount: {
		fontSize: 48,
		fontFamily: 'Inter-Bold',
		marginBottom: design.spacing.xs,
	},
	date: {
		...design.typography.body,
		color: design.colors.textMuted,
	},
	detailsCard: {
		padding: design.spacing.lg,
		backgroundColor: design.colors.surface,
	},
	detailRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: design.spacing.sm,
	},
	iconBox: {
		width: 44,
		height: 44,
		borderRadius: design.borderRadius.md,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: design.spacing.md,
	},
	detailContent: {
		flex: 1,
	},
	detailLabel: {
		...design.typography.caption,
		color: design.colors.textSecondary,
		marginBottom: 4,
	},
	detailValue: {
		...design.typography.subtitle,
		color: design.colors.text,
	},
	separator: {
		height: 1,
		backgroundColor: design.colors.borderDark,
		marginVertical: design.spacing.xs,
		marginLeft: 60,
	},
})
