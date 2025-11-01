import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '@/types/theme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';

interface ThemePreviewProps {
	theme: Theme;
	isSelected: boolean;
	onSelect: () => void;
}

export function ThemePreview({
	theme,
	isSelected,
	onSelect,
}: ThemePreviewProps) {
	return (
		<TouchableOpacity
			onPress={onSelect}
			style={[
				styles.container,
				{
					borderColor: isSelected ? theme.colors.primary : theme.colors.border,
					backgroundColor: theme.colors.surface,
				},
			]}
		>
			<Animated.View entering={FadeIn} style={styles.content}>
				<View style={styles.header}>
					{theme.gradients ? (
						<LinearGradient
							colors={theme.gradients.primary as [string, string, ...string[]]}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 0 }}
							style={styles.headerGradient}
						/>
					) : (
						<View
							style={[
								styles.headerGradient,
								{ backgroundColor: theme.colors.primary },
							]}
						/>
					)}
				</View>
				<View style={styles.body}>
					<View
						style={[
							styles.colorPreview,
							{ backgroundColor: theme.colors.primary },
						]}
					/>
					<View
						style={[
							styles.colorPreview,
							{ backgroundColor: theme.colors.secondary },
						]}
					/>
					<View
						style={[
							styles.colorPreview,
							{ backgroundColor: theme.colors.accent },
						]}
					/>
				</View>
				<Text
					style={[
						styles.themeName,
						{
							color: theme.colors.text,
							fontFamily: 'Inter-SemiBold',
						},
					]}
				>
					{theme.name}
				</Text>
			</Animated.View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		borderRadius: 12,
		borderWidth: 2,
		overflow: 'hidden',
		width: 160,
		height: 160,
	},
	content: {
		flex: 1,
	},
	header: {
		height: 60,
		overflow: 'hidden',
	},
	headerGradient: {
		flex: 1,
	},
	body: {
		flexDirection: 'row',
		gap: 8,
		padding: 12,
	},
	colorPreview: {
		width: 24,
		height: 24,
		borderRadius: 12,
	},
	themeName: {
		fontSize: 16,
		textAlign: 'center',
		position: 'absolute',
		bottom: 12,
		left: 0,
		right: 0,
	},
});
