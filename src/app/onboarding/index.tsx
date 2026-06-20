import { useState, useEffect } from 'react';
import {
	StyleSheet,
	View,
	Pressable,
	Dimensions,
	ImageBackground,
} from 'react-native'
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
	FadeInDown,
} from 'react-native-reanimated'
import {
	ArrowRight,
	Check,
	ShieldCheck,
	PieChart,
	Wallet,
} from 'lucide-react-native'
import {
	Directions,
	Gesture,
	GestureDetector,
} from 'react-native-gesture-handler'
import { design } from '@/constants/design'

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const slides = [
	{
		id: 'track',
		title: 'Track Your Finances',
		description:
			'Easily monitor your spending and income with our intuitive tracking system. Know exactly where your money goes every month.',
		icon: (props: any) => <Wallet {...props} />,
		image:
			'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=2340',
	},
	{
		id: 'insights',
		title: 'Smart Insights',
		description:
			'Get detailed analytics and visual insights to make better financial decisions. Spot trends and plan for the future.',
		icon: (props: any) => <PieChart {...props} />,
		image:
			'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2340',
	},
	{
		id: 'secure',
		title: 'Bank-Level Security',
		description:
			'Your data is protected with industry-leading security measures. We take your privacy and financial data seriously.',
		icon: (props: any) => <ShieldCheck {...props} />,
		image:
			'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=2340',
	},
]

export default function Onboarding() {
	const [currentIndex, setCurrentIndex] = useState(0)
	const translateX = useSharedValue(0)
	const isLastSlide = currentIndex === slides.length - 1
	const [animationKey, setAnimationKey] = useState(0)

	const endOnboarding = () => {
		setCurrentIndex(0)
		// Fixed navigation to use bottom tabs instead of deleted drawer layout
		router.replace('/(tabs)')
	}

	const onNext = () => {
		if (isLastSlide) {
			endOnboarding()
		} else {
			const nextIndex = currentIndex + 1
			translateX.value = withTiming(-nextIndex * SCREEN_WIDTH, {
				duration: 300,
				easing: Easing.inOut(Easing.ease),
			})
			setCurrentIndex(nextIndex)
			setAnimationKey((prev) => prev + 1) // Force animation
		}
	}

	const onPrev = () => {
		if (currentIndex > 0) {
			const prevIndex = currentIndex - 1
			translateX.value = withTiming(-prevIndex * SCREEN_WIDTH, {
				duration: 300,
				easing: Easing.inOut(Easing.ease),
			})
			setCurrentIndex(prevIndex)
			setAnimationKey((prev) => prev + 1)
		}
	}

	const onSwipe = Gesture.Simultaneous(
		Gesture.Fling()
			.direction(Directions.LEFT)
			.onEnd(() => {
				'worklet'
				runOnJS(onNext)()
			}),
		Gesture.Fling()
			.direction(Directions.RIGHT)
			.onEnd(() => {
				'worklet'
				runOnJS(onPrev)()
			}),
	)

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateX: translateX.value }],
		}
	})

	useEffect(() => {
		setAnimationKey((prev) => prev + 1)
	}, [currentIndex])

	return (
		<Animated.View style={styles.container}>
			<StatusBar style='light' />
			<GestureDetector gesture={onSwipe}>
				<Animated.View style={[animatedStyle, styles.slidesContainer]}>
					{slides.map((slide, index) => (
						<Animated.View key={slide.id} style={styles.slideWrapper}>
							{/* Background Crossfade */}
							<Animated.View
								key={`${slide.image}-${index}`}
								entering={FadeIn.duration(600)}
								exiting={FadeOut.duration(600)}
								style={StyleSheet.absoluteFill}
							>
								<ImageBackground
									source={{ uri: slide.image }}
									style={styles.backgroundImage}
								/>
							</Animated.View>
							<View style={styles.overlay} />

							<View style={styles.content}>
								{/* Text Content */}
								{index === currentIndex && (
									<View style={styles.slideContent}>
										<Animated.View
											key={`icon-${animationKey}`}
											entering={FadeInDown.duration(600).delay(200).springify()}
											style={styles.iconContainer}
										>
											<slide.icon size={36} color={design.colors.primary} />
										</Animated.View>

										<Animated.Text
											key={`title-${animationKey}`}
											entering={FadeInDown.duration(600).delay(300).springify()}
											style={styles.title}
										>
											{slide.title}
										</Animated.Text>

										<Animated.Text
											key={`desc-${animationKey}`}
											entering={FadeInDown.duration(600).delay(400).springify()}
											style={styles.description}
										>
											{slide.description}
										</Animated.Text>
									</View>
								)}

								{/* Footer Controls */}
								<View style={styles.footer}>
									<View style={styles.pagination}>
										{slides.map((_, i) => (
											<Animated.View
												key={i}
												style={[
													styles.paginationDot,
													i === currentIndex
														? styles.paginationDotActive
														: styles.paginationDotInactive,
												]}
											/>
										))}
									</View>

									<Pressable
										onPress={onNext}
										style={({ pressed }) => [
											styles.button,
											pressed && styles.buttonPressed,
										]}
									>
										{isLastSlide ? (
											<Check size={24} color='#FFF' />
										) : (
											<ArrowRight size={24} color='#FFF' />
										)}
									</Pressable>
								</View>
							</View>
						</Animated.View>
					))}
				</Animated.View>
			</GestureDetector>
		</Animated.View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000',
	},
	slidesContainer: {
		flex: 1,
		flexDirection: 'row',
		width: SCREEN_WIDTH * slides.length,
	},
	slideWrapper: {
		width: SCREEN_WIDTH,
		flex: 1,
	},
	backgroundImage: {
		flex: 1,
		width: SCREEN_WIDTH,
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0,0,0,0.6)', // Deep semi-transparent overlay
	},
	content: {
		flex: 1,
		justifyContent: 'flex-end',
		paddingBottom: 40,
		paddingHorizontal: design.spacing.xl,
	},
	slideContent: {
		alignItems: 'flex-start',
		marginBottom: 60,
	},
	iconContainer: {
		width: 64,
		height: 64,
		borderRadius: 24,
		backgroundColor: 'rgba(255, 255, 255, 0.95)',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: design.spacing.xl,
	},
	title: {
		...design.typography.h1,
		color: '#FFF',
		marginBottom: design.spacing.md,
	},
	description: {
		...design.typography.body,
		fontSize: 16,
		color: 'rgba(255, 255, 255, 0.8)',
		lineHeight: 24,
	},
	footer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	pagination: {
		flexDirection: 'row',
		gap: 8,
	},
	paginationDot: {
		height: 8,
		borderRadius: 4,
	},
	paginationDotActive: {
		width: 24,
		backgroundColor: design.colors.primary,
	},
	paginationDotInactive: {
		width: 8,
		backgroundColor: 'rgba(255,255,255,0.3)',
	},
	button: {
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: design.colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: design.colors.primary,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	buttonPressed: {
		opacity: 0.8,
		transform: [{ scale: 0.96 }],
	},
})
