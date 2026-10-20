import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';

import {
  Animated,

  Easing,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  RefreshControl,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';

import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { useThemeContext } from '../../context/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';
import { Database, InventoryItem } from '../../supabase/database';
import { NotificationService } from '../../services/notificationService';




/* ============================================================
   COLORS
============================================================ */

const COLORS = {
  background: '#F6F9FC',
  white: '#FFFFFF',

  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textLight: '#94A3B8',

  primary: '#2563EB',
  primaryDark: '#1747B8',
  primarySoft: '#EFF6FF',
  primaryBorder: '#DBEAFE',

  success: '#059669',
  successSoft: '#ECFDF5',
  successBorder: '#A7F3D0',

  warning: '#D97706',
  warningSoft: '#FFFBEB',
  warningBorder: '#FDE68A',

  orange: '#EA580C',
  orangeSoft: '#FFF7ED',
  orangeBorder: '#FED7AA',

  critical: '#E11D48',
  criticalSoft: '#FFF1F2',
  criticalBorder: '#FECDD3',

  purple: '#7C3AED',
  purpleSoft: '#F5F3FF',

  border: '#E2E8F0',
  borderLight: '#EEF2F7',

  navy: '#10284A',
  navyLight: '#18385F',
};

/* ============================================================
   TYPES
============================================================ */

type IoniconName = keyof typeof Ionicons.glyphMap;

/* ============================================================
   HOME SCREEN
============================================================ */

export default function HomeScreen() {
  const { t } = useTranslation();
  const { isDark } = useThemeContext();

  /* ----------------------------------------------------------
     Authentic clinical state & real-time notification sync
  ---------------------------------------------------------- */
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [invRes, txRes, count] = await Promise.all([
        Database.getInventory(),
        Database.getInventoryTransactions(),
        Database.getUnreadNotificationCount(),
      ]);

      if (invRes.data) {
        setInventory(invRes.data);
      }
      if (txRes.data) {
        setTransactions(txRes.data);
      }
      setUnreadCount(count);
    } catch (err) {
      console.warn('Dashboard data fetch error:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  useEffect(() => {
    const unsubscribe = NotificationService.addChangeListener(() => {
      Database.getUnreadNotificationCount().then(setUnreadCount);
      Database.getInventory().then((res) => {
        if (res.data) setInventory(res.data);
      });
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Compute authentic clinical metrics
  const metrics = useMemo(() => {
    const totalMedicines = inventory.length;
    const totalUnits = inventory.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
    const lowStock = inventory.filter(
      (item) => item.status === 'low' || (item.quantity > 0 && item.quantity < 20)
    ).length;
    const expiringSoon = inventory.filter((item) => item.status === 'expiring').length;
    const outOfStock = inventory.filter(
      (item) => item.status === 'critical' || item.quantity === 0
    ).length;

    return {
      totalMedicines: totalMedicines > 0 ? totalMedicines.toLocaleString() : '0',
      totalUnits: totalUnits.toLocaleString(),
      lowStock: String(lowStock).padStart(2, '0'),
      expiringSoon: String(expiringSoon).padStart(2, '0'),
      outOfStock: String(outOfStock).padStart(2, '0'),
    };
  }, [inventory]);

  // Compute dynamic attention items from genuine inventory state
  const dynamicAttentionItems = useMemo(() => {
    const items: {
      name: string;
      value: string;
      description: string;
      icon: keyof typeof Ionicons.glyphMap;
      color: string;
      background: string;
      route?: string;
    }[] = [];

    const lowStockItems = inventory.filter(
      (i) => i.status === 'low' || (i.quantity > 0 && i.quantity < 20)
    );
    const expiringItems = inventory.filter((i) => i.status === 'expiring');
    const criticalItems = inventory.filter((i) => i.status === 'critical' || i.quantity === 0);

    if (lowStockItems.length > 0) {
      items.push({
        name: `${lowStockItems[0].name} (Low)`,
        value: `${lowStockItems[0].quantity} left`,
        description: `${lowStockItems.length} medicine${
          lowStockItems.length > 1 ? 's' : ''
        } below safe buffer threshold`,
        icon: 'warning-outline',
        color: COLORS.warning,
        background: COLORS.warningSoft,
        route: '/inventory',
      });
    }

    if (expiringItems.length > 0) {
      items.push({
        name: `${expiringItems[0].name} (Expiring)`,
        value: expiringItems[0].expiryDate || '30 days',
        description: `${expiringItems.length} batch${
          expiringItems.length > 1 ? 'es' : ''
        } approaching expiry date`,
        icon: 'time-outline',
        color: COLORS.orange,
        background: COLORS.orangeSoft,
        route: '/alerts',
      });
    }

    if (criticalItems.length > 0) {
      items.push({
        name: `${criticalItems[0].name} (Critical)`,
        value: '0 units',
        description: 'Critical clinical supply breach',
        icon: 'alert-circle-outline',
        color: COLORS.critical,
        background: COLORS.criticalSoft,
        route: '/inventory',
      });
    }

    return items;
  }, [inventory]);
  /* ----------------------------------------------------------
     Entrance animations
  ---------------------------------------------------------- */

  const headerAnim = useRef(new Animated.Value(0)).current;
  const greetingAnim = useRef(new Animated.Value(0)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;
  const inventoryAnim = useRef(new Animated.Value(0)).current;
  const attentionAnim = useRef(new Animated.Value(0)).current;

  /* ----------------------------------------------------------
     Smart Scan animations
  ---------------------------------------------------------- */

  const scanPulse = useRef(new Animated.Value(0)).current;
  const scanLine = useRef(new Animated.Value(0)).current;

  /* ==========================================================
     ANIMATIONS
  ========================================================== */

  useEffect(() => {
    Animated.stagger(90, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(greetingAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(scanAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(inventoryAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(attentionAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    /* --------------------------------------------------------
       Scanner pulse
    -------------------------------------------------------- */

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanPulse, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(scanPulse, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    /* --------------------------------------------------------
       Scanner line
    -------------------------------------------------------- */

    const lineAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLine, {
          toValue: 1,
          duration: 1700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(scanLine, {
          toValue: 0,
          duration: 1700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    pulseAnimation.start();
    lineAnimation.start();

    return () => {
      pulseAnimation.stop();
      lineAnimation.stop();
    };
  }, [
    headerAnim,
    greetingAnim,
    scanAnim,
    inventoryAnim,
    attentionAnim,
    scanPulse,
    scanLine,
  ]);

  /* ==========================================================
     HELPERS
  ========================================================== */

  const handleNavigation = (route: string) => {
    router.push(route as never);
  };

  const getTransform = (
    value: Animated.Value,
    distance = 18,
  ) => ({
    opacity: value,
    transform: [
      {
        translateY: value.interpolate({
          inputRange: [0, 1],
          outputRange: [distance, 0],
        }),
      },
    ],
  });

  const getScale = (value: Animated.Value) => ({
    opacity: value,
    transform: [
      {
        scale: value.interpolate({
          inputRange: [0, 1],
          outputRange: [0.965, 1],
        }),
      },
    ],
  });

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <SafeAreaView
      style={[styles.safeArea, isDark && { backgroundColor: '#000000' }]}
      edges={['top']}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? '#000000' : COLORS.background}
      />

      {/* =====================================================
          BACKGROUND ATMOSPHERE
      ===================================================== */}

      <View
        style={[styles.backgroundGlowBlue, isDark && { backgroundColor: '#1D4ED8', opacity: 0.15 }, { pointerEvents: 'none' }]}
      />

      <View
        style={[styles.backgroundGlowGreen, isDark && { opacity: 0 }, { pointerEvents: 'none' }]}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadDashboardData(true)}
            tintColor={isDark ? '#60A5FA' : COLORS.primary}
          />
        }
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <Animated.View
          style={[
            styles.header,
            getTransform(headerAnim, 10),
          ]}
        >
          {/* Brand */}

          <Pressable
            style={styles.brandContainer}
            onPress={() => handleNavigation('/profile')}
          >
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons
                name="medical-bag"
                size={18}
                color="#FFFFFF"
              />

              <View style={styles.logoHighlight} />
            </View>

            <View>
              <Text style={[styles.brandName, isDark && { color: '#FFFFFF' }]}>
                MEDTRIX
              </Text>

              <Text style={[styles.brandSub, isDark && { color: '#CBD5E1' }]}>
                CLINICAL OPERATIONS
              </Text>
            </View>
          </Pressable>

          {/* Header Actions */}

          <View style={styles.headerActions}>
            <ThemeToggle style={{ marginRight: 8 }} />
            <Pressable
              style={[
                styles.headerButton,
                isDark && {
                  backgroundColor: '#0D1117',
                  borderColor: '#1E293B',
                },
              ]}
              onPress={() =>
                handleNavigation('/profile/notifications')
              }
            >
              <Ionicons
                name="notifications-outline"
                size={19}
                color={isDark ? '#FFFFFF' : COLORS.text}
              />

              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </Animated.View>

        {/* ===================================================
            GREETING
        =================================================== */}

        <Animated.View
          style={[
            styles.greetingSection,
            getTransform(greetingAnim),
          ]}
        >
          <View style={styles.greetingContent}>
            <Text style={styles.greetingEyebrow}>
              WELCOME BACK
            </Text>

            <Text style={[styles.greetingName, isDark && { color: '#FFFFFF' }]}>
              Kishore
            </Text>

            <Text style={[styles.greetingDescription, isDark && { color: '#CBD5E1' }]}>
              Manage your medicine inventory.
            </Text>
          </View>
        </Animated.View>

        {/* ===================================================
            {t('dashboard.smart_scan').toUpperCase()} HERO
        =================================================== */}

        <Animated.View
          style={[
            styles.scanHero,
            getScale(scanAnim),
          ]}
        >
          {/* Glow */}

          <View style={styles.scanHeroGlow} />

          <View style={styles.scanHeroContent}>
            {/* ------------------------------------------------
                Hero top
            ------------------------------------------------ */}

            <View style={styles.scanHeroTop}>
              <View style={styles.scanHeroText}>
                <View style={styles.scanLabelRow}>
                  <View style={styles.scanStatusDot} />

                  <Text style={styles.scanLabel}>{t('dashboard.smart_scan').toUpperCase()}</Text>

                  <View style={styles.ocrTag}>
                    <Text style={styles.ocrTagText}>
                      OCR
                    </Text>
                  </View>
                </View>

                <Text style={styles.scanTitle}>{t('dashboard.identify_medicine')}</Text>

                <Text style={styles.scanDescription}>
                  Capture a medicine package to extract
                  name, batch, expiry and dosage details.
                </Text>
              </View>

              {/* ------------------------------------------------
                  Scanner visual
              ------------------------------------------------ */}

              <Animated.View
                style={[
                  styles.scanVisual,
                  {
                    transform: [
                      {
                        scale: scanPulse.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.06],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.scanVisualOuter}>
                  {/* Corners */}

                  <View style={styles.scanCornerTL} />
                  <View style={styles.scanCornerTR} />
                  <View style={styles.scanCornerBL} />
                  <View style={styles.scanCornerBR} />

                  <Ionicons
                    name="scan-outline"
                    size={34}
                    color="#93C5FD"
                  />

                  {/* Moving scan line */}

                  <Animated.View
                    style={[
                      styles.scanMovingLine,
                      {
                        transform: [
                          {
                            translateY:
                              scanLine.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-18, 18],
                              }),
                          },
                        ],
                      },
                    ]}
                  />
                </View>
              </Animated.View>
            </View>

            {/* ------------------------------------------------
                Smart scan features
            ------------------------------------------------ */}

            <View style={styles.scanFeatureRow}>
              <ScanFeature
                icon="text-outline"
                label="OCR"
              />

              <View style={styles.featureDivider} />

              <ScanFeature
                icon="cube-outline"
                label="BATCH"
              />

              <View style={styles.featureDivider} />

              <ScanFeature
                icon="calendar-outline"
                label="EXPIRY"
              />
            </View>

            {/* ------------------------------------------------
                Start scanning button
            ------------------------------------------------ */}

            <Pressable
              style={({ pressed }) => [
                styles.primaryScanButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => handleNavigation('/scan')}
            >
              <View style={styles.primaryScanButtonLeft}>
                <View style={styles.scanButtonIcon}>
                  <Ionicons
                    name="scan-outline"
                    size={18}
                    color={COLORS.navy}
                  />
                </View>

                <Text style={styles.primaryScanText}>
                  Start scanning
                </Text>
              </View>

              <View style={styles.scanArrow}>
                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color="#FFFFFF"
                />
              </View>
            </Pressable>
          </View>
        </Animated.View>

        {/* ===================================================
            INVENTORY SUMMARY
        =================================================== */}

        <Animated.View
          style={[
            styles.section,
            getTransform(inventoryAnim),
          ]}
        >
          <SectionHeader
            title="Inventory"
            action="View all"
            onAction={() =>
              handleNavigation('/inventory')
            }
          />

          <Pressable
            style={({ pressed }) => [
              styles.inventoryCard,
              isDark && {
                backgroundColor: '#0D1117',
                borderColor: '#1E293B',
              },
              pressed && styles.buttonPressed,
            ]}
            onPress={() =>
              handleNavigation('/inventory')
            }
          >
            {/* Total medicines */}

            <View style={styles.inventoryMain}>
              <View style={styles.inventoryIcon}>
                <Ionicons
                  name="medkit-outline"
                  size={21}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.inventoryMainText}>
                <Text style={styles.inventoryLabel}>
                  TOTAL MEDICINES
                </Text>

                <Text style={[styles.inventoryValue, isDark && { color: '#60A5FA' }]}>
                  {metrics.totalMedicines}
                </Text>

                <Text style={[styles.inventorySubtitle, isDark && { color: '#94A3B8' }]}>
                  {metrics.totalUnits} units tracked in inventory
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={COLORS.textLight}
              />
            </View>

            {/* Divider */}

            <View style={[styles.inventoryDivider, isDark && { backgroundColor: '#1E293B' }]} />

            {/* Compact metrics */}

            <View style={styles.inventoryMetrics}>
              <MiniMetric
                value={metrics.lowStock}
                label="Low stock"
                color={COLORS.warning}
                background={COLORS.warningSoft}
              />

              <View style={styles.metricDivider} />

              <MiniMetric
                value={metrics.expiringSoon}
                label="Expiring soon"
                color={COLORS.orange}
                background={COLORS.orangeSoft}
              />

              <View style={styles.metricDivider} />

              <MiniMetric
                value={metrics.outOfStock}
                label="Out of stock"
                color={COLORS.critical}
                background={COLORS.criticalSoft}
              />
            </View>
          </Pressable>
        </Animated.View>

        {/* ===================================================
            NEEDS ATTENTION
        =================================================== */}

        <Animated.View
          style={[
            styles.section,
            getTransform(attentionAnim),
          ]}
        >
          <SectionHeader
            title="Needs attention"
            subtitle="Items requiring action"
            action="View alerts"
            onAction={() =>
              handleNavigation('/alerts')
            }
          />

          <View style={[styles.attentionCard, isDark && { backgroundColor: '#0D1117', borderColor: '#1E293B' }]}>
            {dynamicAttentionItems.length === 0 ? (
              <View style={styles.healthyStateContainer}>
                <View style={styles.healthyStateIcon}>
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.attentionTitle, isDark && { color: '#FFFFFF' }]}>
                    All Stock Levels Optimal
                  </Text>
                  <Text style={[styles.attentionDescription, isDark && { color: '#CBD5E1' }]}>
                    No medicines currently require restocking or expiry quarantine.
                  </Text>
                </View>
              </View>
            ) : (
              dynamicAttentionItems.map((item, index) => (
                <Pressable
                  key={item.name + index}
                  style={({ pressed }) => [
                    styles.attentionRow,
                    index === dynamicAttentionItems.length - 1 && styles.lastRow,
                    pressed && styles.rowPressed,
                  ]}
                  onPress={() => handleNavigation(item.route || '/alerts')}
                >
                  <View
                    style={[
                      styles.attentionIcon,
                      {
                        backgroundColor: isDark ? 'rgba(37, 99, 235, 0.16)' : item.background,
                      },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={18}
                      color={isDark ? '#60A5FA' : item.color}
                    />
                  </View>

                  <View style={styles.attentionContent}>
                    <Text style={[styles.attentionTitle, isDark && { color: '#FFFFFF' }]}>
                      {item.name}
                    </Text>

                    <Text style={[styles.attentionDescription, isDark && { color: '#CBD5E1' }]}>
                      {item.description}
                    </Text>
                  </View>

                  <View style={styles.attentionRight}>
                    <Text
                      style={[
                        styles.attentionValue,
                        {
                          color: isDark ? '#60A5FA' : item.color,
                        },
                      ]}
                    >
                      {item.value}
                    </Text>

                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={isDark ? '#CBD5E1' : COLORS.textLight}
                    />
                  </View>
                </Pressable>
              ))
            )}
          </View>
        </Animated.View>

        {/* ===================================================
            RECENT CLINICAL ACTIVITY
        =================================================== */}

        <Animated.View
          style={[
            styles.section,
            getTransform(attentionAnim),
          ]}
        >
          <SectionHeader
            title="Recent Stock Activity"
            subtitle="Verified movements & transactions"
            action="View inventory"
            onAction={() => handleNavigation('/inventory')}
          />

          <View style={[styles.attentionCard, isDark && { backgroundColor: '#0D1117', borderColor: '#1E293B' }]}>
            {transactions.slice(0, 3).map((tx, idx) => {
              const isReceived = tx.transaction_type === 'received';
              const medName = tx.medicine_batches?.medicines?.name || 'Medicine Batch';
              return (
                <View
                  key={tx.id || idx}
                  style={[
                    styles.attentionRow,
                    idx === Math.min(transactions.length, 3) - 1 && styles.lastRow,
                  ]}
                >
                  <View
                    style={[
                      styles.attentionIcon,
                      {
                        backgroundColor: isReceived
                          ? isDark
                            ? 'rgba(16, 185, 129, 0.16)'
                            : COLORS.successSoft
                          : isDark
                          ? 'rgba(37, 99, 235, 0.16)'
                          : COLORS.primarySoft,
                      },
                    ]}
                  >
                    <Ionicons
                      name={isReceived ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'}
                      size={18}
                      color={isReceived ? COLORS.success : COLORS.primary}
                    />
                  </View>

                  <View style={styles.attentionContent}>
                    <Text style={[styles.attentionTitle, isDark && { color: '#FFFFFF' }]}>
                      {medName}
                    </Text>

                    <Text style={[styles.attentionDescription, isDark && { color: '#CBD5E1' }]}>
                      {isReceived ? 'Received into clinical stock' : 'Dispensed for patient'}
                    </Text>
                  </View>

                  <View style={styles.attentionRight}>
                    <Text
                      style={[
                        styles.attentionValue,
                        {
                          color: isReceived
                            ? COLORS.success
                            : isDark
                            ? '#60A5FA'
                            : COLORS.primary,
                        },
                      ]}
                    >
                      {isReceived ? `+${tx.quantity}` : `-${tx.quantity}`}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Bottom spacing for tab bar */}

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================================================
   SECTION HEADER
============================================================ */

function SectionHeader({
  title,
  subtitle,
  action,
  onAction,
}: {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
}) {
  const { isDark } = useThemeContext();
  return (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={[styles.sectionTitle, isDark && { color: '#FFFFFF' }]}>
          {title}
        </Text>

        {subtitle && (
          <Text style={[styles.sectionSubtitle, isDark && { color: '#CBD5E1' }]}>
            {subtitle}
          </Text>
        )}
      </View>

      {action && onAction && (
        <Pressable
          style={styles.sectionAction}
          onPress={onAction}
        >
          <Text style={[styles.sectionActionText, isDark && { color: '#60A5FA' }]}>
            {action}
          </Text>

          <Ionicons
            name="chevron-forward"
            size={13}
            color={isDark ? '#60A5FA' : COLORS.primary}
          />
        </Pressable>
      )}
    </View>
  );
}

/* ============================================================
   SMART SCAN FEATURE
============================================================ */

function ScanFeature({
  icon,
  label,
}: {
  icon: IoniconName;
  label: string;
}) {
  return (
    <View style={styles.scanFeature}>
      <Ionicons
        name={icon}
        size={14}
        color="#BFDBFE"
      />

      <Text style={styles.scanFeatureText}>
        {label}
      </Text>
    </View>
  );
}

/* ============================================================
   MINI INVENTORY METRIC
============================================================ */

function MiniMetric({
  value,
  label,
  color,
  background,
}: {
  value: string;
  label: string;
  color: string;
  background: string;
}) {
  const { isDark } = useThemeContext();
  return (
    <View style={styles.miniMetric}>
      <View
        style={[
          styles.miniMetricIcon,
          {
            backgroundColor: isDark ? 'rgba(37, 99, 235, 0.16)' : background,
          },
        ]}
      >
        <View
          style={[
            styles.miniMetricDot,
            {
              backgroundColor: isDark ? '#3B82F6' : color,
            },
          ]}
        />
      </View>

      <Text
        style={[
          styles.miniMetricValue,
          {
            color: isDark ? '#60A5FA' : color,
          },
        ]}
      >
        {value}
      </Text>

      <Text style={[styles.miniMetricLabel, isDark && { color: '#CBD5E1' }]}>
        {label}
      </Text>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  /* ==========================================================
     BASE
  ========================================================== */

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  backgroundGlowBlue: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    top: -100,
    right: -90,
    backgroundColor: '#EAF3FF',
    opacity: 0.8,
  },

  backgroundGlowGreen: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    top: 430,
    left: -120,
    backgroundColor: '#ECFDF5',
    opacity: 0.55,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  /* ==========================================================
     HEADER
  ========================================================== */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 26,
  },

  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,

    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },

  logoHighlight: {
    position: 'absolute',
    top: 4,
    left: 5,
    width: 8,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },

  brandName: {
    fontFamily: 'Outfit-Bold',
    fontSize: 17,
    color: COLORS.text,
    letterSpacing: 0.7,
  },

  brandSub: {
    fontFamily: 'Jakarta-Medium',
    fontSize: 8,
    color: COLORS.textMuted,
    letterSpacing: 0.85,
    marginTop: 1,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',

    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.critical,
    borderWidth: 1.5,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },

  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontFamily: 'Jakarta-Bold',
    textAlign: 'center',
  },

  healthyStateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },

  healthyStateIcon: {
    marginRight: 12,
  },

  /* ==========================================================
     GREETING
  ========================================================== */

  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
  },

  greetingContent: {
    flex: 1,
    paddingRight: 10,
  },

  greetingEyebrow: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 9,
    color: COLORS.primary,
    letterSpacing: 1.25,
    marginBottom: 3,
  },

  greetingName: {
    fontFamily: 'Outfit-Bold',
    fontSize: 32,
    lineHeight: 36,
    color: COLORS.text,
    letterSpacing: -0.5,
  },

  greetingDescription: {
    fontFamily: 'Jakarta-Medium',
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textMuted,
    marginTop: 3,
  },

  /* ==========================================================
     SMART SCAN
  ========================================================== */

  scanHero: {
    overflow: 'hidden',
    borderRadius: 24,
    marginBottom: 27,
    backgroundColor: COLORS.navy,

    shadowColor: COLORS.navy,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 7,
  },

  scanHeroGlow: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    right: -70,
    top: -80,
    backgroundColor: '#1E4E87',
    opacity: 0.55,
  },

  scanHeroContent: {
    padding: 20,
  },

  scanHeroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 19,
  },

  scanHeroText: {
    flex: 1,
    paddingRight: 8,
  },

  scanLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },

  scanStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#60A5FA',
    marginRight: 6,
  },

  scanLabel: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 9,
    color: '#BFDBFE',
    letterSpacing: 1.15,
  },

  ocrTag: {
    marginLeft: 7,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
  },

  ocrTagText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 7,
    color: '#93C5FD',
    letterSpacing: 0.6,
  },

  scanTitle: {
    fontFamily: 'Outfit-Bold',
    fontSize: 25,
    lineHeight: 28,
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 7,
  },

  scanDescription: {
    fontFamily: 'Jakarta-Medium',
    fontSize: 11.5,
    lineHeight: 17,
    color: '#B8C8DD',
    maxWidth: 250,
  },

  /* ==========================================================
     SCANNER VISUAL
  ========================================================== */

  scanVisual: {
    width: 74,
    height: 74,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scanVisualOuter: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: 'rgba(37,99,235,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(147,197,253,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  scanCornerTL: {
    position: 'absolute',
    top: 9,
    left: 9,
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#60A5FA',
    borderTopLeftRadius: 4,
  },

  scanCornerTR: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#60A5FA',
    borderTopRightRadius: 4,
  },

  scanCornerBL: {
    position: 'absolute',
    bottom: 9,
    left: 9,
    width: 12,
    height: 12,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#60A5FA',
    borderBottomLeftRadius: 4,
  },

  scanCornerBR: {
    position: 'absolute',
    bottom: 9,
    right: 9,
    width: 12,
    height: 12,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#60A5FA',
    borderBottomRightRadius: 4,
  },

  scanMovingLine: {
    position: 'absolute',
    width: 42,
    height: 1,
    backgroundColor: '#60A5FA',
    opacity: 0.7,
  },

  /* ==========================================================
     SCAN FEATURES
  ========================================================== */

  scanFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 13,
  },

  scanFeature: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  scanFeatureText: {
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 8.5,
    color: '#CBD5E1',
  },

  featureDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  /* ==========================================================
     SCAN BUTTON
  ========================================================== */

  primaryScanButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },

  primaryScanButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  scanButtonIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#E8F1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  primaryScanText: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 13,
    color: COLORS.navy,
  },

  scanArrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ==========================================================
     SECTIONS
  ========================================================== */

  section: {
    marginBottom: 25,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 11,
  },

  sectionTitle: {
    fontFamily: 'Outfit-Bold',
    fontSize: 18,
    lineHeight: 22,
    color: COLORS.text,
    letterSpacing: -0.2,
  },

  sectionSubtitle: {
    fontFamily: 'Jakarta-Medium',
    fontSize: 9.5,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },

  sectionActionText: {
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 10.5,
    color: COLORS.primary,
  },

  /* ==========================================================
     INVENTORY CARD
  ========================================================== */

  inventoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,

    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.045,
    shadowRadius: 10,
    elevation: 2,
  },

  inventoryMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  inventoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  inventoryMainText: {
    flex: 1,
  },

  inventoryLabel: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 8,
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 1,
  },

  inventoryValue: {
    fontFamily: 'Outfit-Bold',
    fontSize: 27,
    lineHeight: 31,
    color: COLORS.primary,
    letterSpacing: -0.4,
  },

  inventorySubtitle: {
    fontFamily: 'Jakarta-Medium',
    fontSize: 8.5,
    color: COLORS.textMuted,
    marginTop: 1,
  },

  inventoryDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 14,
  },

  /* ==========================================================
     INVENTORY METRICS
  ========================================================== */

  inventoryMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  miniMetric: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  miniMetricIcon: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },

  miniMetricDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  miniMetricValue: {
    fontFamily: 'Outfit-Bold',
    fontSize: 18,
    lineHeight: 21,
  },

  miniMetricLabel: {
    fontFamily: 'Jakarta-Medium',
    fontSize: 7.5,
    color: COLORS.textMuted,
    marginTop: 1,
    textAlign: 'center',
  },

  metricDivider: {
    width: 1,
    height: 34,
    backgroundColor: COLORS.borderLight,
  },

  /* ==========================================================
     NEEDS ATTENTION
  ========================================================== */

  attentionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,

    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.045,
    shadowRadius: 10,
    elevation: 2,
  },

  attentionRow: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },

  attentionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  attentionContent: {
    flex: 1,
    paddingRight: 8,
  },

  attentionTitle: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 11.5,
    color: COLORS.text,
    marginBottom: 2,
  },

  attentionDescription: {
    fontFamily: 'Jakarta-Medium',
    fontSize: 8.5,
    color: COLORS.textMuted,
  },

  attentionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  attentionValue: {
    fontFamily: 'Outfit-Bold',
    fontSize: 18,
  },

  /* ==========================================================
     COMMON
  ========================================================== */

  lastRow: {
    borderBottomWidth: 0,
  },

  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.975 }],
  },

  rowPressed: {
    opacity: 0.75,
  },
});