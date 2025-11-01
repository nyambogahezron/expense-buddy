import { useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	Pressable,
	Platform,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useThemeStore } from '@/store/theme';
import { useTransactionStore } from '@/store/transactions';
import { TransactionForm } from '@/components/TransactionForm';
import { ArrowLeft } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import ContentWrapper from '@/components/ui/ContentWrapper';

export default function NewTransactionScreen() {
	const { theme } = useThemeStore();
	const { addTransaction } = useTransactionStore();
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (values: any) => {
		try {
			setError(null);
			await addTransaction(values);
			router.back();
		} catch (err) {
			setError('Failed to create transaction. Please try again.');
		}
	};

	return (
		<View
			style={[styles.container, { backgroundColor: theme.colors.background }]}
		>
			<Stack.Screen
				options={{
					headerShown: true,
					header: () => (
						<View
							style={[
								styles.header,
								{ backgroundColor: theme.colors.background },
							]}
						>
							<View style={styles.headerWrapper}>
								<Pressable
									style={styles.backButton}
									onPress={() => router.back()}
								>
									<ArrowLeft size={24} color={theme.colors.text} />
								</Pressable>
								<Text style={[styles.title, { color: theme.colors.text }]}>
									New Transaction
								</Text>
							</View>
						</View>
					),
				}}
			/>
			<ScrollView style={styles.content}>
				<ContentWrapper>
					<Animated.View entering={FadeIn}>
						{error && (
							<Text style={[styles.error, { color: theme.colors.error }]}>
								{error}
							</Text>
						)}
						<TransactionForm
							onSubmit={handleSubmit}
							onCancel={() => router.back()}
						/>
					</Animated.View>
				</ContentWrapper>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 20,
		paddingTop: 50,
	},
	headerWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
		...Platform.select({
			web: {
				width: '100%',
				maxWidth: 1200,
				marginHorizontal: 'auto',
			},
		}),
	},
	backButton: {
		padding: 8,
	},
	title: {
		fontSize: 24,
		fontFamily: 'Inter-Bold',
		marginLeft: 12,
	},
	content: {
		flex: 1,
	},
	error: {
		fontSize: 14,
		fontFamily: 'Inter-Regular',
		marginHorizontal: 20,
		marginBottom: 16,
	},
});
