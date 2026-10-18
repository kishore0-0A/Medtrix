import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../theme';
import { useThemeContext } from '../../context/ThemeContext';

const MOCK_ALERTS = [
  {
    id: '1',
    type: 'out_of_stock',
    medicine: 'Azithromycin 250mg',
    quantity: 0,
    threshold: 50,
    action: 'Quick Reorder',
  },
  {
    id: '2',
    type: 'low_stock',
    medicine: 'Amoxicillin 500mg',
    quantity: 24,
    threshold: 100,
    action: 'Quick Reorder',
  },
  {
    id: '3',
    type: 'expiring',
    medicine: 'Cetirizine 10mg',
    quantity: 120,
    threshold: 'EXP: 09/2024',
    action: 'Quarantine Batch',
  },
];

export default function AlertsScreen() {
  const { isDark, glass } = useThemeContext();

  const getAlertColor = (type: string) => {
    if (isDark) {
      switch (type) {
        case 'low_stock': return '#3B82F6';
        case 'expiring': return '#60A5FA';
        case 'out_of_stock': return '#93C5FD';
        default: return '#CBD5E1';
      }
    }
    switch (type) {
      case 'low_stock': return COLORS.status.warning;
      case 'expiring': return COLORS.status.expiring;
      case 'out_of_stock': return COLORS.status.critical;
      default: return COLORS.text.muted;
    }
  };

  const getAlertBg = (type: string) => {
    if (isDark) {
      return 'rgba(37, 99, 235, 0.16)';
    }
    switch (type) {
      case 'low_stock': return COLORS.status.warningBg;
      case 'expiring': return COLORS.status.expiringBg;
      case 'out_of_stock': return COLORS.status.criticalBg;
      default: return COLORS.background.canvas;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark && { backgroundColor: '#000000' }]} edges={['top']}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? '#000000' : COLORS.background.canvas} />

      {/* Subtle Background Atmosphere */}
      <View style={[styles.bgGlowTop, isDark && { backgroundColor: '#1D4ED8', opacity: 0.15 }, { pointerEvents: 'none' }]} />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark && { color: '#FFFFFF' }]}>Alerts</Text>
        <Text style={[styles.headerSubtitle, isDark && { color: '#CBD5E1' }]}>Items requiring immediate clinical or inventory action</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* SUMMARY CARDS */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, glass.standard, isDark ? { backgroundColor: '#0D1117', borderColor: '#1E293B' } : { borderColor: COLORS.status.warning + '30' }]}>
            <Text style={[styles.summaryCount, { color: isDark ? '#3B82F6' : COLORS.status.warning }]}>24</Text>
            <Text style={[styles.summaryLabel, isDark && { color: '#CBD5E1' }]}>Low Stock</Text>
          </View>
          <View style={[styles.summaryCard, glass.standard, isDark ? { backgroundColor: '#0D1117', borderColor: '#1E293B' } : { borderColor: COLORS.status.expiring + '30' }]}>
            <Text style={[styles.summaryCount, { color: isDark ? '#60A5FA' : COLORS.status.expiring }]}>18</Text>
            <Text style={[styles.summaryLabel, isDark && { color: '#CBD5E1' }]}>Expiring</Text>
          </View>
          <View style={[styles.summaryCard, glass.standard, isDark ? { backgroundColor: '#0D1117', borderColor: '#1E293B' } : { borderColor: COLORS.status.critical + '30' }]}>
            <Text style={[styles.summaryCount, { color: isDark ? '#93C5FD' : COLORS.status.critical }]}>07</Text>
            <Text style={[styles.summaryLabel, isDark && { color: '#CBD5E1' }]}>Out of Stock</Text>
          </View>
        </View>

        {/* ALERTS LIST */}
        <View style={styles.listHeader}>
          <Text style={[styles.listTitle, isDark && { color: '#FFFFFF' }]}>Action Required</Text>
        </View>

        {MOCK_ALERTS.map((alert) => (
          <View key={alert.id} style={[styles.alertCard, glass.standard, isDark && { backgroundColor: '#0D1117', borderColor: '#1E293B' }]}>
            <View style={styles.alertHeader}>
              <View style={[styles.alertIconWrapper, { backgroundColor: getAlertBg(alert.type) }]}>
                <Ionicons 
                  name={alert.type === 'out_of_stock' ? 'close-circle' : alert.type === 'expiring' ? 'time' : 'alert-circle'} 
                  size={20} 
                  color={getAlertColor(alert.type)} 
                />
              </View>
              <View style={styles.alertHeaderContent}>
                <Text style={[styles.medicineName, isDark && { color: '#FFFFFF' }]}>{alert.medicine}</Text>
                <Text style={[styles.alertMeta, isDark && { color: '#CBD5E1' }]}>
                  Qty: {alert.quantity}  •  {typeof alert.threshold === 'number' ? `Min: ${alert.threshold}` : alert.threshold}
                </Text>
              </View>
            </View>

            <View style={[styles.alertFooter, isDark && { borderTopColor: '#1E293B' }]}>
              <Pressable
                style={[
                  styles.actionButton,
                  isDark
                    ? { backgroundColor: '#2563EB', borderColor: '#2563EB' }
                    : { backgroundColor: getAlertBg(alert.type), borderColor: getAlertColor(alert.type) + '35' }
                ]}
              >
                <Text
                  style={[
                    styles.actionButtonText,
                    isDark ? { color: '#FFFFFF' } : { color: getAlertColor(alert.type) }
                  ]}
                >
                  {alert.action}
                </Text>
              </Pressable>
              <Pressable style={[styles.secondaryButton, isDark && { backgroundColor: '#111827', borderColor: '#1E293B' }]}>
                <Text style={[styles.secondaryButtonText, isDark && { color: '#CBD5E1' }]}>View Medicine</Text>
              </Pressable>
            </View>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.canvas,
  },
  bgGlowTop: {
    position: 'absolute',
    top: 50,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: COLORS.status.warningBg,
    opacity: 0.6,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    ...TYPOGRAPHY.heading800,
    fontSize: 28,
    color: COLORS.text.primary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
    borderWidth: 1,
  },
  summaryCount: {
    ...TYPOGRAPHY.heading,
    fontSize: 24,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  summaryLabel: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 11,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  listHeader: {
    marginBottom: 14,
  },
  listTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 18,
    color: COLORS.text.primary,
    letterSpacing: -0.3,
  },
  alertCard: {
    padding: 18,
    marginBottom: 14,
    borderRadius: 18,
    ...SHADOWS.soft,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  alertHeaderContent: {
    flex: 1,
  },
  medicineName: {
    ...TYPOGRAPHY.heading,
    fontSize: 16,
    color: COLORS.text.primary,
    marginBottom: 3,
  },
  alertMeta: {
    ...TYPOGRAPHY.mono,
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  alertFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border.subtle,
    paddingTop: 14,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginRight: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionButtonText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 13,
  },
  secondaryButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: COLORS.background.secondary,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 13,
    color: COLORS.text.secondary,
  },
});