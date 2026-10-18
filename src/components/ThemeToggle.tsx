import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
  AccessibilityInfo,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../context/ThemeContext';

interface ThemeToggleProps {
  style?: object;
  size?: number;
}

export default function ThemeToggle({ style, size = 38 }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useThemeContext();
  const [reduceMotion, setReduceMotion] = useState(false);

  // Animation values
  const animProgress = useRef(new Animated.Value(isDark ? 1 : 0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  // Check reduced motion accessibility setting
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      setReduceMotion(enabled);
    });

    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', enabled => {
      setReduceMotion(enabled);
    });

    return () => {
      sub?.remove?.();
    };
  }, []);

  // Animate on theme change
  useEffect(() => {
    if (reduceMotion) {
      animProgress.setValue(isDark ? 1 : 0);
      return;
    }

    Animated.timing(animProgress, {
      toValue: isDark ? 1 : 0,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [isDark, reduceMotion, animProgress]);

  const handlePressIn = () => {
    Animated.timing(pressScale, {
      toValue: 0.92,
      duration: 100,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(pressScale, {
      toValue: 1,
      duration: 140,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  // Interpolated visual values
  const spin = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const sunOpacity = animProgress.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [1, 0, 0],
  });

  const sunScale = animProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.6, 0.4],
  });

  const moonOpacity = animProgress.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0, 0, 1],
  });

  const moonScale = animProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 0.6, 1],
  });

  const backgroundColor = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.92)', '#0D1117'],
  });

  const borderColor = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E2E8F0', '#1E293B'],
  });

  const shadowColor = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['#64748B', '#000000'],
  });

  const activeLabel = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';

  return (
    <Animated.View style={[{ transform: [{ scale: pressScale }] }, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={activeLabel}
        accessibilityHint="Toggles between Light and Dark visual themes"
        accessibilityState={{ checked: isDark }}
        onPress={toggleTheme}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressableArea}
      >
        <Animated.View
          style={[
            styles.container,
            {
              width: size,
              height: size,
              borderRadius: Math.round(size * 0.31),
              backgroundColor,
              borderColor,
              shadowColor,
            },
          ]}
        >
          {/* Subtle highlight ring */}
          <View
            style={[
              styles.highlightAura,
              {
                backgroundColor: isDark
                  ? 'rgba(96, 165, 250, 0.12)'
                  : 'rgba(245, 158, 11, 0.10)',
              },
            ]}
          />

          {/* Rotating Icon Container */}
          <Animated.View
            style={[
              styles.iconWrapper,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          >
            {/* Sun Icon (Light Mode) */}
            <Animated.View
              style={[
                styles.iconAbsolute,
                {
                  opacity: sunOpacity,
                  transform: [{ scale: sunScale }],
                },
              ]}
            >
              <Ionicons name="sunny" size={Math.round(size * 0.5)} color="#D97706" />
            </Animated.View>

            {/* Moon Icon (Dark Mode) */}
            <Animated.View
              style={[
                styles.iconAbsolute,
                {
                  opacity: moonOpacity,
                  transform: [{ scale: moonScale }],
                },
              ]}
            >
              <Ionicons name="moon" size={Math.round(size * 0.46)} color="#60A5FA" />
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pressableArea: {
    borderRadius: 12,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  highlightAura: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 10,
  },
  iconWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconAbsolute: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
