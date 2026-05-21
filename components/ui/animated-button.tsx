import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { design } from '@/constants/design';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AnimatedButtonProps extends PressableProps {
  title?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  fullWidth?: boolean;
}

export function AnimatedButton({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  fullWidth = false,
  onPress,
  disabled,
  ...props
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (disabled || isLoading) return;
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    if (disabled || isLoading) return;
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const handlePress = (e: any) => {
    if (disabled || isLoading) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress?.(e);
  };

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: design.colors.primary,
          boxShadow: design.shadows.glow,
        };
      case 'secondary':
        return {
          backgroundColor: design.colors.surfaceHighlight,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: design.colors.border,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
      case 'danger':
        return {
          backgroundColor: design.colors.errorBg,
        };
      default:
        return { backgroundColor: design.colors.primary };
    }
  };

  const getVariantTextStyles = (): TextStyle => {
    switch (variant) {
      case 'primary':
        return { color: '#FFFFFF' };
      case 'secondary':
        return { color: design.colors.text };
      case 'outline':
        return { color: design.colors.text };
      case 'ghost':
        return { color: design.colors.primary };
      case 'danger':
        return { color: design.colors.error };
      default:
        return { color: '#FFFFFF' };
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 8, paddingHorizontal: 16, borderRadius: design.borderRadius.md };
      case 'md':
        return { paddingVertical: 14, paddingHorizontal: 24, borderRadius: design.borderRadius.lg };
      case 'lg':
        return { paddingVertical: 18, paddingHorizontal: 32, borderRadius: design.borderRadius.xl };
      case 'icon':
        return { width: 48, height: 48, justifyContent: 'center', alignItems: 'center', borderRadius: design.borderRadius.pill, paddingHorizontal: 0, paddingVertical: 0 };
      default:
        return { paddingVertical: 14, paddingHorizontal: 24, borderRadius: design.borderRadius.lg };
    }
  };

  const getTextSizeStyles = (): TextStyle => {
    switch (size) {
      case 'sm':
        return { fontSize: 14, fontFamily: 'Inter-Medium' };
      case 'md':
        return { fontSize: 16, fontFamily: 'Inter-SemiBold' };
      case 'lg':
        return { fontSize: 18, fontFamily: 'Inter-Bold' };
      case 'icon':
        return { fontSize: 16, fontFamily: 'Inter-SemiBold' };
      default:
        return { fontSize: 16, fontFamily: 'Inter-SemiBold' };
    }
  };

  const isDisabled = disabled || isLoading;

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={isDisabled}
      style={[
        styles.base,
        getVariantStyles(),
        getSizeStyles(),
        fullWidth && { width: '100%' },
        isDisabled && styles.disabled,
        animatedStyle,
        style,
      ]}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={getVariantTextStyles().color} />
      ) : (
        <>
          {leftIcon}
          {title && (
            <Text
              style={[
                getVariantTextStyles(),
                getTextSizeStyles(),
                leftIcon ? { marginLeft: 8 } : undefined,
                rightIcon ? { marginRight: 8 } : undefined,
                textStyle,
              ]}
            >
              {title}
            </Text>
          )}
          {rightIcon}
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  disabled: {
    opacity: 0.5,
  },
});
