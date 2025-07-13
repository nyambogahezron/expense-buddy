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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { TransactionCategory } from '@/types/transaction';
import { CATEGORIES } from '@/constants/categories';
import { formatDate } from '@/utils/helpers';
import { useThemeStore } from '@/store/theme';
import { useCategoryStore } from '@/store/categories';
import DateTimePicker from '@react-native-community/datetimepicker';

interface TransactionFormProps {
	initialValues?: {
		amount: string;
		description: string;
		category: TransactionCategory;
		date: Date;
		type: 'income' | 'expense';
	};
	onSubmit: (values: {
		amount: number;
		description: string;
		category: TransactionCategory;
		date: Date;
		type: 'income' | 'expense';
	}) => void;
	onCancel: () => void;
}

export function TransactionForm({
	initialValues,
	onSubmit,
	onCancel,
}: TransactionFormProps) {
	const { theme } = useThemeStore();
	const { categories, loadCategories, addCategory } = useCategoryStore();
	const styles = useMemo(() => createStyles(theme), [theme]);

	// Form state
	const [amount, setAmount] = useState(initialValues?.amount || '');
	const [description, setDescription] = useState(
		initialValues?.description || ''
	);
	const [category, setCategory] = useState<TransactionCategory>(
		initialValues?.category || 'other'
	);
	const [date, setDate] = useState(initialValues?.date || new Date());
	const [type, setType] = useState<'income' | 'expense'>(
		initialValues?.type || 'expense'
	);
	const [showDatePicker, setShowDatePicker] = useState(false);

	// Custom category modal state
	const [showCustomCategoryModal, setShowCustomCategoryModal] = useState(false);
	const [newCategoryName, setNewCategoryName] = useState('');
	const [newCategoryIcon, setNewCategoryIcon] = useState('tag');
	const [newCategoryColor, setNewCategoryColor] = useState('#6366F1');
	const [creatingCategory, setCreatingCategory] = useState(false);

	// Available icons for custom categories
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
	];

	const availableColors = [
		'#6366F1',
		'#8B5CF6',
		'#EC4899',
		'#EF4444',
		'#F59E0B',
		'#10B981',
		'#3B82F6',
		'#6B7280',
		'#84CC16',
		'#F97316',
	];

	useEffect(() => {
		loadCategories();
	}, [loadCategories]);

	// Combine default categories with custom categories from database
	const allCategories = useMemo(() => {
		const defaultCategories = CATEGORIES.map((cat) => ({
			id: cat.id,
			name: cat.name,
			icon: cat.icon,
			color: cat.color,
			isCustom: false,
			uniqueKey: `default-${cat.id}`,
		}));

		const customCategories = categories.map((cat) => ({
			id: cat.id,
			name: cat.name,
			icon: cat.icon,
			color: cat.color,
			isCustom: true,
			uniqueKey: `custom-${cat.id}`,
		}));

		return [...defaultCategories, ...customCategories];
	}, [categories]);

	const handleSubmit = () => {
		if (!amount || !description) {
			Alert.alert('Error', 'Please fill in all required fields');
			return;
		}

		const amountNum = parseFloat(amount);
		if (isNaN(amountNum) || amountNum <= 0) {
			Alert.alert('Error', 'Please enter a valid amount');
			return;
		}

		onSubmit({
			amount: amountNum,
			description,
			category,
			date,
			type,
		});
	};

	const handleCreateCustomCategory = async () => {
		if (!newCategoryName.trim()) {
			Alert.alert('Error', 'Please enter a category name');
			return;
		}

		try {
			setCreatingCategory(true);
			await addCategory({
				name: newCategoryName.trim(),
				icon: newCategoryIcon,
				color: newCategoryColor,
				description: '',
			});

			// Set the newly created category as selected
			setCategory(
				newCategoryName
					.toLowerCase()
					.replace(/\s+/g, '_') as TransactionCategory
			);

			setNewCategoryName('');
			setNewCategoryIcon('tag');
			setNewCategoryColor('#6366F1');
			setShowCustomCategoryModal(false);

			Alert.alert('Success', 'Category created successfully!');
		} catch (error) {
			Alert.alert('Error', 'Failed to create category');
		} finally {
			setCreatingCategory(false);
		}
	};

	return (
		<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
				<View style={styles.categoryHeader}>
					<Text style={styles.sectionTitle}>Category</Text>
					<TouchableOpacity
						style={styles.addCategoryButton}
						onPress={() => setShowCustomCategoryModal(true)}
					>
						<Feather name='plus' size={16} color={theme.colors.primary} />
						<Text style={styles.addCategoryText}>Add Custom</Text>
					</TouchableOpacity>
				</View>

				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					style={styles.categoriesScroll}
				>
					{allCategories.map((cat) => {
						const isSelected = category === cat.id;
						return (
							<TouchableOpacity
								key={cat.uniqueKey}
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
								{cat.isCustom && (
									<View style={styles.customBadge}>
										<Text style={styles.customBadgeText}>Custom</Text>
									</View>
								)}
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

			{/* Action Buttons */}
			<Animated.View
				entering={FadeInDown.duration(200).delay(600)}
				style={styles.actionButtons}
			>
				<TouchableOpacity
					style={[styles.button, styles.cancelButton]}
					onPress={onCancel}
				>
					<Text style={styles.cancelButtonText}>Cancel</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.button, styles.submitButton]}
					onPress={handleSubmit}
				>
					<Text style={styles.submitButtonText}>
						{initialValues ? 'Update' : 'Create'} Transaction
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
							<Text style={styles.modalTitle}>Create Custom Category</Text>
							<TouchableOpacity
								onPress={() => setShowCustomCategoryModal(false)}
							>
								<Feather name='x' size={24} color={theme.colors.text} />
							</TouchableOpacity>
						</View>

						<View style={styles.modalBody}>
							<Text style={styles.inputLabel}>Category Name</Text>
							<TextInput
								style={styles.modalInput}
								value={newCategoryName}
								onChangeText={setNewCategoryName}
								placeholder='Enter category name'
								placeholderTextColor={theme.colors.textSecondary}
							/>

							<Text style={styles.inputLabel}>Icon</Text>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								style={styles.iconSelector}
							>
								{availableIcons.map((iconName) => (
									<TouchableOpacity
										key={iconName}
										style={[
											styles.iconOption,
											newCategoryIcon === iconName && styles.iconOptionSelected,
											{
												borderColor:
													newCategoryIcon === iconName
														? newCategoryColor
														: theme.colors.border,
											},
										]}
										onPress={() => setNewCategoryIcon(iconName)}
									>
										<Feather
											name={iconName as any}
											size={20}
											color={
												newCategoryIcon === iconName
													? newCategoryColor
													: theme.colors.text
											}
										/>
									</TouchableOpacity>
								))}
							</ScrollView>

							<Text style={styles.inputLabel}>Color</Text>
							<View style={styles.colorSelector}>
								{availableColors.map((color) => (
									<TouchableOpacity
										key={color}
										style={[
											styles.colorOption,
											{ backgroundColor: color },
											newCategoryColor === color && styles.colorOptionSelected,
										]}
										onPress={() => setNewCategoryColor(color)}
									>
										{newCategoryColor === color && (
											<Feather name='check' size={16} color='#fff' />
										)}
									</TouchableOpacity>
								))}
							</View>
						</View>

						<View style={styles.modalActions}>
							<TouchableOpacity
								style={[styles.modalButton, styles.modalCancelButton]}
								onPress={() => setShowCustomCategoryModal(false)}
							>
								<Text style={styles.modalCancelText}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.modalButton, styles.modalCreateButton]}
								onPress={handleCreateCustomCategory}
								disabled={creatingCategory}
							>
								{creatingCategory ? (
									<ActivityIndicator size='small' color='#fff' />
								) : (
									<Text style={styles.modalCreateText}>Create</Text>
								)}
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</ScrollView>
	);
}

const createStyles = (theme: any) =>
	StyleSheet.create({
		container: {
			flex: 1,
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
		categoryHeader: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginBottom: 12,
		},
		addCategoryButton: {
			flexDirection: 'row',
			alignItems: 'center',
			paddingVertical: 6,
			paddingHorizontal: 12,
			borderRadius: 6,
			backgroundColor: theme.colors.surface,
			borderWidth: 1,
			borderColor: theme.colors.primary,
		},
		addCategoryText: {
			fontSize: 12,
			fontWeight: '500',
			color: theme.colors.primary,
			marginLeft: 4,
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
			minWidth: 80,
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
			textAlign: 'center',
		},
		customBadge: {
			marginTop: 4,
			paddingHorizontal: 6,
			paddingVertical: 2,
			backgroundColor: theme.colors.primary + '20',
			borderRadius: 4,
		},
		customBadgeText: {
			fontSize: 8,
			fontWeight: '600',
			color: theme.colors.primary,
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
		actionButtons: {
			flexDirection: 'row',
			gap: 12,
			marginTop: 20,
			marginBottom: 40,
		},
		button: {
			flex: 1,
			paddingVertical: 16,
			paddingHorizontal: 24,
			borderRadius: 8,
			alignItems: 'center',
			justifyContent: 'center',
		},
		cancelButton: {
			backgroundColor: theme.colors.surface,
			borderWidth: 1,
			borderColor: theme.colors.border,
		},
		cancelButtonText: {
			fontSize: 16,
			fontWeight: '600',
			color: theme.colors.text,
		},
		submitButton: {
			backgroundColor: theme.colors.primary,
		},
		submitButtonText: {
			fontSize: 16,
			fontWeight: '600',
			color: '#fff',
		},
		// Modal styles
		modalOverlay: {
			flex: 1,
			backgroundColor: 'rgba(0, 0, 0, 0.5)',
			justifyContent: 'center',
			alignItems: 'center',
			padding: 20,
		},
		modalContent: {
			backgroundColor: theme.colors.background,
			borderRadius: 12,
			padding: 20,
			width: '100%',
			maxWidth: 400,
			maxHeight: '80%',
		},
		modalHeader: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginBottom: 20,
		},
		modalTitle: {
			fontSize: 18,
			fontWeight: '600',
			color: theme.colors.text,
		},
		modalBody: {
			marginBottom: 20,
		},
		inputLabel: {
			fontSize: 14,
			fontWeight: '600',
			color: theme.colors.text,
			marginBottom: 8,
			marginTop: 16,
		},
		modalInput: {
			backgroundColor: theme.colors.surface,
			borderRadius: 8,
			paddingHorizontal: 16,
			paddingVertical: 12,
			fontSize: 16,
			color: theme.colors.text,
			borderWidth: 1,
			borderColor: theme.colors.border,
		},
		iconSelector: {
			marginVertical: 8,
		},
		iconOption: {
			width: 44,
			height: 44,
			borderRadius: 22,
			backgroundColor: theme.colors.surface,
			borderWidth: 2,
			alignItems: 'center',
			justifyContent: 'center',
			marginRight: 12,
		},
		iconOptionSelected: {
			borderWidth: 2,
		},
		colorSelector: {
			flexDirection: 'row',
			flexWrap: 'wrap',
			gap: 12,
			marginVertical: 8,
		},
		colorOption: {
			width: 32,
			height: 32,
			borderRadius: 16,
			alignItems: 'center',
			justifyContent: 'center',
			borderWidth: 2,
			borderColor: 'transparent',
		},
		colorOptionSelected: {
			borderColor: theme.colors.text,
		},
		modalActions: {
			flexDirection: 'row',
			gap: 12,
		},
		modalButton: {
			flex: 1,
			paddingVertical: 12,
			paddingHorizontal: 20,
			borderRadius: 8,
			alignItems: 'center',
			justifyContent: 'center',
		},
		modalCancelButton: {
			backgroundColor: theme.colors.surface,
			borderWidth: 1,
			borderColor: theme.colors.border,
		},
		modalCancelText: {
			fontSize: 16,
			fontWeight: '600',
			color: theme.colors.text,
		},
		modalCreateButton: {
			backgroundColor: theme.colors.primary,
		},
		modalCreateText: {
			fontSize: 16,
			fontWeight: '600',
			color: '#fff',
		},
	});
