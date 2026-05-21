import {
	View,
	Text,
	StyleSheet,
	Pressable,
	ScrollView,
	Modal,
} from 'react-native';
import { Stack } from 'expo-router';
import { useThemeStore } from '@/store/theme';
import { useNotificationStore, Notification } from '@/store/notifications';
import { format } from 'date-fns';
import { Check, Trash2, Bell, X } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useEffect, useState } from 'react';

export default function NotificationsScreen() {
	const { theme } = useThemeStore();
	const {
		notifications,
		markAsRead,
		markAllAsRead,
		deleteNotification,
		addNotification,
	} = useNotificationStore();
	const [selectedNotification, setSelectedNotification] =
		useState<Notification | null>(null);

	const getNotificationColor = (type: string) => {
		switch (type) {
			case 'success':
				return theme.colors.success;
			case 'error':
				return theme.colors.error;
			case 'warning':
				return theme.colors.accent;
			default:
				return theme.colors.primary;
		}
	};

	// Add sample notifications when component mounts
	useEffect(() => {
		// Only add notifications if there are none
		if (notifications.length === 0) {
			addNotification({
				title: 'Budget Alert',
				message: "You've reached 80% of your monthly budget",
				type: 'warning',
			});
			addNotification({
				title: 'Transaction Complete',
				message: 'Your payment of $50.00 has been processed',
				type: 'success',
			});
			addNotification({
				title: 'Low Balance',
				message: 'Your account balance is below $100',
				type: 'error',
			});
		}
	}, []);

	const handleNotificationPress = (notification: Notification) => {
		setSelectedNotification(notification);
		if (!notification.read) {
			markAsRead(notification.id);
		}
	};

	return (
		<View
			style={[styles.container, { backgroundColor: theme.colors.background }]}
		>
			<Stack.Screen
				options={{
					title: 'Notifications',
					headerStyle: { backgroundColor: theme.colors.primary },
					headerTitleStyle: {
						color: theme.colors.text,
						fontFamily: 'Poppins-SemiBold',
						fontSize: 20,
					},
					headerTintColor: theme.colors.text,
					headerTitleAlign: 'center',
				}}
			/>

			<View style={styles.header}>
				<Pressable
					onPress={markAllAsRead}
					style={({ pressed }) => [
						styles.headerButton,
						{
							backgroundColor: theme.colors.surface,
							opacity: pressed ? 0.8 : 1,
						},
					]}
				>
					<Check size={20} color={theme.colors.primary} />
					<Text
						style={[styles.headerButtonText, { color: theme.colors.primary }]}
					>
						Mark all as read
					</Text>
				</Pressable>
			</View>

			<ScrollView style={styles.scrollView}>
				{notifications.length === 0 ? (
					<View style={styles.emptyState}>
						<Bell size={48} color={theme.colors.textSecondary} />
						<Text
							style={[
								styles.emptyStateText,
								{ color: theme.colors.textSecondary },
							]}
						>
							No notifications yet
						</Text>
					</View>
				) : (
					notifications.map((notification) => (
						<Animated.View
							key={notification.id}
							entering={FadeIn}
							style={[
								styles.notificationCard,
								{
									backgroundColor: theme.colors.surface,
									borderColor: theme.colors.border,
								},
							]}
						>
							<Pressable
								onPress={() => handleNotificationPress(notification)}
								style={styles.notificationContent}
							>
								<View style={styles.notificationHeader}>
									<View style={styles.notificationType}>
										<View
											style={[
												styles.typeIndicator,
												{
													backgroundColor: getNotificationColor(
														notification.type
													),
												},
											]}
										/>
										<Text
											style={[
												styles.notificationTitle,
												{
													color: theme.colors.text,
													opacity: notification.read ? 0.7 : 1,
												},
											]}
										>
											{notification.title}
										</Text>
									</View>
									<Pressable
										onPress={() => deleteNotification(notification.id)}
										style={({ pressed }) => [
											styles.deleteButton,
											{ opacity: pressed ? 0.7 : 1 },
										]}
									>
										<Trash2 size={18} color={theme.colors.error} />
									</Pressable>
								</View>

								<Text
									style={[
										styles.notificationMessage,
										{
											color: theme.colors.textSecondary,
											opacity: notification.read ? 0.7 : 1,
										},
									]}
								>
									{notification.message}
								</Text>

								<View style={styles.notificationFooter}>
									<Text
										style={[
											styles.timestamp,
											{ color: theme.colors.textSecondary },
										]}
									>
										{format(notification.timestamp, 'MMM d, h:mm a')}
									</Text>
									{!notification.read && (
										<Pressable
											onPress={() => markAsRead(notification.id)}
											style={({ pressed }) => [
												styles.readButton,
												{
													backgroundColor: theme.colors.primary,
													opacity: pressed ? 0.8 : 1,
												},
											]}
										>
											<Text style={styles.readButtonText}>Mark as read</Text>
										</Pressable>
									)}
								</View>
							</Pressable>
						</Animated.View>
					))
				)}
			</ScrollView>

			<Modal
				visible={!!selectedNotification}
				transparent
				animationType='fade'
				onRequestClose={() => setSelectedNotification(null)}
			>
				<View
					style={[
						styles.modalContainer,
						{ backgroundColor: theme.colors.background + 'CC' },
					]}
				>
					<View
						style={[
							styles.modalContent,
							{ backgroundColor: theme.colors.surface },
						]}
					>
						<View style={styles.modalHeader}>
							<View style={styles.modalTitleContainer}>
								<View
									style={[
										styles.modalTypeIndicator,
										{
											backgroundColor: selectedNotification
												? getNotificationColor(selectedNotification.type)
												: theme.colors.primary,
										},
									]}
								/>
								<Text style={[styles.modalTitle, { color: theme.colors.text }]}>
									{selectedNotification?.title}
								</Text>
							</View>
							<Pressable
								onPress={() => setSelectedNotification(null)}
								style={({ pressed }) => [
									styles.closeButton,
									{ opacity: pressed ? 0.7 : 1 },
								]}
							>
								<X size={24} color={theme.colors.text} />
							</Pressable>
						</View>

						<Text
							style={[
								styles.modalMessage,
								{ color: theme.colors.textSecondary },
							]}
						>
							{selectedNotification?.message}
						</Text>

						<Text
							style={[
								styles.modalTimestamp,
								{ color: theme.colors.textSecondary },
							]}
						>
							{selectedNotification
								? format(selectedNotification.timestamp, 'MMMM d, yyyy h:mm a')
								: ''}
						</Text>
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		padding: 16,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: '#E5E7EB',
	},
	headerButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 8,
		alignSelf: 'flex-start',
	},
	headerButtonText: {
		fontSize: 14,
		fontFamily: 'Poppins-Medium',
	},
	scrollView: {
		flex: 1,
	},
	emptyState: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingTop: 100,
	},
	emptyStateText: {
		marginTop: 16,
		fontSize: 16,
		fontFamily: 'Poppins-Medium',
	},
	notificationCard: {
		margin: 16,
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
	},
	notificationHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	notificationType: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	typeIndicator: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	notificationTitle: {
		fontSize: 16,
		fontFamily: 'Poppins-SemiBold',
	},
	deleteButton: {
		padding: 4,
	},
	notificationMessage: {
		fontSize: 14,
		fontFamily: 'Poppins-Regular',
		lineHeight: 20,
	},
	notificationFooter: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 12,
	},
	timestamp: {
		fontSize: 12,
		fontFamily: 'Poppins-Regular',
	},
	readButton: {
		paddingVertical: 4,
		paddingHorizontal: 12,
		borderRadius: 6,
	},
	readButtonText: {
		color: '#FFFFFF',
		fontSize: 12,
		fontFamily: 'Poppins-Medium',
	},
	notificationContent: {
		flex: 1,
	},
	modalContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContent: {
		width: '90%',
		maxWidth: 400,
		borderRadius: 16,
		padding: 24,
		elevation: 5,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: 16,
	},
	modalTitleContainer: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginRight: 16,
	},
	modalTypeIndicator: {
		width: 12,
		height: 12,
		borderRadius: 6,
	},
	modalTitle: {
		fontSize: 20,
		fontFamily: 'Poppins-SemiBold',
		flex: 1,
	},
	closeButton: {
		padding: 4,
	},
	modalMessage: {
		fontSize: 16,
		fontFamily: 'Poppins-Regular',
		lineHeight: 24,
		marginBottom: 16,
	},
	modalTimestamp: {
		fontSize: 14,
		fontFamily: 'Poppins-Medium',
	},
});
