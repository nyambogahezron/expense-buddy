import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	Modal,
	Pressable,
	Dimensions,
	Platform,
	Vibration,
} from 'react-native';
import { useThemeStore } from '@/store/theme';
import { useAppLockStore } from '@/store/appLock';
import { Lock, Fingerprint, Delete } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as LocalAuthentication from 'expo-local-authentication';

const { width, height } = Dimensions.get('window');

interface LockScreenProps {
	visible: boolean;
	onUnlock: () => void;
}

export default function LockScreen({ visible, onUnlock }: LockScreenProps) {
	const { theme } = useThemeStore();
	const { useBiometrics } = useAppLockStore();
	// const { pin, useBiometrics } = useAppLockStore();
	const [enteredPin, setEnteredPin] = useState('');
	const [error, setError] = useState(false);
	const [biometricsAvailable, setBiometricsAvailable] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const pin = '1234';

	useEffect(() => {
		if (visible) {
			setEnteredPin('');
			setError(false);
			setIsSuccess(false);
			checkBiometrics();
		}
	}, [visible]);

	const checkBiometrics = async () => {
		const compatible = await LocalAuthentication.hasHardwareAsync();
		const enrolled = await LocalAuthentication.isEnrolledAsync();
		setBiometricsAvailable(compatible && enrolled);
	};

	const handleBiometricAuth = async () => {
		try {
			const result = await LocalAuthentication.authenticateAsync({
				promptMessage: 'Authenticate to unlock',
				fallbackLabel: 'Use PIN',
			});

			if (result.success) {
				onUnlock();
			}
		} catch (error) {
			console.error('Biometric authentication error:', error);
		}
	};

	const handlePinSubmit = () => {
		if (enteredPin === pin) {
			setError(false);
			setIsSuccess(true);
			Vibration.vibrate(50);
			setTimeout(() => {
				onUnlock();
			}, 300);
		} else {
			setError(true);
			Vibration.vibrate(400);
			setTimeout(() => {
				setError(false);
			}, 1000);
			setEnteredPin('');
		}
	};

	const handleKeyPress = (key: string) => {
		if (enteredPin.length < 4) {
			const newPin = enteredPin + key;
			setEnteredPin(newPin);
			if (newPin.length === 4) {
				handlePinSubmit();
			}
		}
	};

	const handleBackspace = () => {
		setEnteredPin((prev) => prev.slice(0, -1));
	};

	const getPinDotColor = (index: number) => {
		if (isSuccess) return theme.colors.success;
		if (error) return theme.colors.error;
		return index < enteredPin.length
			? theme.colors.primary
			: theme.colors.border;
	};

	const renderKeypad = () => {
		const keys = [
			['1', '2', '3'],
			['4', '5', '6'],
			['7', '8', '9'],
			['', '0', 'backspace'],
		];

		return (
			<View style={styles.keypad}>
				{keys.map((row, rowIndex) => (
					<View key={rowIndex} style={styles.keypadRow}>
						{row.map((key, keyIndex) => (
							<Pressable
								key={keyIndex}
								style={({ pressed }) => [
									styles.keypadButton,
									{
										backgroundColor: theme.colors.surface,
										opacity: pressed ? 0.7 : 1,
									},
								]}
								onPress={() => {
									if (key === 'backspace') {
										handleBackspace();
									} else if (key !== '') {
										handleKeyPress(key);
									}
								}}
							>
								{key === 'backspace' ? (
									<Delete size={24} color={theme.colors.text} />
								) : (
									<Text
										style={[styles.keypadText, { color: theme.colors.text }]}
									>
										{key}
									</Text>
								)}
							</Pressable>
						))}
					</View>
				))}
			</View>
		);
	};

	return (
		<Modal
			visible={visible}
			animationType='fade'
			transparent={false}
			statusBarTranslucent
		>
			<View
				style={[
					styles.container,
					{
						backgroundColor: theme.colors.background,
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
					},
				]}
			>
				<Animated.View
					entering={FadeIn.duration(300)}
					style={[
						styles.content,
						{
							backgroundColor: theme.colors.surface,
							position: 'absolute',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
						},
					]}
				>
					<View style={styles.iconContainer}>
						<Lock size={32} color={theme.colors.primary} />
					</View>

					<Text style={[styles.title, { color: theme.colors.text }]}>
						Enter PIN
					</Text>

					<View style={styles.pinContainer}>
						{[...Array(4)].map((_, index) => (
							<Animated.View
								key={index}
								style={[
									styles.pinDot,
									{
										backgroundColor: getPinDotColor(index),
									},
								]}
							/>
						))}
					</View>

					{error && (
						<Text style={[styles.errorText, { color: theme.colors.error }]}>
							Incorrect PIN
						</Text>
					)}

					{renderKeypad()}

					{useBiometrics && biometricsAvailable && (
						<Pressable
							style={({ pressed }) => [
								styles.biometricButton,
								{
									backgroundColor: theme.colors.surface,
									opacity: pressed ? 0.9 : 1,
								},
							]}
							onPress={handleBiometricAuth}
						>
							<Fingerprint size={24} color={theme.colors.primary} />
							<Text
								style={[styles.biometricText, { color: theme.colors.primary }]}
							>
								Use {Platform.OS === 'ios' ? 'Face ID' : 'Biometrics'}
							</Text>
						</Pressable>
					)}
				</Animated.View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#000',
		height: height,
		width: width,
		zIndex: 9999,
	},
	content: {
		height: height,
		width: width,
		flex: 1,
		padding: 24,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 5,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		zIndex: 10000,
	},
	iconContainer: {
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: 'rgba(0, 0, 0, 0.1)',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 16,
	},
	title: {
		fontSize: 24,
		fontFamily: 'Poppins-SemiBold',
		marginBottom: 24,
	},
	pinContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 32,
		gap: 16,
	},
	pinDot: {
		width: 16,
		height: 16,
		borderRadius: 8,
	},
	errorText: {
		marginBottom: 24,
		fontSize: 14,
		fontFamily: 'Poppins-Regular',
	},
	keypad: {
		width: '100%',
		maxWidth: 300,
		marginBottom: 24,
	},
	keypadRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 16,
	},
	keypadButton: {
		width: 72,
		height: 72,
		borderRadius: 36,
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 2,
	},
	keypadText: {
		fontSize: 24,
		fontFamily: 'Poppins-SemiBold',
	},
	biometricButton: {
		marginTop: 16,
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	biometricText: {
		fontSize: 16,
		fontFamily: 'Poppins-Medium',
	},
});
