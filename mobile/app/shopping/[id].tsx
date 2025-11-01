import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useThemeStore } from '@/store/theme';
import { useShoppingStore } from '@/store/shopping';
import {
	ArrowLeft,
	CreditCard as Edit2,
	Trash,
	Plus,
	Check,
} from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function ShoppingListDetailScreen() {
	const { theme } = useThemeStore();
	const { selectedList, deleteList, toggleItemPurchased } = useShoppingStore();
	const params = useLocalSearchParams();

	if (!selectedList) {
		return null;
	}

	const purchasedItems = selectedList.items.filter((item) => item.purchased);
	const remainingItems = selectedList.items.filter((item) => !item.purchased);

	const handleDelete = () => {
		deleteList(selectedList.id);
		router.back();
	};

	return (
		<View
			style={[styles.container, { backgroundColor: theme.colors.background }]}
		>
			<View style={styles.header}>
				<Pressable onPress={() => router.back()} style={styles.backButton}>
					<ArrowLeft size={24} color={theme.colors.text} />
				</Pressable>
				<Text style={[styles.title, { color: theme.colors.text }]}>
					{selectedList.name}
				</Text>
				<View style={styles.actions}>
					<Pressable
						onPress={() => router.push('/shopping/edit')}
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

			<ScrollView style={styles.content}>
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
							Total Items
						</Text>
						<Text style={[styles.summaryValue, { color: theme.colors.text }]}>
							{selectedList.items.length}
						</Text>
					</View>
					<View style={styles.summaryRow}>
						<Text
							style={[
								styles.summaryLabel,
								{ color: theme.colors.textSecondary },
							]}
						>
							Purchased
						</Text>
						<Text
							style={[styles.summaryValue, { color: theme.colors.success }]}
						>
							{purchasedItems.length}
						</Text>
					</View>
					<View style={styles.summaryRow}>
						<Text
							style={[
								styles.summaryLabel,
								{ color: theme.colors.textSecondary },
							]}
						>
							Estimated Cost
						</Text>
						<Text
							style={[styles.summaryValue, { color: theme.colors.primary }]}
						>
							${selectedList.totalEstimatedCost.toLocaleString()}
						</Text>
					</View>
				</Animated.View>

				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
							Remaining Items
						</Text>
						<Pressable
							onPress={() => router.push('/shopping/add-item')}
							style={[
								styles.addButton,
								{ backgroundColor: theme.colors.primary },
							]}
						>
							<Plus size={20} color='#FFFFFF' />
						</Pressable>
					</View>
					{remainingItems.map((item) => (
						<Animated.View
							key={item.id}
							entering={FadeIn}
							style={[
								styles.itemCard,
								{
									backgroundColor: theme.colors.surface,
									borderColor: theme.colors.border,
								},
							]}
						>
							<Pressable
								onPress={() => toggleItemPurchased(selectedList.id, item.id)}
								style={styles.itemContent}
							>
								<View
									style={[
										styles.checkbox,
										{
											borderColor: theme.colors.primary,
										},
									]}
								/>
								<View style={styles.itemInfo}>
									<Text style={[styles.itemName, { color: theme.colors.text }]}>
										{item.name}
									</Text>
									<Text
										style={[
											styles.itemDetails,
											{ color: theme.colors.textSecondary },
										]}
									>
										{item.quantity}x · ${item.estimatedCost.toLocaleString()}
									</Text>
								</View>
								<View
									style={[
										styles.priorityBadge,
										{
											backgroundColor:
												item.priority === 'high'
													? theme.colors.error + '20'
													: item.priority === 'medium'
													? theme.colors.accent + '20'
													: theme.colors.success + '20',
										},
									]}
								>
									<Text
										style={[
											styles.priorityText,
											{
												color:
													item.priority === 'high'
														? theme.colors.error
														: item.priority === 'medium'
														? theme.colors.accent
														: theme.colors.success,
											},
										]}
									>
										{item.priority}
									</Text>
								</View>
							</Pressable>
						</Animated.View>
					))}
				</View>

				{purchasedItems.length > 0 && (
					<View style={styles.section}>
						<Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
							Purchased Items
						</Text>
						{purchasedItems.map((item) => (
							<Animated.View
								key={item.id}
								entering={FadeIn}
								style={[
									styles.itemCard,
									{
										backgroundColor: theme.colors.surface,
										borderColor: theme.colors.border,
										opacity: 0.6,
									},
								]}
							>
								<Pressable
									onPress={() => toggleItemPurchased(selectedList.id, item.id)}
									style={styles.itemContent}
								>
									<View
										style={[
											styles.checkbox,
											{
												backgroundColor: theme.colors.primary,
												borderColor: theme.colors.primary,
											},
										]}
									>
										<Check size={16} color='#FFFFFF' />
									</View>
									<View style={styles.itemInfo}>
										<Text
											style={[styles.itemName, { color: theme.colors.text }]}
										>
											{item.name}
										</Text>
										<Text
											style={[
												styles.itemDetails,
												{ color: theme.colors.textSecondary },
											]}
										>
											{item.quantity}x · ${item.estimatedCost.toLocaleString()}
										</Text>
									</View>
								</Pressable>
							</Animated.View>
						))}
					</View>
				)}
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
		paddingTop: 60,
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
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 18,
		fontFamily: 'Inter-SemiBold',
	},
	addButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
	},
	itemCard: {
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
		marginBottom: 12,
	},
	itemContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	checkbox: {
		width: 24,
		height: 24,
		borderRadius: 6,
		borderWidth: 2,
		justifyContent: 'center',
		alignItems: 'center',
	},
	itemInfo: {
		flex: 1,
	},
	itemName: {
		fontSize: 16,
		fontFamily: 'Inter-SemiBold',
		marginBottom: 4,
	},
	itemDetails: {
		fontSize: 14,
		fontFamily: 'Inter-Regular',
	},
	priorityBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
	},
	priorityText: {
		fontSize: 12,
		fontFamily: 'Inter-SemiBold',
		textTransform: 'capitalize',
	},
});
