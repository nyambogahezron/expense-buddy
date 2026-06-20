import React, { useState, useEffect, useMemo } from 'react';
import {
	StyleSheet,
	View,
	Text,
	ActivityIndicator,
	TouchableOpacity,
	ScrollView,
	TextInput,
	Alert,
	Modal,
} from 'react-native'
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { TransactionCategory } from '@/types/transaction';
import { CATEGORIES } from '@/constants/categories';
import { formatDate } from '@/utils/helpers'
import { useCategoryStore } from '@/store/categories';
import { design } from '@/constants/design'
import { AnimatedButton } from '@/components/ui/animated-button'
import { AnimatedCard } from '@/components/ui/animated-card'
import DateTimePicker from '@react-native-community/datetimepicker';

interface TransactionFormProps {
	initialValues?: {
		amount: string
		description: string
		category: TransactionCategory
		date: Date
		type: 'income' | 'expense'
	}
	onSubmit: (values: {
		amount: number
		description: string
		category: TransactionCategory
		date: Date
		type: 'income' | 'expense'
	}) => void
	onCancel: () => void
}

export function TransactionForm({
	initialValues,
	onSubmit,
	onCancel,
}: TransactionFormProps) {
	const { categories, loadCategories, addCategory } = useCategoryStore()

	const [amount, setAmount] = useState(initialValues?.amount || '')
	const [description, setDescription] = useState(
		initialValues?.description || '',
	)
	const [category, setCategory] = useState<TransactionCategory>(
		initialValues?.category || 'other',
	)
	const [date, setDate] = useState(initialValues?.date || new Date())
	const [type, setType] = useState<'income' | 'expense'>(
		initialValues?.type || 'expense',
	)
	const [showDatePicker, setShowDatePicker] = useState(false)

	const [showCustomCategoryModal, setShowCustomCategoryModal] = useState(false)
	const [newCategoryName, setNewCategoryName] = useState('')
	const [newCategoryIcon, setNewCategoryIcon] = useState('tag')
	const [newCategoryColor, setNewCategoryColor] = useState(
		design.colors.primary,
	)
	const [creatingCategory, setCreatingCategory] = useState(false)

	const availableIcons = [
		'tag',
		'shopping-bag',
		'car',
		'home',
		'heart',
		'book',
		'music',
		'camera',
		'gift',
		'tool',
		'phone',
		'laptop',
		'coffee',
		'umbrella',
		'star',
		'sun',
		'moon',
		'cloud',
		'zap',
		'award',
	]
	const availableColors = [
		design.colors.primary,
		design.colors.secondary,
		'#EC4899',
		design.colors.error,
		design.colors.warning,
		design.colors.success,
		'#3B82F6',
		design.colors.textMuted,
		'#84CC16',
		'#F97316',
	]

	useEffect(() => {
		loadCategories()
	}, [loadCategories])

	const allCategories = useMemo(() => {
		const defaultCategories = CATEGORIES.map((cat) => ({
			...cat,
			isCustom: false,
			uniqueKey: `default-${cat.id}`,
		}))
		const customCategories = categories.map((cat) => ({
			...cat,
			isCustom: true,
			uniqueKey: `custom-${cat.id}`,
		}))
		return [...defaultCategories, ...customCategories]
	}, [categories])

	const handleSubmit = () => {
		if (!amount || !description) {
			Alert.alert('Error', 'Please fill in all required fields')
			return
		}
		const amountNum = parseFloat(amount)
		if (isNaN(amountNum) || amountNum <= 0) {
			Alert.alert('Error', 'Please enter a valid amount')
			return
		}
		onSubmit({ amount: amountNum, description, category, date, type })
	}

	const handleCreateCustomCategory = async () => {
		if (!newCategoryName.trim()) {
			Alert.alert('Error', 'Please enter a category name')
			return
		}
		try {
			setCreatingCategory(true)
			await addCategory({
				name: newCategoryName.trim(),
				icon: newCategoryIcon,
				color: newCategoryColor,
				description: '',
			})
			setCategory(
				newCategoryName
					.toLowerCase()
					.replace(/\s+/g, '_') as TransactionCategory,
			)
			setNewCategoryName('')
			setNewCategoryIcon('tag')
			setNewCategoryColor(design.colors.primary)
			setShowCustomCategoryModal(false)
			Alert.alert('Success', 'Category created successfully!')
		} catch (error) {
			Alert.alert('Error', 'Failed to create category')
		} finally {
			setCreatingCategory(false)
		}
	}

	const isIncome = type === 'income'

	return (
		<View style={styles.wrapper}>
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.scrollContent}
			>
				<Animated.View
					entering={FadeInDown.duration(300).delay(50)}
					style={styles.segmentControl}
				>
					<TouchableOpacity
						style={[styles.segmentBtn, !isIncome && styles.segmentBtnExpense]}
						onPress={() => setType('expense')}
						activeOpacity={0.8}
					>
						<Text
							style={[
								styles.segmentText,
								!isIncome && styles.segmentTextActive,
							]}
						>
							Expense
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.segmentBtn, isIncome && styles.segmentBtnIncome]}
						onPress={() => setType('income')}
						activeOpacity={0.8}
					>
						<Text
							style={[styles.segmentText, isIncome && styles.segmentTextActive]}
						>
							Income
						</Text>
					</TouchableOpacity>
				</Animated.View>

				<Animated.View
					entering={FadeInDown.duration(400).delay(100)}
					style={styles.amountHeader}
				>
					<Text style={styles.amountLabel}>How much?</Text>
					<View style={styles.amountInputRow}>
						<Text
							style={[
								styles.currencySymbol,
								isIncome ? styles.textSuccess : styles.textError,
							]}
						>
							$
						</Text>
						<TextInput
							style={[
								styles.amountInput,
								isIncome ? styles.textSuccess : styles.textError,
							]}
							value={amount}
							onChangeText={setAmount}
							placeholder='0.00'
							placeholderTextColor={design.colors.borderDark}
							keyboardType='decimal-pad'
							autoFocus
						/>
					</View>
				</Animated.View>

				<Animated.View entering={FadeInUp.duration(400).delay(150)}>
					<AnimatedCard style={styles.detailsCard} withHaptic={false}>
						{/* Category */}
						<View style={styles.fieldSection}>
							<View style={styles.fieldHeader}>
								<Text style={styles.fieldLabel}>Category</Text>
								<TouchableOpacity
									onPress={() => setShowCustomCategoryModal(true)}
									style={styles.addCategoryBtn}
								>
									<Feather
										name='plus-circle'
										size={16}
										color={design.colors.primary}
									/>
									<Text style={styles.addCategoryText}>Custom</Text>
								</TouchableOpacity>
							</View>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={styles.categoryScroll}
							>
								{allCategories.map((cat) => {
									const isSelected = category === cat.id
									return (
										<TouchableOpacity
											key={cat.uniqueKey}
											onPress={() => setCategory(cat.id as TransactionCategory)}
											style={[
												styles.catChip,
												isSelected && {
													backgroundColor: cat.color,
													borderColor: cat.color,
												},
											]}
										>
											<Feather
												name={cat.icon as any}
												size={16}
												color={
													isSelected ? '#FFFFFF' : design.colors.textSecondary
												}
											/>
											<Text
												style={[
													styles.catChipText,
													isSelected && { color: '#FFFFFF' },
												]}
											>
												{cat.name}
											</Text>
										</TouchableOpacity>
									)
								})}
							</ScrollView>
						</View>

						<View style={styles.divider} />

						{/* Date */}
						<TouchableOpacity
							style={styles.fieldSectionRow}
							onPress={() => setShowDatePicker(true)}
						>
							<Text style={styles.fieldLabel}>Date</Text>
							<View style={styles.valueRow}>
								<Text style={styles.fieldValue}>
									{formatDate(date.toISOString())}
								</Text>
								<Feather
									name='chevron-right'
									size={20}
									color={design.colors.textMuted}
								/>
							</View>
						</TouchableOpacity>

						<View style={styles.divider} />

						{/* Note */}
						<View
							style={[
								styles.fieldSection,
								{ borderBottomWidth: 0, paddingBottom: 0 },
							]}
						>
							<Text style={styles.fieldLabel}>Note</Text>
							<TextInput
								style={styles.notesInput}
								value={description}
								onChangeText={setDescription}
								placeholder='What was this for?'
								placeholderTextColor={design.colors.textMuted}
								multiline
							/>
						</View>
					</AnimatedCard>
				</Animated.View>

				<Animated.View
					entering={FadeInUp.duration(400).delay(250)}
					style={styles.actionRow}
				>
					<AnimatedButton
						title='Cancel'
						variant='secondary'
						onPress={onCancel}
						style={styles.actionBtn}
					/>
					<AnimatedButton
						title={initialValues ? 'Update' : 'Save'}
						variant='primary'
						onPress={handleSubmit}
						style={styles.actionBtn}
					/>
				</Animated.View>
			</ScrollView>

			{showDatePicker && (
				<DateTimePicker
					value={date}
					mode='date'
					display='default'
					onChange={(event, selectedDate) => {
						setShowDatePicker(false)
						if (selectedDate) setDate(selectedDate)
					}}
				/>
			)}

			{/* Custom Category Modal */}
			<Modal
				visible={showCustomCategoryModal}
				transparent
				animationType='slide'
				onRequestClose={() => setShowCustomCategoryModal(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>New Category</Text>
							<TouchableOpacity
								onPress={() => setShowCustomCategoryModal(false)}
							>
								<Feather name='x' size={24} color={design.colors.text} />
							</TouchableOpacity>
						</View>

						<ScrollView showsVerticalScrollIndicator={false}>
							<Text style={styles.inputLabel}>Name</Text>
							<TextInput
								style={styles.modalInput}
								value={newCategoryName}
								onChangeText={setNewCategoryName}
								placeholder='e.g., Subscriptions'
								placeholderTextColor={design.colors.textMuted}
							/>

							<Text style={styles.inputLabel}>Icon</Text>
							<View style={styles.gridContainer}>
								{availableIcons.map((iconName) => (
									<TouchableOpacity
										key={iconName}
										style={[
											styles.iconOption,
											newCategoryIcon === iconName && {
												borderColor: newCategoryColor,
											},
										]}
										onPress={() => setNewCategoryIcon(iconName)}
									>
										<Feather
											name={iconName as any}
											size={24}
											color={
												newCategoryIcon === iconName
													? newCategoryColor
													: design.colors.textSecondary
											}
										/>
									</TouchableOpacity>
								))}
							</View>

							<Text style={styles.inputLabel}>Color</Text>
							<View style={styles.gridContainer}>
								{availableColors.map((color) => (
									<TouchableOpacity
										key={color}
										style={[
											styles.colorOption,
											{ backgroundColor: color },
											newCategoryColor === color && {
												borderColor: design.colors.text,
												borderWidth: 2,
											},
										]}
										onPress={() => setNewCategoryColor(color)}
									>
										{newCategoryColor === color && (
											<Feather name='check' size={16} color='#fff' />
										)}
									</TouchableOpacity>
								))}
							</View>
						</ScrollView>

						<View style={styles.modalActions}>
							<AnimatedButton
								title='Cancel'
								variant='secondary'
								onPress={() => setShowCustomCategoryModal(false)}
								style={styles.actionBtn}
							/>
							<AnimatedButton
								title='Create'
								variant='primary'
								onPress={handleCreateCustomCategory}
								isLoading={creatingCategory}
								style={styles.actionBtn}
							/>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	)
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
	},
	scrollContent: {
		padding: design.spacing.lg,
		paddingBottom: 100,
	},
	segmentControl: {
		flexDirection: 'row',
		backgroundColor: design.colors.borderDark,
		borderRadius: design.borderRadius.pill,
		padding: 4,
		marginBottom: design.spacing.xl,
	},
	segmentBtn: {
		flex: 1,
		paddingVertical: 10,
		alignItems: 'center',
		borderRadius: design.borderRadius.pill,
	},
	segmentBtnExpense: {
		backgroundColor: design.colors.errorBg,
	},
	segmentBtnIncome: {
		backgroundColor: design.colors.successBg,
	},
	segmentText: {
		color: design.colors.textSecondary,
		fontFamily: 'Inter-Medium',
	},
	segmentTextActive: {
		color: design.colors.text,
		fontFamily: 'Inter-SemiBold',
	},
	amountHeader: {
		alignItems: 'center',
		marginBottom: design.spacing.xl,
	},
	amountLabel: {
		...design.typography.caption,
		color: design.colors.textSecondary,
		textTransform: 'uppercase',
		letterSpacing: 1,
		marginBottom: design.spacing.sm,
	},
	amountInputRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	currencySymbol: {
		fontSize: 48,
		fontFamily: 'Inter-Medium',
		marginRight: 4,
	},
	amountInput: {
		fontSize: 56,
		fontFamily: 'Inter-Bold',
		minWidth: 120,
		textAlign: 'center',
	},
	textSuccess: {
		color: design.colors.success,
	},
	textError: {
		color: design.colors.error,
	},
	detailsCard: {
		padding: 0,
		overflow: 'hidden',
		backgroundColor: design.colors.surface,
	},
	fieldSection: {
		padding: design.spacing.lg,
	},
	fieldSectionRow: {
		padding: design.spacing.lg,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	fieldHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: design.spacing.sm,
	},
	fieldLabel: {
		...design.typography.body,
		color: design.colors.textSecondary,
	},
	addCategoryBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	addCategoryText: {
		...design.typography.caption,
		color: design.colors.primary,
	},
	categoryScroll: {
		paddingVertical: design.spacing.xs,
		gap: design.spacing.sm,
	},
	catChip: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: design.borderRadius.pill,
		backgroundColor: design.colors.base,
		borderWidth: 1,
		borderColor: design.colors.border,
		marginRight: design.spacing.sm,
		gap: 6,
	},
	catChipText: {
		...design.typography.caption,
		color: design.colors.textSecondary,
	},
	valueRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: design.spacing.xs,
	},
	fieldValue: {
		...design.typography.body,
		color: design.colors.text,
	},
	notesInput: {
		...design.typography.body,
		color: design.colors.text,
		paddingTop: design.spacing.sm,
		minHeight: 60,
		textAlignVertical: 'top',
	},
	divider: {
		height: 1,
		backgroundColor: design.colors.border,
		marginLeft: design.spacing.lg,
	},
	actionRow: {
		flexDirection: 'row',
		gap: design.spacing.md,
		marginTop: design.spacing.xl,
	},
	actionBtn: {
		flex: 1,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.6)',
		justifyContent: 'flex-end',
	},
	modalContent: {
		backgroundColor: design.colors.base,
		borderTopLeftRadius: design.borderRadius.xl,
		borderTopRightRadius: design.borderRadius.xl,
		padding: design.spacing.lg,
		maxHeight: '85%',
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: design.spacing.lg,
	},
	modalTitle: {
		...design.typography.h2,
		color: design.colors.text,
	},
	inputLabel: {
		...design.typography.subtitle,
		color: design.colors.text,
		marginTop: design.spacing.lg,
		marginBottom: design.spacing.sm,
	},
	modalInput: {
		backgroundColor: design.colors.surface,
		borderRadius: design.borderRadius.lg,
		padding: design.spacing.md,
		color: design.colors.text,
		...design.typography.body,
	},
	gridContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: design.spacing.md,
	},
	iconOption: {
		width: 48,
		height: 48,
		borderRadius: design.borderRadius.md,
		backgroundColor: design.colors.surface,
		borderWidth: 2,
		borderColor: 'transparent',
		alignItems: 'center',
		justifyContent: 'center',
	},
	colorOption: {
		width: 40,
		height: 40,
		borderRadius: design.borderRadius.pill,
		alignItems: 'center',
		justifyContent: 'center',
	},
	modalActions: {
		flexDirection: 'row',
		gap: design.spacing.md,
		marginTop: design.spacing.xl,
		paddingBottom: Platform.OS === 'ios' ? 20 : 0,
	},
})
