import { useThemeStore } from '@/store/theme';
import { Tabs } from 'expo-router';
import {
	ArrowUpDown,
	ChartPie as PieChart,
	Grid2x2 as Grid,
	Wallet,
} from 'lucide-react-native';

export default function HomeTabLayout() {
	const { theme } = useThemeStore();
	
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					borderTopWidth: 0,
					backgroundColor: theme.colors.background,
				},
				tabBarActiveTintColor: '#6366F1',
				tabBarInactiveTintColor: '#6B7280',
				sceneStyle: {
					backgroundColor: theme.colors.background,
				},
			}}
		>
			<Tabs.Screen
				name='index'
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
