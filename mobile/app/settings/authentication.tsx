import {
	View,
	Text,
	StyleSheet,
	Switch,
	Pressable,
	TextInput,
	Modal,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useThemeStore } from '@/store/theme';
import { useAppLockStore } from '@/store/appLock';
import { useNotificationStore } from '@/store/notifications';
import { useState, useEffect } from 'react';
import {
	Lock,
	Fingerprint,
	KeyRound,
	ShieldCheck,
	Clock,
	Bell,
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import PageContainer from '@/components/PageContainer';

export default function AuthenticationScreen() {
	const { theme } = useThemeStore();
	const {
		isEnabled: appLockEnabled,
		lockInterval,
		pin,
		useBiometrics,
		setEnabled: setAppLockEnabled,
		setLockInterval,
		setPin,
		setUseBiometrics,
	} = useAppLockStore();
	const { notifications } = useNotificationStore();

	const [showPinModal, setShowPinModal] = useState(false);
	const [newPin, setNewPin] = useState('');
	const [confirmPin, setConfirmPin] = useState('');
	const [pinError, setPinError] = useState('');
	const [biometricsAvailable, setBiometricsAvailable] = useState(false);

	const unreadCount = notifications.filter((n) => !n.read).length;

	useEffect(() => {
		checkBiometrics();
	}, []);

	const checkBiometrics = async () => {
		const compatible = await LocalAuthentication.hasHardwareAsync();
		const enrolled = await LocalAuthentication.isEnrolledAsync();
		setBiometricsAvailable(compatible && enrolled);
	};

	const handleAppLockToggle = (enabled: boolean) => {
		if (enabled) {
			setShowPinModal(true);
		} else {
			setAppLockEnabled(false);
			setPin('');
			setUseBiometrics(false);
		}
	};

	const handleBiometricToggle = async (enabled: boolean) => {
		if (enabled) {
			try {
				const result = await LocalAuthentication.authenticateAsync({
					promptMessage: 'Authenticate to enable biometrics',
				});
				if (result.success) {
					setUseBiometrics(true);
				}
			} catch (error) {
				console.error('Biometric authentication error:', error);
			}
		} else {
			setUseBiometrics(false);
		}
	};

	const handlePinSubmit = () => {
		if (newPin.length !== 4) {
			setPinError('PIN must be 4 digits');
			return;
		}

		if (newPin !== confirmPin) {
			setPinError('PINs do not match');
			return;
		}

		setPin(newPin);
		setAppLockEnabled(true);
		setShowPinModal(false);
		setNewPin('');
		setConfirmPin('');
		setPinError('');
	};

	return (
		<PageContainer>
			<Stack.Screen
				options={{
					title: 'Authentication',
					headerStyle: { backgroundColor: theme.colors.primary },
					headerTitleStyle: {
						color: theme.colors.text,
						fontFamily: 'Poppins-SemiBold',
						fontSize: 20,
					},
					headerTintColor: theme.colors.text,
					headerTitleAlign: 'center',
					headerRight: () => (
						<Pressable
							onPress={() => router.push('/notifications')}
							style={({ pressed }) => [
								styles.notificationButton,
								{ opacity: pressed ? 0.7 : 1 },
							]}
						>
							<Bell size={24} color={theme.colors.text} />
							{unreadCount > 0 && (
								<View
									style={[
										styles.badge,
										{ backgroundColor: theme.colors.error },
									]}
								>
									<Text style={styles.badgeText}>
										{unreadCount > 99 ? '99+' : unreadCount}
									</Text>
								</View>
							)}
						</Pressable>
					),
				}}
			/>

			<View
				style={[styles.content, { backgroundColor: theme.colors.background }]}
			>
				<Animated.View
					entering={FadeInUp.delay(100).duration(400)}
					style={[styles.card, { backgroundColor: theme.colors.surface }]}
				>
					<View style={styles.cardHeader}>
						<View
							style={[
								styles.iconContainer,
								{ backgroundColor: theme.colors.primary + '20' },
							]}
						>
							<ShieldCheck size={24} color={theme.colors.primary} />
						</View>
						<Text style={[styles.cardTitle, { color: theme.colors.text }]}>
							Security Settings
						</Text>
					</View>

					<View style={styles.settingsList}>
						<View style={styles.settingItem}>
							<View style={styles.settingLabel}>
								<Lock size={20} color={theme.colors.text} />
								<Text
									style={[styles.settingText, { color: theme.colors.text }]}
								>
									App Lock
								</Text>
							</View>
							<Switch
								trackColor={{
									false: theme.colors.border,
									true: theme.colors.primary,
								}}
								thumbColor='#FFFFFF'
								ios_backgroundColor={theme.colors.border}
								onValueChange={handleAppLockToggle}
								value={appLockEnabled}
							/>
						</View>

						{appLockEnabled && (
							<>
								<View
									style={[
										styles.divider,
										{ backgroundColor: theme.colors.border },
									]}
								/>

								{biometricsAvailable && (
									<>
										<View style={styles.settingItem}>
											<View style={styles.settingLabel}>
												<Fingerprint size={20} color={theme.colors.text} />
												<Text
													style={[
														styles.settingText,
														{ color: theme.colors.text },
													]}
												>
													Use {Platform.OS === 'ios' ? 'Face ID' : 'Biometrics'}
												</Text>
											</View>
											<Switch
												trackColor={{
													false: theme.colors.border,
													true: theme.colors.primary,
												}}
												thumbColor='#FFFFFF'
												ios_backgroundColor={theme.colors.border}
												onValueChange={handleBiometricToggle}
												value={useBiometrics}
											/>
										</View>

										<View
											style={[
												styles.divider,
												{ backgroundColor: theme.colors.border },
											]}
										/>
									</>
								)}

								<View style={styles.settingItem}>
									<View style={styles.settingLabel}>
										<Clock size={20} color={theme.colors.text} />
										<Text
											style={[styles.settingText, { color: theme.colors.text }]}
										>
											Lock Interval
										</Text>
									</View>
									<View style={styles.intervalSelector}>
										{[10, 15, 30].map((minutes) => (
											<Pressable
												key={minutes}
												style={[
													styles.intervalButton,
													{
														backgroundColor:
															lockInterval === minutes
																? theme.colors.primary
																: theme.colors.border,
													},
												]}
												onPress={() => setLockInterval(minutes)}
											>
												<Text
													style={[
														styles.intervalText,
														{
															color:
																lockInterval === minutes
																	? '#FFFFFF'
																	: theme.colors.text,
														},
													]}
												>
													{minutes}m
												</Text>
											</Pressable>
										))}
									</View>
								</View>
							</>
						)}
					</View>
				</Animated.View>

				<Animated.View
					entering={FadeInUp.delay(200).duration(400)}
					style={[
						styles.card,
						{ backgroundColor: theme.colors.surface, marginTop: 16 },
					]}
				>
					<View style={styles.cardContent}>
						<Text
							style={[styles.infoText, { color: theme.colors.textSecondary }]}
						>
							Enable app lock to secure your financial data when the app is in
							the background. Choose a PIN and set the lock interval to
							automatically lock the app after the specified time. You can also
							use biometric authentication if available on your device.
						</Text>
					</View>
				</Animated.View>
			</View>

			<Modal
				visible={showPinModal}
				transparent
				animationType='fade'
				onRequestClose={() => setShowPinModal(false)}
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
						<Text style={[styles.modalTitle, { color: theme.colors.text }]}>
							Set PIN
						</Text>

						<TextInput
							style={[
								styles.input,
								{
									color: theme.colors.text,
									borderColor: theme.colors.border,
								},
							]}
							placeholder='Enter 4-digit PIN'
							placeholderTextColor={theme.colors.textSecondary}
							value={newPin}
							onChangeText={setNewPin}
							keyboardType='number-pad'
							maxLength={4}
							secureTextEntry
						/>

						<TextInput
							style={[
								styles.input,
								{
									color: theme.colors.text,
									borderColor: theme.colors.border,
									marginTop: 16,
								},
							]}
							placeholder='Confirm PIN'
							placeholderTextColor={theme.colors.textSecondary}
							value={confirmPin}
							onChangeText={setConfirmPin}
							keyboardType='number-pad'
							maxLength={4}
							secureTextEntry
						/>

						{pinError ? (
							<Text style={[styles.errorText, { color: theme.colors.error }]}>
								{pinError}
							</Text>
						) : null}

						<View style={styles.modalButtons}>
							<Pressable
								style={[
									styles.modalButton,
									{
										backgroundColor: theme.colors.border,
										marginRight: 8,
									},
								]}
								onPress={() => setShowPinModal(false)}
							>
								<Text style={[styles.buttonText, { color: theme.colors.text }]}>
									Cancel
								</Text>
							</Pressable>

							<Pressable
								style={[
									styles.modalButton,
									{
										backgroundColor: theme.colors.primary,
										marginLeft: 8,
									},
								]}
								onPress={handlePinSubmit}
							>
								<Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
									Confirm
								</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</PageContainer>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		padding: 16,
	},
	card: {
		borderRadius: 12,
		overflow: 'hidden',
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 16,
		gap: 12,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: '#E5E7EB',
	},
	iconContainer: {
		width: 44,
		height: 44,
		borderRadius: 22,
		alignItems: 'center',
		justifyContent: 'center',
	},
	cardTitle: {
		fontSize: 18,
		fontFamily: 'Poppins-Medium',
	},
	cardContent: {
		padding: 16,
	},
	settingsList: {
		padding: 16,
	},
	settingItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 12,
	},
	settingLabel: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	settingText: {
		fontSize: 16,
		fontFamily: 'Poppins-Regular',
	},
	divider: {
		height: 1,
		width: '100%',
		opacity: 0.6,
	},
	infoText: {
		fontSize: 14,
		fontFamily: 'Poppins-Regular',
		lineHeight: 20,
	},
	intervalSelector: {
		flexDirection: 'row',
		gap: 8,
	},
	intervalButton: {
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 6,
	},
	intervalText: {
		fontSize: 14,
		fontFamily: 'Poppins-Medium',
	},
	modalContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContent: {
		width: '80%',
		padding: 24,
		borderRadius: 16,
		elevation: 5,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	modalTitle: {
		fontSize: 20,
		fontFamily: 'Poppins-SemiBold',
		marginBottom: 24,
		textAlign: 'center',
	},
	input: {
		width: '100%',
		height: 50,
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 16,
		fontSize: 16,
		fontFamily: 'Poppins-Regular',
	},
	errorText: {
		marginTop: 8,
		fontSize: 14,
		fontFamily: 'Poppins-Regular',
		textAlign: 'center',
	},
	modalButtons: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 24,
	},
	modalButton: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: 'center',
	},
	buttonText: {
		fontSize: 16,
		fontFamily: 'Poppins-SemiBold',
	},
	notificationButton: {
		marginRight: 16,
		position: 'relative',
	},
	badge: {
		position: 'absolute',
		top: -4,
		right: -4,
		minWidth: 18,
		height: 18,
		borderRadius: 9,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 4,
	},
	badgeText: {
		color: '#FFFFFF',
		fontSize: 10,
		fontFamily: 'Poppins-Medium',
	},
});
