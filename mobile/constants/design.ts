import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Premium Dark Fintech Theme Colors
export const palette = {
  // Backgrounds
  base: '#0B0F19',       // Deepest navy/black
  surface: '#131B2C',    // Slightly lighter card background
  surfaceHighlight: '#1A253C', // Hover/Active states

  // Accents
  primary: '#6366F1',    // Indigo for main actions
  primaryDark: '#4F46E5',
  secondary: '#8B5CF6',  // Violet for secondary actions
  accent: '#10B981',     // Emerald for positive metrics

  // Semantic
  success: '#10B981',    // Emerald
  successBg: 'rgba(16, 185, 129, 0.1)',
  error: '#EF4444',      // Red
  errorBg: 'rgba(239, 68, 68, 0.1)',
  warning: '#F59E0B',    // Amber
  warningBg: 'rgba(245, 158, 11, 0.1)',

  // Text
  text: '#F8FAFC',       // Slate 50
  textSecondary: '#94A3B8', // Slate 400
  textMuted: '#64748B',    // Slate 500

  // Borders
  border: '#1E293B',     // Slate 800
  borderDark: '#0F172A', // Slate 900
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 9999,
};

export const typography = {
  h1: { fontSize: 32, fontFamily: 'Inter-Bold' },
  h2: { fontSize: 24, fontFamily: 'Inter-Bold' },
  h3: { fontSize: 20, fontFamily: 'Inter-SemiBold' },
  subtitle: { fontSize: 16, fontFamily: 'Inter-Medium' },
  body: { fontSize: 14, fontFamily: 'Inter-Regular' },
  caption: { fontSize: 12, fontFamily: 'Inter-Regular' },
  label: { fontSize: 10, fontFamily: 'Inter-Medium' },
};

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px rgba(0, 0, 0, 0.3)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.4)',
  glow: '0 0 15px rgba(99, 102, 241, 0.25)', // primary color glow
};

export const layout = {
  window: { width, height },
  isSmallDevice: width < 375,
};

export const design = {
  colors: palette,
  spacing,
  borderRadius,
  typography,
  shadows,
  layout,
};
