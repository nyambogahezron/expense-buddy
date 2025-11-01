import { View, StyleSheet, Dimensions, Pressable, Text } from 'react-native';
import { useThemeStore } from '@/store/theme';
import { themes, ThemeType } from '@/types/theme';
import Animated, {
	FadeIn,
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	Easing,
	FadeInUp,
	runOnJS,
	cancelAnimation,
	withRepeat,
	withSequence,
	withDelay,
} from 'react-native-reanimated';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react-native';
import { useState, useCallback, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
	Directions,
	Gesture,
	GestureDetector,
} from 'react-native-gesture-handler';
import { Stack } from 'expo-router';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ANIMATION_DURATION = 350;

export default function SettingsScreen() {
	const { currentTheme, isTransitioning, setThemeWithTransition } =
		useThemeStore();
	const theme = themes[currentTheme];
	const [previewIndex, setPreviewIndex] = useState(
		Object.keys(themes).indexOf(currentTheme)
	);
	const translateX = useSharedValue(-previewIndex * SCREEN_WIDTH);
	const [isAnimating, setIsAnimating] = useState(false);
	const themeSlides = useMemo(() => Object.keys(themes) as ThemeType[], []);
	const totalSlides = themeSlides.length;

	// Animation values for loading dots
	const dot1Scale = useSharedValue(0.8);
	const dot2Scale = useSharedValue(0.8);
	const dot3Scale = useSharedValue(0.8);

	// Check if the currently previewed theme is different from the active theme
	const previewThemeKey = themeSlides[previewIndex];
	const isPreviewDifferentFromCurrent = previewThemeKey !== currentTheme;

	// Navigation functions
	const navigateSlide = useCallback(
		(newIndex: number) => {
			if (
				newIndex >= 0 &&
				newIndex < totalSlides &&
				!isAnimating &&
				!isTransitioning
			) {
				setIsAnimating(true);

				// Cancel any ongoing animations
				cancelAnimation(translateX);

				translateX.value = withTiming(
					-newIndex * SCREEN_WIDTH,
					{
						duration: ANIMATION_DURATION,
						easing: Easing.inOut(Easing.ease),
					},
					(finished) => {
						if (finished) {
							runOnJS(setPreviewIndex)(newIndex);
							runOnJS(setIsAnimating)(false);
						}
					}
				);
			}
		},
		[totalSlides, isAnimating, isTransitioning, translateX]
	);

	const onNext = useCallback(() => {
		if (previewIndex < totalSlides - 1) {
			navigateSlide(previewIndex + 1);
		}
	}, [previewIndex, totalSlides, navigateSlide]);

	const onPrev = useCallback(() => {
		if (previewIndex > 0) {
			navigateSlide(previewIndex - 1);
		}
	}, [previewIndex, navigateSlide]);

	// Apply theme function
	const applySelectedTheme = useCallback(() => {
		if (isTransitioning || !isPreviewDifferentFromCurrent) return;

		// Apply theme change with our transition method
		setThemeWithTransition(themeSlides[previewIndex], ANIMATION_DURATION);
	}, [
		previewIndex,
		themeSlides,
		setThemeWithTransition,
		isTransitioning,
		isPreviewDifferentFromCurrent,
	]);

	const onSwipe = useMemo(
		() =>
			Gesture.Simultaneous(
				Gesture.Fling()
					.direction(Directions.LEFT)
					.onEnd(() => {
						'worklet';
						if (!isAnimating && !isTransitioning) {
							runOnJS(onNext)();
						}
					}),
				Gesture.Fling()
					.direction(Directions.RIGHT)
					.onEnd(() => {
						'worklet';
						if (!isAnimating && !isTransitioning) {
							runOnJS(onPrev)();
						}
					})
			),
		[onNext, onPrev, isAnimating, isTransitioning]
	);

	// Start loading dots animation when transitioning
	useMemo(() => {
		if (isTransitioning) {
			// Animate the dots in sequence with pulsing effect
			dot1Scale.value = withRepeat(
				withSequence(
					withTiming(1.2, { duration: 400, easing: Easing.ease }),
					withTiming(0.8, { duration: 400, easing: Easing.ease })
				),
				-1,
				true
			);

			dot2Scale.value = withDelay(
				100,
				withRepeat(
					withSequence(
						withTiming(1.2, { duration: 400, easing: Easing.ease }),
						withTiming(0.8, { duration: 400, easing: Easing.ease })
					),
					-1,
					true
				)
			);

			dot3Scale.value = withDelay(
				200,
				withRepeat(
					withSequence(
						withTiming(1.2, { duration: 400, easing: Easing.ease }),
						withTiming(0.8, { duration: 400, easing: Easing.ease })
					),
					-1,
					true
				)
			);
		} else {
			// Reset dots when not transitioning
			cancelAnimation(dot1Scale);
			cancelAnimation(dot2Scale);
			cancelAnimation(dot3Scale);
			dot1Scale.value = withTiming(0.8);
			dot2Scale.value = withTiming(0.8);
			dot3Scale.value = withTiming(0.8);
		}
	}, [isTransitioning, dot1Scale, dot2Scale, dot3Scale]);

	const dot1Style = useAnimatedStyle(() => ({
		transform: [{ scale: dot1Scale.value }],
	}));

	const dot2Style = useAnimatedStyle(() => ({
		transform: [{ scale: dot2Scale.value }],
	}));

	const dot3Style = useAnimatedStyle(() => ({
		transform: [{ scale: dot3Scale.value }],
	}));

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateX: translateX.value }],
		};
	});

	return (
		<View
			style={[styles.container, { backgroundColor: theme.colors.background }]}
		>
			<Stack.Screen
				options={{
					title: 'Theme Customization',
					headerStyle: {
						backgroundColor: theme.colors.primary,
					},
					headerTitleStyle: {
						color: theme.colors.text,
						fontFamily: 'Inter-SemiBold',
						fontSize: 20,
					},
					headerTintColor: theme.colors.text,
					headerTitleAlign: 'center',
				}}
			/>

			<View style={{ flex: 1, padding: 2 }}>
				<View style={styles.slideContainer}>
					<GestureDetector gesture={onSwipe}>
						<Animated.View style={[styles.slidesWrapper, animatedStyle]}>
							{themeSlides.map((themeKey, index) => {
								const currentThemeData = themes[themeKey];
								return (
									<View key={themeKey} style={styles.slideItem}>
										<Animated.View
											style={[
												styles.themePreviewContainer,
												{
													backgroundColor: currentThemeData.colors.surface,
													borderColor: theme.colors.border,
												},
											]}
										>
											{/* Background color or gradient */}
											<View style={styles.themePreviewTop}>
												{currentThemeData.gradients ? (
													<LinearGradient
														colors={
															currentThemeData.gradients.primary as [
																string,
																string,
																...string[]
															]
														}
														start={{ x: 0, y: 0 }}
														end={{ x: 1, y: 0 }}
														style={styles.themePreviewGradient}
													/>
												) : (
													<View
														style={[
															styles.themePreviewBackground,
															{
																backgroundColor:
																	currentThemeData.colors.primary,
															},
														]}
													/>
												)}
											</View>

											{/* Theme name */}
											<Animated.Text
												entering={FadeInUp.delay(100).duration(300)}
												style={[
													styles.themeName,
													{ color: currentThemeData.colors.text },
												]}
											>
												{currentThemeData.name}
											</Animated.Text>

											{/* Color samples */}
											<Animated.View
												entering={FadeInUp.delay(200).duration(300)}
												style={styles.colorSamplesContainer}
											>
												<View
													style={[
														styles.colorSample,
														{
															backgroundColor: currentThemeData.colors.primary,
														},
													]}
												/>
												<View
													style={[
														styles.colorSample,
														{
															backgroundColor:
																currentThemeData.colors.secondary,
														},
													]}
												/>
												<View
													style={[
														styles.colorSample,
														{ backgroundColor: currentThemeData.colors.accent },
													]}
												/>
											</Animated.View>

											{/* Active theme indicator */}
											{themeKey === currentTheme && (
												<Animated.View
													entering={FadeIn.duration(300)}
													style={styles.activeThemeBadge}
												>
													<Check size={16} color='#FFF' />
													<Text style={styles.activeThemeText}>Current</Text>
												</Animated.View>
											)}
										</Animated.View>

										{index === previewIndex && (
											<Animated.View
												entering={FadeIn.duration(300)}
												style={[
													styles.activeIndicator,
													{ backgroundColor: theme.colors.primary },
												]}
											/>
										)}
									</View>
								);
							})}
						</Animated.View>
					</GestureDetector>

					{/* Navigation arrows */}
					<View style={styles.navigationControls}>
						<Pressable
							onPress={onPrev}
							disabled={previewIndex === 0 || isAnimating || isTransitioning}
							style={({ pressed }) => [
								styles.navButton,
								{
									backgroundColor: theme.colors.surface,
									opacity:
										previewIndex === 0 || isAnimating || isTransitioning
											? 0.5
											: pressed
											? 0.8
											: 1,
								},
							]}
						>
							<ArrowLeft size={20} color={theme.colors.primary} />
						</Pressable>

						{/* Loading  */}
						<View style={styles.pagination}>
							{isTransitioning ? (
								<View style={styles.loadingDotsContainer}>
									<Animated.View
										style={[
											styles.loadingDot,
											dot1Style,
											{ backgroundColor: theme.colors.primary },
										]}
									/>
									<Animated.View
										style={[
											styles.loadingDot,
											dot2Style,
											{ backgroundColor: theme.colors.primary },
										]}
									/>
									<Animated.View
										style={[
											styles.loadingDot,
											dot3Style,
											{ backgroundColor: theme.colors.primary },
										]}
									/>
								</View>
							) : (
								// Show regular pagination dots when not transitioning
								themeSlides.map((_, i) => (
									<View
										key={`dot-${i}`}
										style={[
											styles.paginationDot,
											{
												backgroundColor:
													i === previewIndex
														? theme.colors.primary
														: theme.colors.border,
												width: i === previewIndex ? 20 : 8,
											},
										]}
									/>
								))
							)}
						</View>

						<Pressable
							onPress={onNext}
							disabled={
								previewIndex === totalSlides - 1 ||
								isAnimating ||
								isTransitioning
							}
							style={({ pressed }) => [
								styles.navButton,
								{
									backgroundColor: theme.colors.surface,
									opacity:
										previewIndex === totalSlides - 1 ||
										isAnimating ||
										isTransitioning
											? 0.5
											: pressed
											? 0.8
											: 1,
								},
							]}
						>
							<ArrowRight size={20} color={theme.colors.primary} />
						</Pressable>
					</View>

					{/* Apply Theme Button or Applying Message */}
					{isTransitioning ? (
						<Animated.Text
							entering={FadeIn.delay(200)}
							style={[styles.helperText, { color: theme.colors.textSecondary }]}
						>
							Applying theme...
						</Animated.Text>
					) : (
						isPreviewDifferentFromCurrent && (
							<Animated.View
								entering={FadeIn.delay(100)}
								style={styles.applyButtonContainer}
							>
								<Pressable
									onPress={applySelectedTheme}
									style={({ pressed }) => [
										styles.applyButton,
										{
											backgroundColor: theme.colors.primary,
											opacity: pressed ? 0.9 : 1,
										},
									]}
								>
									<Text style={styles.applyButtonText}>Apply Theme</Text>
								</Pressable>
							</Animated.View>
						)
					)}
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		height: SCREEN_HEIGHT,
		width: SCREEN_WIDTH,
	},

	slideContainer: {
		height: SCREEN_HEIGHT * 0.68,
	},
	slidesWrapper: {
		flexDirection: 'row',
		height: '100%',
		overflow: 'hidden',
		width: SCREEN_WIDTH * Object.keys(themes).length,
	},
	slideItem: {
		width: SCREEN_WIDTH,
		flex: 1,
		paddingVertical: 20,
		height: '100%',
		alignItems: 'center',
		marginHorizontal: 'auto',
		justifyContent: 'center',
	},
	themePreviewContainer: {
		width: SCREEN_WIDTH - 30,
		height: '100%',
		borderRadius: 20,
		borderWidth: 1,
		overflow: 'hidden',
		elevation: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		position: 'relative',
	},
	themePreviewTop: {
		height: 140,
		overflow: 'hidden',
	},
	themePreviewBackground: {
		height: '100%',
		width: '100%',
	},
	themePreviewGradient: {
		height: '100%',
		width: '100%',
	},
	themeName: {
		fontSize: 20,
		fontFamily: 'Inter-SemiBold',
		marginTop: 20,
		textAlign: 'center',
	},
	colorSamplesContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 16,
		marginTop: 20,
	},
	colorSample: {
		width: 28,
		height: 28,
		borderRadius: 14,
	},
	activeIndicator: {
		width: 60,
		height: 4,
		borderRadius: 2,
		marginTop: 16,
	},
	navigationControls: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		marginTop: 16,
	},
	navButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
	},
	pagination: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	paginationDot: {
		height: 8,
		borderRadius: 4,
	},
	loadingDotsContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	loadingDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	helperText: {
		textAlign: 'center',
		fontSize: 14,
		marginTop: 24,
		fontFamily: 'Inter-Medium',
	},
	applyButtonContainer: {
		marginTop: 24,
		alignItems: 'center',
	},
	applyButton: {
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 12,
		minWidth: 160,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 2,
	},
	applyButtonText: {
		fontSize: 16,
		fontFamily: 'Inter-SemiBold',
		color: '#FFFFFF',
	},
	activeThemeBadge: {
		position: 'absolute',
		top: 12,
		right: 12,
		backgroundColor: '#10B981',
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 4,
		paddingHorizontal: 8,
		borderRadius: 12,
		gap: 4,
	},
	activeThemeText: {
		color: '#FFFFFF',
		fontSize: 12,
		fontFamily: 'Inter-Medium',
	},
});
