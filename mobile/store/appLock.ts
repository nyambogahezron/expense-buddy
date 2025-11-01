import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppLockState {
	pin: string;
	useBiometrics: boolean;
	lockInterval: number;
	isLocked: boolean;
	showOverlay: boolean;
	isEnabled: boolean;
	setPin: (pin: string) => void;
	setUseBiometrics: (use: boolean) => void;
	setLockInterval: (interval: number) => void;
	lock: () => void;
	unlock: () => void;
	showAppOverlay: () => void;
	hideAppOverlay: () => void;
	setEnabled: (enabled: boolean) => void;
}

export const useAppLockStore = create<AppLockState>()(
	persist(
		(set) => ({
			pin: '',
			useBiometrics: false,
			lockInterval: 0, // 0 means no auto-lock
			isLocked: false,
			showOverlay: false,
			isEnabled: false,
			setPin: (pin) => set({ pin }),
			setUseBiometrics: (use) => set({ useBiometrics: use }),
			setLockInterval: (interval) => set({ lockInterval: interval }),
			lock: () => set({ isLocked: true }),
			unlock: () => set({ isLocked: false }),
			showAppOverlay: () => set({ showOverlay: true }),
			hideAppOverlay: () => set({ showOverlay: false }),
			setEnabled: (enabled) => set({ isEnabled: enabled }),
		}),
		{
			name: 'app-lock-storage',
			storage: createJSONStorage(() => AsyncStorage),
		}
	)
);
