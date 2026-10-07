import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

export const COLORS = {
  background: {
    canvas: '#F8FAFC',
    primary: '#F4F8FC',
    secondary: '#EEF5FC',
  },
  glass: {
    primary: 'rgba(255,255,255,0.72)',
    bright: 'rgba(255,255,255,0.82)',
    soft: 'rgba(255,255,255,0.58)',
    subtle: 'rgba(255,255,255,0.45)',
  },
  border: {
    primary: 'rgba(255,255,255,0.78)',
    secondary: 'rgba(255,255,255,0.62)',
    subtle: '#E2E8F0',
    highlight: 'rgba(255,255,255,0.88)',
  },
  brand: {
    primary: '#2563EB',
    deep: '#004AC6',
    accent: '#0053DB',
    soft: '#DBEAFE',
    verySoft: '#EFF6FF',
  },
  status: {
    healthy: '#10B981',
    healthyBg: '#ECFDF5',
    warning: '#F59E0B',
    warningBg: '#FFFBEB',
    expiring: '#F97316',
    expiringBg: '#FFF7ED',
    critical: '#E11D48',
    criticalBg: '#FFF1F2',
    info: '#9333EA',
    infoBg: '#FAF5FF',
  },
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    muted: '#64748B',
    disabled: '#94A3B8',
  }
};

export const TYPOGRAPHY = {
  heading: { fontFamily: 'Outfit_700Bold' },
  heading800: { fontFamily: 'Outfit_800ExtraBold' },
  body: { fontFamily: 'PlusJakartaSans_400Regular' },
  bodyMedium: { fontFamily: 'PlusJakartaSans_500Medium' },
  bodyBold: { fontFamily: 'PlusJakartaSans_700Bold' },
  mono: { fontFamily: 'JetBrainsMono_400Regular' },
  monoBold: { fontFamily: 'JetBrainsMono_700Bold' },
};

// LIQUID GLASS RULE LEVELS
export const GLASS = StyleSheet.create({
  // LEVEL 1 — HERO GLASS
  hero: {
    backgroundColor: COLORS.glass.bright,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    boxShadow: '0px 20px 40px rgba(148, 163, 184, 0.12)',
    elevation: 8,
  },
  // LEVEL 2 — STANDARD GLASS
  standard: {
    backgroundColor: COLORS.glass.primary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.85)',
    borderRadius: 20,
    boxShadow: '0px 10px 24px rgba(148, 163, 184, 0.08)',
    elevation: 4,
  },
  // LEVEL 3 — SECONDARY GLASS
  secondary: {
    backgroundColor: COLORS.glass.soft,
    borderWidth: 1,
    borderColor: COLORS.border.secondary,
    borderRadius: 12,
  },
});

export const SHADOWS = StyleSheet.create({
  soft: {
    boxShadow: '0px 8px 24px rgba(148, 163, 184, 0.08)',
    elevation: 4,
  },
  medium: {
    boxShadow: '0px 16px 32px rgba(100, 116, 139, 0.12)',
    elevation: 6,
  }
});
