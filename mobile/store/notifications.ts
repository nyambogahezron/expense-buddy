import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Notification {
	id: string;
	title: string;
	message: string;
	type: 'info' | 'success' | 'warning' | 'error';
	timestamp: number;
	read: boolean;
}

interface NotificationState {
	notifications: Notification[];
	addNotification: (
		notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
	) => void;
	markAsRead: (id: string) => void;
	markAllAsRead: () => void;
	deleteNotification: (id: string) => void;
	clearAllNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
	persist(
		(set) => ({
			notifications: [],

			addNotification: (notification) =>
				set((state) => ({
					notifications: [
						{
							...notification,
							id: Math.random().toString(36).substring(7),
							timestamp: Date.now(),
							read: false,
						},
						...state.notifications,
					],
				})),

			markAsRead: (id) =>
				set((state) => ({
					notifications: state.notifications.map((notification) =>
						notification.id === id
							? { ...notification, read: true }
							: notification
					),
				})),

			markAllAsRead: () =>
				set((state) => ({
					notifications: state.notifications.map((notification) => ({
						...notification,
						read: true,
					})),
				})),

			deleteNotification: (id) =>
				set((state) => ({
					notifications: state.notifications.filter(
						(notification) => notification.id !== id
					),
				})),

			clearAllNotifications: () => set({ notifications: [] }),
		}),
		{
			name: 'expense-buddy-notifications',
			storage: createJSONStorage(() => AsyncStorage),
		}
	)
);
