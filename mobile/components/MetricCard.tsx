import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '@/store/theme';
import Animated, { FadeIn } from 'react-native-reanimated';
import {
	ArrowDown as ArrowDownIcon,
	ArrowUp as ArrowUpIcon,
} from 'lucide-react-native';

interface MetricCardProps {
	title: string;
	value: string;
	change: number;
	prefix?: string;
}

function MetricCard({ title, value, change, prefix = '$' }: MetricCardProps) {
	const { theme } = useThemeStore();

	return (
		<Animated.View
			entering={FadeIn}
			style={[
				styles.container,
				{
					backgroundColor: theme.colors.surface,
					borderColor: theme.colors.border,
				},
			]}
		>
			<Text style={[styles.title, { color: theme.colors.textSecondary }]}>
				{title}
			</Text>
			<Text style={[styles.value, { color: theme.colors.text }]}>
				{prefix}
				{value}
			</Text>
			<View style={styles.changeContainer}>
				{change > 0 ? (
					<ArrowUpIcon size={16} color={theme.colors.success} />
				) : (
					<ArrowDownIcon size={16} color={theme.colors.error} />
				)}
				<Text
					style={[
						styles.changeText,
						{
							color: change > 0 ? theme.colors.success : theme.colors.error,
						},
					]}
				>
					{Math.abs(change)}%
				</Text>
			</View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
		flex: 1,
	},
	title: {
		fontSize: 14,
		fontFamily: 'Inter-Regular',
		marginBottom: 4,
	},
	value: {
		fontSize: 24,
		fontFamily: 'Inter-Bold',
		marginBottom: 8,
	},
	changeContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	changeText: {
		fontSize: 14,
		fontFamily: 'Inter-SemiBold',
	},
});

export default memo(MetricCard);
