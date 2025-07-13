import React, { memo } from 'react';
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from 'react-native-reanimated';
import { Transaction } from '@/types';
import { CATEGORIES } from '@/constants/categories';
import { formatCurrency, formatTime } from '@/utils/helpers';
import { router } from 'expo-router';
import { useThemeStore } from '@/store/theme';
import { useCategoryStore } from '@/store/categories';

interface TransactionItemProps {
	transaction: Transaction;
	style?: ViewStyle;
}

const TransactionItem = ({ transaction, style }: TransactionItemProps) => {
	const { theme } = useThemeStore();
	const { categories } = useCategoryStore();
	const scale = useSharedValue(1);

	const getCategoryDetails = (categoryId: string) => {
		// First try to find in default categories
		const defaultCategory = CATEGORIES.find((cat) => cat.id === categoryId);
		if (defaultCategory) return defaultCategory;

		// Then try to find in custom categories
		const customCategory = categories.find((cat) => cat.id === categoryId);
		if (customCategory) return customCategory;

		// Fallback
		return {
			name: categoryId,
			icon: 'help-circle',
			color: theme.colors.success,
		};
	};

	const category = getCategoryDetails(transaction.category);

	const handlePress = () => {
		router.push(`/transactions/${transaction.id}`);
	};

	const handlePressIn = () => {
		scale.value = withSpring(0.97);
	};

	const handlePressOut = () => {
		scale.value = withSpring(1);
	};

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ scale: scale.value }],
		};
	});

	return (
		<Animated.View style={[animatedStyle, style]}>
			<TouchableOpacity
				style={styles.touchable}
				onPress={handlePress}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				activeOpacity={0.9}
			>
				<View
					style={[styles.iconContainer, { backgroundColor: category.color }]}
				>
					<Feather name={category.icon as any} size={20} color='#fff' />
				</View>

				<View style={styles.details}>
					<View style={styles.topRow}>
						<Text
							style={[styles.description, { color: theme.colors.text }]}
							numberOfLines={1}
						>
							{transaction.description}
						</Text>
						<Text
							style={[
								styles.amount,
								transaction.type === 'income'
									? styles.incomeAmount
									: styles.expenseAmount,
							]}
						>
							{transaction.type === 'income' ? '+' : '-'}
							{formatCurrency(transaction.amount)}
						</Text>
					</View>

					<View style={styles.bottomRow}>
						<Text
							style={{
								fontSize: 14,
								color: theme.colors.textSecondary,
							}}
						>
							{category.name}
						</Text>
						<Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
							{formatTime(transaction.date)}
						</Text>
					</View>
				</View>
			</TouchableOpacity>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	touchable: {
		flexDirection: 'row',
		padding: 16,
		alignItems: 'center',
	},
	iconContainer: {
		width: 45,
		height: 45,
		borderRadius: 12,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	details: {
		flex: 1,
	},
	topRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 6,
	},
	description: {
		fontSize: 16,
		fontWeight: '500',
		flex: 1,
		marginRight: 8,
	},
	amount: {
		fontSize: 16,
		fontWeight: '600',
	},
	incomeAmount: {
		color: '#2ecc71',
	},
	expenseAmount: {
		color: '#e74c3c',
	},
	bottomRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
});

export default memo(TransactionItem);
