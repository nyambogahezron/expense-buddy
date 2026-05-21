import { Stack } from 'expo-router';

export default function OnboardingLayout() {
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
