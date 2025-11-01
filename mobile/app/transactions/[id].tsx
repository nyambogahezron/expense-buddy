import React, { useEffect, useState, useMemo } from 'react';
import {
	StyleSheet,
	View,
	Text,
	ActivityIndicator,
	TouchableOpacity,
	Platform,
	ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Transaction } from '@/types/transaction';
import * as transactionService from '@/services/db/transactions';
import { CATEGORIES } from '@/constants/categories';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { useThemeStore } from '@/store/theme';
import { useTransactionStore } from '@/store/transactions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TransactionsDetails() {
	const route = useRouter();
	const { theme } = useThemeStore();
	const { deleteTransaction } = useTransactionStore();
	const insets = useSafeAreaInsets();
	const styles = useMemo(() => createStyles(theme), [theme]);

	const { id } = useLocalSearchParams() as { id: string };
	const [transaction, setTransaction] = useState<Transaction | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		const fetchTransaction = async () => {
			try {
				const data = await transactionService.getTransactionById(id);
				if (data) {
					setTransaction(data);
				} else {
					setError('Transaction not found');
				}
			} catch (err) {
				setError('Failed to load transaction details');
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		fetchTransaction();
	}, [id]);

	const handleDelete = async () => {
		if (!transaction) return;

		try {
			setDeleting(true);
			await deleteTransaction(transaction.id);
			// Navigate immediately without waiting, since we use optimistic updates
			route.push('/(tabs)/transactions');
		} catch (err) {
			setError('Failed to delete transaction');
			console.error(err);
		} finally {
			setDeleting(false);
		}
	};

	const getCategoryDetails = (categoryId: string) => {
		return (
			CATEGORIES.find((cat) => cat.id === categoryId) || {
				name: categoryId,
				icon: 'help-circle',
				color: '#999',
			}
		);
	};

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size='large' color={theme.colors.primary} />
			</View>
		);
	}

	if (error || !transaction) {
		return (
			<View style={styles.errorContainer}>
				<Text style={styles.errorText}>{error || 'Transaction not found'}</Text>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => route.push('/(tabs)/transactions')}
				>
					<Text style={styles.backButtonText}>Go Back</Text>
				</TouchableOpacity>
			</View>
		);
	}

	const category = getCategoryDetails(transaction.category);

	return (
		<View style={styles.container}>
			<Stack.Screen
				options={{
					title: 'Transaction Details',
					headerShown: true,
					headerStyle: {
						backgroundColor: theme.colors.surface,
					},
					headerTintColor: theme.colors.text,
					headerTitleStyle: {
						fontWeight: '600',
					},
					headerRight: () => (
						<View style={styles.headerActions}>
							<TouchableOpacity
								style={styles.editButton}
								onPress={() =>
									route.push(`/transactions/edit/${transaction.id}`)
								}
							>
								<Feather name='edit-2' size={24} color={theme.colors.primary} />
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.deleteButton}
								onPress={handleDelete}
								disabled={deleting}
							>
								{deleting ? (
									<ActivityIndicator size='small' color={theme.colors.error} />
								) : (
									<Feather
										name='trash-2'
										size={24}
										color={theme.colors.error}
									/>
								)}
							</TouchableOpacity>
						</View>
					),
				}}
			/>

			<View style={styles.wrapper}>
				<ScrollView
					style={styles.scrollView}
					contentContainerStyle={styles.content}
					showsVerticalScrollIndicator={false}
				>
					<Animated.View
						entering={FadeInDown.duration(200).delay(200)}
						style={[
							styles.amountContainer,
							{
								backgroundColor:
									transaction.type === 'income'
										? theme.colors.success
										: theme.colors.error,
							},
						]}
					>
						<Text style={styles.amountLabel}>
							{transaction.type === 'income' ? 'Income' : 'Expense'}
						</Text>
						<Text style={styles.amount}>
							{transaction.type === 'income' ? '+' : '-'}
							{formatCurrency(transaction.amount)}
						</Text>
						<Text style={styles.date}>{formatDate(transaction.date)}</Text>
					</Animated.View>

					<Animated.View
						style={styles.detailsCard}
						entering={FadeInDown.duration(200).delay(300)}
					>
						<View style={styles.detailRow}>
							<View
								style={[
									styles.categoryIcon,
									{ backgroundColor: category.color },
								]}
							>
								<Feather name={category.icon as any} size={20} color='#fff' />
							</View>
							<View style={styles.detailContent}>
								<Text style={styles.detailLabel}>Category</Text>
								<Text style={styles.detailValue}>{category.name}</Text>
							</View>
						</View>

						<View style={styles.separator} />

						<View style={styles.detailRow}>
							<View style={styles.iconContainer}>
								<Feather
									name='align-left'
									size={20}
									color={theme.colors.primary}
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
							<View style={styles.iconContainer}>
								<Feather
									name='calendar'
									size={20}
									color={theme.colors.primary}
								/>
							</View>
							<View style={styles.detailContent}>
								<Text style={styles.detailLabel}>Date & Time</Text>
								<Text style={styles.detailValue}>
									{formatDate(transaction.date, true)}
								</Text>
							</View>
						</View>
					</Animated.View>
				</ScrollView>

				{/* Floating Edit Button */}
				<Animated.View
					entering={FadeIn.duration(400).delay(600)}
					style={styles.floatingButton}
				>
					<TouchableOpacity
						style={styles.editFab}
						onPress={() => route.push(`/transactions/edit/${transaction.id}`)}
					>
						<Feather name='edit-2' size={24} color='#fff' />
					</TouchableOpacity>
				</Animated.View>
			</View>
		</View>
	);
}

const createStyles = (theme: any) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.colors.background,
		},
		wrapper: {
			flex: 1,
			...(Platform.OS === 'web' && {
				maxWidth: 1200,
				marginHorizontal: 'auto',
				width: '100%',
			}),
		},
		loadingContainer: {
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
			backgroundColor: theme.colors.background,
		},
		errorContainer: {
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
			backgroundColor: theme.colors.background,
			padding: 20,
		},
		errorText: {
			fontSize: 16,
			color: theme.colors.error,
			marginBottom: 20,
			textAlign: 'center',
		},
		header: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingHorizontal: 16,
			paddingVertical: 12,
			backgroundColor: theme.colors.surface,
			elevation: 2,
			shadowColor: '#000',
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.1,
			shadowRadius: 3,
		},
		headerWrapper: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			flex: 1,
			...Platform.select({
				web: {
					maxWidth: 1200,
					marginHorizontal: 'auto',
					width: '100%',
				},
			}),
		},
		headerTitle: {
			fontSize: 18,
			fontWeight: '600',
			color: theme.colors.text,
		},
		backButton: {
			padding: 8,
		},
		backButtonText: {
			color: theme.colors.primary,
			fontSize: 16,
			fontWeight: '500',
		},
		deleteButton: {
			padding: 8,
		},
		headerActions: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 8,
		},
		editButton: {
			padding: 8,
		},
		floatingButton: {
			position: 'absolute',
			right: 20,
			bottom: 20,
		},
		editFab: {
			width: 56,
			height: 56,
			borderRadius: 28,
			backgroundColor: theme.colors.primary,
			justifyContent: 'center',
			alignItems: 'center',
			elevation: 8,
			shadowColor: '#000',
			shadowOffset: { width: 0, height: 4 },
			shadowOpacity: 0.3,
			shadowRadius: 8,
		},
		scrollView: {
			flex: 1,
		},
		content: {
			paddingHorizontal: 16,
			paddingTop: 20,
			paddingBottom: 20,
		},
		amountContainer: {
			borderRadius: 12,
			padding: 24,
			alignItems: 'center',
			marginBottom: 20,
			minHeight: 90,
		},
		amountLabel: {
			color: 'rgba(255, 255, 255, 0.9)',
			fontSize: 16,
			marginBottom: 8,
			fontWeight: '500',
		},
		amount: {
			color: 'white',
			fontSize: 36,
			fontWeight: 'bold',
			marginBottom: 8,
			textAlign: 'center',
		},
		date: {
			color: 'rgba(255, 255, 255, 0.9)',
			fontSize: 16,
		},
		detailsCard: {
			backgroundColor: theme.colors.surface,
			borderRadius: 12,
			marginVertical: 8,
			padding: 20,
		},
		detailRow: {
			flexDirection: 'row',
			alignItems: 'center',
			paddingVertical: 12,
		},
		categoryIcon: {
			width: 40,
			height: 40,
			borderRadius: 20,
			justifyContent: 'center',
			alignItems: 'center',
			marginRight: 16,
		},
		iconContainer: {
			width: 40,
			height: 40,
			borderRadius: 20,
			backgroundColor: theme.colors.primary + '15',
			justifyContent: 'center',
			alignItems: 'center',
			marginRight: 16,
		},
		detailContent: {
			flex: 1,
		},
		detailLabel: {
			fontSize: 14,
			color: theme.colors.textSecondary,
			marginBottom: 4,
			fontWeight: '500',
		},
		detailValue: {
			fontSize: 16,
			color: theme.colors.text,
			fontWeight: '600',
			// Ensure text is always visible
			...(theme.id === 'light' && { color: '#1F2937' }),
			...(theme.id === 'dark' && { color: '#F9FAFB' }),
		},
		separator: {
			height: 1,
			backgroundColor: theme.colors.border,
			marginVertical: 8,
			marginLeft: 56, // Align with content after icon
		},
	});
