import { useThemeStore } from '@/store/theme';
import { Tabs, router } from 'expo-router';
import {
	ArrowUpDown,
	ChartPie as PieChart,
	Grid2x2 as Grid,
	Wallet,
	Menu as MenuIcon,
} from 'lucide-react-native';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { usePathname } from 'expo-router';
import MenuNav from '@/components/MenuNav';
import PageContainer from '@/components/PageContainer';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function WebTabLayout() {
	const { theme } = useThemeStore();
	const pathname = usePathname();
	const isMobile = useIsMobile();

	const tabs = [
		{
			name: 'transactions',
			title: 'Transactions',
			icon: ArrowUpDown,
		},
		{
			name: 'budgets',
			title: 'Budgets',
			icon: Wallet,
		},
		{
			name: 'analytics',
			title: 'Analytics',
			icon: PieChart,
		},
		{
			name: 'categories',
			title: 'Categories',
			icon: Grid,
		},
	];

	const handleNavigation = (tabName: string) => {
		router.push(`/(tabs)/${tabName}` as any);
	};

	if (isMobile) {
		return (
			<Tabs
				screenOptions={{
					headerShown: false,
					tabBarStyle: {
						backgroundColor: theme.colors.background,
						borderTopWidth: 0,
					},
					tabBarActiveTintColor: '#6366F1',
					tabBarInactiveTintColor: '#6B7280',
					sceneStyle: {
						backgroundColor: theme.colors.primary,
					},
				}}
			>
				<Tabs.Screen
					name='transactions'
					options={{
						title: 'Transactions',
						tabBarIcon: ({ size, color }: { size: number; color: string }) => (
							<ArrowUpDown size={24} color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name='budgets'
					options={{
						title: 'Budgets',
						tabBarIcon: ({ size, color }) => <Wallet size={24} color={color} />,
					}}
				/>
				<Tabs.Screen
					name='menu'
					options={{
						title: 'Menu',
						tabBarIcon: ({ color }) => <MenuIcon size={24} color={color} />,
						tabBarButton: () => <MenuNav />,
					}}
					listeners={{
						tabPress: (e) => {
							e.preventDefault();
						},
					}}
				/>
				<Tabs.Screen
					name='analytics'
					options={{
						title: 'Analytics',
						tabBarIcon: ({ size, color }: { size: number; color: string }) => (
							<PieChart size={24} color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name='categories'
					options={{
						title: 'Categories',
						tabBarIcon: ({ size, color }: { size: number; color: string }) => (
							<Grid size={24} color={color} />
						),
					}}
				/>
			</Tabs>
		);
	}

	return (
		<View style={styles.container}>
			<View
				style={[styles.navbar, { backgroundColor: theme.colors.background }]}
			>
				<PageContainer>
					<View style={styles.navContent}>
						<Pressable
							onPress={() => router.push('/(tabs)/transactions' as any)}
						>
							<Text style={[styles.logo, { color: theme.colors.primary }]}>
								Expense Buddy
							</Text>
						</Pressable>
						<View style={styles.navLinks}>
							{tabs.map((tab) => {
								const isActive = pathname.includes(tab.name);
								return (
									<Pressable
										key={tab.name}
										style={[
											styles.navItem,
											isActive && {
												backgroundColor: theme.colors.primary + '20',
											},
										]}
										onPress={() => handleNavigation(tab.name)}
									>
										<tab.icon
											size={20}
											color={
												isActive ? theme.colors.primary : theme.colors.text
											}
										/>
										<Text
											style={[
												styles.navText,
												{
													color: isActive
														? theme.colors.primary
														: theme.colors.text,
												},
											]}
										>
											{tab.title}
										</Text>
									</Pressable>
								);
							})}
						</View>
						<MenuNav />
					</View>
				</PageContainer>
			</View>
			{/* ensure the tabs are returned  */}

			<View style={styles.content}>
				<Tabs
					screenOptions={{
						headerShown: false,
						tabBarStyle: {
							display: 'none',

							borderWidth: 0,
						},
					}}
				>
					<Tabs.Screen name='transactions' />
					<Tabs.Screen name='budgets' />
					<Tabs.Screen name='analytics' />
					<Tabs.Screen name='categories' />
					<Tabs.Screen name='menu' />
				</Tabs>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	navbar: {
		height: 64,
	},
	navContent: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 24,
	},
	logo: {
		fontSize: 20,
		fontFamily: 'Inter-Bold',
	},
	navLinks: {
		flexDirection: 'row',
		gap: 8,
	},
	navItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
		gap: 8,
	},
	navText: {
		fontSize: 14,
		fontFamily: 'Inter-Medium',
	},
	content: {
		flex: 1,
		width: '100%',
	},
});
