import { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import Animated, {
	Easing,
	FadeIn,
	FadeOut,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
	FadeInUp,
} from 'react-native-reanimated';
import {
	ArrowRight,
	Check,
	ChartLine as LineChart,
	Shield,
	Wallet,
} from 'lucide-react-native';
import { useThemeStore } from '@/store/theme';
import {
	Directions,
	Gesture,
	GestureDetector,
} from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const slides = [
	{
		id: 'track',
		title: 'Track Your Finances',
		description:
			'Easily monitor your spending and income with our intuitive tracking system.',
		icon: (props: any) => <Wallet {...props} />,
		image:
			'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=2340',
	},
	{
		id: 'insights',
		title: 'Smart Insights',
		description:
			'Get detailed analytics and insights to make better financial decisions.',
		icon: (props: any) => <LineChart {...props} />,
		image:
			'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2340',
	},
	{
		id: 'secure',
		title: 'Bank-Level Security',
		description:
			'Your data is protected with industry-leading security measures.',
		icon: (props: any) => <Shield {...props} />,
		image:
			'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=2340',
	},

	{
		id: 'get-started',
		title: 'Get Started Now',
		description:
			'Join thousands of users and take control of your finances today.',
		icon: (props: any) => <Wallet {...props} />,
		image:
			'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=2340',
	},
];

export default function Onboarding() {
	const { theme } = useThemeStore();
	const [currentIndex, setCurrentIndex] = useState(0);
	const translateX = useSharedValue(0);
	const isLastSlide = currentIndex === slides.length - 1;
	const [animationKey, setAnimationKey] = useState(0);

	const endOnboarding = () => {
		setCurrentIndex(0);
		router.replace('/(tabs)/transactions');
	};

	const onNext = () => {
		if (isLastSlide) {
			endOnboarding();
		} else {
			const nextIndex = currentIndex + 1;

			translateX.value = withTiming(-nextIndex * SCREEN_WIDTH, {
				duration: 300,
				easing: Easing.inOut(Easing.ease),
			});
			setCurrentIndex(nextIndex);
			setAnimationKey((prev) => prev + 1); // Force animation to re-trigger
		}
	};

	const onPrev = () => {
		if (currentIndex > 0) {
			const prevIndex = currentIndex - 1;

			translateX.value = withTiming(-prevIndex * SCREEN_WIDTH, {
				duration: 300,
				easing: Easing.inOut(Easing.ease),
			});
			setCurrentIndex(prevIndex);
			setAnimationKey((prev) => prev + 1); // Force animation to re-trigger
		}
	};

	const onSwipe = Gesture.Simultaneous(
		Gesture.Fling()
			.direction(Directions.LEFT)
			.onEnd(() => {
				'worklet:';
				runOnJS(onNext)();
			}),
		Gesture.Fling()
			.direction(Directions.RIGHT)
			.onEnd(() => {
				'worklet:';
				runOnJS(onPrev)();
			})
	);

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateX: translateX.value }],
		};
	});

	// Force re-render of slide content on index change
	useEffect(() => {
		setAnimationKey((prev) => prev + 1);
	}, [currentIndex]);

	return (
		<Animated.View
			style={[styles.container, { backgroundColor: theme.colors.background }]}
		>
			<StatusBar style='light' />
			<GestureDetector gesture={onSwipe}>
				<Animated.View style={[animatedStyle, styles.slidesContainer]}>
					{slides.map((slide, index) => (
						<Animated.View
							key={slide.id}
							style={{ width: SCREEN_WIDTH, flex: 1, alignContent: 'center' }}
						>
							<Animated.View
								key={`${slide.image}-${index}`}
								entering={FadeIn.duration(600)}
								exiting={FadeOut.duration(600)}
								style={StyleSheet.absoluteFill}
							>
								<Animated.Image
									source={{ uri: slide.image }}
									style={[
										StyleSheet.absoluteFill,
										styles.backgroundImage,
										{ width: SCREEN_WIDTH, flex: 1 },
									]}
								/>
							</Animated.View>
							<View style={styles.overlay} />

							<View style={styles.content}>
								{/* Only render content for the current slide */}
								{index === currentIndex && (
									<Animated.View
										key={`slide-content-${animationKey}`}
										style={styles.slide}
									>
										<Animated.View
											key={`icon-${animationKey}`}
											entering={FadeInUp.duration(800).delay(200)}
											style={styles.iconContainer}
										>
											<slide.icon size={40} color={theme.colors.primary} />
										</Animated.View>
										<Animated.View
											key={`title-wrapper-${animationKey}`}
											entering={FadeInUp.duration(800).delay(400)}
										>
											<Animated.Text
												style={[styles.title, { color: theme.colors.surface }]}
											>
												{slide.title}
											</Animated.Text>
										</Animated.View>
										<Animated.View
											key={`desc-wrapper-${animationKey}`}
											entering={FadeInUp.duration(800).delay(600)}
										>
											<Animated.Text
												style={[
													styles.description,
													{ color: theme.colors.surface },
												]}
											>
												{slide.description}
											</Animated.Text>
										</Animated.View>
									</Animated.View>
								)}

								<View style={styles.footer}>
									<View style={styles.pagination}>
										{slides.map((_, i) => (
											<View
												key={i}
												style={[
													styles.paginationDot,
													{
														backgroundColor:
															i === currentIndex
																? theme.colors.primary
																: theme.colors.surface,
														opacity: i === currentIndex ? 1 : 0.5,
													},
												]}
											/>
										))}
									</View>

									<Pressable
										onPress={onNext}
										style={({ pressed }) => [
											styles.button,
											{ backgroundColor: theme.colors.primary },
											pressed && { opacity: 0.8 },
										]}
									>
										{isLastSlide ? (
											<Check size={24} color={theme.colors.surface} />
										) : (
											<ArrowRight size={24} color={theme.colors.surface} />
										)}
									</Pressable>
								</View>
							</View>
						</Animated.View>
					))}
				</Animated.View>
			</GestureDetector>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	slidesContainer: {
		flex: 1,
		flexDirection: 'row',
		width: SCREEN_WIDTH * slides.length,
	},
	slide: {
		width: SCREEN_WIDTH,
		flex: 1,
		marginTop: 100,
		alignItems: 'center',
		marginHorizontal: 'auto',
		maxWidth: 1200,
	},
	backgroundImage: {
		opacity: 0.8,
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.4)',
	},
	content: {
		flex: 1,
		justifyContent: 'space-between',
		marginHorizontal: 'auto',
		maxWidth: 1200,
	},

	iconContainer: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: 'rgba(255, 255, 255, 0.9)',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 24,
	},
	title: {
		fontSize: 32,
		fontFamily: 'Inter-Bold',
		textAlign: 'center',
		marginBottom: 16,
	},
	description: {
		fontSize: 18,
		fontFamily: 'Inter-Regular',
		textAlign: 'center',
		opacity: 0.9,
		lineHeight: 30,
		paddingHorizontal: 24,
	},
	footer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 40,
		paddingHorizontal: 24,
	},
	pagination: {
		flexDirection: 'row',
		gap: 8,
	},
	paginationDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	button: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: 'white',
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
});
