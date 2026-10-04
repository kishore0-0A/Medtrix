import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Pressable,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, GLASS } from '../../theme';
import { Database } from '../../supabase';
import type { InventoryItem, InventoryStatus } from '../../supabase/database';

const FILTERS = ['All', 'Low Stock', 'Expiring', 'Critical'];

const filterToStatus: Record<string, InventoryStatus | null> = {
  All: null,
  'Low Stock': 'low',
  Expiring: 'expiring',
  Critical: 'critical',
};

const formatInventoryCount = (items: InventoryItem[]) => {
  const total = items.reduce((sum, item) => sum + item.quantity, 0);
  return `${total.toLocaleString()} units tracked`;
};

export default function InventoryScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInventory = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    const { data, error: inventoryError } = await Database.getInventory();

    if (inventoryError) {
      console.error(inventoryError);
      setError(
        (inventoryError as Error).message ||
          'Could not load inventory. Check Supabase table setup and connection.',
      );
      setItems([]);
    } else {
      setItems(data ?? []);
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadInventory();
    }, [loadInventory]),
  );

  const filteredItems = useMemo(() => {
    const status = filterToStatus[activeFilter];
    const needle = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesFilter = status ? item.status === status : true;
      const matchesSearch = needle
        ? [item.name, item.strength, item.batchNumber, item.expiryDate]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(needle)
        : true;

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, items, query]);

  const getStatusColor = (status: InventoryStatus) => {
    switch (status) {
      case 'healthy': return COLORS.status.healthy;
      case 'low': return COLORS.status.warning;
      case 'expiring': return COLORS.status.expiring;
      case 'critical': return COLORS.status.critical;
      default: return COLORS.text.muted;
    }
  };

  const getStatusLabel = (status: InventoryStatus) => {
    switch (status) {
      case 'healthy': return 'Healthy';
      case 'low': return 'Low';
      case 'expiring': return 'Expiring';
      case 'critical': return 'Critical';
      default: return 'Unknown';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.canvas} />

      <View style={styles.bgGlowTop} pointerEvents="none" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventory</Text>
        <Text style={styles.headerSubtitle}>
          {loading ? 'Syncing scanned medicines...' : formatInventoryCount(items)}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, GLASS.secondary]}>
          <Ionicons name="search" size={20} color={COLORS.text.muted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search medicines, batches..."
            placeholderTextColor={COLORS.text.muted}
          />
        </View>
        <Pressable style={[styles.filterButton, GLASS.secondary]} onPress={() => loadInventory(true)}>
          <Ionicons name="refresh-outline" size={20} color={COLORS.brand.primary} />
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

      <ScrollView
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadInventory(true)} />
        }
      >
        {loading && (
          <View style={[styles.stateCard, GLASS.standard]}>
            <ActivityIndicator color={COLORS.brand.primary} />
            <Text style={styles.stateTitle}>Loading inventory</Text>
            <Text style={styles.stateText}>Pulling scanned medicine batches from Supabase.</Text>
          </View>
        )}

        {!loading && error && (
          <View style={[styles.stateCard, GLASS.standard]}>
            <Ionicons name="cloud-offline-outline" size={28} color={COLORS.status.critical} />
            <Text style={styles.stateTitle}>Inventory unavailable</Text>
            <Text style={styles.stateText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={() => loadInventory()}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </Pressable>
          </View>
        )}

        {!loading && !error && filteredItems.length === 0 && (
          <View style={[styles.stateCard, GLASS.standard]}>
            <Ionicons name="cube-outline" size={30} color={COLORS.brand.primary} />
            <Text style={styles.stateTitle}>No medicines found</Text>
            <Text style={styles.stateText}>
              Scan a medicine cover and confirm it to add the batch here.
            </Text>
          </View>
        )}

        {!loading && !error && filteredItems.map((item) => (
          <View key={item.id} style={[styles.medicineCard, GLASS.standard]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleCol}>
                <Text style={styles.medicineName}>{item.name}</Text>
                <Text style={styles.medicineStrength}>
                  {[item.strength, item.form].filter(Boolean).join(' - ') || 'Medicine'}
                </Text>
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
                <Text style={styles.metaValue}>{item.batchNumber}</Text>
              </View>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>EXP</Text>
                <Text style={styles.metaValue}>{item.expiryDate}</Text>
              </View>
              <View style={styles.statusPill}>
                <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {getStatusLabel(item.status)}
                </Text>
              </View>
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
  stateCard: {
    minHeight: 190,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginBottom: 16,
  },
  stateTitle: {
    ...TYPOGRAPHY.heading,
    marginTop: 12,
    fontSize: 18,
    color: COLORS.text.primary,
  },
  stateText: {
    ...TYPOGRAPHY.body,
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: COLORS.brand.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryButtonText: {
    ...TYPOGRAPHY.bodyBold,
    color: '#FFFFFF',
    fontSize: 13,
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
  cardTitleCol: {
    flex: 1,
    paddingRight: 12,
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
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 11,
  },
});
