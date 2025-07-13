import { router, Stack } from 'expo-router';

export default function OnboardingLayout() {
	const skipForDev = true;

	if (skipForDev) {
		router.replace('/(tabs)/transactions');
	}
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
