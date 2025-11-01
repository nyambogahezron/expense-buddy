import { useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	Image,
	ScrollView,
	Pressable,
} from 'react-native';
import { useThemeStore } from '@/store/theme';
import { dummyUsers } from '@/types/user';
import Animated, { FadeIn } from 'react-native-reanimated';
import { CreditCard as Edit2, LogOut } from 'lucide-react-native';
import { router, Stack } from 'expo-router';

export default function ProfileScreen() {
	const { theme } = useThemeStore();
	const [currentUser] = useState(dummyUsers[0]);

	const handleLogout = () => {
		router.replace('/');
	};

	return (
		<View style={{ flex: 1, backgroundColor: theme.colors.background }}>
			<Stack.Screen
				options={{
					headerShown: true,
					header: () => (
						<View style={styles.header}>
							<Text style={[styles.title, { color: theme.colors.text }]}>
								Profile
							</Text>
							<Pressable
								onPress={handleLogout}
								style={({ pressed }) => [
									styles.logoutButton,
									{ opacity: pressed ? 0.8 : 1 },
								]}
							>
								<LogOut size={24} color={theme.colors.error} />
							</Pressable>
						</View>
					),
				}}
			/>
			<ScrollView
				style={[styles.container, { backgroundColor: theme.colors.background }]}
				contentContainerStyle={styles.content}
			>
				<Animated.View
					entering={FadeIn.duration(1000)}
					style={[
						styles.profileCard,
						{
							backgroundColor: theme.colors.surface,
							borderColor: theme.colors.border,
						},
					]}
				>
					<Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
					<View style={styles.profileInfo}>
						<Text style={[styles.username, { color: theme.colors.text }]}>
							{currentUser.username}
						</Text>
						<Text style={[styles.bio, { color: theme.colors.textSecondary }]}>
							{currentUser.bio}
						</Text>
						<Text
							style={[styles.joinDate, { color: theme.colors.textSecondary }]}
						>
							Joined {new Date(currentUser.joinDate).toLocaleDateString()}
						</Text>
					</View>
					<Pressable
						style={[
							styles.editButton,
							{ backgroundColor: theme.colors.primary },
						]}
					>
						<Edit2 size={20} color='#FFFFFF' />
					</Pressable>
				</Animated.View>

				<View style={styles.statsGrid}>
					<Animated.View
						entering={FadeIn.delay(200)}
						style={[
							styles.statCard,
							{
								backgroundColor: theme.colors.surface,
								borderColor: theme.colors.border,
							},
						]}
					>
						<Text style={[styles.statValue, { color: theme.colors.text }]}>
							{currentUser.stats.transactions}
						</Text>
						<Text
							style={[styles.statLabel, { color: theme.colors.textSecondary }]}
						>
							Transactions
						</Text>
					</Animated.View>

					<Animated.View
						entering={FadeIn.delay(400)}
						style={[
							styles.statCard,
							{
								backgroundColor: theme.colors.surface,
								borderColor: theme.colors.border,
							},
						]}
					>
						<Text style={[styles.statValue, { color: theme.colors.text }]}>
							{currentUser.stats.categories}
						</Text>
						<Text
							style={[styles.statLabel, { color: theme.colors.textSecondary }]}
						>
							Categories
						</Text>
					</Animated.View>

					<Animated.View
						entering={FadeIn.delay(600)}
						style={[
							styles.statCard,
							{
								backgroundColor: theme.colors.surface,
								borderColor: theme.colors.border,
							},
						]}
					>
						<Text style={[styles.statValue, { color: theme.colors.text }]}>
							${currentUser.stats.totalSaved.toLocaleString()}
						</Text>
						<Text
							style={[styles.statLabel, { color: theme.colors.textSecondary }]}
						>
							Total Saved
						</Text>
					</Animated.View>
				</View>

				<Animated.View
					entering={FadeIn.delay(800)}
					style={[
						styles.preferencesCard,
						{
							backgroundColor: theme.colors.surface,
							borderColor: theme.colors.border,
						},
					]}
				>
					<Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
						Preferences
					</Text>
					<View style={styles.preferencesList}>
						<View style={styles.preferenceItem}>
							<Text
								style={[styles.preferenceLabel, { color: theme.colors.text }]}
							>
								Notifications
							</Text>
							<Text
								style={[
									styles.preferenceValue,
									{ color: theme.colors.textSecondary },
								]}
							>
								{currentUser.preferences.notifications ? 'Enabled' : 'Disabled'}
							</Text>
						</View>
						<View style={styles.preferenceItem}>
							<Text
								style={[styles.preferenceLabel, { color: theme.colors.text }]}
							>
								Dark Mode
							</Text>
							<Text
								style={[
									styles.preferenceValue,
									{ color: theme.colors.textSecondary },
								]}
							>
								{currentUser.preferences.darkMode ? 'Enabled' : 'Disabled'}
							</Text>
						</View>
						<View style={styles.preferenceItem}>
							<Text
								style={[styles.preferenceLabel, { color: theme.colors.text }]}
							>
								Currency
							</Text>
							<Text
								style={[
									styles.preferenceValue,
									{ color: theme.colors.textSecondary },
								]}
							>
								{currentUser.preferences.currency}
							</Text>
						</View>
					</View>
				</Animated.View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		padding: 20,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
		height: 60,
	},
	title: {
		fontSize: 24,
		fontFamily: 'Inter-Bold',
	},
	logoutButton: {
		padding: 8,
	},
	profileCard: {
		padding: 20,
		borderRadius: 16,
		borderWidth: 1,
		marginBottom: 20,
	},
	avatar: {
		width: 100,
		height: 100,
		borderRadius: 50,
		marginBottom: 16,
	},
	profileInfo: {
		alignItems: 'center',
	},
	username: {
		fontSize: 24,
		fontFamily: 'Inter-Bold',
		marginBottom: 8,
	},
	bio: {
		fontSize: 16,
		fontFamily: 'Inter-Regular',
		textAlign: 'center',
		marginBottom: 8,
	},
	joinDate: {
		fontSize: 14,
		fontFamily: 'Inter-Regular',
	},
	editButton: {
		position: 'absolute',
		top: 20,
		right: 20,
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	statsGrid: {
		flexDirection: 'row',
		gap: 12,
		marginBottom: 20,
	},
	statCard: {
		flex: 1,
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
		alignItems: 'center',
	},
	statValue: {
		fontSize: 20,
		fontFamily: 'Inter-Bold',
		marginBottom: 4,
	},
	statLabel: {
		fontSize: 14,
		fontFamily: 'Inter-Regular',
	},
	preferencesCard: {
		padding: 20,
		borderRadius: 16,
		borderWidth: 1,
	},
	sectionTitle: {
		fontSize: 18,
		fontFamily: 'Inter-SemiBold',
		marginBottom: 16,
	},
	preferencesList: {
		gap: 16,
	},
	preferenceItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	preferenceLabel: {
		fontSize: 16,
		fontFamily: 'Inter-Regular',
	},
	preferenceValue: {
		fontSize: 16,
		fontFamily: 'Inter-Regular',
	},
});
