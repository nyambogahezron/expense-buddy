import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface ErrorStateProps {
	message: string;
	onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
	return (
		<Animated.View style={styles.container} entering={FadeIn.duration(300)}>
			<Feather name='alert-circle' size={60} color={Colors.error} />
			<Text style={styles.errorText}>{message}</Text>
			<TouchableOpacity style={styles.retryButton} onPress={onRetry}>
				<Feather name='refresh-cw' size={16} color='#fff' />
				<Text style={styles.retryText}>Retry</Text>
			</TouchableOpacity>
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
	errorText: {
		marginTop: 16,
		marginBottom: 24,
		fontSize: 16,
		color: '#666',
		textAlign: 'center',
	},
	retryButton: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: Colors.primary,
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 8,
	},
	retryText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '500',
		marginLeft: 8,
	},
});
