import {
	View,
	Text,
	StyleSheet,
	TextInput,
	Pressable,
	ScrollView,
} from 'react-native';

import { Stack } from 'expo-router';
import { useThemeStore } from '@/store/theme';
import { useState } from 'react';
import { KeySquare, Eye, EyeOff, CheckCircle } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function ChangePasswordScreen() {
	const { theme } = useThemeStore();
	const [formData, setFormData] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [passwordError, setPasswordError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	interface FormData {
		currentPassword: string;
		newPassword: string;
		confirmPassword: string;
	}

	type HandleChange = (field: keyof FormData, value: string) => void;

	const handleChange: HandleChange = (field, value) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));

		// Clear error when user types
		if (passwordError) {
			setPasswordError('');
		}
	};

	// Password strength checker
	interface PasswordStrength {
		strength: number;
		text: string;
	}

	const getPasswordStrength = (password: string): PasswordStrength => {
		if (!password) return { strength: 0, text: 'Very Weak' };

		let strength = 0;
		if (password.length >= 8) strength += 1;
		if (password.match(/[a-z]+/)) strength += 1;
		if (password.match(/[A-Z]+/)) strength += 1;
		if (password.match(/[0-9]+/)) strength += 1;
		if (password.match(/[^a-zA-Z0-9]+/)) strength += 1;

		const strengthTexts: string[] = [
			'Very Weak',
			'Weak',
			'Moderate',
			'Strong',
			'Very Strong',
		];
		return {
			strength,
			text: strengthTexts[strength - 1] || 'Very Weak',
		};
	};

	const passwordStrength = getPasswordStrength(formData.newPassword);

	// Get color based on strength
	const getStrengthColor = () => {
		const colors = [
			theme.colors.error, // Very Weak
			'#FFA500', // Weak (Orange)
			'#FFD700', // Moderate (Gold)
			'#90EE90', // Strong (Light Green)
			theme.colors.success, // Very Strong
		];
		return colors[passwordStrength.strength - 1] || theme.colors.error;
	};

	const handleSubmit = () => {
		// Validate passwords
		if (!formData.currentPassword) {
			setPasswordError('Current password is required');
			return;
		}

		if (!formData.newPassword) {
			setPasswordError('New password is required');
			return;
		}

		if (formData.newPassword.length < 8) {
			setPasswordError('Password must be at least 8 characters');
			return;
		}

		if (formData.newPassword !== formData.confirmPassword) {
			setPasswordError('Passwords do not match');
			return;
		}

		// Simulate API call
		setIsSubmitting(true);
		setTimeout(() => {
			setIsSubmitting(false);
			setIsSuccess(true);

			// Reset form after 2 seconds
			setTimeout(() => {
				setFormData({
					currentPassword: '',
					newPassword: '',
					confirmPassword: '',
				});
				setIsSuccess(false);
			}, 2000);
		}, 1500);
	};

	return (
		<View
			style={[styles.container, { backgroundColor: theme.colors.background }]}
		>
			<Stack.Screen
				options={{
					title: 'Change Password',
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

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.contentContainer}
				keyboardShouldPersistTaps='handled'
			>
				<Animated.View
					entering={FadeInUp.delay(100).duration(400)}
					style={[styles.card, { backgroundColor: theme.colors.surface }]}
				>
					<View style={styles.cardHeader}>
						<View
							style={[
								styles.iconContainer,
								{ backgroundColor: theme.colors.secondary + '20' },
							]}
						>
							<KeySquare size={24} color={theme.colors.secondary} />
						</View>
						<Text style={[styles.cardTitle, { color: theme.colors.text }]}>
							Update Your Password
						</Text>
					</View>

					<View style={styles.formContainer}>
						{/* Current Password */}
						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: theme.colors.text }]}>
								Current Password
							</Text>
							<View
								style={[
									styles.inputContainer,
									{
										backgroundColor: theme.colors.background,
										borderColor: theme.colors.border,
									},
								]}
							>
								<TextInput
									style={[styles.input, { color: theme.colors.text }]}
									placeholder='Enter your current password'
									placeholderTextColor={theme.colors.textSecondary}
									secureTextEntry={!showCurrentPassword}
									value={formData.currentPassword}
									onChangeText={(text) => handleChange('currentPassword', text)}
								/>
								<Pressable
									onPress={() => setShowCurrentPassword(!showCurrentPassword)}
									style={styles.eyeIcon}
								>
									{showCurrentPassword ? (
										<EyeOff size={20} color={theme.colors.textSecondary} />
									) : (
										<Eye size={20} color={theme.colors.textSecondary} />
									)}
								</Pressable>
							</View>
						</View>

						{/* New Password */}
						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: theme.colors.text }]}>
								New Password
							</Text>
							<View
								style={[
									styles.inputContainer,
									{
										backgroundColor: theme.colors.background,
										borderColor: theme.colors.border,
									},
								]}
							>
								<TextInput
									style={[styles.input, { color: theme.colors.text }]}
									placeholder='Enter your new password'
									placeholderTextColor={theme.colors.textSecondary}
									secureTextEntry={!showNewPassword}
									value={formData.newPassword}
									onChangeText={(text) => handleChange('newPassword', text)}
								/>
								<Pressable
									onPress={() => setShowNewPassword(!showNewPassword)}
									style={styles.eyeIcon}
								>
									{showNewPassword ? (
										<EyeOff size={20} color={theme.colors.textSecondary} />
									) : (
										<Eye size={20} color={theme.colors.textSecondary} />
									)}
								</Pressable>
							</View>

							{formData.newPassword && (
								<View style={styles.strengthContainer}>
									<Text
										style={[
											styles.strengthLabel,
											{ color: theme.colors.textSecondary },
										]}
									>
										Password Strength:
									</Text>
									<Text
										style={[styles.strengthText, { color: getStrengthColor() }]}
									>
										{passwordStrength.text}
									</Text>
									<View style={styles.strengthBar}>
										{[1, 2, 3, 4, 5].map((level) => (
											<View
												key={level}
												style={[
													styles.strengthSegment,
													{
														backgroundColor:
															level <= passwordStrength.strength
																? getStrengthColor()
																: theme.colors.border,
													},
												]}
											/>
										))}
									</View>
								</View>
							)}
						</View>

						{/* Confirm Password */}
						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: theme.colors.text }]}>
								Confirm New Password
							</Text>
							<View
								style={[
									styles.inputContainer,
									{
										backgroundColor: theme.colors.background,
										borderColor: theme.colors.border,
									},
								]}
							>
								<TextInput
									style={[styles.input, { color: theme.colors.text }]}
									placeholder='Confirm your new password'
									placeholderTextColor={theme.colors.textSecondary}
									secureTextEntry={!showConfirmPassword}
									value={formData.confirmPassword}
									onChangeText={(text) => handleChange('confirmPassword', text)}
								/>
								<Pressable
									onPress={() => setShowConfirmPassword(!showConfirmPassword)}
									style={styles.eyeIcon}
								>
									{showConfirmPassword ? (
										<EyeOff size={20} color={theme.colors.textSecondary} />
									) : (
										<Eye size={20} color={theme.colors.textSecondary} />
									)}
								</Pressable>
							</View>

							{formData.newPassword && formData.confirmPassword && (
								<View style={styles.matchContainer}>
									{formData.newPassword === formData.confirmPassword ? (
										<Text
											style={[
												styles.matchText,
												{ color: theme.colors.success },
											]}
										>
											Passwords match ✓
										</Text>
									) : (
										<Text
											style={[styles.matchText, { color: theme.colors.error }]}
										>
											Passwords do not match
										</Text>
									)}
								</View>
							)}
						</View>

						{/* Error message */}
						{passwordError ? (
							<Text style={[styles.errorText, { color: theme.colors.error }]}>
								{passwordError}
							</Text>
						) : null}

						{/* Success message */}
						{isSuccess && (
							<Animated.View
								entering={FadeInUp.duration(300)}
								style={styles.successContainer}
							>
								<CheckCircle size={20} color={theme.colors.success} />
								<Text
									style={[styles.successText, { color: theme.colors.success }]}
								>
									Password changed successfully!
								</Text>
							</Animated.View>
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
							For security reasons, your password should be at least 8
							characters long and include a mix of uppercase and lowercase
							letters, numbers, and special characters.
						</Text>
					</View>
				</Animated.View>

				<Animated.View
					entering={FadeInUp.delay(300).duration(400)}
					style={styles.buttonContainer}
				>
					<Pressable
						style={({ pressed }) => [
							styles.button,
							{
								backgroundColor:
									isSubmitting ||
									!formData.currentPassword ||
									!formData.newPassword ||
									!formData.confirmPassword
										? theme.colors.primary + '80'
										: theme.colors.primary,
								opacity: pressed ? 0.9 : 1,
							},
						]}
						onPress={handleSubmit}
						disabled={
							isSubmitting ||
							!formData.currentPassword ||
							!formData.newPassword ||
							!formData.confirmPassword
						}
					>
						<Text style={styles.buttonText}>
							{isSubmitting ? 'Updating...' : 'Update Password'}
						</Text>
					</Pressable>
				</Animated.View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	contentContainer: {
		padding: 16,
		paddingBottom: 40,
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
	formContainer: {
		padding: 16,
		gap: 16,
	},
	inputGroup: {
		gap: 6,
	},
	label: {
		fontSize: 14,
		fontFamily: 'Poppins-Medium',
		marginLeft: 4,
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderRadius: 8,
		height: 50,
		paddingHorizontal: 12,
	},
	input: {
		flex: 1,
		height: '100%',
		fontSize: 16,
		fontFamily: 'Poppins-Regular',
	},
	eyeIcon: {
		padding: 8,
	},
	strengthContainer: {
		marginTop: 8,
	},
	strengthLabel: {
		fontSize: 12,
		fontFamily: 'Poppins-Regular',
	},
	strengthText: {
		fontSize: 14,
		fontFamily: 'Poppins-Medium',
		marginTop: 2,
	},
	strengthBar: {
		flexDirection: 'row',
		gap: 4,
		marginTop: 6,
	},
	strengthSegment: {
		flex: 1,
		height: 4,
		borderRadius: 2,
	},
	matchContainer: {
		marginTop: 8,
	},
	matchText: {
		fontSize: 14,
		fontFamily: 'Poppins-Medium',
	},
	errorText: {
		fontSize: 14,
		fontFamily: 'Poppins-Medium',
		marginTop: 8,
		textAlign: 'center',
	},
	successContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		marginTop: 8,
	},
	successText: {
		fontSize: 14,
		fontFamily: 'Poppins-Medium',
	},
	infoText: {
		fontSize: 14,
		fontFamily: 'Poppins-Regular',
		lineHeight: 20,
	},
	buttonContainer: {
		marginTop: 24,
		alignItems: 'center',
	},
	button: {
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 12,
		minWidth: 200,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 2,
	},
	buttonText: {
		fontSize: 16,
		fontFamily: 'Poppins-SemiBold',
		color: '#FFFFFF',
	},
});
