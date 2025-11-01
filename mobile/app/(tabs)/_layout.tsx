import { useThemeStore } from '@/store/theme';
import { Tabs } from 'expo-router';
import {
	ArrowUpDown,
	ChartPie as PieChart,
	Grid2x2 as Grid,
	Wallet,
	Menu as MenuIcon,
} from 'lucide-react-native';
import { StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';
import MenuNav from '@/components/MenuNav';

const { width } = Dimensions.get('window');

export default function TabLayout() {
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
						// Prevent default action (navigation to menu screen)
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

const styles = StyleSheet.create({
	menuButton: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalBackdrop: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		zIndex: -1,
	},
	modalView: {
		width: width * 0.85,
		maxHeight: '80%',
		borderRadius: 16,
		padding: 20,
		elevation: 5,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
	},
	modalTitle: {
		fontSize: 22,
		fontFamily: 'Inter-Bold',
	},
	menuItemsContainer: {
		gap: 16,
	},
	menuItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
	},
	menuItemText: {
		fontSize: 16,
		marginLeft: 16,
		fontFamily: 'Inter-SemiBold',
	},
});
