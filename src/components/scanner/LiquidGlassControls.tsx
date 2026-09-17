import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../theme';

interface LiquidGlassControlsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function LiquidGlassControls({ tabs, activeTab, onTabChange }: LiquidGlassControlsProps) {
  return (
    <View style={styles.tabsContainer}>
      {tabs.map((tab) => (
        <Pressable
          key={tab}
          style={[
            styles.tabButton,
            activeTab === tab && styles.tabButtonActive,
          ]}
          onPress={() => onTabChange(tab)}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab && styles.tabTextActive,
            ]}
          >
            {tab}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.65)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.80)',
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: COLORS.background.canvas,
    ...SHADOWS.soft,
  },
  tabText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  tabTextActive: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.brand.primary,
  },
});
