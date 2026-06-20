import { useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	Pressable,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	Alert,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useThemeStore } from '@/store/theme';
import { useShoppingStore } from '@/store/shopping';
import { ArrowLeft, Plus, X, Save } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Priority, ShoppingItem } from '@/types/shopping';

export default function NewShoppingListScreen() {
	const { theme } = useThemeStore();
	const { addList } = useShoppingStore();
	const [listName, setListName] = useState('');
	const [store, setStore] = useState('');
	const [items, setItems] = useState<
		Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'>[]
	>([]);
	const [showItemForm, setShowItemForm] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Item form state
	const [itemName, setItemName] = useState('');
	const [itemCategory, setItemCategory] = useState('');
	const [itemQuantity, setItemQuantity] = useState('1');
	const [itemCost, setItemCost] = useState('');
	const [itemPriority, setItemPriority] = useState<Priority>('medium');
	const [itemStore, setItemStore] = useState('');

	const resetItemForm = () => {
		setItemName('');
		setItemCategory('');
		setItemQuantity('1');
		setItemCost('');
		setItemPriority('medium');
		setItemStore('');
	};

	const handleAddItem = () => {
		if (!itemName.trim()) {
			Alert.alert('Error', 'Please enter item name');
			return;
		}

		const newItem: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'> = {
			name: itemName.trim(),
			category: itemCategory.trim() || 'General',
			quantity: parseInt(itemQuantity) || 1,
			estimatedCost: parseFloat(itemCost) || 0,
			priority: itemPriority,
			store: itemStore.trim() || undefined,
			purchased: false,
		};

		setItems([...items, newItem]);
		resetItemForm();
		setShowItemForm(false);
	};

	const handleRemoveItem = (index: number) => {
		setItems(items.filter((_, i) => i !== index));
	};

	const handleSubmit = async () => {
		if (!listName.trim()) {
			Alert.alert('Error', 'Please enter a list name');
			return;
		}

		if (items.length === 0) {
			Alert.alert('Error', 'Please add at least one item to the list');
			return;
		}

		setIsSubmitting(true);
		try {
			await addList({
				name: listName.trim(),
				store: store.trim() || undefined,
			});

			// Note: Items will need to be added separately after list creation
			// This depends on your implementation

			Alert.alert('Success', 'Shopping list created successfully', [
				{
					text: 'OK',
					onPress: () => router.back(),
				},
			]);
		} catch (error) {
			Alert.alert('Error', 'Failed to create shopping list');
			setIsSubmitting(false);
		}
	};

	const priorityColors = {
		low: theme.colors.success,
		medium: theme.colors.accent,
		high: theme.colors.error,
	};

	return (
		<View
			style={[styles.container, { backgroundColor: theme.colors.background }]}
		>
			<Stack.Screen
				options={{
					headerShown: true,
					headerTitle: 'Create Shopping List',
					headerStyle: {
						backgroundColor: theme.colors.primary,
					},
					headerTintColor: '#fff',
					headerLeft: () => (
						<Pressable
							onPress={() => router.back()}
							style={({ pressed }) => ({
								padding: 8,
								marginLeft: 8,
								opacity: pressed ? 0.7 : 1,
							})}
						>
							<ArrowLeft size={24} color="#fff" />
						</Pressable>
					),
				}}
			/>

			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={{ flex: 1 }}
			>
				<ScrollView
					style={styles.content}
					contentContainerStyle={styles.contentContainer}
				>
					{/* List Info Section */}
					<Animated.View
						entering={FadeInUp.delay(100)}
						style={[
							styles.section,
							{
								backgroundColor: theme.colors.surface,
								borderColor: theme.colors.border,
							},
						]}
					>
						<Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
							List Information
						</Text>

						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: theme.colors.textSecondary }]}>
								List Name *
							</Text>
							<TextInput
								style={[
									styles.input,
									{
										backgroundColor: theme.colors.background,
										color: theme.colors.text,
										borderColor: theme.colors.border,
									},
								]}
								placeholder="e.g., Weekly Groceries"
								placeholderTextColor={theme.colors.textSecondary}
								value={listName}
								onChangeText={setListName}
							/>
						</View>

						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: theme.colors.textSecondary }]}>
								Store (Optional)
							</Text>
							<TextInput
								style={[
									styles.input,
									{
										backgroundColor: theme.colors.background,
										color: theme.colors.text,
										borderColor: theme.colors.border,
									},
								]}
								placeholder="e.g., Walmart, Target"
								placeholderTextColor={theme.colors.textSecondary}
								value={store}
								onChangeText={setStore}
							/>
						</View>
					</Animated.View>

					{/* Items Section */}
					<Animated.View
						entering={FadeInUp.delay(200)}
						style={[
							styles.section,
							{
								backgroundColor: theme.colors.surface,
								borderColor: theme.colors.border,
							},
						]}
					>
						<View style={styles.sectionHeader}>
							<Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
								Items ({items.length})
							</Text>
							{!showItemForm && (
								<Pressable
									onPress={() => setShowItemForm(true)}
									style={[
										styles.addItemButton,
										{ backgroundColor: theme.colors.primary },
									]}
								>
									<Plus size={20} color="#fff" />
									<Text style={styles.addItemButtonText}>Add Item</Text>
								</Pressable>
							)}
						</View>

						{/* Item Form */}
						{showItemForm && (
							<Animated.View
								entering={FadeInUp}
								style={[
									styles.itemForm,
									{
										backgroundColor: theme.colors.background,
										borderColor: theme.colors.border,
									},
								]}
							>
								<View style={styles.inputGroup}>
									<Text
										style={[styles.label, { color: theme.colors.textSecondary }]}
									>
										Item Name *
									</Text>
									<TextInput
										style={[
											styles.input,
											{
												backgroundColor: theme.colors.surface,
												color: theme.colors.text,
												borderColor: theme.colors.border,
											},
										]}
										placeholder="e.g., Milk"
										placeholderTextColor={theme.colors.textSecondary}
										value={itemName}
										onChangeText={setItemName}
									/>
								</View>

								<View style={styles.row}>
									<View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
										<Text
											style={[
												styles.label,
												{ color: theme.colors.textSecondary },
											]}
										>
											Category
										</Text>
										<TextInput
											style={[
												styles.input,
												{
													backgroundColor: theme.colors.surface,
													color: theme.colors.text,
													borderColor: theme.colors.border,
												},
											]}
											placeholder="General"
											placeholderTextColor={theme.colors.textSecondary}
											value={itemCategory}
											onChangeText={setItemCategory}
										/>
									</View>

									<View style={[styles.inputGroup, { flex: 1 }]}>
										<Text
											style={[
												styles.label,
												{ color: theme.colors.textSecondary },
											]}
										>
											Quantity
										</Text>
										<TextInput
											style={[
												styles.input,
												{
													backgroundColor: theme.colors.surface,
													color: theme.colors.text,
													borderColor: theme.colors.border,
												},
											]}
											placeholder="1"
											placeholderTextColor={theme.colors.textSecondary}
											value={itemQuantity}
											onChangeText={setItemQuantity}
											keyboardType="numeric"
										/>
									</View>
								</View>

								<View style={styles.row}>
									<View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
										<Text
											style={[
												styles.label,
												{ color: theme.colors.textSecondary },
											]}
										>
											Estimated Cost
										</Text>
										<TextInput
											style={[
												styles.input,
												{
													backgroundColor: theme.colors.surface,
													color: theme.colors.text,
													borderColor: theme.colors.border,
												},
											]}
											placeholder="0.00"
											placeholderTextColor={theme.colors.textSecondary}
											value={itemCost}
											onChangeText={setItemCost}
											keyboardType="decimal-pad"
										/>
									</View>

									<View style={[styles.inputGroup, { flex: 1 }]}>
										<Text
											style={[
												styles.label,
												{ color: theme.colors.textSecondary },
											]}
										>
											Priority
										</Text>
										<View style={styles.priorityContainer}>
											{(['low', 'medium', 'high'] as Priority[]).map((p) => (
												<Pressable
													key={p}
													onPress={() => setItemPriority(p)}
													style={[
														styles.priorityButton,
														{
															backgroundColor:
																itemPriority === p
																	? priorityColors[p]
																	: theme.colors.surface,
															borderColor:
																itemPriority === p
																	? priorityColors[p]
																	: theme.colors.border,
														},
													]}
												>
													<Text
														style={[
															styles.priorityText,
															{
																color:
																	itemPriority === p
																		? '#fff'
																		: theme.colors.textSecondary,
															},
														]}
													>
														{p.charAt(0).toUpperCase() + p.slice(1)}
													</Text>
												</Pressable>
											))}
										</View>
									</View>
								</View>

								<View style={styles.formActions}>
									<Pressable
										onPress={() => {
											resetItemForm();
											setShowItemForm(false);
										}}
										style={[
											styles.formButton,
											{
												backgroundColor: theme.colors.surface,
												borderColor: theme.colors.border,
											},
										]}
									>
										<Text
											style={[
												styles.formButtonText,
												{ color: theme.colors.textSecondary },
											]}
										>
											Cancel
										</Text>
									</Pressable>

									<Pressable
										onPress={handleAddItem}
										style={[
											styles.formButton,
											{ backgroundColor: theme.colors.primary },
										]}
									>
										<Text style={styles.formButtonText}>Add Item</Text>
									</Pressable>
								</View>
							</Animated.View>
						)}

						{/* Items List */}
						{items.map((item, index) => (
							<Animated.View
								key={index}
								entering={FadeInUp.delay(index * 50)}
								style={[
									styles.itemCard,
									{
										backgroundColor: theme.colors.background,
										borderColor: theme.colors.border,
									},
								]}
							>
								<View style={styles.itemContent}>
									<View style={styles.itemHeader}>
										<Text style={[styles.itemName, { color: theme.colors.text }]}>
											{item.name}
										</Text>
										<Pressable
											onPress={() => handleRemoveItem(index)}
											style={styles.removeButton}
										>
											<X size={20} color={theme.colors.error} />
										</Pressable>
									</View>

									<View style={styles.itemDetails}>
										<Text
											style={[
												styles.itemDetailText,
												{ color: theme.colors.textSecondary },
											]}
										>
											{item.category} • Qty: {item.quantity}
										</Text>
										{item.estimatedCost > 0 && (
											<Text
												style={[
													styles.itemCost,
													{ color: theme.colors.text },
												]}
											>
												${item.estimatedCost.toFixed(2)}
											</Text>
										)}
									</View>

									<View
										style={[
											styles.priorityBadge,
											{ backgroundColor: priorityColors[item.priority] + '20' },
										]}
									>
										<Text
											style={[
												styles.priorityBadgeText,
												{ color: priorityColors[item.priority] },
											]}
										>
											{item.priority.toUpperCase()}
										</Text>
									</View>
								</View>
							</Animated.View>
						))}

						{items.length === 0 && !showItemForm && (
							<Text
								style={[
									styles.emptyText,
									{ color: theme.colors.textSecondary },
								]}
							>
								No items added yet. Tap {`"Add Item"`} to get started.
							</Text>
						)}
					</Animated.View>
				</ScrollView>

				{/* Submit Button */}
				<View
					style={[
						styles.footer,
						{
							backgroundColor: theme.colors.surface,
							borderTopColor: theme.colors.border,
						},
					]}
				>
					<Pressable
						onPress={handleSubmit}
						disabled={isSubmitting}
						style={[
							styles.submitButton,
							{
								backgroundColor: theme.colors.primary,
								opacity: isSubmitting ? 0.7 : 1,
							},
						]}
					>
						<Save size={20} color="#fff" />
						<Text style={styles.submitButtonText}>
							{isSubmitting ? 'Creating...' : 'Create Shopping List'}
						</Text>
					</Pressable>
				</View>
			</KeyboardAvoidingView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
	},
	contentContainer: {
		padding: 16,
		paddingBottom: 100,
	},
	section: {
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
		borderWidth: 1,
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '600',
		fontFamily: 'Inter-SemiBold',
	},
	inputGroup: {
		marginBottom: 16,
	},
	label: {
		fontSize: 14,
		fontWeight: '500',
		marginBottom: 8,
		fontFamily: 'Inter-Medium',
	},
	input: {
		borderWidth: 1,
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		fontFamily: 'Inter-Regular',
	},
	row: {
		flexDirection: 'row',
	},
	addItemButton: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 8,
		gap: 4,
	},
	addItemButtonText: {
		color: '#fff',
		fontSize: 14,
		fontWeight: '600',
		fontFamily: 'Inter-SemiBold',
	},
	itemForm: {
		borderWidth: 1,
		borderRadius: 8,
		padding: 12,
		marginBottom: 16,
	},
	priorityContainer: {
		flexDirection: 'row',
		gap: 8,
		marginTop: 8,
	},
	priorityButton: {
		flex: 1,
		paddingVertical: 8,
		borderRadius: 6,
		borderWidth: 1,
		alignItems: 'center',
	},
	priorityText: {
		fontSize: 12,
		fontWeight: '600',
		fontFamily: 'Inter-SemiBold',
	},
	formActions: {
		flexDirection: 'row',
		gap: 12,
		marginTop: 16,
	},
	formButton: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: 'center',
		borderWidth: 1,
	},
	formButtonText: {
		color: '#fff',
		fontSize: 14,
		fontWeight: '600',
		fontFamily: 'Inter-SemiBold',
	},
	itemCard: {
		borderWidth: 1,
		borderRadius: 8,
		padding: 12,
		marginBottom: 8,
	},
	itemContent: {
		gap: 8,
	},
	itemHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	itemName: {
		fontSize: 16,
		fontWeight: '600',
		fontFamily: 'Inter-SemiBold',
		flex: 1,
	},
	removeButton: {
		padding: 4,
	},
	itemDetails: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	itemDetailText: {
		fontSize: 14,
		fontFamily: 'Inter-Regular',
	},
	itemCost: {
		fontSize: 14,
		fontWeight: '600',
		fontFamily: 'Inter-SemiBold',
	},
	priorityBadge: {
		alignSelf: 'flex-start',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
	},
	priorityBadgeText: {
		fontSize: 10,
		fontWeight: '700',
		fontFamily: 'Inter-Bold',
	},
	emptyText: {
		fontSize: 14,
		textAlign: 'center',
		paddingVertical: 24,
		fontFamily: 'Inter-Regular',
	},
	footer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		padding: 16,
		borderTopWidth: 1,
	},
	submitButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 16,
		borderRadius: 12,
		gap: 8,
	},
	submitButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '700',
		fontFamily: 'Inter-Bold',
	},
});
