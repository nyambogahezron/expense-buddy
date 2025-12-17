import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { CATEGORIES, TransactionCategory } from '@/types/transaction';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface CategoryFilterProps {
	selectedCategory: TransactionCategory | null;
	onSelectCategory: (category: TransactionCategory | null) => void;
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
						backgroundColor: selectedCategory === null ? '#6366F1' : '#F3F4F6',
					},
				]}
				onPress={() => onSelectCategory(null)}
			>
				<Text
					style={[
						styles.chipText,
						{ color: selectedCategory === null ? '#FFFFFF' : '#374151' },
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
								backgroundColor: selectedCategory === key ? color : '#F3F4F6',
							},
						]}
						onPress={() => onSelectCategory(key as TransactionCategory)}
					>
						<Text
							style={[
								styles.chipText,
								{
									color: selectedCategory === key ? '#FFFFFF' : '#374151',
								},
							]}
						>
							{label}
						</Text>
					</TouchableOpacity>
				</Animated.View>
			))}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 20,
		paddingVertical: 12,
		gap: 8,
	},
	chip: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		height: 35,
	},
	chipText: {
		fontSize: 14,
		fontFamily: 'Inter-SemiBold',
	},
});
