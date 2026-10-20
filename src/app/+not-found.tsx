import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack, usePathname } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeContext } from '../context/ThemeContext';
import { TYPOGRAPHY } from '../theme';

export const statusCode = 404;

export default function NotFoundScreen() {
  const { isDark, colors, glass, shadows } = useThemeContext();
  const { width } = useWindowDimensions();
  const pathname = usePathname();

  // Subtle entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const canGoBack = router.canGoBack();

  useEffect(() => {
    // Log developer diagnostics in development environment
    if (__DEV__) {
      console.warn(`[Medtrix Navigation] 404 Not Found triggered for path: "${pathname}"`);
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Ambient medical tech pulse
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, [fadeAnim, slideAnim, pulseAnim, pathname]);

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  const handleGoBack = () => {
    if (canGoBack) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Page Not Found',
          headerShown: false,
        }}
      />
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: colors.background.canvas },
        ]}
      >
        <Animated.View
          style={[
            styles.contentCard,
            glass.hero,
            shadows.elevated,
            isDark && {
              backgroundColor: '#0D1117',
              borderColor: '#1E293B',
            },
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              maxWidth: Math.min(width - 32, 480),
            },
          ]}
        >
          {/* Medical Tech Holographic Icon */}
          <Animated.View
            style={[
              styles.iconWrapper,
              isDark
                ? { backgroundColor: 'rgba(37, 99, 235, 0.16)', borderColor: '#1E293B' }
                : { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' },
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <View
              style={[
                styles.iconGlow,
                isDark
                  ? { backgroundColor: 'rgba(59, 130, 246, 0.25)' }
                  : { backgroundColor: 'rgba(37, 99, 235, 0.15)' },
              ]}
            />
            <MaterialCommunityIcons
              name="medical-bag"
              size={52}
              color={colors.brand.primary}
            />
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: colors.status.warning, borderColor: colors.background.surface },
              ]}
            >
              <Ionicons name="alert" size={13} color="#FFFFFF" />
            </View>
          </Animated.View>

          {/* Categorical Badge */}
          <View
            style={[
              styles.badge,
              isDark
                ? { backgroundColor: 'rgba(59, 130, 246, 0.14)', borderColor: '#1E293B' }
                : { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' },
            ]}
          >
            <View style={[styles.badgeDot, { backgroundColor: colors.brand.primary }]} />
            <Text
              style={[
                styles.badgeText,
                { color: isDark ? '#93C5FD' : colors.brand.primary },
              ]}
            >
              STATUS 404 • ROUTE UNREACHABLE
            </Text>
          </View>

          {/* Heading */}
          <Text
            style={[
              styles.title,
              TYPOGRAPHY.h1,
              { color: colors.text.primary },
            ]}
          >
            Page Not Found
          </Text>

          {/* Description */}
          <Text
            style={[
              styles.description,
              TYPOGRAPHY.body,
              { color: colors.text.secondary },
            ]}
          >
            The clinical module, inventory section, or record you are trying to view does not exist or may have been relocated.
          </Text>

          {/* Actions */}
          <View style={styles.actionContainer}>
            {/* Primary Action: Go to Home */}
            <Pressable
              onPress={handleGoHome}
              accessibilityRole="button"
              accessibilityLabel="Go to Home Dashboard"
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: colors.brand.primary },
                shadows.soft,
                pressed && styles.buttonPressed,
              ]}
            >
              <Ionicons name="home" size={18} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={[styles.primaryButtonText, TYPOGRAPHY.button]}>
                Return to Home
              </Text>
            </Pressable>

            {/* Secondary Action: Go Back (only if previous route exists) */}
            {canGoBack && (
              <Pressable
                onPress={handleGoBack}
                accessibilityRole="button"
                accessibilityLabel="Go to Previous Screen"
                style={({ pressed }) => [
                  styles.secondaryButton,
                  isDark
                    ? { backgroundColor: '#111827', borderColor: '#1E293B' }
                    : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
                  shadows.soft,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Ionicons
                  name="arrow-back"
                  size={18}
                  color={colors.text.primary}
                  style={styles.buttonIcon}
                />
                <Text
                  style={[
                    styles.secondaryButtonText,
                    TYPOGRAPHY.button,
                    { color: colors.text.primary },
                  ]}
                >
                  Go Back
                </Text>
              </Pressable>
            )}
          </View>

          {/* Footer Assistance */}
          <View style={styles.footer}>
            <Ionicons
              name="shield-checkmark-outline"
              size={14}
              color={colors.text.muted}
            />
            <Text style={[styles.footerText, { color: colors.text.muted }]}>
              Medtrix Clinical Inventory System • Secure & Audited
            </Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  contentCard: {
    width: '100%',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
  },
  iconWrapper: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  iconGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.6,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 26,
    paddingHorizontal: 8,
  },
  actionContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 14,
    paddingHorizontal: 20,
    minHeight: 48,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 20,
    minHeight: 48,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 24,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
