import { Drawer } from 'expo-router/drawer';
import { useThemeStore } from '@/store/theme';
import {
	Home,
	ShoppingCart,
	Bell,
	Settings,
	HelpCircle,
	TrendingUp,
	TrendingDown,
} from 'lucide-react-native';
import { View, Text, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { useTransactionStore } from '@/store/transactions';
import { useMemo } from 'react';

function CustomDrawerContent(props: any) {
	const { theme } = useThemeStore();
	const router = useRouter();
	const { transactions } = useTransactionStore();

	// Calculate transaction summary
	const summary = useMemo(() => {
		const income = transactions
			.filter(t => t.type === 'income')
			.reduce((sum, t) => sum + t.amount, 0);
		const expense = transactions
			.filter(t => t.type === 'expense')
			.reduce((sum, t) => sum + t.amount, 0);
		const balance = income - expense;
		return { income, expense, balance };
	}, [transactions]);

	return (
		<View style={{ flex: 1, backgroundColor: theme.colors.background }}>
			<DrawerContentScrollView
				{...props}
				style={{ backgroundColor: theme.colors.background }}
				contentContainerStyle={{ paddingBottom: 0 }}
			>

				{/* Transaction Summary */}
				<View style={[styles.summaryContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
					<Text style={[styles.summaryTitle, { color: theme.colors.textSecondary }]}>
						Transaction Summary
					</Text>
					<View style={styles.summaryRow}>
						<TrendingUp size={18} color={theme.colors.success} />
						<Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
							Income:
						</Text>
						<Text style={[styles.summaryValue, { color: theme.colors.success }]}>
							${summary.income.toFixed(2)}
						</Text>
					</View>
					<View style={styles.summaryRow}>
						<TrendingDown size={18} color={theme.colors.error} />
						<Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
							Expense:
						</Text>
						<Text style={[styles.summaryValue, { color: theme.colors.error }]}>
							${summary.expense.toFixed(2)}
						</Text>
					</View>
					<View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
					<View style={styles.summaryRow}>
						<Text style={[styles.balanceLabel, { color: theme.colors.text }]}>
							Balance:
						</Text>
						<Text style={[styles.balanceValue, { color: summary.balance >= 0 ? theme.colors.success : theme.colors.error }]}>
							${summary.balance.toFixed(2)}
						</Text>
					</View>
				</View>

				{/* Navigation Items */}
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
			</DrawerContentScrollView>

			{/* Bottom Section - Settings and Help */}
			<View style={[styles.bottomSection, { borderTopColor: theme.colors.border }]}>
				<DrawerItem
					label="Settings"
					icon={({ size, color }) => <Settings size={size} color={color} />}
					onPress={() => router.push('/settings' as any)}
					labelStyle={{ color: theme.colors.text }}
					activeBackgroundColor={theme.colors.primary + '20'}
					activeTintColor={theme.colors.primary}
				/>
				<DrawerItem
					label="Help"
					icon={({ size, color }) => <HelpCircle size={size} color={color} />}
					onPress={() => {
						// Add help navigation or action here
						console.log('Help pressed');
					}}
					labelStyle={{ color: theme.colors.text }}
					activeBackgroundColor={theme.colors.primary + '20'}
					activeTintColor={theme.colors.primary}
				/>
			</View>
		</View>
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
					headerTransparent: false,
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
	summaryContainer: {
		margin: 12,
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
	},
	summaryTitle: {
		fontSize: 14,
		fontWeight: '600',
		marginBottom: 12,
		fontFamily: 'Inter-SemiBold',
	},
	summaryRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
		gap: 8,
	},
	summaryLabel: {
		fontSize: 14,
		flex: 1,
		fontFamily: 'Inter-Regular',
	},
	summaryValue: {
		fontSize: 14,
		fontWeight: '600',
		fontFamily: 'Inter-SemiBold',
	},
	balanceLabel: {
		fontSize: 16,
		fontWeight: '600',
		flex: 1,
		fontFamily: 'Inter-SemiBold',
	},
	balanceValue: {
		fontSize: 16,
		fontWeight: 'bold',
		fontFamily: 'Inter-Bold',
	},
	divider: {
		height: 1,
		marginVertical: 12,
	},
	bottomSection: {
		borderTopWidth: 1,
		paddingTop: 8,
		paddingBottom: 8,
	},
});
