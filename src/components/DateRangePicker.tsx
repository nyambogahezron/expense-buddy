import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeStore } from '@/store/theme';
import { Calendar } from 'lucide-react-native';

interface DateRangePickerProps {
	startDate: Date;
	endDate: Date;
	onPress: () => void;
}

export function DateRangePicker({
	startDate,
	endDate,
	onPress,
}: DateRangePickerProps) {
	const { theme } = useThemeStore();

	return (
		<TouchableOpacity
			onPress={onPress}
			style={[
				styles.container,
				{
					backgroundColor: theme.colors.surface,
					borderColor: theme.colors.border,
				},
			]}
		>
			<Calendar size={20} color={theme.colors.primary} />
			<Text style={[styles.text, { color: theme.colors.text }]}>
				{startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
			</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		borderRadius: 8,
		borderWidth: 1,
		gap: 8,
	},
	text: {
		fontSize: 14,
		fontFamily: 'Inter-Regular',
	},
});
