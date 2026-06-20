import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { CATEGORIES, TransactionCategory } from '@/types/transaction';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { design } from '@/constants/design'

interface CategoryFilterProps {
	selectedCategory: TransactionCategory | null
	onSelectCategory: (category: TransactionCategory | null) => void
}

export function CategoryFilter({
	selectedCategory,
	onSelectCategory,
}: CategoryFilterProps) {
	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={styles.container}
		>
			<TouchableOpacity
				style={[
					styles.chip,
					{
						backgroundColor:
							selectedCategory === null
								? design.colors.primary
								: design.colors.surface,
						borderColor:
							selectedCategory === null
								? design.colors.primary
								: design.colors.border,
					},
				]}
				onPress={() => onSelectCategory(null)}
			>
				<Text
					style={[
						styles.chipText,
						{
							color:
								selectedCategory === null
									? '#FFFFFF'
									: design.colors.textSecondary,
						},
					]}
				>
					All
				</Text>
			</TouchableOpacity>
			{Object.entries(CATEGORIES).map(([key, { label, color }]) => (
				<Animated.View key={key} entering={FadeIn} exiting={FadeOut}>
					<TouchableOpacity
						style={[
							styles.chip,
							{
								backgroundColor:
									selectedCategory === key
										? color + '20'
										: design.colors.surface,
								borderColor:
									selectedCategory === key ? color : design.colors.border,
							},
						]}
						onPress={() => onSelectCategory(key as TransactionCategory)}
					>
						<Text
							style={[
								styles.chipText,
								{
									color:
										selectedCategory === key
											? color
											: design.colors.textSecondary,
								},
							]}
						>
							{label}
						</Text>
					</TouchableOpacity>
				</Animated.View>
			))}
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: design.spacing.lg,
		paddingVertical: design.spacing.sm,
		gap: design.spacing.sm,
	},
	chip: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: design.borderRadius.pill,
		borderWidth: 1,
	},
	chipText: {
		...design.typography.body,
		fontFamily: 'Inter-Medium',
	},
})
