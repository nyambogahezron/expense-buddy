import { router, Stack } from 'expo-router';
import { useEffect } from 'react';

export default function OnboardingLayout() {
	const skipForDev = true;

	useEffect(() => {
		if (skipForDev) {
			router.replace('/(tabs)/transactions');
		}
	}, [skipForDev]);

	return (
		<Stack
			screenOptions={{
				statusBarStyle: 'light',
				statusBarBackgroundColor: 'transparent',
				headerShown: false,
				animation: 'fade',
			}}
		/>
	);
}
