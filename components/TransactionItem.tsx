import { StyleSheet, Text, View } from 'react-native';
import { Transaction } from '@/types/transaction';
import { format } from 'date-fns';
import { CATEGORIES } from '@/types/transaction';
import Animated, {
	FadeInDown,
	withRepeat,
	withTiming,
	useAnimatedStyle,
} from 'react-native-reanimated'
import { design } from '@/constants/design'
import { Feather } from '@expo/vector-icons'

interface TransactionItemProps {
	transaction: Transaction
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
	const { amount, date, category, type, description } = transaction
	const catData = CATEGORIES[category] || CATEGORIES['other']

	return (
		<Animated.View entering={FadeInDown.springify()} style={styles.container}>
			<View style={styles.left}>
				<View
					style={[
						styles.iconContainer,
						{ backgroundColor: catData.color + '20' },
					]}
				>
					<Feather name='tag' size={20} color={catData.color} />
				</View>
				<View style={styles.details}>
					<Text style={styles.description} numberOfLines={1}>
						{description}
					</Text>
					<Text style={styles.date}>
						{format(new Date(date), 'MMM d, yyyy h:mm a')}
					</Text>
				</View>
			</View>
			<Text
				style={[
					styles.amount,
					{
						color:
							type === 'income' ? design.colors.success : design.colors.text,
					},
				]}
			>
				{type === 'income' ? '+' : '-'}${amount.toFixed(2)}
			</Text>
		</Animated.View>
	)
}

export function TransactionSkeleton() {
	const animatedStyle = useAnimatedStyle(() => ({
		opacity: withRepeat(withTiming(0.5, { duration: 1000 }), -1, true),
	}))

	return (
		<Animated.View style={[styles.container, animatedStyle]}>
			<View style={styles.left}>
				<View
					style={[
						styles.iconContainer,
						{ backgroundColor: design.colors.border },
					]}
				/>
				<View style={styles.details}>
					<View style={[styles.skeletonText, { width: 120 }]} />
					<View style={[styles.skeletonText, { width: 80, marginTop: 8 }]} />
				</View>
			</View>
			<View style={[styles.skeletonText, { width: 60 }]} />
		</Animated.View>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: design.spacing.md,
		paddingHorizontal: design.spacing.md,
		backgroundColor: design.colors.surface,
		marginBottom: design.spacing.sm,
		borderRadius: design.borderRadius.lg,
		borderWidth: 1,
		borderColor: design.colors.border,
	},
	left: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: design.spacing.md,
		flex: 1,
	},
	iconContainer: {
		width: 48,
		height: 48,
		borderRadius: design.borderRadius.md,
		alignItems: 'center',
		justifyContent: 'center',
	},
	details: {
		flex: 1,
		paddingRight: design.spacing.sm,
	},
	description: {
		...design.typography.subtitle,
		color: design.colors.text,
		marginBottom: 4,
	},
	date: {
		...design.typography.caption,
		color: design.colors.textSecondary,
	},
	amount: {
		...design.typography.h3,
	},
	skeletonText: {
		height: 16,
		backgroundColor: design.colors.borderDark,
		borderRadius: 4,
	},
})
