import { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TextInput,
	Pressable,
	Alert,
	Platform,
} from 'react-native'
import { router, Stack } from 'expo-router'
import { useBudgetStore } from '@/store/budgets';
import { ArrowLeft, DollarSign } from 'lucide-react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useBudgetValidation } from '@/hooks/useBudgets';
import { calculateEndDate, validateBudget } from '@/utils/budgetHelpers';
import { design } from '@/constants/design'
import { AnimatedButton } from '@/components/ui/animated-button'

export default function NewBudgetScreen() {
  const { addBudget } = useBudgetStore()
	const {
		validationErrors,
		isValidating,
		validateBudgetName,
		validateAmount,
		validateDates,
		clearAllErrors,
	} = useBudgetValidation()

  const [name, setName] = useState('')
	const [totalAmount, setTotalAmount] = useState('')
  const [period, setPeriod] = useState<
		'daily' | 'weekly' | 'monthly' | 'yearly'
	>('monthly')
	const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(() =>
		calculateEndDate(new Date(), 'monthly'),
	)
	const [showStartDate, setShowStartDate] = useState(false)
	const [showEndDate, setShowEndDate] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
		const newEndDate = calculateEndDate(startDate, period)
		setEndDate(newEndDate)
	}, [startDate, period])

  const handleSubmit = async () => {
		clearAllErrors()
		setIsSubmitting(true)

		try {
			const isNameValid = await validateBudgetName(name)
			const isAmountValid = validateAmount(totalAmount, 'totalAmount')
			const isDatesValid = validateDates(startDate, endDate)

			if (!isNameValid || !isAmountValid || !isDatesValid) {
				setIsSubmitting(false)
				return
			}

			const budgetData = {
				name: name.trim(),
				totalAmount: parseFloat(totalAmount),
				period,
				startDate: startDate.toISOString(),
				endDate: endDate.toISOString(),
				categories: [],
			}

			const validation = validateBudget(budgetData)
			if (!validation.isValid) {
				Alert.alert('Validation Error', validation.errors.join('\n'))
				setIsSubmitting(false)
				return
			}

			await addBudget(budgetData)
			router.back()
		} catch (err) {
			Alert.alert('Error', 'Failed to create budget. Please try again.')
		} finally {
			setIsSubmitting(false)
		}
	}

  return (
		<View style={styles.container}>
			<Stack.Screen
				options={{
					headerShown: true,
					title: 'New Budget',
					headerStyle: { backgroundColor: design.colors.base },
					headerTintColor: design.colors.text,
					headerShadowVisible: false,
					headerLeft: () => (
						<Pressable onPress={() => router.back()} style={styles.backButton}>
							<ArrowLeft size={24} color={design.colors.text} />
						</Pressable>
					),
				}}
			/>

			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				<Animated.View
					entering={FadeInDown.duration(300)}
					style={styles.formContainer}
				>
					{Object.keys(validationErrors).length > 0 && (
						<View style={styles.errorBanner}>
							{Object.entries(validationErrors).map(([field, message]) => (
								<Text key={field} style={styles.errorText}>
									• {message}
								</Text>
							))}
						</View>
					)}

					<View style={styles.formGroup}>
						<Text style={styles.label}>Budget Name</Text>
						<TextInput
							value={name}
							onChangeText={setName}
							onBlur={() => validateBudgetName(name)}
							placeholder='e.g., Grocery Budget'
							placeholderTextColor={design.colors.textMuted}
							style={[styles.input, validationErrors.name && styles.inputError]}
						/>
					</View>

					<View style={styles.formGroup}>
						<Text style={styles.label}>Total Amount</Text>
						<View
							style={[
								styles.inputContainer,
								validationErrors.totalAmount && styles.inputError,
							]}
						>
							<DollarSign
								size={20}
								color={design.colors.textSecondary}
								style={styles.inputIcon}
							/>
							<TextInput
								value={totalAmount}
								onChangeText={setTotalAmount}
								onBlur={() => validateAmount(totalAmount, 'totalAmount')}
								placeholder='0.00'
								keyboardType='decimal-pad'
								placeholderTextColor={design.colors.textMuted}
								style={[styles.input, styles.inputWithIcon]}
							/>
						</View>
					</View>

					<View style={styles.formGroup}>
						<Text style={styles.label}>Period</Text>
						<View style={styles.periodRow}>
							{(['daily', 'weekly', 'monthly', 'yearly'] as const).map((p) => (
								<Pressable
									key={p}
									onPress={() => setPeriod(p)}
									style={[
										styles.periodBtn,
										period === p && styles.periodBtnActive,
									]}
								>
									<Text
										style={[
											styles.periodBtnText,
											period === p && styles.periodBtnTextActive,
										]}
									>
										{p.charAt(0).toUpperCase() + p.slice(1)}
									</Text>
								</Pressable>
							))}
						</View>
					</View>

					<View style={styles.formGroup}>
						<Text style={styles.label}>Date Range</Text>
						<View style={styles.dateRow}>
							<Pressable
								onPress={() => setShowStartDate(true)}
								style={styles.dateBtn}
							>
								<Text style={styles.dateText}>
									{startDate.toLocaleDateString()}
								</Text>
							</Pressable>
							<Text style={styles.dateSeparator}>to</Text>
							<Pressable
								onPress={() => setShowEndDate(true)}
								style={styles.dateBtn}
							>
								<Text style={styles.dateText}>
									{endDate.toLocaleDateString()}
								</Text>
							</Pressable>
						</View>
					</View>

					{showStartDate && (
						<DateTimePicker
							value={startDate}
							mode='date'
							onChange={(e, d) => {
								setShowStartDate(false)
								if (d) setStartDate(d)
							}}
						/>
					)}

					{showEndDate && (
						<DateTimePicker
							value={endDate}
							mode='date'
							onChange={(e, d) => {
								setShowEndDate(false)
								if (d) setEndDate(d)
							}}
						/>
					)}

					<View style={styles.actionRow}>
						<AnimatedButton
							title='Cancel'
							variant='secondary'
							onPress={() => router.back()}
							style={styles.actionBtn}
						/>
						<AnimatedButton
							title='Create Budget'
							variant='primary'
							onPress={handleSubmit}
							isLoading={isSubmitting || isValidating}
							style={styles.actionBtn}
						/>
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
	backButton: {
		paddingRight: 16,
	},
	content: {
		flex: 1,
		padding: design.spacing.lg,
	},
	formContainer: {
		...Platform.select({
			web: { maxWidth: 600, marginHorizontal: 'auto', width: '100%' },
		}),
		paddingBottom: 60,
	},
	errorBanner: {
		backgroundColor: design.colors.errorBg,
		borderRadius: design.borderRadius.lg,
		padding: design.spacing.md,
		marginBottom: design.spacing.xl,
	},
	errorText: {
		...design.typography.caption,
		color: design.colors.error,
		marginBottom: 4,
	},
	formGroup: {
		marginBottom: design.spacing.xl,
	},
	label: {
		...design.typography.subtitle,
		color: design.colors.text,
		marginBottom: design.spacing.sm,
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: design.colors.surface,
		borderRadius: design.borderRadius.lg,
		borderWidth: 1,
		borderColor: design.colors.border,
	},
	input: {
		flex: 1,
		height: 52,
		backgroundColor: design.colors.surface,
		borderRadius: design.borderRadius.lg,
		borderWidth: 1,
		borderColor: design.colors.border,
		paddingHorizontal: design.spacing.md,
		...design.typography.body,
		color: design.colors.text,
	},
	inputWithIcon: {
		borderWidth: 0,
		paddingLeft: 44,
	},
	inputIcon: {
		position: 'absolute',
		left: 14,
		zIndex: 1,
	},
	inputError: {
		borderColor: design.colors.error,
	},
	periodRow: {
		flexDirection: 'row',
		gap: design.spacing.sm,
	},
	periodBtn: {
		flex: 1,
		height: 48,
		borderRadius: design.borderRadius.pill,
		backgroundColor: design.colors.surface,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: design.colors.border,
	},
	periodBtnActive: {
		backgroundColor: design.colors.primary,
		borderColor: design.colors.primary,
	},
	periodBtnText: {
		...design.typography.caption,
		fontFamily: 'Inter-Medium',
		color: design.colors.text,
	},
	periodBtnTextActive: {
		color: '#FFF',
	},
	dateRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: design.spacing.md,
	},
	dateBtn: {
		flex: 1,
		height: 52,
		backgroundColor: design.colors.surface,
		borderRadius: design.borderRadius.lg,
		borderWidth: 1,
		borderColor: design.colors.border,
		justifyContent: 'center',
		alignItems: 'center',
	},
	dateText: {
		...design.typography.body,
		color: design.colors.text,
	},
	dateSeparator: {
		...design.typography.body,
		color: design.colors.textSecondary,
	},
	actionRow: {
		flexDirection: 'row',
		gap: design.spacing.md,
		marginTop: design.spacing.md,
	},
	actionBtn: {
		flex: 1,
	},
})
