import React, { useEffect, useState, useMemo } from 'react';
import {
	StyleSheet,
	View,
	Text,
	ActivityIndicator,
	TouchableOpacity,
	ScrollView,
	TextInput,
	Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Transaction, TransactionCategory } from '@/types/transaction';
import * as transactionService from '@/services/db/transactions';
import { CATEGORIES } from '@/constants/categories';
import { formatDate } from '@/utils/helpers';
import { useThemeStore } from '@/store/theme';
import { useTransactionStore } from '@/store/transactions';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EditTransaction() {
	const router = useRouter();
	const { theme } = useThemeStore();
	const { updateTransaction } = useTransactionStore();
	const styles = useMemo(() => createStyles(theme), [theme]);

	const { id } = useLocalSearchParams() as { id: string };
	const [originalTransaction, setOriginalTransaction] =
		useState<Transaction | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showDatePicker, setShowDatePicker] = useState(false);

	// Form state
	const [amount, setAmount] = useState('');
	const [description, setDescription] = useState('');
	const [category, setCategory] = useState<TransactionCategory>('other');
	const [date, setDate] = useState(new Date());
	const [type, setType] = useState<'income' | 'expense'>('expense');

	useEffect(() => {
		const fetchTransaction = async () => {
			try {
				const data = await transactionService.getTransactionById(id);
				if (data) {
					setOriginalTransaction(data);
					// Populate form with existing data
					setAmount(data.amount.toString());
					setDescription(data.description);
					setCategory(data.category);
					setDate(new Date(data.date));
					setType(data.type);
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

	const handleSave = async () => {
		if (!amount || !description || !originalTransaction) {
			Alert.alert('Error', 'Please fill in all required fields');
			return;
		}

		const amountNum = parseFloat(amount);
		if (isNaN(amountNum) || amountNum <= 0) {
			Alert.alert('Error', 'Please enter a valid amount');
			return;
		}

		try {
			setSaving(true);
			await updateTransaction(id, {
				amount: amountNum,
				description,
				category,
				date: date.toISOString(),
				type,
			});

			Alert.alert('Success', 'Transaction updated successfully', [
				{ text: 'OK', onPress: () => router.back() },
			]);
		} catch (err) {
			setError('Failed to update transaction');
			console.error(err);
			Alert.alert('Error', 'Failed to update transaction');
		} finally {
			setSaving(false);
		}
	};

	const handleCancel = () => {
		Alert.alert(
			'Cancel Changes',
			'Are you sure you want to cancel? All changes will be lost.',
			[
				{ text: 'Continue Editing', style: 'cancel' },
				{
					text: 'Cancel Changes',
					style: 'destructive',
					onPress: () => router.back(),
				},
			]
		);
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

	if (error || !originalTransaction) {
		return (
			<View style={styles.errorContainer}>
				<Text style={styles.errorText}>{error || 'Transaction not found'}</Text>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => router.back()}
				>
					<Text style={styles.backButtonText}>Go Back</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Stack.Screen
				options={{
					title: 'Edit Transaction',
					headerShown: true,
					headerStyle: {
						backgroundColor: theme.colors.surface,
					},
					headerTintColor: theme.colors.text,
					headerTitleStyle: {
						fontWeight: '600',
					},
					headerLeft: () => (
						<TouchableOpacity onPress={handleCancel}>
							<Feather name='x' size={24} color={theme.colors.text} />
						</TouchableOpacity>
					),
					headerRight: () => (
						<TouchableOpacity
							style={styles.saveButton}
							onPress={handleSave}
							disabled={saving}
						>
							{saving ? (
								<ActivityIndicator size='small' color={theme.colors.primary} />
							) : (
								<Text style={styles.saveButtonText}>Save</Text>
							)}
						</TouchableOpacity>
					),
				}}
			/>

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				{/* Transaction Type Toggle */}
				<Animated.View
					entering={FadeInDown.duration(200).delay(100)}
					style={styles.section}
				>
					<Text style={styles.sectionTitle}>Transaction Type</Text>
					<View style={styles.typeToggle}>
						<TouchableOpacity
							style={[
								styles.typeButton,
								type === 'expense' && styles.typeButtonActive,
								{
									backgroundColor:
										type === 'expense'
											? theme.colors.error
											: theme.colors.surface,
								},
							]}
							onPress={() => setType('expense')}
						>
							<Text
								style={[
									styles.typeButtonText,
									{ color: type === 'expense' ? '#fff' : theme.colors.text },
								]}
							>
								Expense
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.typeButton,
								type === 'income' && styles.typeButtonActive,
								{
									backgroundColor:
										type === 'income'
											? theme.colors.success
											: theme.colors.surface,
								},
							]}
							onPress={() => setType('income')}
						>
							<Text
								style={[
									styles.typeButtonText,
									{ color: type === 'income' ? '#fff' : theme.colors.text },
								]}
							>
								Income
							</Text>
						</TouchableOpacity>
					</View>
				</Animated.View>

				{/* Amount Input */}
				<Animated.View
					entering={FadeInDown.duration(200).delay(200)}
					style={styles.section}
				>
					<Text style={styles.sectionTitle}>Amount</Text>
					<View style={styles.amountInputContainer}>
						<Text style={styles.currencySymbol}>$</Text>
						<TextInput
							style={styles.amountInput}
							value={amount}
							onChangeText={setAmount}
							placeholder='0.00'
							placeholderTextColor={theme.colors.textSecondary}
							keyboardType='numeric'
						/>
					</View>
				</Animated.View>

				{/* Description Input */}
				<Animated.View
					entering={FadeInDown.duration(200).delay(300)}
					style={styles.section}
				>
					<Text style={styles.sectionTitle}>Description</Text>
					<TextInput
						style={styles.textInput}
						value={description}
						onChangeText={setDescription}
						placeholder='Enter description'
						placeholderTextColor={theme.colors.textSecondary}
						multiline
						numberOfLines={3}
					/>
				</Animated.View>

				{/* Category Selection */}
				<Animated.View
					entering={FadeInDown.duration(200).delay(400)}
					style={styles.section}
				>
					<Text style={styles.sectionTitle}>Category</Text>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						style={styles.categoriesScroll}
					>
						{CATEGORIES.map((cat) => {
							const isSelected = category === cat.id;
							return (
								<TouchableOpacity
									key={cat.id}
									style={[
										styles.categoryItem,
										isSelected && styles.categoryItemSelected,
										{
											borderColor: isSelected ? cat.color : theme.colors.border,
										},
									]}
									onPress={() => setCategory(cat.id as TransactionCategory)}
								>
									<View
										style={[
											styles.categoryIcon,
											{
												backgroundColor: isSelected
													? cat.color
													: theme.colors.surface,
											},
										]}
									>
										<Feather
											name={cat.icon as any}
											size={20}
											color={isSelected ? '#fff' : cat.color}
										/>
									</View>
									<Text
										style={[
											styles.categoryName,
											{ color: isSelected ? cat.color : theme.colors.text },
										]}
									>
										{cat.name}
									</Text>
								</TouchableOpacity>
							);
						})}
					</ScrollView>
				</Animated.View>

				{/* Date Selection */}
				<Animated.View
					entering={FadeInDown.duration(200).delay(500)}
					style={styles.section}
				>
					<Text style={styles.sectionTitle}>Date</Text>
					<TouchableOpacity
						style={styles.dateButton}
						onPress={() => setShowDatePicker(true)}
					>
						<Feather name='calendar' size={20} color={theme.colors.primary} />
						<Text style={styles.dateButtonText}>
							{formatDate(date.toISOString())}
						</Text>
					</TouchableOpacity>
				</Animated.View>

				{showDatePicker && (
					<DateTimePicker
						value={date}
						mode='date'
						display='default'
						onChange={(event, selectedDate) => {
							setShowDatePicker(false);
							if (selectedDate) {
								setDate(selectedDate);
							}
						}}
					/>
				)}
			</ScrollView>
		</View>
	);
}

const createStyles = (theme: any) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.colors.background,
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
			textAlign: 'center',
			marginBottom: 20,
		},
		backButton: {
			backgroundColor: theme.colors.primary,
			paddingHorizontal: 20,
			paddingVertical: 10,
			borderRadius: 8,
		},
		backButtonText: {
			color: '#fff',
			fontSize: 16,
			fontWeight: '600',
		},
		saveButton: {
			paddingHorizontal: 16,
			paddingVertical: 8,
		},
		saveButtonText: {
			color: theme.colors.primary,
			fontSize: 16,
			fontWeight: '600',
		},
		scrollView: {
			flex: 1,
		},
		content: {
			padding: 20,
		},
		section: {
			marginBottom: 24,
		},
		sectionTitle: {
			fontSize: 16,
			fontWeight: '600',
			color: theme.colors.text,
			marginBottom: 12,
		},
		typeToggle: {
			flexDirection: 'row',
			borderRadius: 8,
			overflow: 'hidden',
		},
		typeButton: {
			flex: 1,
			paddingVertical: 12,
			paddingHorizontal: 16,
			alignItems: 'center',
			justifyContent: 'center',
		},
		typeButtonActive: {
			// Active styles are handled inline
		},
		typeButtonText: {
			fontSize: 16,
			fontWeight: '600',
		},
		amountInputContainer: {
			flexDirection: 'row',
			alignItems: 'center',
			backgroundColor: theme.colors.surface,
			borderRadius: 8,
			paddingHorizontal: 16,
			borderWidth: 1,
			borderColor: theme.colors.border,
		},
		currencySymbol: {
			fontSize: 24,
			fontWeight: '600',
			color: theme.colors.text,
			marginRight: 8,
		},
		amountInput: {
			flex: 1,
			fontSize: 24,
			fontWeight: '600',
			color: theme.colors.text,
			paddingVertical: 16,
		},
		textInput: {
			backgroundColor: theme.colors.surface,
			borderRadius: 8,
			paddingHorizontal: 16,
			paddingVertical: 12,
			fontSize: 16,
			color: theme.colors.text,
			borderWidth: 1,
			borderColor: theme.colors.border,
			textAlignVertical: 'top',
		},
		categoriesScroll: {
			marginHorizontal: -20,
			paddingHorizontal: 20,
		},
		categoryItem: {
			alignItems: 'center',
			paddingVertical: 12,
			paddingHorizontal: 16,
			marginRight: 12,
			borderRadius: 12,
			borderWidth: 2,
			backgroundColor: theme.colors.surface,
		},
		categoryItemSelected: {
			backgroundColor: theme.colors.surface,
		},
		categoryIcon: {
			width: 40,
			height: 40,
			borderRadius: 20,
			alignItems: 'center',
			justifyContent: 'center',
			marginBottom: 8,
		},
		categoryName: {
			fontSize: 12,
			fontWeight: '500',
		},
		dateButton: {
			flexDirection: 'row',
			alignItems: 'center',
			backgroundColor: theme.colors.surface,
			borderRadius: 8,
			paddingHorizontal: 16,
			paddingVertical: 12,
			borderWidth: 1,
			borderColor: theme.colors.border,
		},
		dateButtonText: {
			fontSize: 16,
			color: theme.colors.text,
			marginLeft: 12,
		},
	});
