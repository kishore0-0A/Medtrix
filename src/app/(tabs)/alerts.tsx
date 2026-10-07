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
import { COLORS, TYPOGRAPHY, GLASS } from '../../theme';

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
  const getAlertColor = (type: string) => {
    switch (type) {
      case 'low_stock': return COLORS.status.warning;
      case 'expiring': return COLORS.status.expiring;
      case 'out_of_stock': return COLORS.status.critical;
      default: return COLORS.text.muted;
    }
  };

  const getAlertBg = (type: string) => {
    switch (type) {
      case 'low_stock': return COLORS.status.warningBg;
      case 'expiring': return COLORS.status.expiringBg;
      case 'out_of_stock': return COLORS.status.criticalBg;
      default: return COLORS.background.canvas;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.canvas} />

      {/* Subtle Background Elements */}
      <View style={[styles.bgGlowTop, { pointerEvents: 'none' }]} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alerts</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* SUMMARY CARDS */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, GLASS.standard]}>
            <Text style={[styles.summaryCount, { color: COLORS.status.warning }]}>24</Text>
            <Text style={styles.summaryLabel}>Low Stock</Text>
          </View>
          <View style={[styles.summaryCard, GLASS.standard]}>
            <Text style={[styles.summaryCount, { color: COLORS.status.expiring }]}>18</Text>
            <Text style={styles.summaryLabel}>Expiring</Text>
          </View>
          <View style={[styles.summaryCard, GLASS.standard]}>
            <Text style={[styles.summaryCount, { color: COLORS.status.critical }]}>07</Text>
            <Text style={styles.summaryLabel}>Out of Stock</Text>
          </View>
        </View>

        {/* ALERTS LIST */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Action Required</Text>
        </View>

        {MOCK_ALERTS.map((alert) => (
          <View key={alert.id} style={[styles.alertCard, GLASS.standard]}>
            <View style={styles.alertHeader}>
              <View style={[styles.alertIconWrapper, { backgroundColor: getAlertBg(alert.type) }]}>
                <Ionicons 
                  name={alert.type === 'out_of_stock' ? 'close-circle' : alert.type === 'expiring' ? 'time' : 'alert-circle'} 
                  size={18} 
                  color={getAlertColor(alert.type)} 
                />
              </View>
              <View style={styles.alertHeaderContent}>
                <Text style={styles.medicineName}>{alert.medicine}</Text>
                <Text style={styles.alertMeta}>
                  Qty: {alert.quantity}  •  {typeof alert.threshold === 'number' ? `Min: ${alert.threshold}` : alert.threshold}
                </Text>
              </View>
            </View>

            <View style={styles.alertFooter}>
              <Pressable style={[styles.actionButton, GLASS.secondary]}>
                <Text style={[styles.actionButtonText, { color: getAlertColor(alert.type) }]}>
                  {alert.action}
                </Text>
              </Pressable>
              <Pressable style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>View Medicine</Text>
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
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    ...TYPOGRAPHY.heading800,
    fontSize: 28,
    color: COLORS.text.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCount: {
    ...TYPOGRAPHY.heading,
    fontSize: 24,
    marginBottom: 4,
  },
  summaryLabel: {
    ...TYPOGRAPHY.body,
    fontSize: 11,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  listHeader: {
    marginBottom: 16,
  },
  listTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 18,
    color: COLORS.text.primary,
  },
  alertCard: {
    padding: 16,
    marginBottom: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertHeaderContent: {
    flex: 1,
  },
  medicineName: {
    ...TYPOGRAPHY.heading,
    fontSize: 16,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  alertMeta: {
    ...TYPOGRAPHY.mono,
    fontSize: 11,
    color: COLORS.text.secondary,
  },
  alertFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border.subtle,
    paddingTop: 16,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
  },
  actionButtonText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 13,
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 13,
    color: COLORS.text.secondary,
  },
});