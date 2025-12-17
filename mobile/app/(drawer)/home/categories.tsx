import { useState, useMemo } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	Pressable,
	TextInput,
	Platform,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useThemeStore } from '@/store/theme';
import { useCategoryStore } from '@/store/categories';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Search, Plus, Trash2, CreditCard as Edit } from 'lucide-react-native';
import { Category } from '@/types/category';
import ContentWrapper from '@/components/ui/ContentWrapper';
import KeyboardAvoidingView from '@/components/ui/KeyboardAvoidingView';

export default function CategoriesScreen() {
	const { theme } = useThemeStore();
	const { categories, deleteCategory, selectCategory } = useCategoryStore();
	const [searchQuery, setSearchQuery] = useState('');
	const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
		null
	);

	const styles = useMemo(() => createStyles(theme), [theme]);

	const filteredCategories = categories.filter((category) =>
		category.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleCategoryPress = (category: Category) => {
		selectCategory(category);
		router.push('/categories/[id]');
	};

	const handleDeletePress = (id: string) => {
		setShowDeleteConfirm(id);
	};

	const handleDeleteConfirm = (id: string) => {
		deleteCategory(id);
		setShowDeleteConfirm(null);
	};

	const handleEditPress = (category: Category) => {
		selectCategory(category);
		router.push('/categories/edit');
	};

	return (
		<KeyboardAvoidingView style={styles.container}>
			<Stack.Screen
				options={{
					headerShown: true,
					header: () => (
						<View style={styles.header}>
							<ContentWrapper
								style={{
									flexDirection: 'row',
									justifyContent: 'space-between',
									alignItems: 'center',
								}}
							>
								<Text style={styles.title}>Categories</Text>
								<Pressable
									onPress={() => router.push('/categories/new')}
									style={styles.addButton}
								>
									<Plus size={24} color='#FFFFFF' />
								</Pressable>
							</ContentWrapper>
						</View>
					),
				}}
			/>
			<View style={styles.searchContainer}>
				<Search size={20} color={theme.colors.textSecondary} />
				<TextInput
					placeholder='Search categories...'
					value={searchQuery}
					onChangeText={setSearchQuery}
					style={styles.searchInput}
					placeholderTextColor={theme.colors.textSecondary}
				/>
			</View>
			<View style={styles.content}>
				<ScrollView
					style={styles.categoriesList}
					contentContainerStyle={styles.categoriesContent}
				>
					{filteredCategories.map((category, index) => (
						<Animated.View
							key={category.id}
							entering={FadeInUp.delay(index * 100)}
							style={styles.categoryCard}
						>
							<Pressable
								onPress={() => handleCategoryPress(category)}
								style={styles.categoryContent}
							>
								<View
									style={[
										styles.categoryIcon,
										{ backgroundColor: category.color + '20' },
									]}
								>
									<Text style={[styles.iconText, { color: category.color }]}>
										{category.name[0].toUpperCase()}
									</Text>
								</View>
								<View style={styles.categoryInfo}>
									<Text style={styles.categoryName}>{category.name}</Text>
									<Text style={styles.categoryDescription}>
										{category.description}
									</Text>
								</View>
								<View
									style={[
										styles.itemCount,
										{ backgroundColor: theme.colors.primary + '20' },
									]}
								>
									<Text style={styles.itemCountText}>{category.itemCount}</Text>
								</View>
							</Pressable>

							<View style={styles.actions}>
								<Pressable
									onPress={() => handleEditPress(category)}
									style={[
										styles.actionButton,
										{ backgroundColor: theme.colors.primary + '20' },
									]}
								>
									<Edit size={20} color={theme.colors.primary} />
								</Pressable>
								<Pressable
									onPress={() => handleDeletePress(category.id)}
									style={[
										styles.actionButton,
										{ backgroundColor: theme.colors.error + '20' },
									]}
								>
									<Trash2 size={20} color={theme.colors.error} />
								</Pressable>
							</View>

							{showDeleteConfirm === category.id && (
								<View style={styles.deleteConfirm}>
									<Text style={styles.deleteText}>Delete this category?</Text>
									<View style={styles.deleteActions}>
										<Pressable
											onPress={() => setShowDeleteConfirm(null)}
											style={styles.cancelButton}
										>
											<Text style={styles.cancelButtonText}>Cancel</Text>
										</Pressable>
										<Pressable
											onPress={() => handleDeleteConfirm(category.id)}
											style={styles.confirmDeleteButton}
										>
											<Text style={styles.deleteButtonText}>Delete</Text>
										</Pressable>
									</View>
								</View>
							)}
						</Animated.View>
					))}
				</ScrollView>
			</View>
		</KeyboardAvoidingView>
	);
}

const createStyles = (theme: any) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.colors.background,
		},
		content: {
			flex: 1,
			padding: 20,
			...(Platform.OS === 'web' && {
				maxWidth: 1200,
				marginHorizontal: 'auto',
				width: '100%',
			}),
		},
		header: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginTop: 40,
			paddingHorizontal: 10,
			...(Platform.OS === 'web' && {
				maxWidth: 1200,
				marginHorizontal: 'auto',
				width: '100%',
			}),
		},
		title: {
			fontSize: 24,
			fontFamily: 'Inter-Bold',
			color: theme.colors.text,
		},
		addButton: {
			width: 40,
			height: 40,
			borderRadius: 20,
			justifyContent: 'center',
			alignItems: 'center',
			backgroundColor: theme.colors.primary,
		},
		searchContainer: {
			flexDirection: 'row',
			alignItems: 'center',
			marginHorizontal: 20,
			marginTop: 20,
			padding: 5,
			paddingHorizontal: 10,
			borderRadius: 12,
			borderWidth: 1,
			backgroundColor: theme.colors.surface,
			borderColor: theme.colors.border,
			...(Platform.OS === 'web' && {
				maxWidth: 1200,
				marginHorizontal: 'auto',
				width: '100%',
			}),
		},
		searchInput: {
			flex: 1,
			marginLeft: 12,
			fontSize: 16,
			fontFamily: 'Inter-Regular',
			color: theme.colors.text,
		},
		categoriesList: {
			flex: 1,
		},
		categoriesContent: {
			padding: 20,
			gap: 20,
		},
		categoryCard: {
			borderRadius: 16,
			borderWidth: 1,
			padding: 16,
			backgroundColor: theme.colors.surface,
			borderColor: theme.colors.border,
		},
		categoryContent: {
			flexDirection: 'row',
			alignItems: 'center',
		},
		categoryIcon: {
			width: 48,
			height: 48,
			borderRadius: 24,
			justifyContent: 'center',
			alignItems: 'center',
		},
		iconText: {
			fontSize: 20,
			fontFamily: 'Inter-Bold',
		},
		categoryInfo: {
			flex: 1,
			marginLeft: 12,
		},
		categoryName: {
			fontSize: 18,
			fontFamily: 'Inter-SemiBold',
			marginBottom: 4,
			color: theme.colors.text,
		},
		categoryDescription: {
			fontSize: 14,
			fontFamily: 'Inter-Regular',
			color: theme.colors.textSecondary,
		},
		itemCount: {
			paddingHorizontal: 12,
			paddingVertical: 6,
			borderRadius: 12,
		},
		itemCountText: {
			fontSize: 14,
			fontFamily: 'Inter-SemiBold',
			color: theme.colors.primary,
		},
		actions: {
			flexDirection: 'row',
			justifyContent: 'flex-end',
			gap: 8,
			marginTop: 12,
		},
		actionButton: {
			padding: 8,
			borderRadius: 8,
		},
		deleteConfirm: {
			marginTop: 12,
			padding: 12,
			borderRadius: 8,
			alignItems: 'center',
			backgroundColor: theme.colors.surface,
		},
		deleteText: {
			fontSize: 16,
			fontFamily: 'Inter-SemiBold',
			marginBottom: 12,
			color: theme.colors.text,
		},
		deleteActions: {
			flexDirection: 'row',
			gap: 12,
		},
		cancelButton: {
			paddingHorizontal: 16,
			paddingVertical: 8,
			borderRadius: 8,
			backgroundColor: theme.colors.border,
		},
		cancelButtonText: {
			color: theme.colors.text,
			fontSize: 14,
			fontFamily: 'Inter-SemiBold',
		},
		confirmDeleteButton: {
			paddingHorizontal: 16,
			paddingVertical: 8,
			borderRadius: 8,
			backgroundColor: theme.colors.error,
		},
		deleteButtonText: {
			color: '#FFFFFF',
			fontSize: 14,
			fontFamily: 'Inter-SemiBold',
		},
	});
