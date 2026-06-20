import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import colors from '../src/constants/colors';

interface EmptyStateProps {
	message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
	return (
		<Animated.View style={styles.container} entering={FadeIn.duration(300)}>
			<Feather name='inbox' size={60} color='#ccc' />
			<Text style={styles.message}>{message}</Text>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	container: {
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 40,
	},
	message: {
		marginTop: 16,
		fontSize: 16,
		color: '#666',
		textAlign: 'center',
	},
});

export default EmptyState;
