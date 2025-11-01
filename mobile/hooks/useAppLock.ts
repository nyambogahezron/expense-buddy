import { useAppLockStore } from '@/store/appLock';

export function useAppLock() {
	const isLocked = useAppLockStore((state) => state.isLocked);
	const showOverlay = useAppLockStore((state) => state.showOverlay);
	const unlock = useAppLockStore((state) => state.unlock);
	const showAppOverlay = useAppLockStore((state) => state.showAppOverlay);
	const hideAppOverlay = useAppLockStore((state) => state.hideAppOverlay);

	return {
		isLocked,
		showOverlay,
		unlock,
		showAppOverlay,
		hideAppOverlay,
	};
}
