import { StyleSheet, Text, View } from 'react-native';
import { Transaction } from '@/types/transaction';
import { format } from 'date-fns';
import { CATEGORIES } from '@/types/transaction';
import Animated, {
	FadeInRight,
	FadeOutLeft,
	withRepeat,
	withTiming,
	useAnimatedStyle,
} from 'react-native-reanimated';
import { useThemeStore } from '@/store/theme';

interface TransactionItemProps {
	transaction: Transaction;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
	const { amount, date, category, type, description } = transaction;
	const { color } = CATEGORIES[category];
	const { theme } = useThemeStore();

	return (
		<Animated.View
			entering={FadeInRight}
			exiting={FadeOutLeft}
			style={[styles.container, { backgroundColor: theme.colors.surface }]}
		>
			<View style={styles.left}>
				<View style={[styles.categoryDot, { backgroundColor: color }]} />
				<View>
					<Text style={styles.description}>{description}</Text>
					<Text style={styles.date}>
						{format(new Date(date), 'MMM d, yyyy h:mm a')}
					</Text>
				</View>
			</View>
			<Text
				style={[
					styles.amount,
					{ color: type === 'income' ? '#10B981' : '#EF4444' },
				]}
			>
				{type === 'income' ? '+' : '-'}${amount.toLocaleString()}
			</Text>
		</Animated.View>
	);
}

export function TransactionSkeleton() {
	const { theme } = useThemeStore();
	const animatedStyle = useAnimatedStyle(() => ({
		opacity: withRepeat(withTiming(0.5, { duration: 1000 }), -1, true),
	}));

	return (
		<Animated.View
			style={[
				styles.container,
				{ backgroundColor: theme.colors.surface },
				animatedStyle,
			]}
		>
			<View style={styles.left}>
				<View style={[styles.categoryDot, { backgroundColor: '#E5E7EB' }]} />
				<View>
					<View style={[styles.skeletonText, { width: 120 }]} />
					<View style={[styles.skeletonText, { width: 80, marginTop: 4 }]} />
				</View>
			</View>
			<View style={[styles.skeletonText, { width: 60 }]} />
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 16,
		backgroundColor: '#FFFFFF',
		paddingHorizontal: 20,
		marginHorizontal: 20,
		marginBottom: 12,
		borderRadius: 12,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	left: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	categoryDot: {
		width: 12,
		height: 12,
		borderRadius: 6,
	},
	description: {
		fontSize: 16,
		fontFamily: 'Inter-SemiBold',
		color: '#1F2937',
		marginBottom: 4,
	},
	date: {
		fontSize: 14,
		fontFamily: 'Inter-Regular',
		color: '#6B7280',
	},
	amount: {
		fontSize: 16,
		fontFamily: 'Inter-SemiBold',
	},
	skeletonText: {
		height: 16,
		backgroundColor: '#E5E7EB',
		borderRadius: 4,
	},
});
