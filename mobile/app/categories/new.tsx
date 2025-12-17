import { useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TextInput,
	Pressable,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useThemeStore } from '@/store/theme';
import { useCategoryStore } from '@/store/categories';
import { ArrowLeft } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import ContentWrapper from '@/components/ui/ContentWrapper';

const COLORS = [
	'#EF4444',
	'#F59E0B',
	'#10B981',
	'#3B82F6',
	'#6366F1',
	'#8B5CF6',
	'#EC4899',
	'#6B7280',
];

export default function NewCategoryScreen() {
	const { theme } = useThemeStore();
	const { addCategory } = useCategoryStore();
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [selectedColor, setSelectedColor] = useState(COLORS[0]);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = () => {
		if (!name) {
			setError('Please enter a category name');
			return;
		}

		try {
			addCategory({
				name,
				description,
				color: selectedColor,
				icon: 'tag',
			});
			router.back();
		} catch (err) {
			setError('Failed to create category. Please try again.');
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
							<ContentWrapper
								style={{
									flexDirection: 'row',
									alignItems: 'center',
								}}
							>
								<Pressable
									onPress={() => router.back()}
									style={styles.backButton}
								>
									<ArrowLeft size={24} color={theme.colors.text} />
								</Pressable>
								<Text style={[styles.title, { color: theme.colors.text }]}>
									New Category
								</Text>
							</ContentWrapper>
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

						<View style={styles.form}>
							<View style={styles.inputGroup}>
								<Text style={[styles.label, { color: theme.colors.text }]}>
									Category Name
								</Text>
								<TextInput
									value={name}
									onChangeText={setName}
									placeholder='Enter category name'
									style={[
										styles.input,
										{
											backgroundColor: theme.colors.surface,
											borderColor: theme.colors.border,
											color: theme.colors.text,
										},
									]}
									placeholderTextColor={theme.colors.textSecondary}
								/>
							</View>

							<View style={styles.inputGroup}>
								<Text style={[styles.label, { color: theme.colors.text }]}>
									Description (Optional)
								</Text>
								<TextInput
									value={description}
									onChangeText={setDescription}
									placeholder='Enter description'
									multiline
									numberOfLines={3}
									style={[
										styles.input,
										styles.textArea,
										{
											backgroundColor: theme.colors.surface,
											borderColor: theme.colors.border,
											color: theme.colors.text,
										},
									]}
									placeholderTextColor={theme.colors.textSecondary}
								/>
							</View>

							<View style={styles.inputGroup}>
								<Text style={[styles.label, { color: theme.colors.text }]}>
									Color
								</Text>
								<View style={styles.colorGrid}>
									{COLORS.map((color) => (
										<Pressable
											key={color}
											onPress={() => setSelectedColor(color)}
											style={[
												styles.colorButton,
												{
													backgroundColor: color,
													borderWidth: selectedColor === color ? 3 : 0,
													borderColor: theme.colors.surface,
												},
											]}
										/>
									))}
								</View>
							</View>

							<View style={styles.buttons}>
								<Pressable
									onPress={() => router.back()}
									style={[
										styles.button,
										{
											backgroundColor: theme.colors.surface,
											borderColor: theme.colors.border,
										},
									]}
								>
									<Text
										style={[styles.buttonText, { color: theme.colors.text }]}
									>
										Cancel
									</Text>
								</Pressable>
								<Pressable
									onPress={handleSubmit}
									style={[
										styles.button,
										{ backgroundColor: theme.colors.primary },
									]}
								>
									<Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
										Create Category
									</Text>
								</Pressable>
							</View>
						</View>
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
		paddingTop: 20,
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
	form: {
		padding: 20,
		gap: 24,
	},
	inputGroup: {
		gap: 8,
	},
	label: {
		fontSize: 16,
		fontFamily: 'Inter-SemiBold',
	},
	input: {
		height: 48,
		borderRadius: 12,
		borderWidth: 1,
		paddingHorizontal: 16,
		fontSize: 16,
		fontFamily: 'Inter-Regular',
	},
	textArea: {
		height: 100,
		paddingTop: 12,
		paddingBottom: 12,
		textAlignVertical: 'top',
	},
	colorGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 12,
	},
	colorButton: {
		width: 48,
		height: 48,
		borderRadius: 24,
	},
	buttons: {
		flexDirection: 'row',
		gap: 12,
		marginTop: 12,
	},
	button: {
		flex: 1,
		height: 48,
		borderRadius: 12,
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	buttonText: {
		fontSize: 16,
		fontFamily: 'Inter-SemiBold',
	},
});
