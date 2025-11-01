import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { useThemeStore } from '@/store/theme';

export default function ForgotPasswordScreen() {
	const { theme } = useThemeStore();
	const [email, setEmail] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const handleResetPassword = () => {
		if (!email) {
			setError('Please enter your email address');
			return;
		}
		// TODO: Implement actual password reset logic
		setSuccess(true);
	};

	return (
		<View
			style={[styles.container, { backgroundColor: theme.colors.background }]}
		>
			<StatusBar style='auto' />

			<Link href='/login' style={styles.backButton}>
				<ArrowLeft size={24} color={theme.colors.text} />
			</Link>

			<View style={styles.header}>
				<Text style={[styles.title, { color: theme.colors.text }]}>
					Reset Password
				</Text>
				<Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
					Enter your email address to receive password reset instructions
				</Text>
			</View>

			<Animated.View
				entering={FadeInDown.duration(1000).springify()}
				style={styles.form}
			>
				{!success ? (
					<>
						<View style={styles.inputGroup}>
							<View
								style={[
									styles.inputContainer,
									{
										backgroundColor: theme.colors.surface,
										borderColor: theme.colors.border,
									},
								]}
							>
								<Mail size={20} color={theme.colors.textSecondary} />
								<TextInput
									placeholder='Email'
									value={email}
									onChangeText={setEmail}
									autoCapitalize='none'
									keyboardType='email-address'
									style={[styles.input, { color: theme.colors.text }]}
									placeholderTextColor={theme.colors.textSecondary}
								/>
							</View>

							{error && (
								<Text style={[styles.errorText, { color: theme.colors.error }]}>
									{error}
								</Text>
							)}
						</View>

						<Pressable
							onPress={handleResetPassword}
							style={({ pressed }) => [
								styles.button,
								{ backgroundColor: theme.colors.primary },
								pressed && { opacity: 0.8 },
							]}
						>
							<Text style={styles.buttonText}>Send Reset Link</Text>
						</Pressable>
					</>
				) : (
					<View style={styles.successContainer}>
						<Text style={[styles.successTitle, { color: theme.colors.text }]}>
							Check Your Email
						</Text>
						<Text
							style={[
								styles.successText,
								{ color: theme.colors.textSecondary },
							]}
						>
							We've sent password reset instructions to your email address.
						</Text>
						<Link
							href='/login'
							style={[styles.button, { backgroundColor: theme.colors.primary }]}
						>
							<Text style={styles.buttonText}>Return to Login</Text>
						</Link>
					</View>
				)}
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
	},
	backButton: {
		marginTop: 40,
		marginBottom: 20,
		width: 40,
		height: 40,
		justifyContent: 'center',
	},
	header: {
		marginBottom: 40,
	},
	title: {
		fontSize: 32,
		fontFamily: 'Inter-Bold',
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		fontFamily: 'Inter-Regular',
	},
	form: {
		flex: 1,
	},
	inputGroup: {
		gap: 16,
		marginBottom: 24,
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
		gap: 12,
	},
	input: {
		flex: 1,
		fontSize: 16,
		fontFamily: 'Inter-Regular',
	},
	errorText: {
		fontSize: 14,
		fontFamily: 'Inter-Regular',
		marginTop: 8,
	},
	button: {
		padding: 16,
		borderRadius: 12,
		alignItems: 'center',
	},
	buttonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontFamily: 'Inter-SemiBold',
	},
	successContainer: {
		alignItems: 'center',
		gap: 16,
	},
	successTitle: {
		fontSize: 24,
		fontFamily: 'Inter-Bold',
		textAlign: 'center',
	},
	successText: {
		fontSize: 16,
		fontFamily: 'Inter-Regular',
		textAlign: 'center',
		marginBottom: 24,
	},
});
