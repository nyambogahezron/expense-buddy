import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	Modal,
	Pressable,
	Dimensions,
} from 'react-native';
import React, { useState, useCallback, memo } from 'react';
import { useRouter } from 'expo-router';
import Animated, {
	FadeInDown,
	FadeOutUp,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import { useThemeStore } from '@/store/theme';
import {
	Settings,
	Bell,
	LogOut,
	X,
	ShoppingCart,
	MenuIcon,
	LucideIcon,
	PaintBucket,
} from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type MenuItemProps = {
	icon: LucideIcon;
	label: string;
	onPress: () => void;
	color: string;
};

const MenuItem = memo(
	({ icon: Icon, label, onPress, color }: MenuItemProps) => (
		<Animated.View entering={FadeInDown.springify().damping(15)}>
			<TouchableOpacity
				style={[styles.menuItem]}
				onPress={onPress}
				activeOpacity={0.7}
			>
				<Icon size={20} color={color} />
				<Text style={[styles.menuItemText, { color }]}>{label}</Text>
				<Ionicons
					name='chevron-forward-outline'
					size={18}
					color={color}
					style={{ position: 'absolute', right: 0 }}
				/>
			</TouchableOpacity>
		</Animated.View>
	)
);

export default function MenuNav() {
	const [modalVisible, setModalVisible] = useState(false);

	const { theme, closeMenu } = useThemeStore();
	const router = useRouter();

	const opacity = useSharedValue(0);

	const backdropStyle = useAnimatedStyle(() => {
		return {
			opacity: opacity.value,
		};
	});

	const menuItems = [
		{ icon: ShoppingCart, label: 'Shopping List', route: '/shopping' },
		{ icon: Bell, label: 'Notifications', route: '/notifications' },
		{ icon: PaintBucket, label: 'Theme', route: '/settings/theme' },
		{ icon: Settings, label: 'Settings', route: '/settings/index' },
		{ icon: LogOut, label: 'Logout', action: () => handleLogout() },
	];

	const handleLogout = useCallback(() => {
		setModalVisible(false);
		router.push('/(auth)/login');
	}, [router]);

	const handleMenuItemPress = useCallback(
		(route: any, action: any) => {
			setModalVisible(false);
			closeMenu();

			if (action) {
				action();
			} else if (route) {
				router.push(route);
			}
		},
		[router, closeMenu]
	);

	const handleOpenModal = useCallback(() => {
		setModalVisible(true);
		opacity.value = withTiming(1, { duration: 200 });
	}, [opacity]);

	const handleCloseModal = useCallback(() => {
		opacity.value = withTiming(0, { duration: 150 });
		setTimeout(() => {
			setModalVisible(false);
			closeMenu();
		}, 100);
	}, [opacity, closeMenu]);

	return (
		<View>
			<TouchableOpacity
				style={styles.menuButton}
				onPress={handleOpenModal}
				activeOpacity={0.7}
			>
				<MenuIcon size={24} color={'#888'} />
			</TouchableOpacity>

			<Modal
				animationType='none'
				transparent={true}
				visible={modalVisible}
				onRequestClose={handleCloseModal}
			>
				<View style={styles.centeredView}>
					<Animated.View
						style={[
							styles.modalView,
							{ backgroundColor: theme.colors.background },
						]}
						entering={FadeInDown.springify().damping(15)}
						exiting={FadeOutUp.springify().damping(15)}
					>
						<View style={styles.modalHeader}>
							<TouchableOpacity onPress={handleCloseModal} activeOpacity={0.7}>
								<X size={24} color={theme.colors.text} />
							</TouchableOpacity>
						</View>

						<View style={styles.menuItemsContainer}>
							{menuItems.map((item, index) => (
								<MenuItem
									key={index}
									icon={item.icon}
									label={item.label}
									color={theme.colors.text}
									onPress={() => handleMenuItemPress(item.route, item.action)}
								/>
							))}
						</View>
					</Animated.View>

					<Animated.View style={[styles.modalBackdrop, backdropStyle]}>
						<Pressable
							style={styles.pressableBackdrop}
							onPress={handleCloseModal}
						/>
					</Animated.View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	menuButton: {
		width: '100%',
		padding: 10,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	menuButtonText: {
		fontSize: 16,
		fontWeight: '600',
	},
	centeredView: {
		flex: 1,
		position: 'absolute',
		bottom: 0,
		alignItems: 'center',
	},
	modalBackdrop: {
		flex: 1,
		width: '100%',
		height: '100%',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		zIndex: -1,
	},
	pressableBackdrop: {
		width: '100%',
		height: '100%',
	},
	modalView: {
		width: width,
		maxHeight: '100%',
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
		justifyContent: 'flex-end',
		alignItems: 'center',
		marginBottom: 20,
	},

	menuItemsContainer: {
		gap: 5,
	},
	menuItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
	},
	menuItemText: {
		fontSize: 16,
		marginLeft: 16,
		fontWeight: '500',
	},
});
