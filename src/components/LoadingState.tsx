import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, ActivityIndicator, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function LoadingState({ message = 'Loading transactions...' }) {
	return (
		<Animated.View style={styles.container} entering={FadeIn.duration(300)}>
			<ActivityIndicator size='large' color={Colors.primary} />
			<Text style={styles.message}>{message}</Text>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#f5f5f5',
		padding: 20,
	},
	message: {
		marginTop: 16,
		fontSize: 16,
		color: '#666',
		textAlign: 'center',
	},
});
