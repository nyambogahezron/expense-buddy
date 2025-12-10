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
import { useState, useEffect } from 'react';
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
	const [isInitialized, setIsInitialized] = useState(false);

	const [fontsLoaded] = useFonts({
		'Inter-Regular': Inter_400Regular,
		'Inter-Medium': Inter_500Medium,
		'Inter-SemiBold': Inter_600SemiBold,
		'Inter-Bold': Inter_700Bold,
	});



	useEffect(() => {
		// Initialize categories after successful migration
		if (success && !isInitialized) {
			initializeCategories().finally(() => {
				setIsInitialized(true);
			});
		}
	}, [success, isInitialized]);

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
							statusBarStyle: 'light',
							statusBarTranslucent: true,
							statusBarBackgroundColor: 'transparent',
						}}
						initialRouteName='(drawer)'
					>
						<Stack.Screen name='onboarding' options={{ headerShown: false }} />
						<Stack.Screen name='(drawer)' options={{ headerShown: false }} />
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
							options={{ headerShown: false, animation: 'slide_from_right' }}
						/>
						<Stack.Screen
							name='profile'
							options={{ headerShown: true, animation: 'slide_from_right' }}
						/>
						<Stack.Screen
							name='notifications'
							options={{ headerShown: false, animation: 'slide_from_right' }}
						/>

						<Stack.Screen name='+not-found' />
					</Stack>
				</GestureHandlerRootView>
			</QueryClientProvider>
		</SafeAreaProvider>
	);
}
