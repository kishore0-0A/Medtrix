import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions, ActivityIndicator } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { COLORS, TYPOGRAPHY } from '../../theme';
import { useThemeContext } from '../../context/ThemeContext';
import { Auth } from '../../supabase';

const { width } = Dimensions.get('window');

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { isDark } = useThemeContext();

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          paddingBottom: Platform.OS === 'ios' ? insets.bottom + 8 : 16,
        },
      ]}
    >
      <View style={[styles.tabBar, isDark && { backgroundColor: 'rgba(30, 41, 59, 0.94)', borderColor: 'rgba(255, 255, 255, 0.12)' }]}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          // Get icon based on route name
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
          if (route.name === 'index') {
            iconName = isFocused ? 'home' : 'home-outline';
          } else if (route.name === 'inventory') {
            iconName = isFocused ? 'cube' : 'cube-outline';
          } else if (route.name === 'scan') {
            iconName = isFocused ? 'scan' : 'scan-outline';
          } else if (route.name === 'alerts') {
            iconName = isFocused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'profile') {
            iconName = isFocused ? 'person' : 'person-outline';
          }

          const isScan = route.name === 'scan';

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[
                styles.tabButton,
                isScan && styles.scanButtonContainer,
                isFocused && !isScan && styles.activeTab,
              ]}
              activeOpacity={0.75}
            >
              <View style={isScan ? [styles.scanIconWrapper, isDark && { borderColor: '#1E293B' }] : null}>
                <Ionicons
                  name={iconName}
                  size={isScan ? 24 : 20}
                  color={
                    isScan
                      ? '#FFFFFF'
                      : isFocused
                      ? COLORS.brand.primary
                      : isDark ? '#94A3B8' : COLORS.text.muted
                  }
                />
              </View>
              {!isScan && (
                <Text
                  style={[
                    styles.tabLabel,
                    isFocused ? TYPOGRAPHY.bodyBold : TYPOGRAPHY.bodyMedium,
                    {
                      color: isFocused ? COLORS.brand.primary : (isDark ? '#94A3B8' : COLORS.text.muted),
                    },
                  ]}
                >
                  {label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const { isDark } = useThemeContext();
  const [checkingAuth, setCheckingAuth] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const user = await Auth.getCurrentUser();
        if (mounted) {
          setIsAuthenticated(!!user);
          setCheckingAuth(false);
        }
      } catch {
        if (mounted) {
          setIsAuthenticated(false);
          setCheckingAuth(false);
        }
      }
    })();

    const sub = Auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setIsAuthenticated(!!session?.user);
        setCheckingAuth(false);
      }
    });

    return () => {
      mounted = false;
      if (sub && typeof sub.unsubscribe === 'function') {
        sub.unsubscribe();
      }
    };
  }, []);

  if (checkingAuth) {
    return (
      <View style={[styles.loadingContainer, isDark && { backgroundColor: '#000000' }]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('profile.home'),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: t('profile.inventory'),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: t('profile.scan'),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: t('profile.alerts'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile.profile'),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    width: Math.min(width * 0.94, 440),
    height: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#334155',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    borderRadius: 18,
    paddingVertical: 6,
  },
  activeTab: {
    backgroundColor: COLORS.brand.verySoft,
    borderWidth: 1,
    borderColor: COLORS.brand.soft,
    marginVertical: 6,
    height: 'auto',
  },
  scanButtonContainer: {
    flex: 1.2,
    transform: [{ translateY: -14 }],
  },
  scanIconWrapper: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.brand.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  tabLabel: {
    fontSize: 10.5,
    marginTop: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});