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
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../theme';
import { useThemeContext } from '../../context/ThemeContext';
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
  const { i18n } = useTranslation();
  const { isDark, glass } = useThemeContext();
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
      console.log(inventoryError);
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
    if (isDark) {
      switch (status) {
        case 'healthy': return '#60A5FA';
        case 'low': return '#3B82F6';
        case 'expiring': return '#60A5FA';
        case 'critical': return '#93C5FD';
        default: return '#CBD5E1';
      }
    }
    switch (status) {
      case 'healthy': return COLORS.status.healthy;
      case 'low': return COLORS.status.warning;
      case 'expiring': return COLORS.status.expiring;
      case 'critical': return COLORS.status.critical;
      default: return COLORS.text.muted;
    }
  };

  const getStatusBg = (status: InventoryStatus) => {
    if (isDark) {
      return 'rgba(37, 99, 235, 0.16)';
    }
    switch (status) {
      case 'healthy': return COLORS.status.healthyBg;
      case 'low': return COLORS.status.warningBg;
      case 'expiring': return COLORS.status.expiringBg;
      case 'critical': return COLORS.status.criticalBg;
      default: return 'rgba(241, 245, 249, 0.8)';
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
    <SafeAreaView style={[styles.safeArea, isDark && { backgroundColor: '#000000' }]} edges={['top']}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? '#000000' : COLORS.background.canvas} />

      <View style={[styles.bgGlowTop, isDark && { backgroundColor: '#1D4ED8', opacity: 0.15 }, { pointerEvents: 'none' }]} />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark && { color: '#FFFFFF' }]}>Inventory</Text>
        <Text style={[styles.headerSubtitle, isDark && { color: '#CBD5E1' }]}>
          {loading ? 'Syncing scanned medicines...' : formatInventoryCount(items)}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, glass.secondary, isDark && { backgroundColor: '#0D1117', borderColor: '#1E293B' }]}>
          <Ionicons name="search" size={20} color={isDark ? '#94A3B8' : COLORS.text.muted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, isDark && { color: '#FFFFFF' }]}
            value={query}
            onChangeText={setQuery}
            placeholder="Search medicines, batches..."
            placeholderTextColor={isDark ? '#94A3B8' : COLORS.text.muted}
          />
        </View>
        <Pressable
          style={[styles.filterButton, glass.secondary, isDark && { backgroundColor: '#0D1117', borderColor: '#1E293B' }]}
          onPress={() => loadInventory(true)}
        >
          <Ionicons name="refresh-outline" size={20} color={isDark ? '#60A5FA' : COLORS.brand.primary} />
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
                  glass.secondary,
                  isDark && { backgroundColor: '#0D1117', borderColor: '#1E293B' },
                  isActive && styles.filterChipActive,
                  isActive && isDark && { backgroundColor: 'rgba(37, 99, 235, 0.20)', borderColor: '#3B82F6' },
                ]}
                onPress={() => setActiveFilter(f)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isDark && { color: '#CBD5E1' },
                    isActive && styles.filterChipTextActive,
                    isActive && isDark && { color: '#60A5FA' },
                  ]}
                >
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
          <RefreshControl refreshing={refreshing} onRefresh={() => loadInventory(true)} colors={[COLORS.brand.primary]} tintColor={isDark ? '#60A5FA' : COLORS.brand.primary} />
        }
      >
        <Pressable 
          style={[styles.importActionCard, glass.standard, isDark && { backgroundColor: '#0D1117', borderColor: '#1E293B' }]} 
          onPress={() => router.push('/bulk-import')}
        >
          <View style={[styles.importIconContainer, isDark && { backgroundColor: 'rgba(37, 99, 235, 0.16)' }]}>
            <Ionicons name="document-text-outline" size={24} color={isDark ? '#60A5FA' : COLORS.brand.primary} />
          </View>
          <View style={styles.importTextContainer}>
            <Text style={[styles.importActionTitle, isDark && { color: '#FFFFFF' }]}>Upload Invoice</Text>
            <Text style={[styles.importActionSub, isDark && { color: '#CBD5E1' }]}>Import multiple medicines from one PDF</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={isDark ? '#CBD5E1' : COLORS.text.muted} />
        </Pressable>
        {loading && (
          <View style={[styles.stateCard, glass.standard, isDark && { backgroundColor: '#0D1117', borderColor: '#1E293B' }]}>
            <ActivityIndicator color={isDark ? '#3B82F6' : COLORS.brand.primary} />
            <Text style={[styles.stateTitle, isDark && { color: '#FFFFFF' }]}>Loading inventory</Text>
            <Text style={[styles.stateText, isDark && { color: '#CBD5E1' }]}>Pulling scanned medicine batches from Supabase.</Text>
          </View>
        )}

        {!loading && error && (
          <View style={[styles.stateCard, glass.standard, isDark && { backgroundColor: '#0D1117', borderColor: '#1E293B' }]}>
            <Ionicons name="cloud-offline-outline" size={28} color={isDark ? '#93C5FD' : COLORS.status.critical} />
            <Text style={[styles.stateTitle, isDark && { color: '#FFFFFF' }]}>Inventory unavailable</Text>
            <Text style={[styles.stateText, isDark && { color: '#CBD5E1' }]}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={() => loadInventory()}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </Pressable>
          </View>
        )}

        {!loading && !error && filteredItems.length === 0 && (
          <View style={[styles.stateCard, glass.standard, isDark && { backgroundColor: '#0D1117', borderColor: '#1E293B' }]}>
            <Ionicons name="cube-outline" size={30} color={isDark ? '#60A5FA' : COLORS.brand.primary} />
            <Text style={[styles.stateTitle, isDark && { color: '#FFFFFF' }]}>No medicines found</Text>
            <Text style={[styles.stateText, isDark && { color: '#CBD5E1' }]}>
              Scan a medicine cover and confirm it to add the batch here.
            </Text>
          </View>
        )}

        {!loading && !error && filteredItems.map((item) => (
          <View key={item.id} style={[styles.medicineCard, glass.standard, isDark && { backgroundColor: '#0D1117', borderColor: '#1E293B' }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleCol}>
                <Text style={[styles.medicineName, isDark && { color: '#FFFFFF' }]}>{item.translations?.[i18n.language]?.name || item.name}</Text>
                <Text style={[styles.medicineStrength, isDark && { color: '#CBD5E1' }]}>
                  {[item.translations?.[i18n.language]?.strength || item.strength, item.translations?.[i18n.language]?.form || item.form].filter(Boolean).join(' - ') || 'Medicine'}
                </Text>
              </View>
              <View style={[styles.quantityContainer, { backgroundColor: getStatusBg(item.status) }]}>
                <Text style={[styles.quantityText, { color: getStatusColor(item.status) }]}>
                  {item.quantity}
                </Text>
                <Text style={[styles.unitText, { color: getStatusColor(item.status) }]}>units</Text>
              </View>
            </View>

            <View style={[styles.cardFooter, isDark && { borderTopColor: '#1E293B' }]}>
              <View style={styles.metaCol}>
                <Text style={[styles.metaLabel, isDark && { color: '#94A3B8' }]}>BATCH</Text>
                <Text style={[styles.metaValue, isDark && { color: '#FFFFFF' }]}>{item.batchNumber}</Text>
              </View>
              <View style={styles.metaCol}>
                <Text style={[styles.metaLabel, isDark && { color: '#94A3B8' }]}>EXP</Text>
                <Text style={[styles.metaValue, isDark && { color: '#FFFFFF' }]}>{item.expiryDate}</Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: getStatusBg(item.status), borderColor: isDark ? '#1E293B' : getStatusColor(item.status) + '30' }]}>
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
    paddingTop: 16,
    paddingBottom: 14,
  },
  headerTitle: {
    ...TYPOGRAPHY.heading800,
    fontSize: 28,
    color: COLORS.text.primary,
    letterSpacing: -0.5,
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
    marginBottom: 14,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 14,
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
    borderRadius: 14,
  },
  filterScrollWrapper: {
    marginBottom: 16,
  },
  filterScroll: {
    paddingHorizontal: 20,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  filterChipActive: {
    borderColor: COLORS.brand.primary,
    backgroundColor: COLORS.brand.verySoft,
    ...SHADOWS.soft,
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
    padding: 24,
    marginBottom: 16,
    borderRadius: 18,
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
    paddingHorizontal: 18,
    paddingVertical: 10,
    ...SHADOWS.soft,
  },
  retryButtonText: {
    ...TYPOGRAPHY.bodyBold,
    color: '#FFFFFF',
    fontSize: 13,
  },
  medicineCard: {
    padding: 18,
    marginBottom: 14,
    borderRadius: 18,
    ...SHADOWS.soft,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  cardTitleCol: {
    flex: 1,
    paddingRight: 12,
  },
  medicineName: {
    ...TYPOGRAPHY.heading,
    fontSize: 17,
    color: COLORS.text.primary,
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  medicineStrength: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  quantityContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 54,
  },
  quantityText: {
    ...TYPOGRAPHY.heading,
    fontSize: 18,
    lineHeight: 22,
  },
  unitText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    letterSpacing: 0.5,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 11,
  },
  importActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    marginBottom: 16,
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
    borderWidth: 1,
    borderColor: COLORS.brand.verySoft,
    ...SHADOWS.soft,
  },
  importIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  importTextContainer: { flex: 1 },
  importActionTitle: { ...TYPOGRAPHY.heading, fontSize: 16, color: COLORS.text.primary, marginBottom: 2 },
  importActionSub: { ...TYPOGRAPHY.body, fontSize: 13, color: COLORS.text.secondary },
});
