import { StyleSheet, View, ViewStyle } from 'react-native';
import React from 'react';
import { Platform } from 'react-native';
import { useThemeStore } from '@/store/theme';

interface ContentWrapperProps {
	children: React.ReactNode;
	style?: ViewStyle;
}

export default function ContentWrapper({
	children,
	style,
}: ContentWrapperProps) {
	const { theme } = useThemeStore();
	return (
		<View
			style={[
				styles.container,
				style,
				{ backgroundColor: theme.colors.background },
			]}
		>
			{children}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: '100%',
		...Platform.select({
			web: {
				width: '100%',
				maxWidth: 1200,
				marginHorizontal: 'auto',
			},
		}),
	},
});
