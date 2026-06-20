import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native'
import { router, Stack } from 'expo-router'
import { useTransactionStore } from '@/store/transactions';
import { TransactionForm } from '@/components/TransactionForm';
import { ArrowLeft } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { design } from '@/constants/design'

export default function NewTransactionScreen() {
	const { addTransaction } = useTransactionStore()
	const [error, setError] = useState<string | null>(null)

	const handleSubmit = async (values: any) => {
		try {
			setError(null)
			await addTransaction(values)
			router.back()
		} catch (err) {
			setError('Failed to create transaction. Please try again.')
		}
	}

	return (
		<View style={styles.container}>
			<Stack.Screen
				options={{
					headerShown: true,
					header: () => (
						<View style={styles.header}>
							<View style={styles.headerWrapper}>
								<Pressable
									style={({ pressed }) => [
										styles.backButton,
										pressed && { opacity: 0.7 },
									]}
									onPress={() => router.back()}
								>
									<ArrowLeft size={24} color={design.colors.text} />
								</Pressable>
								<Text style={styles.title}>New Transaction</Text>
							</View>
						</View>
					),
				}}
			/>
			<View style={styles.content}>
				<Animated.View entering={FadeIn} style={{ flex: 1 }}>
					{error && <Text style={styles.error}>{error}</Text>}
					<TransactionForm
						onSubmit={handleSubmit}
						onCancel={() => router.back()}
					/>
				</Animated.View>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: design.colors.base,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: design.spacing.md,
		paddingTop: Platform.OS === 'ios' ? 60 : 40,
		backgroundColor: design.colors.base,
	},
	headerWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
		...Platform.select({
			web: {
				maxWidth: 1200,
				marginHorizontal: 'auto',
			},
		}),
	},
	backButton: {
		padding: design.spacing.sm,
		backgroundColor: design.colors.surface,
		borderRadius: design.borderRadius.pill,
	},
	title: {
		...design.typography.h2,
		color: design.colors.text,
		marginLeft: design.spacing.md,
	},
	content: {
		flex: 1,
	},
	error: {
		...design.typography.body,
		color: design.colors.error,
		marginHorizontal: design.spacing.lg,
		marginBottom: design.spacing.md,
		backgroundColor: design.colors.errorBg,
		padding: design.spacing.md,
		borderRadius: design.borderRadius.md,
	},
})
