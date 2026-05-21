import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useThemeStore } from '@/store/theme';
import { CATEGORIES } from '@/types/transaction';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Filter } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useState } from 'react';

interface TransactionFiltersProps {
	startDate: Date;
	endDate: Date;
	selectedCategory: string | null;
	transactionType: 'all' | 'income' | 'expense';
	selectedBudget: string | null;
	onStartDateChange: (date: Date) => void;
	onEndDateChange: (date: Date) => void;
	onCategoryChange: (category: string | null) => void;
	onTypeChange: (type: 'all' | 'income' | 'expense') => void;
	onBudgetChange: (budget: string | null) => void;
}

export function TransactionFilters({
	startDate,
	endDate,
	selectedCategory,
	transactionType,
	selectedBudget,
	onStartDateChange,
	onEndDateChange,
	onCategoryChange,
	onTypeChange,
	onBudgetChange,
}: TransactionFiltersProps) {
	const { theme } = useThemeStore();
	const [showStartDate, setShowStartDate] = useState(false);
	const [showEndDate, setShowEndDate] = useState(false);
	const [showFilters, setShowFilters] = useState(false);

	return (
		<View style={styles.container}>
			<Pressable
				onPress={() => setShowFilters(!showFilters)}
				style={[
					styles.filterButton,
					{
						backgroundColor: theme.colors.surface,
						borderColor: theme.colors.border,
					},
				]}
			>
				<Filter size={20} color={theme.colors.text} />
				<Text style={[styles.filterButtonText, { color: theme.colors.text }]}>
					Filters
				</Text>
			</Pressable>

			{showFilters && (
				<Animated.View
					entering={FadeIn}
					style={[
						styles.filtersPanel,
						{
							backgroundColor: theme.colors.surface,
							borderColor: theme.colors.border,
						},
					]}
				>
					<View style={styles.filterSection}>
						<Text style={[styles.filterTitle, { color: theme.colors.text }]}>
							Date Range
						</Text>
						<View style={styles.dateButtons}>
							<Pressable
								onPress={() => setShowStartDate(true)}
								style={[
									styles.dateButton,
									{ backgroundColor: theme.colors.background },
								]}
							>
								<Calendar size={20} color={theme.colors.textSecondary} />
								<Text style={[styles.dateText, { color: theme.colors.text }]}>
									{startDate.toLocaleDateString()}
								</Text>
							</Pressable>
							<Text
								style={[styles.dateSeperator, { color: theme.colors.text }]}
							>
								to
							</Text>
							<Pressable
								onPress={() => setShowEndDate(true)}
								style={[
									styles.dateButton,
									{ backgroundColor: theme.colors.background },
								]}
							>
								<Calendar size={20} color={theme.colors.textSecondary} />
								<Text style={[styles.dateText, { color: theme.colors.text }]}>
									{endDate.toLocaleDateString()}
								</Text>
							</Pressable>
						</View>
					</View>

					<View style={styles.filterSection}>
						<Text style={[styles.filterTitle, { color: theme.colors.text }]}>
							Transaction Type
						</Text>
						<View style={styles.typeButtons}>
							{(['all', 'income', 'expense'] as const).map((type) => (
								<Pressable
									key={type}
									onPress={() => onTypeChange(type)}
									style={[
										styles.typeButton,
										{
											backgroundColor:
												transactionType === type
													? theme.colors.primary
													: theme.colors.background,
										},
									]}
								>
									<Text
										style={[
											styles.typeButtonText,
											{
												color:
													transactionType === type
														? '#FFFFFF'
														: theme.colors.text,
											},
										]}
									>
										{type.charAt(0).toUpperCase() + type.slice(1)}
									</Text>
								</Pressable>
							))}
						</View>
					</View>

					<View style={styles.filterSection}>
						<Text style={[styles.filterTitle, { color: theme.colors.text }]}>
							Categories
						</Text>
						<View style={styles.categoryGrid}>
							{Object.entries(CATEGORIES).map(([key, { label, color }]) => (
								<Pressable
									key={key}
									onPress={() =>
										onCategoryChange(key === selectedCategory ? null : key)
									}
									style={[
										styles.categoryButton,
										{
											backgroundColor:
												key === selectedCategory
													? color
													: theme.colors.background,
										},
									]}
								>
									<Text
										style={[
											styles.categoryButtonText,
											{
												color:
													key === selectedCategory
														? '#FFFFFF'
														: theme.colors.text,
											},
										]}
									>
										{label}
									</Text>
								</Pressable>
							))}
						</View>
					</View>
				</Animated.View>
			)}

			{showStartDate && (
				<DateTimePicker
					value={startDate}
					mode='date'
					onChange={(event, selectedDate) => {
						setShowStartDate(false);
						if (selectedDate) {
							onStartDateChange(selectedDate);
						}
					}}
				/>
			)}

			{showEndDate && (
				<DateTimePicker
					value={endDate}
					mode='date'
					onChange={(event, selectedDate) => {
						setShowEndDate(false);
						if (selectedDate) {
							onEndDateChange(selectedDate);
						}
					}}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 20,
	},
	filterButton: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		borderRadius: 8,
		borderWidth: 1,
		gap: 8,
	},
	filterButtonText: {
		fontSize: 14,
		fontFamily: 'Inter-Medium',
	},
	filtersPanel: {
		marginTop: 12,
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
		gap: 20,
	},
	filterSection: {
		gap: 12,
	},
	filterTitle: {
		fontSize: 16,
		fontFamily: 'Inter-SemiBold',
	},
	dateButtons: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	dateButton: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		borderRadius: 8,
		gap: 8,
	},
	dateText: {
		fontSize: 14,
		fontFamily: 'Inter-Regular',
	},
	dateSeperator: {
		fontSize: 14,
		fontFamily: 'Inter-Regular',
	},
	typeButtons: {
		flexDirection: 'row',
		gap: 8,
	},
	typeButton: {
		flex: 1,
		padding: 12,
		borderRadius: 8,
		alignItems: 'center',
	},
	typeButtonText: {
		fontSize: 14,
		fontFamily: 'Inter-SemiBold',
	},
	categoryGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	categoryButton: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 6,
	},
	categoryButtonText: {
		fontSize: 14,
		fontFamily: 'Inter-SemiBold',
	},
});
