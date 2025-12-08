import { Drawer } from 'expo-router/drawer';
import { useThemeStore } from '@/store/theme';
import {
	Home,
	ShoppingCart,
	Bell,
	Settings,
	PaintBucket,
} from 'lucide-react-native';
import { View, Text, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';

function CustomDrawerContent(props: any) {
	const { theme } = useThemeStore();
	const router = useRouter();

	return (
		<DrawerContentScrollView
			{...props}
			style={{ backgroundColor: theme.colors.background }}
		>
			<View style={[styles.drawerHeader, { borderBottomColor: theme.colors.border }]}>
				<Text style={[styles.appTitle, { color: theme.colors.text }]}>
					Expense Buddy
				</Text>
			</View>

			<DrawerItem
				label="Home"
				icon={({ size, color }) => <Home size={size} color={color} />}
				onPress={() => router.push('/(drawer)/home/transactions' as any)}
				labelStyle={{ color: theme.colors.text }}
				activeBackgroundColor={theme.colors.primary + '20'}
				activeTintColor={theme.colors.primary}
			/>

			<DrawerItem
				label="Shopping List"
				icon={({ size, color }) => <ShoppingCart size={size} color={color} />}
				onPress={() => router.push('/shopping' as any)}
				labelStyle={{ color: theme.colors.text }}
				activeBackgroundColor={theme.colors.primary + '20'}
				activeTintColor={theme.colors.primary}
			/>

			<DrawerItem
				label="Notifications"
				icon={({ size, color }) => <Bell size={size} color={color} />}
				onPress={() => router.push('/notifications')}
				labelStyle={{ color: theme.colors.text }}
				activeBackgroundColor={theme.colors.primary + '20'}
				activeTintColor={theme.colors.primary}
			/>

			<DrawerItem
				label="Theme"
				icon={({ size, color }) => <PaintBucket size={size} color={color} />}
				onPress={() => router.push('/settings/theme' as any)}
				labelStyle={{ color: theme.colors.text }}
				activeBackgroundColor={theme.colors.primary + '20'}
				activeTintColor={theme.colors.primary}
			/>

			<DrawerItem
				label="Settings"
				icon={({ size, color }) => <Settings size={size} color={color} />}
				onPress={() => router.push('/settings' as any)}
				labelStyle={{ color: theme.colors.text }}
				activeBackgroundColor={theme.colors.primary + '20'}
				activeTintColor={theme.colors.primary}
			/>

			<View style={styles.divider} />
		</DrawerContentScrollView>
	);
}

export default function DrawerLayout() {
	const { theme } = useThemeStore();

	return (
			<Drawer
				drawerContent={(props) => <CustomDrawerContent {...props} />}
				screenOptions={{
					headerShown: true,
					headerStyle: {
						backgroundColor: theme.colors.primary,
					},
					headerTintColor: '#fff',
					drawerStyle: {
						backgroundColor: theme.colors.background,
					},
					drawerActiveTintColor: theme.colors.primary,
					drawerInactiveTintColor: theme.colors.text,
				}}
			>
				<Drawer.Screen
					name="home"
					options={{
						drawerLabel: 'Home',
						title: 'Home',
						headerShown: false,
					}}
				/>
			</Drawer>
	);
}

const styles = StyleSheet.create({
	drawerHeader: {
		padding: 20,
		borderBottomWidth: 1,
		marginBottom: 10,
	},
	appTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		fontFamily: 'Inter-Bold',
	},
	divider: {
		height: 1,
		backgroundColor: '#E5E7EB',
		marginVertical: 10,
	},
});
