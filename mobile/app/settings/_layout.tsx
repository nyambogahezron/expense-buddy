import { Stack } from 'expo-router';

export default function SettingsLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: true,
				animation: 'slide_from_right',
			}}
		>
			<Stack.Screen
				name='index'
				options={{
					title: 'Settings',
					headerShown: true,
				}}
			/>
			<Stack.Screen
				name='theme'
				options={{
					title: 'Theme',
					headerShown: true,
				}}
			/>
		</Stack>
	);
}
