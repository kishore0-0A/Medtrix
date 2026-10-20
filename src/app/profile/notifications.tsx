import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Alert,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS, TYPOGRAPHY } from '../../theme';
import { useThemeContext } from '../../context/ThemeContext';
import { Database, NotificationItem, NotificationCategory } from '../../supabase/database';
import { NotificationService } from '../../services/notificationService';

type FilterCategory = 'all' | NotificationCategory;

function formatRelativeTime(dateString: string): string {
  try {
    const now = Date.now();
    const past = new Date(dateString).getTime();
    const diffMs = now - past;

    if (isNaN(diffMs) || diffMs < 0) return 'Just now';

    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay}d ago`;

    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Recently';
  }
}

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { isDark, colors } = useThemeContext();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [showTestTriggers, setShowTestTriggers] = useState(false);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }, []);

  useEffect(() => {
    const onHardwareBack = () => {
      handleBack();
      return true;
    };

    const backSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onHardwareBack
    );

    return () => {
      backSubscription.remove();
    };
  }, [handleBack]);

  const loadNotifications = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    const { data } = await Database.getNotifications();
    if (data) {
      setNotifications(data);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  const checkPermissionState = useCallback(async () => {
    const { granted } = await NotificationService.checkPermissions();
    setPermissionGranted(granted);
  }, []);

  useEffect(() => {
    loadNotifications();
    checkPermissionState();

    // Subscribe to real-time notification changes
    const unsubscribe = NotificationService.addChangeListener(() => {
      loadNotifications(true);
    });

    return () => {
      unsubscribe();
    };
  }, [loadNotifications, checkPermissionState]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications(true);
    checkPermissionState();
  }, [loadNotifications, checkPermissionState]);

  const requestPushPermission = async () => {
    const granted = await NotificationService.requestPermissions();
    setPermissionGranted(granted);
    if (granted) {
      await NotificationService.registerForPushNotificationsAsync();
      Alert.alert(
        'Notifications Enabled',
        'You will now receive real-time push alerts for critical inventory events.'
      );
    } else {
      Alert.alert(
        'Permission Required',
        'Push notifications are currently disabled in your device settings.'
      );
    }
  };

  const markAsRead = async (id: string) => {
    await Database.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    NotificationService.refresh();
  };

  const markAllAsRead = async () => {
    await Database.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    NotificationService.refresh();
  };

  const handleCardPress = async (item: NotificationItem) => {
    if (!item.is_read) {
      await markAsRead(item.id);
    }

    if (item.data?.route) {
      try {
        router.push(item.data.route as any);
      } catch (e) {
        console.warn('Navigation error for route:', item.data.route, e);
      }
    }
  };

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.is_read).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') return notifications;
    return notifications.filter((n) => n.category === activeFilter);
  }, [notifications, activeFilter]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: notifications.length,
      stock_alert: 0,
      expiry: 0,
      inventory_movement: 0,
      ai_triage: 0,
      system: 0,
    };
    notifications.forEach((n) => {
      if (n.category && counts[n.category] !== undefined) {
        counts[n.category]++;
      }
    });
    return counts;
  }, [notifications]);

  const getCategoryIcon = (category?: NotificationCategory, type?: string) => {
    switch (category) {
      case 'stock_alert':
        return { name: 'warning' as const, color: COLORS.status.warning, bg: isDark ? 'rgba(245, 158, 11, 0.18)' : '#FFFBEB' };
      case 'expiry':
        return { name: 'time' as const, color: COLORS.status.expiring, bg: isDark ? 'rgba(234, 88, 12, 0.18)' : '#FFF7ED' };
      case 'inventory_movement':
        return { name: 'cube' as const, color: COLORS.status.healthy, bg: isDark ? 'rgba(16, 185, 129, 0.18)' : '#ECFDF5' };
      case 'ai_triage':
        return { name: 'sparkles' as const, color: '#3B82F6', bg: isDark ? 'rgba(59, 130, 246, 0.18)' : '#EFF6FF' };
      default:
        return {
          name: type === 'warning' ? ('warning' as const) : type === 'success' ? ('checkmark-circle' as const) : ('information-circle' as const),
          color: type === 'warning' ? COLORS.status.warning : type === 'success' ? COLORS.status.healthy : COLORS.brand.primary,
          bg: isDark ? 'rgba(37, 99, 235, 0.18)' : '#EFF6FF',
        };
    }
  };

  // Test simulation triggers
  const handleTestLowStock = async () => {
    await NotificationService.dispatchLowStockAlert({
      medicineName: 'Amoxicillin 500mg',
      currentQty: 8,
      threshold: 20,
    });
  };

  const handleTestExpiry = async () => {
    await NotificationService.dispatchExpiryAlert({
      medicineName: 'Azithromycin 250mg',
      batchNumber: 'AZ-409',
      expiryDate: '11/2026',
      daysRemaining: 18,
    });
  };

  const handleTestStockIn = async () => {
    await NotificationService.dispatchStockMovementAlert({
      type: 'received',
      medicineName: 'Paracetamol 250mg',
      quantity: 50,
      batchNumber: 'P-990',
    });
  };

  const handleTestAiTriage = async () => {
    await NotificationService.dispatchAiTriageAlert({
      title: 'Triage Recommendation Updated',
      message: 'High demand detected in Emergency Ward: Antipyretics reorder recommended.',
      urgency: 'high',
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.canvas }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background.canvas} />

      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: colors.background.surface, borderBottomColor: colors.border.subtle }]}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] },
          ]}
          hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>

        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
            {t('profile.push_notifications')}
          </Text>
          {unreadCount > 0 && (
            <View style={styles.unreadHeaderBadge}>
              <Text style={styles.unreadHeaderBadgeText}>{unreadCount} new</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 ? (
          <Pressable onPress={markAllAsRead} hitSlop={8} style={styles.markAllButton}>
            <Text style={[styles.markAllText, { color: colors.brand.primary }]}>Mark all read</Text>
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand.primary} />}
      >
        {/* PERMISSION BANNER */}
        {!permissionGranted && (
          <View style={[styles.permissionCard, isDark && { backgroundColor: 'rgba(245, 158, 11, 0.12)', borderColor: 'rgba(245, 158, 11, 0.3)' }]}>
            <View style={styles.permissionIconContainer}>
              <Ionicons name="notifications-circle" size={32} color={COLORS.status.warning} />
            </View>
            <View style={styles.permissionTextContainer}>
              <Text style={[styles.permissionTitle, { color: colors.text.primary }]}>
                Real-Time Push Alerts Disabled
              </Text>
              <Text style={[styles.permissionSubtitle, { color: colors.text.secondary }]}>
                Enable notifications to receive urgent low-stock and batch expiry warnings directly on your device.
              </Text>
              <Pressable style={styles.enableButton} onPress={requestPushPermission}>
                <Ionicons name="checkmark-sharp" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.enableButtonText}>Enable Alerts</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* CATEGORY FILTER CHIPS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContainer}>
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'stock_alert', label: 'Stock Alerts' },
              { id: 'expiry', label: 'Expiry' },
              { id: 'inventory_movement', label: 'Inventory' },
              { id: 'ai_triage', label: 'AI Triage' },
            ] as const
          ).map((tab) => {
            const count = categoryCounts[tab.id] ?? 0;
            const isSelected = activeFilter === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setActiveFilter(tab.id)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected
                      ? colors.brand.primary
                      : isDark
                      ? colors.background.elevated
                      : colors.background.primary,
                    borderColor: isSelected
                      ? colors.brand.primary
                      : colors.border.subtle,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: isSelected
                        ? '#FFFFFF'
                        : isDark
                        ? colors.text.primary
                        : colors.text.secondary,
                    },
                  ]}
                >
                  {tab.label}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.chipBadge,
                      {
                        backgroundColor: isSelected
                          ? 'rgba(255, 255, 255, 0.25)'
                          : isDark
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(0, 0, 0, 0.07)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipBadgeText,
                        { color: isSelected ? '#FFFFFF' : colors.text.primary },
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* LOADING STATE */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.brand.primary} />
            <Text style={[styles.loadingText, { color: colors.text.muted }]}>Loading notifications...</Text>
          </View>
        )}

        {/* NOTIFICATION LIST */}
        {!loading &&
          filteredNotifications.map((item) => {
            const iconInfo = getCategoryIcon(item.category, item.type);
            const isUnread = !item.is_read;

            return (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.notificationCard,
                  {
                    backgroundColor: isUnread
                      ? isDark
                        ? '#0E1726'
                        : '#F0F6FF'
                      : colors.background.surface,
                    borderColor: isUnread
                      ? isDark
                        ? 'rgba(37, 99, 235, 0.45)'
                        : 'rgba(37, 99, 235, 0.35)'
                      : colors.border.subtle,
                    opacity: pressed ? 0.92 : 1,
                  },
                ]}
                onPress={() => handleCardPress(item)}
              >
                {/* Status Indicator Icon */}
                <View style={[styles.iconContainer, { backgroundColor: iconInfo.bg }]}>
                  <Ionicons name={iconInfo.name} size={22} color={iconInfo.color} />
                </View>

                {/* Content */}
                <View style={styles.textContainer}>
                  <View style={styles.titleRow}>
                    <Text
                      style={[
                        styles.title,
                        { color: colors.text.primary },
                        isUnread && styles.unreadTitle,
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    {isUnread && <View style={[styles.unreadDot, { backgroundColor: colors.brand.primary }]} />}
                  </View>

                  <Text style={[styles.message, { color: colors.text.secondary }]}>{item.message}</Text>

                  <View style={styles.footerRow}>
                    <Text style={[styles.time, { color: colors.text.muted }]}>
                      {formatRelativeTime(item.created_at)}
                    </Text>

                    {item.data?.route && (
                      <View style={styles.routePill}>
                        <Text style={[styles.routePillText, { color: colors.brand.primary }]}>
                          View details
                        </Text>
                        <Ionicons name="chevron-forward" size={13} color={colors.brand.primary} />
                      </View>
                    )}
                  </View>
                </View>

                {/* Quick Read/Unread Toggle */}
                {isUnread && (
                  <Pressable
                    hitSlop={12}
                    style={styles.checkButton}
                    onPress={() => markAsRead(item.id)}
                  >
                    <Ionicons name="checkmark-circle-outline" size={20} color={colors.text.muted} />
                  </Pressable>
                )}
              </Pressable>
            );
          })}

        {/* EMPTY STATE */}
        {!loading && filteredNotifications.length === 0 && (
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIconCircle,
                { backgroundColor: isDark ? colors.background.elevated : '#F1F5F9' },
              ]}
            >
              <Ionicons name="notifications-off-outline" size={44} color={colors.text.muted} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>All Caught Up</Text>
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
              {activeFilter === 'all'
                ? 'No alerts right now. Medtrix will notify you as soon as inventory events require attention.'
                : 'No alerts found in this category.'}
            </Text>
          </View>
        )}

        {/* CLINICAL NOTIFICATION SIMULATION / TEST SECTION */}
        <View style={[styles.testSection, { borderTopColor: colors.border.subtle }]}>
          <Pressable
            style={styles.testHeader}
            onPress={() => setShowTestTriggers((prev) => !prev)}
          >
            <View style={styles.testHeaderLeft}>
              <Ionicons name="flash-outline" size={18} color={colors.brand.primary} />
              <Text style={[styles.testHeaderText, { color: colors.text.primary }]}>
                Notification Test Laboratory
              </Text>
            </View>
            <Ionicons
              name={showTestTriggers ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.text.muted}
            />
          </Pressable>

          {showTestTriggers && (
            <View style={styles.testButtonsGrid}>
              <Text style={[styles.testDescription, { color: colors.text.muted }]}>
                Dispatch authentic clinical inventory events to test local heads-up notifications and real-time synchronization:
              </Text>
              <View style={styles.testButtonRow}>
                <Pressable
                  style={[styles.testActionBtn, { backgroundColor: isDark ? '#1F2937' : '#FEF3C7' }]}
                  onPress={handleTestLowStock}
                >
                  <Ionicons name="warning-outline" size={16} color={COLORS.status.warning} />
                  <Text style={[styles.testActionBtnText, { color: COLORS.status.warning }]}>
                    Low Stock (8 units)
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.testActionBtn, { backgroundColor: isDark ? '#1F2937' : '#FFEDD5' }]}
                  onPress={handleTestExpiry}
                >
                  <Ionicons name="time-outline" size={16} color={COLORS.status.expiring} />
                  <Text style={[styles.testActionBtnText, { color: COLORS.status.expiring }]}>
                    Near Expiry (18d)
                  </Text>
                </Pressable>
              </View>

              <View style={styles.testButtonRow}>
                <Pressable
                  style={[styles.testActionBtn, { backgroundColor: isDark ? '#1F2937' : '#D1FAE5' }]}
                  onPress={handleTestStockIn}
                >
                  <Ionicons name="cube-outline" size={16} color={COLORS.status.healthy} />
                  <Text style={[styles.testActionBtnText, { color: COLORS.status.healthy }]}>
                    Stock In (+50)
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.testActionBtn, { backgroundColor: isDark ? '#1F2937' : '#DBEAFE' }]}
                  onPress={handleTestAiTriage}
                >
                  <Ionicons name="sparkles-outline" size={16} color="#3B82F6" />
                  <Text style={[styles.testActionBtnText, { color: '#3B82F6' }]}>
                    AI Triage Alert
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    zIndex: 100,
    elevation: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    zIndex: 110,
    elevation: 6,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 19,
    fontWeight: '700',
  },
  unreadHeaderBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  unreadHeaderBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  markAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  markAllText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  permissionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 16,
  },
  permissionIconContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  permissionTextContainer: {
    flex: 1,
  },
  permissionTitle: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 15,
    marginBottom: 4,
  },
  permissionSubtitle: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  enableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#2563EB',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  enableButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterContainer: {
    paddingRight: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  chipBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 15,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 6,
  },
  message: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  time: {
    fontSize: 12,
  },
  routePill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routePillText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 2,
  },
  checkButton: {
    padding: 4,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  testSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  testHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  testDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  testButtonsGrid: {
    marginTop: 10,
    gap: 8,
  },
  testButtonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  testActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6,
  },
  testActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
