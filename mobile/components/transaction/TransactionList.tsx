import React, { useCallback, useRef } from 'react';
import { StyleSheet, Text, View, SectionList } from 'react-native';
import TransactionItem from './TransactionItem';
import Animated, {
	FadeInDown,
	Layout,
	useAnimatedStyle,
	withSpring,
} from 'react-native-reanimated';
import { Transaction } from '@/types/transaction';
import { formatDate } from '@/utils/helpers';
import Swipeable, {
	SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useThemeStore } from '@/store/theme';
import { useTransactionStore } from '@/store/transactions';
import { Trash2 } from 'lucide-react-native';

interface TransactionListProps {
	transactions: Transaction[];
	onTransactionPress: (id: string) => void;
}

export default function TransactionList({
	transactions,
	onTransactionPress,
}: TransactionListProps) {
	const { theme } = useThemeStore();
	const { deleteTransaction } = useTransactionStore();
	const swipeableRefs = useRef<{ [key: string]: SwipeableMethods | null }>({});

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					scale: withSpring(1, {
						damping: 15,
						stiffness: 100,
					}),
				},
			],
		};
	});

	const groupedTransactions = React.useMemo(() => {
		const groups: { [key: string]: Transaction[] } = {};

		transactions.forEach((transaction) => {
			const date = new Date(transaction.date);
			const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

			if (!groups[dateStr]) {
				groups[dateStr] = [];
			}

			groups[dateStr].push(transaction);
		});

		return Object.keys(groups)
			.map((date) => ({
				title: date,
				data: groups[date],
			}))
			.sort(
				(a, b) => new Date(b.title).getTime() - new Date(a.title).getTime()
			);
	}, [transactions]);

	const renderSectionHeader = useCallback(
		({ section: { title } }: { section: { title: string } }) => {
			return (
				<Animated.View
					style={styles.sectionHeader}
					entering={FadeInDown.delay(100).springify()}
				>
					<Text style={styles.sectionHeaderText}>{formatDate(title)}</Text>
				</Animated.View>
			);
		},
		[]
	);

	const handleDelete = useCallback(
		(id: string) => {
			swipeableRefs.current[id]?.close();
			deleteTransaction(id);
		},
		[deleteTransaction]
	);

	const renderRightActions = useCallback(
		(transaction: Transaction) => {
			return (
				<Animated.View
					style={[
						styles.rightAction,
						{ backgroundColor: theme.colors.error },
						animatedStyle,
					]}
				>
					<Trash2 size={24} color='#FFFFFF' />
				</Animated.View>
			);
		},
		[theme, animatedStyle]
	);

	const renderItem = useCallback(
		({ item, index }: { item: Transaction; index: number }) => {
			return (
				<Animated.View
					entering={FadeInDown.delay(150 + index * 50).springify()}
					layout={Layout.springify()}
				>
					<Swipeable
						ref={(ref) => {
							swipeableRefs.current[item.id] = ref;
						}}
						renderRightActions={() => renderRightActions(item)}
						onSwipeableOpen={() => handleDelete(item.id)}
						overshootRight={false}
						rightThreshold={40}
					>
						<TransactionItem transaction={item} />
					</Swipeable>
				</Animated.View>
			);
		},
		[onTransactionPress, renderRightActions, handleDelete]
	);

	return (
		<View style={styles.container}>
			<SectionList
				scrollEnabled={false}
				sections={groupedTransactions}
				keyExtractor={(item, index) => `${item.id}-${index}`}
				renderItem={renderItem}
				renderSectionHeader={renderSectionHeader}
				stickySectionHeadersEnabled={false}
				contentContainerStyle={styles.listContent}
				showsVerticalScrollIndicator={false}
				initialNumToRender={10}
				ItemSeparatorComponent={() => <View style={styles.separator} />}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	listContent: {
		paddingHorizontal: 5,
		paddingBottom: 20,
	},
	sectionHeader: {
		paddingVertical: 8,
		marginVertical: 8,
		borderRadius: 8,
	},
	sectionHeaderText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#666',
		paddingHorizontal: 10,
	},
	separator: {
		height: 8,
	},
	rightAction: {
		justifyContent: 'center',
		alignItems: 'center',
		width: 80,
		height: '100%',
	},
});
