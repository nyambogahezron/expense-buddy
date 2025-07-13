import { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TextInput,
	Pressable,
	Alert,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useThemeStore } from '@/store/theme';
import { useBudgetStore } from '@/store/budgets';
import { ArrowLeft, Calendar, DollarSign } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';
import ContentWrapper from '@/components/ui/ContentWrapper';
import { useBudgetValidation } from '@/hooks/useBudgets';
import { calculateEndDate, validateBudget } from '@/utils/budgetHelpers';

export default function NewBudgetScreen() {
	const { theme } = useThemeStore();
	const { addBudget, isLoading } = useBudgetStore();
	const {
		validationErrors,
		isValidating,
		validateBudgetName,
		validateAmount,
		validateDates,
		clearAllErrors,
	} = useBudgetValidation();

	const [name, setName] = useState('');
	const [totalAmount, setTotalAmount] = useState('');
	const [period, setPeriod] = useState<
		'daily' | 'weekly' | 'monthly' | 'yearly'
	>('monthly');
	const [startDate, setStartDate] = useState(new Date());
	const [endDate, setEndDate] = useState(() =>
		calculateEndDate(new Date(), 'monthly')
	);
	const [showStartDate, setShowStartDate] = useState(false);
	const [showEndDate, setShowEndDate] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Auto-calculate end date when period or start date changes
	useEffect(() => {
		const newEndDate = calculateEndDate(startDate, period);
		setEndDate(newEndDate);
	}, [startDate, period]);

	const handleNameChange = async (text: string) => {
		setName(text);
		if (text.trim()) {
			await validateBudgetName(text);
		}
	};

	const handleAmountChange = (text: string) => {
		setTotalAmount(text);
		if (text.trim()) {
			validateAmount(text, 'totalAmount');
		}
	};

	const handleSubmit = async () => {
		clearAllErrors();
		setIsSubmitting(true);

		try {
			// Validate all fields
			const isNameValid = await validateBudgetName(name);
			const isAmountValid = validateAmount(totalAmount, 'totalAmount');
			const isDatesValid = validateDates(startDate, endDate);

			if (!isNameValid || !isAmountValid || !isDatesValid) {
				setIsSubmitting(false);
				return;
			}

			const budgetData = {
				name: name.trim(),
				totalAmount: parseFloat(totalAmount),
				period,
				startDate: startDate.toISOString(),
				endDate: endDate.toISOString(),
				categories: [],
			};

			const validation = validateBudget(budgetData);
			if (!validation.isValid) {
				Alert.alert('Validation Error', validation.errors.join('\n'));
				setIsSubmitting(false);
				return;
			}

			await addBudget(budgetData);

			Alert.alert('Success', 'Budget created successfully!', [
				{ text: 'OK', onPress: () => router.back() },
			]);
		} catch (err) {
			console.error('Error creating budget:', err);
			Alert.alert('Error', 'Failed to create budget. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<View
			style={[styles.container, { backgroundColor: theme.colors.background }]}
		>
			<Stack.Screen
				options={{
					headerShown: true,
					header: () => (
						<View
							style={[
								styles.header,
								{ backgroundColor: theme.colors.background },
							]}
						>
							<ContentWrapper
								style={{ flexDirection: 'row', alignItems: 'center' }}
							>
								<Pressable
									onPress={() => router.back()}
									style={styles.backButton}
								>
									<ArrowLeft size={24} color={theme.colors.text} />
								</Pressable>
								<Text style={[styles.title, { color: theme.colors.text }]}>
									New Budget
								</Text>
							</ContentWrapper>
						</View>
					),
				}}
			/>

			<ScrollView style={styles.content}>
				<ContentWrapper>
					<Animated.View entering={FadeIn}>
						{Object.keys(validationErrors).length > 0 && (
							<View
								style={[
									styles.errorContainer,
									{ backgroundColor: theme.colors.error + '20' },
								]}
							>
								{Object.entries(validationErrors).map(([field, message]) => (
									<Text
										key={field}
										style={[styles.error, { color: theme.colors.error }]}
									>
										{message}
									</Text>
								))}
							</View>
						)}

						<View style={styles.form}>
							<View style={styles.inputGroup}>
								<Text style={[styles.label, { color: theme.colors.text }]}>
									Budget Name *
								</Text>
								<TextInput
									value={name}
									onChangeText={handleNameChange}
									placeholder='Enter budget name'
									style={[
										styles.input,
										{
											backgroundColor: theme.colors.surface,
											borderColor: theme.colors.border,
											color: theme.colors.text,
										},
									]}
									placeholderTextColor={theme.colors.textSecondary}
								/>
							</View>

							<View style={styles.inputGroup}>
								<Text style={[styles.label, { color: theme.colors.text }]}>
									Total Amount *
								</Text>
								<View style={styles.inputWithIcon}>
									<DollarSign
										size={20}
										color={theme.colors.textSecondary}
										style={styles.inputIcon}
									/>
									<TextInput
										value={totalAmount}
										onChangeText={handleAmountChange}
										placeholder='Enter amount'
										keyboardType='decimal-pad'
										style={[
											styles.input,
											styles.inputWithPadding,
											{
												backgroundColor: theme.colors.surface,
												borderColor: validationErrors.totalAmount
													? theme.colors.error
													: theme.colors.border,
												color: theme.colors.text,
											},
										]}
										placeholderTextColor={theme.colors.textSecondary}
									/>
								</View>
							</View>

							<View style={styles.inputGroup}>
								<Text style={[styles.label, { color: theme.colors.text }]}>
									Period
								</Text>
								<View style={styles.periodButtons}>
									{(['daily', 'weekly', 'monthly', 'yearly'] as const).map(
										(p) => (
											<Pressable
												key={p}
												onPress={() => setPeriod(p)}
												style={[
													styles.periodButton,
													{
														backgroundColor:
															period === p
																? theme.colors.primary
																: theme.colors.surface,
														borderColor: theme.colors.border,
													},
												]}
											>
												<Text
													style={[
														styles.periodButtonText,
														{
															color:
																period === p ? '#FFFFFF' : theme.colors.text,
														},
													]}
												>
													{p.charAt(0).toUpperCase() + p.slice(1)}
												</Text>
											</Pressable>
										)
									)}
								</View>
							</View>

							<View style={styles.inputGroup}>
								<Text style={[styles.label, { color: theme.colors.text }]}>
									Date Range
								</Text>
								<View style={styles.dateButtons}>
									<Pressable
										onPress={() => setShowStartDate(true)}
										style={[
											styles.dateButton,
											{
												backgroundColor: theme.colors.surface,
												borderColor: theme.colors.border,
											},
										]}
									>
										<Text
											style={[
												styles.dateButtonText,
												{ color: theme.colors.text },
											]}
										>
											{startDate.toLocaleDateString()}
										</Text>
									</Pressable>
									<Text
										style={[styles.dateSeperator, { color: theme.colors.text }]}
									>
										to
									</Text>
									<Pressable
										onPress={() => setShowEndDate(true)}
										style={[
											styles.dateButton,
											{
												backgroundColor: theme.colors.surface,
												borderColor: theme.colors.border,
											},
										]}
									>
										<Text
											style={[
												styles.dateButtonText,
												{ color: theme.colors.text },
											]}
										>
											{endDate.toLocaleDateString()}
										</Text>
									</Pressable>
								</View>
							</View>

							{showStartDate && (
								<DateTimePicker
									value={startDate}
									mode='date'
									onChange={(event, selectedDate) => {
										setShowStartDate(false);
										if (selectedDate) {
											setStartDate(selectedDate);
										}
									}}
								/>
							)}

							{showEndDate && (
								<DateTimePicker
									value={endDate}
									mode='date'
									onChange={(event, selectedDate) => {
										setShowEndDate(false);
										if (selectedDate) {
											setEndDate(selectedDate);
										}
									}}
								/>
							)}

							<View style={styles.buttons}>
								<Pressable
									onPress={() => router.back()}
									style={[
										styles.button,
										{
											backgroundColor: theme.colors.surface,
											borderColor: theme.colors.border,
										},
									]}
									disabled={isSubmitting}
								>
									<Text
										style={[styles.buttonText, { color: theme.colors.text }]}
									>
										Cancel
									</Text>
								</Pressable>
								<Pressable
									onPress={handleSubmit}
									style={[
										styles.button,
										{
											backgroundColor: isSubmitting
												? theme.colors.textSecondary
												: theme.colors.primary,
										},
									]}
									disabled={isSubmitting || isValidating}
								>
									<Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
										{isSubmitting ? 'Creating...' : 'Create Budget'}
									</Text>
								</Pressable>
							</View>
						</View>
					</Animated.View>
				</ContentWrapper>
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
		alignItems: 'center',
		padding: 20,
		paddingTop: 20,
	},
	backButton: {
		padding: 8,
	},
	title: {
		fontSize: 24,
		fontFamily: 'Inter-Bold',
		marginLeft: 12,
	},
	content: {
		flex: 1,
	},
	errorContainer: {
		backgroundColor: 'rgba(239, 68, 68, 0.1)',
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: 'rgba(239, 68, 68, 0.2)',
	},
	error: {
		fontSize: 14,
		fontFamily: 'Inter-Regular',
		marginBottom: 4,
	},
	form: {
		padding: 20,
		gap: 24,
	},
	inputGroup: {
		gap: 8,
	},
	label: {
		fontSize: 16,
		fontFamily: 'Inter-SemiBold',
	},
	input: {
		height: 48,
		borderRadius: 12,
		borderWidth: 1,
		paddingHorizontal: 16,
		fontSize: 16,
		fontFamily: 'Inter-Regular',
	},
	inputWithIcon: {
		position: 'relative',
		flexDirection: 'row',
		alignItems: 'center',
	},
	inputIcon: {
		position: 'absolute',
		left: 16,
		zIndex: 1,
	},
	inputWithPadding: {
		paddingLeft: 48,
	},
	periodButtons: {
		flexDirection: 'row',
		gap: 12,
	},
	periodButton: {
		flex: 1,
		height: 48,
		borderRadius: 12,
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	periodButtonText: {
		fontSize: 16,
		fontFamily: 'Inter-SemiBold',
	},
	dateButtons: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	dateButton: {
		flex: 1,
		height: 48,
		borderRadius: 12,
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	dateButtonText: {
		fontSize: 16,
		fontFamily: 'Inter-Regular',
	},
	dateSeperator: {
		fontSize: 16,
		fontFamily: 'Inter-Regular',
	},
	buttons: {
		flexDirection: 'row',
		gap: 12,
		marginTop: 12,
	},
	button: {
		flex: 1,
		height: 48,
		borderRadius: 12,
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	buttonText: {
		fontSize: 16,
		fontFamily: 'Inter-SemiBold',
	},
});
