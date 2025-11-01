import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useThemeStore } from '@/store/theme';
import { useCategoryStore } from '@/store/categories';
import { ArrowLeft, Plus } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import TransactionItem from '@/components/transaction/TransactionItem';

export default function CategoryDetailScreen() {
	const { theme } = useThemeStore();
	const { selectedCategory } = useCategoryStore();

	if (!selectedCategory) {
		return null;
	}

	const totalAmount = selectedCategory.items.reduce(
		(sum, item) => sum + item.amount,
		0
	);

	return (
		<View
			style={[styles.container, { backgroundColor: theme.colors.background }]}
		>
			<View style={styles.header}>
				<Pressable onPress={() => router.back()} style={styles.backButton}>
					<ArrowLeft size={24} color={theme.colors.text} />
				</Pressable>
				<Text style={[styles.title, { color: theme.colors.text }]}>
					{selectedCategory.name}
				</Text>
				<Pressable
					onPress={() => router.push('/categories/new-transaction')}
					style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
				>
					<Plus size={24} color='#FFFFFF' />
				</Pressable>
			</View>

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
				<View style={styles.summaryItem}>
					<Text
						style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}
					>
						Total Transactions
					</Text>
					<Text style={[styles.summaryValue, { color: theme.colors.text }]}>
						{selectedCategory.itemCount}
					</Text>
				</View>
				<View style={styles.summaryItem}>
					<Text
						style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}
					>
						Total Amount
					</Text>
					<Text style={[styles.summaryValue, { color: theme.colors.text }]}>
						${totalAmount.toLocaleString()}
					</Text>
				</View>
			</Animated.View>

			<ScrollView style={styles.transactionsList}>
				{/* {selectedCategory.items.map((transaction, index) => (
          <TransactionItem transaction={transaction} />
        ))} */}
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
	},
	backButton: {
		padding: 8,
	},
	title: {
		fontSize: 24,
		fontFamily: 'Inter-Bold',
	},
	addButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	summaryCard: {
		margin: 20,
		padding: 20,
		borderRadius: 16,
		borderWidth: 1,
		flexDirection: 'row',
		justifyContent: 'space-around',
	},
	summaryItem: {
		alignItems: 'center',
	},
	summaryLabel: {
		fontSize: 14,
		fontFamily: 'Inter-Regular',
		marginBottom: 4,
	},
	summaryValue: {
		fontSize: 24,
		fontFamily: 'Inter-Bold',
	},
	transactionsList: {
		flex: 1,
	},
});
