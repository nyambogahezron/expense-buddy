import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated';
import {
	ArrowDown as ArrowDownIcon,
	ArrowUp as ArrowUpIcon,
} from 'lucide-react-native'
import { design } from '@/constants/design'

interface MetricCardProps {
	title: string
	value: string
	change: number
	prefix?: string
}

function MetricCard({ title, value, change, prefix = '$' }: MetricCardProps) {
	return (
		<Animated.View
			entering={FadeIn}
			style={[
				styles.container,
				{
					backgroundColor: design.colors.surface,
					borderColor: design.colors.border,
				},
			]}
		>
			<Text style={[styles.title, { color: design.colors.textSecondary }]}>
				{title}
			</Text>
			<Text style={[styles.value, { color: design.colors.text }]}>
				{prefix}
				{value}
			</Text>
			<View style={styles.changeContainer}>
				{change > 0 ? (
					<ArrowUpIcon size={16} color={design.colors.success} />
				) : (
					<ArrowDownIcon size={16} color={design.colors.error} />
				)}
				<Text
					style={[
						styles.changeText,
						{
							color: change > 0 ? design.colors.success : design.colors.error,
						},
					]}
				>
					{Math.abs(change)}%
				</Text>
			</View>
		</Animated.View>
	)
}

const styles = StyleSheet.create({
	container: {
		padding: design.spacing.md,
		borderRadius: design.borderRadius.xl,
		borderWidth: 1,
		flex: 1,
	},
	title: {
		...design.typography.caption,
		marginBottom: 4,
	},
	value: {
		...design.typography.h3,
		marginBottom: 8,
	},
	changeContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	changeText: {
		...design.typography.caption,
		fontFamily: 'Inter-SemiBold',
	},
})

export default memo(MetricCard);
