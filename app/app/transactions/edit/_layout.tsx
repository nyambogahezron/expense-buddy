import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function EditTransactionLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				animation: 'fade',
				headerStyle: {
					...(Platform.OS === 'web' && {}),
				},
			}}
		>
			<Stack.Screen name='[id]' />
		</Stack>
	);
}
