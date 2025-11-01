import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useThemeStore } from '@/store/theme';
import { useShoppingStore } from '@/store/shopping';
import { Plus, Check } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function ShoppingListsScreen() {
	const { theme } = useThemeStore();
	const { lists, selectList, toggleItemPurchased } = useShoppingStore();

	const handleListPress = (list: any) => {
		selectList(list);
		router.push('/shopping/[id]');
	};

	return (
		<View
			style={[styles.container, { backgroundColor: theme.colors.background }]}
		>
			<View style={styles.header}>
				<Text style={[styles.title, { color: theme.colors.text }]}>
					Shopping Lists
				</Text>
				<Pressable
					onPress={() => router.push('/shopping/new')}
					style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
				>
					<Plus size={24} color='#FFFFFF' />
				</Pressable>
			</View>

			<ScrollView style={styles.content}>
				{lists.map((list, index) => (
					<Animated.View
						key={list.id}
						entering={FadeInUp.delay(index * 100)}
						style={[
							styles.listCard,
							{
								backgroundColor: theme.colors.surface,
								borderColor: theme.colors.border,
							},
						]}
					>
						<Pressable
							onPress={() => handleListPress(list)}
							style={styles.listContent}
						>
							<View style={styles.listHeader}>
								<Text style={[styles.listName, { color: theme.colors.text }]}>
									{list.name}
								</Text>
								<Text
									style={[styles.listAmount, { color: theme.colors.primary }]}
								>
									${list.totalEstimatedCost.toLocaleString()}
								</Text>
							</View>

							{list.store && (
								<Text
									style={[
										styles.storeText,
										{ color: theme.colors.textSecondary },
									]}
								>
									{list.store}
								</Text>
							)}

							<View style={styles.itemsList}>
								{list.items.map((item) => (
									<Pressable
										key={item.id}
										onPress={() => toggleItemPurchased(list.id, item.id)}
										style={[
											styles.itemRow,
											{
												backgroundColor: theme.colors.background,
												opacity: item.purchased ? 0.6 : 1,
											},
										]}
									>
										<View
											style={[
												styles.checkbox,
												{
													backgroundColor: item.purchased
														? theme.colors.primary
														: 'transparent',
													borderColor: theme.colors.primary,
												},
											]}
										>
											{item.purchased && <Check size={16} color='#FFFFFF' />}
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
												{item.quantity}x · $
												{item.estimatedCost.toLocaleString()}
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
								))}
							</View>
						</Pressable>
					</Animated.View>
				))}
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
	title: {
		fontSize: 32,
		fontFamily: 'Inter-Bold',
	},
	addButton: {
		width: 48,
		height: 48,
		borderRadius: 24,
		justifyContent: 'center',
		alignItems: 'center',
	},
	content: {
		flex: 1,
		padding: 20,
	},
	listCard: {
		borderRadius: 16,
		padding: 20,
		marginBottom: 16,
		borderWidth: 1,
	},
	listContent: {
		gap: 16,
	},
	listHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	listName: {
		fontSize: 20,
		fontFamily: 'Inter-SemiBold',
	},
	listAmount: {
		fontSize: 20,
		fontFamily: 'Inter-Bold',
	},
	storeText: {
		fontSize: 14,
		fontFamily: 'Inter-Regular',
	},
	itemsList: {
		gap: 12,
	},
	itemRow: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		borderRadius: 12,
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
