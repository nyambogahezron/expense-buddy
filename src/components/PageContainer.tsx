import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

interface PageContainerProps {
	children: React.ReactNode;
	style?: any;
}

export default function PageContainer({ children, style }: PageContainerProps) {
	return (
		<View style={[styles.container, style]}>
			<View style={styles.content}>{children}</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: '100%',
	},
	content: {
		flex: 1,
		width: '100%',
		...(Platform.OS === 'web' && {
			maxWidth: 1200,
			marginHorizontal: 'auto',
		}),
	},
});
