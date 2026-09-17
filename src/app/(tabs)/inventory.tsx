import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, GLASS } from '../../theme';

const MOCK_INVENTORY = [
  {
    id: '1',
    name: 'Paracetamol',
    strength: '500mg',
    batch: 'BT-24081',
    expiry: '12/2027',
    quantity: 450,
    status: 'healthy',
  },
  {
    id: '2',
    name: 'Amoxicillin',
    strength: '500mg',
    batch: 'AM-18432',
    expiry: '10/2024',
    quantity: 24,
    status: 'low',
  },
  {
    id: '3',
    name: 'Cetirizine',
    strength: '10mg',
    batch: 'CT-88314',
    expiry: '09/2024',
    quantity: 120,
    status: 'expiring',
  },
  {
    id: '4',
    name: 'Azithromycin',
    strength: '250mg',
    batch: 'AZ-00912',
    expiry: '05/2026',
    quantity: 0,
    status: 'critical',
  },
];

const FILTERS = ['All', 'Low Stock', 'Expiring', 'Critical'];

export default function InventoryScreen() {
  const [activeFilter, setActiveFilter] = useState('All');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return COLORS.status.healthy;
      case 'low': return COLORS.status.warning;
      case 'expiring': return COLORS.status.expiring;
      case 'critical': return COLORS.status.critical;
      default: return COLORS.text.muted;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.canvas} />

      {/* Subtle Background Elements */}
      <View style={styles.bgGlowTop} pointerEvents="none" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventory</Text>
        <Text style={styles.headerSubtitle}>1,248 items tracked</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, GLASS.secondary]}>
          <Ionicons name="search" size={20} color={COLORS.text.muted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search medicines, batches..."
            placeholderTextColor={COLORS.text.muted}
          />
        </View>
        <Pressable style={[styles.filterButton, GLASS.secondary]}>
          <Ionicons name="options-outline" size={20} color={COLORS.brand.primary} />
        </Pressable>
      </View>

      <View style={styles.filterScrollWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTERS.map((f) => {
            const isActive = activeFilter === f;
            return (
              <Pressable
                key={f}
                style={[
                  styles.filterChip,
                  GLASS.secondary,
                  isActive && styles.filterChipActive
                ]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {f}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {MOCK_INVENTORY.map((item) => (
          <View key={item.id} style={[styles.medicineCard, GLASS.standard]}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.medicineName}>{item.name}</Text>
                <Text style={styles.medicineStrength}>{item.strength}</Text>
              </View>
              <View style={styles.quantityContainer}>
                <Text style={[styles.quantityText, { color: getStatusColor(item.status) }]}>
                  {item.quantity}
                </Text>
                <Text style={styles.unitText}>units</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>BATCH</Text>
                <Text style={styles.metaValue}>{item.batch}</Text>
              </View>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>EXP</Text>
                <Text style={styles.metaValue}>{item.expiry}</Text>
              </View>
              <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
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
    top: -50,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: COLORS.brand.soft,
    opacity: 0.5,
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
  headerSubtitle: {
    ...TYPOGRAPHY.mono,
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    fontSize: 15,
    color: COLORS.text.primary,
  },
  filterButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterScrollWrapper: {
    marginBottom: 20,
  },
  filterScroll: {
    paddingHorizontal: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
  },
  filterChipActive: {
    borderColor: COLORS.brand.primary,
    backgroundColor: COLORS.brand.verySoft,
  },
  filterChipText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  filterChipTextActive: {
    color: COLORS.brand.primary,
    ...TYPOGRAPHY.bodyBold,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  medicineCard: {
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  medicineName: {
    ...TYPOGRAPHY.heading,
    fontSize: 18,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  medicineStrength: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  quantityContainer: {
    alignItems: 'flex-end',
  },
  quantityText: {
    ...TYPOGRAPHY.heading,
    fontSize: 22,
  },
  unitText: {
    ...TYPOGRAPHY.body,
    fontSize: 11,
    color: COLORS.text.muted,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border.subtle,
    paddingTop: 12,
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    ...TYPOGRAPHY.monoBold,
    fontSize: 9,
    color: COLORS.text.muted,
    marginBottom: 2,
  },
  metaValue: {
    ...TYPOGRAPHY.mono,
    fontSize: 12,
    color: COLORS.text.primary,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 16,
  },
});
