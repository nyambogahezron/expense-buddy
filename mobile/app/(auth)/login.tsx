import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Lock, Mail } from 'lucide-react-native';
import { useThemeStore } from '@/store/theme';

export default function LoginScreen() {
	const { theme } = useThemeStore();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);

	const handleLogin = () => {
		if (!email || !password) {
			setError('Please fill in all fields');
			return;
		}
		// TODO: Implement actual login logic
		router.replace('/(tabs)');
	};

	return (
		<View
			style={[styles.container, { backgroundColor: theme.colors.background }]}
		>
			<StatusBar style='auto' />

			<View style={styles.header}>
				<Text style={[styles.title, { color: theme.colors.text }]}>
					Welcome Back
				</Text>
				<Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
					Sign in to continue tracking your finances
				</Text>
			</View>

			<Animated.View
				entering={FadeInDown.duration(1000).springify()}
				style={styles.form}
			>
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

					<View
						style={[
							styles.inputContainer,
							{
								backgroundColor: theme.colors.surface,
								borderColor: theme.colors.border,
							},
						]}
					>
						<Lock size={20} color={theme.colors.textSecondary} />
						<TextInput
							placeholder='Password'
							value={password}
							onChangeText={setPassword}
							secureTextEntry
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

				<Link href='/forgot-password' style={styles.forgotPassword}>
					<Text
						style={[styles.forgotPasswordText, { color: theme.colors.primary }]}
					>
						Forgot Password?
					</Text>
				</Link>

				<Pressable
					onPress={handleLogin}
					style={({ pressed }) => [
						styles.button,
						{ backgroundColor: theme.colors.primary },
						pressed && { opacity: 0.8 },
					]}
				>
					<Text style={styles.buttonText}>Sign In</Text>
				</Pressable>

				<View style={styles.footer}>
					<Text
						style={[styles.footerText, { color: theme.colors.textSecondary }]}
					>
						Don't have an account?
					</Text>
					<Link href='/register' style={styles.link}>
						<Text style={[styles.linkText, { color: theme.colors.primary }]}>
							Sign Up
						</Text>
					</Link>
				</View>
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
	},
	header: {
		marginTop: 60,
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
	forgotPassword: {
		alignSelf: 'flex-end',
		marginBottom: 24,
	},
	forgotPasswordText: {
		fontSize: 14,
		fontFamily: 'Inter-SemiBold',
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
	footer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 24,
		gap: 8,
	},
	footerText: {
		fontSize: 14,
		fontFamily: 'Inter-Regular',
	},
	link: {
		padding: 4,
	},
	linkText: {
		fontSize: 14,
		fontFamily: 'Inter-SemiBold',
	},
});
