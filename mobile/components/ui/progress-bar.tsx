import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { design } from '@/constants/design';

interface ProgressBarProps {
  progress: number; // 0 to 100
  height?: number;
  color?: string;
  backgroundColor?: string;
}

export function ProgressBar({
  progress,
  height = 8,
  color = design.colors.primary,
  backgroundColor = design.colors.borderDark,
}: ProgressBarProps) {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withSpring(Math.min(Math.max(progress, 0), 100), {
      damping: 20,
      stiffness: 90,
    });
  }, [progress]);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedProgress.value}%`,
      backgroundColor: animatedProgress.value > 90 ? design.colors.error : color,
    };
  });

  return (
    <View style={[styles.container, { height, backgroundColor }]}>
      <Animated.View style={[styles.fill, progressStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: design.borderRadius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: design.borderRadius.pill,
  },
});
