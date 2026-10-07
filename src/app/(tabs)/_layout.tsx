import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, TYPOGRAPHY, SHADOWS } from '../../theme';

const { width } = Dimensions.get('window');

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          paddingBottom: Platform.OS === 'ios' ? insets.bottom + 8 : 16,
        },
      ]}
    >
      <View style={styles.tabBar}>
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
              activeOpacity={0.7}
            >
              <View style={isScan ? styles.scanIconWrapper : null}>
                <Ionicons
                  name={iconName}
                  size={isScan ? 24 : 22}
                  color={
                    isScan
                      ? COLORS.brand.primary
                      : isFocused
                      ? COLORS.brand.primary
                      : COLORS.text.muted
                  }
                />
              </View>
              {!isScan && (
                <Text
                  style={[
                    styles.tabLabel,
                    isFocused ? TYPOGRAPHY.bodyBold : TYPOGRAPHY.bodyMedium,
                    {
                      color: isFocused ? COLORS.brand.primary : COLORS.text.muted,
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

import { useTranslation } from 'react-i18next';

export default function TabsLayout() {
  const { t } = useTranslation();
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
    width: width * 0.92,
    height: 72,
    backgroundColor: COLORS.glass.bright,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
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
    borderRadius: 20,
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: COLORS.brand.verySoft,
    marginVertical: 6,
    height: 'auto',
  },
  scanButtonContainer: {
    flex: 1.2,
    transform: [{ translateY: -12 }],
  },
  scanIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.background.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.glass.primary,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
  },
});