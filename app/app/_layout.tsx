import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
	useFonts,
	Inter_400Regular,
	Inter_500Medium,
	Inter_600SemiBold,
	Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useThemeStore } from '@/store/theme';
import { useAppLock } from '@/hooks/useAppLock';
import { useState, useEffect } from 'react';
import { AppState } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '../drizzle/migrations';
import { db } from '@/db';
import { initializeCategories } from '@/services/db/init';

SystemUI.setBackgroundColorAsync('transparent');

const queryClient = new QueryClient();

export default function RootLayout() {
	const { success, error } = useMigrations(db, migrations);
	useDrizzleStudio(db.$client);

	const { theme } = useThemeStore();
	const { isLocked, showOverlay, unlock, showAppOverlay, hideAppOverlay } =
		useAppLock();
	const [appState, setAppState] = useState(AppState.currentState);

	const [fontsLoaded] = useFonts({
		'Inter-Regular': Inter_400Regular,
		'Inter-Medium': Inter_500Medium,
		'Inter-SemiBold': Inter_600SemiBold,
		'Inter-Bold': Inter_700Bold,
	});

	useEffect(() => {
		const subscription = AppState.addEventListener('change', (nextAppState) => {
			if (appState.match(/inactive|background/) && nextAppState === 'active') {
				// App has come to the foreground
				hideAppOverlay();
			} else if (nextAppState.match(/inactive|background/)) {
				// App has gone to the background
				showAppOverlay();
			}
			setAppState(nextAppState);
		});

		return () => {
			subscription.remove();
		};
	}, [appState, hideAppOverlay, showAppOverlay]);

	useEffect(() => {
		// Initialize categories after successful migration
		if (success) {
			initializeCategories();
		}
	}, [success]);

	if (error) {
		console.error('Migration error:', error);
	}

	if (!fontsLoaded || !success) {
		return null;
	}

	return (
		<SafeAreaProvider>
			<QueryClientProvider client={queryClient}>
				<GestureHandlerRootView style={{ flex: 1, backgroundColor: '#111827' }}>
					<Stack
						screenOptions={{
							headerShown: false,
							statusBarStyle:
								theme.name.toLocaleLowerCase() === 'light' ? 'dark' : 'light',
							statusBarBackgroundColor: theme.colors.primary,
						}}
						initialRouteName='onboarding'
					>
						<Stack.Screen name='onboarding' options={{ headerShown: false }} />
						<Stack.Screen name='(auth)' options={{ headerShown: false }} />
						<Stack.Screen name='(tabs)' options={{ headerShown: false }} />
						<Stack.Screen name='budgets' options={{ headerShown: false }} />
						<Stack.Screen
							name='transactions'
							options={{ headerShown: false }}
						/>
						<Stack.Screen name='categories' options={{ headerShown: false }} />
						<Stack.Screen
							name='shopping'
							options={{ headerShown: false, animation: 'slide_from_right' }}
						/>
						<Stack.Screen
							name='settings'
							options={{ headerShown: true, animation: 'slide_from_right' }}
						/>
						<Stack.Screen
							name='profile'
							options={{ headerShown: true, animation: 'slide_from_right' }}
						/>
						<Stack.Screen
							name='settings/authentication'
							options={{
								title: 'Authentication',
								headerShown: true,
							}}
						/>

						<Stack.Screen name='+not-found' />
					</Stack>
					{/* <LockScreen visible={isLocked} onUnlock={unlock} />
				<AppOverlay visible={showOverlay} /> */}
				</GestureHandlerRootView>
			</QueryClientProvider>
		</SafeAreaProvider>
	);
}
