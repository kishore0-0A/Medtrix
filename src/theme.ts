import { StyleSheet, Platform, TextStyle } from 'react-native';

export const LIGHT_COLORS = {
  background: {
    canvas: '#F8FAFC',
    primary: '#F1F5F9',
    secondary: '#E2E8F0',
    surface: '#FFFFFF',
    elevated: '#FFFFFF',
  },
  glass: {
    primary: 'rgba(255, 255, 255, 0.88)',
    bright: 'rgba(255, 255, 255, 0.95)',
    soft: 'rgba(255, 255, 255, 0.72)',
    subtle: 'rgba(255, 255, 255, 0.50)',
    tinted: 'rgba(240, 247, 255, 0.85)',
  },
  border: {
    primary: 'rgba(226, 232, 240, 0.90)',
    secondary: 'rgba(203, 213, 225, 0.75)',
    subtle: '#E2E8F0',
    light: '#EEF2F7',
    highlight: 'rgba(255, 255, 255, 0.95)',
    brand: 'rgba(37, 99, 235, 0.25)',
  },
  brand: {
    primary: '#2563EB',
    deep: '#1D4ED8',
    dark: '#1E40AF',
    accent: '#0284C7',
    soft: 'rgba(37, 99, 235, 0.10)',
    verySoft: 'rgba(37, 99, 235, 0.05)',
  },
  status: {
    healthy: '#10B981',
    healthyBg: '#ECFDF5',
    warning: '#F59E0B',
    warningBg: '#FFFBEB',
    expiring: '#EA580C',
    expiringBg: '#FFF7ED',
    critical: '#EF4444',
    criticalBg: '#FEF2F2',
    info: '#0EA5E9',
    infoBg: '#F0F9FF',
  },
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    muted: '#64748B',
    subtle: '#94A3B8',
    disabled: '#94A3B8',
    inverse: '#FFFFFF',
    brand: '#2563EB',
  },
};

// Aliased as COLORS for full backwards compatibility
export const COLORS = LIGHT_COLORS;

// GLOBAL DARK MODE: BLACK & BLUE ONLY
export const DARK_COLORS = {
  background: {
    canvas: '#000000',
    primary: '#080B12',
    secondary: '#0D1117',
    surface: '#0D1117',
    elevated: '#111827',
  },
  glass: {
    primary: '#0D1117',
    bright: '#111827',
    soft: '#080B12',
    subtle: 'rgba(8, 11, 18, 0.75)',
    tinted: 'rgba(37, 99, 235, 0.15)',
  },
  border: {
    primary: '#1E293B',
    secondary: '#1E293B',
    subtle: '#1E293B',
    light: '#111827',
    highlight: 'rgba(96, 165, 250, 0.25)',
    brand: '#2563EB',
  },
  brand: {
    primary: '#2563EB',
    deep: '#1D4ED8',
    dark: '#1E40AF',
    accent: '#3B82F6',
    soft: 'rgba(37, 99, 235, 0.18)',
    verySoft: 'rgba(37, 99, 235, 0.08)',
  },
  status: {
    healthy: '#60A5FA',
    healthyBg: 'rgba(37, 99, 235, 0.16)',
    warning: '#3B82F6',
    warningBg: 'rgba(37, 99, 235, 0.20)',
    expiring: '#60A5FA',
    expiringBg: 'rgba(37, 99, 235, 0.20)',
    critical: '#93C5FD',
    criticalBg: 'rgba(37, 99, 235, 0.24)',
    info: '#3B82F6',
    infoBg: 'rgba(37, 99, 235, 0.16)',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#CBD5E1',
    muted: '#94A3B8',
    subtle: '#64748B',
    disabled: '#475569',
    inverse: '#000000',
    brand: '#60A5FA',
  },
};

export function getThemeColors(isDark: boolean) {
  return isDark ? DARK_COLORS : LIGHT_COLORS;
}

export const TYPOGRAPHY: Record<string, TextStyle> = {
  heading: {
    fontFamily: 'Outfit_700Bold',
    fontWeight: (Platform.select({ web: '700', default: undefined }) as TextStyle['fontWeight']),
  },
  heading800: {
    fontFamily: 'Outfit_800ExtraBold',
    fontWeight: (Platform.select({ web: '800', default: undefined }) as TextStyle['fontWeight']),
  },
  subheading: {
    fontFamily: 'Outfit_600SemiBold',
    fontWeight: (Platform.select({ web: '600', default: undefined }) as TextStyle['fontWeight']),
  },
  body: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontWeight: (Platform.select({ web: '400', default: undefined }) as TextStyle['fontWeight']),
  },
  bodyMedium: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontWeight: (Platform.select({ web: '500', default: undefined }) as TextStyle['fontWeight']),
  },
  bodyBold: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontWeight: (Platform.select({ web: '700', default: undefined }) as TextStyle['fontWeight']),
  },
  mono: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontWeight: (Platform.select({ web: '400', default: undefined }) as TextStyle['fontWeight']),
  },
  monoBold: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontWeight: (Platform.select({ web: '700', default: undefined }) as TextStyle['fontWeight']),
  },
};

// LIQUID GLASS RULE LEVELS (LIGHT)
export const GLASS = StyleSheet.create({
  hero: {
    backgroundColor: LIGHT_COLORS.glass.bright,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  standard: {
    backgroundColor: LIGHT_COLORS.glass.primary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 18,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  secondary: {
    backgroundColor: LIGHT_COLORS.glass.soft,
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border.subtle,
    borderRadius: 14,
  },
  tinted: {
    backgroundColor: LIGHT_COLORS.glass.tinted,
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border.brand,
    borderRadius: 16,
    shadowColor: LIGHT_COLORS.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
});

// LIQUID GLASS RULE LEVELS (DARK) — BLACK & BLUE ONLY
export const DARK_GLASS = StyleSheet.create({
  hero: {
    backgroundColor: '#0D1117',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 6,
  },
  standard: {
    backgroundColor: '#0D1117',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 3,
  },
  secondary: {
    backgroundColor: '#080B12',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
  },
  tinted: {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.40)',
    borderRadius: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 2,
  },
});

export const SHADOWS = StyleSheet.create({
  soft: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  medium: {
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#334155',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  brandGlow: {
    shadowColor: LIGHT_COLORS.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },
});

export const DARK_SHADOWS = StyleSheet.create({
  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.65,
    shadowRadius: 16,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.85,
    shadowRadius: 24,
    elevation: 8,
  },
  brandGlow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 6,
  },
});
