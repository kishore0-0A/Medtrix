import React from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/* =========================================================
   MEDTRIX DESIGN SYSTEM
========================================================= */

const COLORS = {
  background: '#050B16',
  surface: '#0C1628',
  surfaceElevated: '#101C30',
  surfaceBlue: '#0E1D35',

  border: '#1B2A42',
  borderBlue: '#274873',

  white: '#F7FAFF',
  text: '#E9F0FB',
  textSecondary: '#8D9BB0',
  textMuted: '#607087',

  blue: '#3478F6',
  blueBright: '#4A8CFF',
  blueDark: '#123064',

  green: '#35D7A1',
  greenDark: '#10352F',

  yellow: '#F2B84B',
  yellowDark: '#3A301D',

  orange: '#F28B55',
  orangeDark: '#3A261F',

  red: '#EF5575',
  redDark: '#3A1D2C',

  purple: '#A995F5',
  purpleDark: '#292445',

  cyan: '#43C9E8',
};

/* =========================================================
   MOCK DATA
========================================================= */

const inventoryStats = [
  {
    value: '1,248',
    label: 'Total medicines',
    footer: '+12 this week',
    icon: 'medical-outline' as keyof typeof Ionicons.glyphMap,
    color: COLORS.blueBright,
    iconBackground: '#122C57',
  },
  {
    value: '24',
    label: 'Low stock',
    footer: 'Needs attention',
    icon: 'alert-circle-outline' as keyof typeof Ionicons.glyphMap,
    color: COLORS.yellow,
    iconBackground: COLORS.yellowDark,
  },
  {
    value: '18',
    label: 'Expiring soon',
    footer: 'Within 30 days',
    icon: 'time-outline' as keyof typeof Ionicons.glyphMap,
    color: COLORS.orange,
    iconBackground: COLORS.orangeDark,
  },
  {
    value: '07',
    label: 'Out of stock',
    footer: 'Action required',
    icon: 'close-circle-outline' as keyof typeof Ionicons.glyphMap,
    color: COLORS.red,
    iconBackground: COLORS.redDark,
  },
];

const expiringMedicines = [
  {
    name: 'Paracetamol 500mg',
    batch: 'BT-24081',
    days: 12,
    progress: 82,
  },
  {
    name: 'Amoxicillin 500mg',
    batch: 'AM-19422',
    days: 18,
    progress: 64,
  },
  {
    name: 'Cetirizine 10mg',
    batch: 'CT-83104',
    days: 24,
    progress: 48,
  },
];

const recentActivities = [
  {
    title: 'Medicine received',
    medicine: 'Paracetamol 500mg',
    detail: '24 units added',
    time: '10 min ago',
    icon: 'arrow-down-outline' as keyof typeof Ionicons.glyphMap,
    color: COLORS.green,
  },
  {
    title: 'Medicine issued',
    medicine: 'Amoxicillin 500mg',
    detail: '12 units issued',
    time: '35 min ago',
    icon: 'arrow-up-outline' as keyof typeof Ionicons.glyphMap,
    color: COLORS.blueBright,
  },
  {
    title: 'Stock updated',
    medicine: 'Cetirizine 10mg',
    detail: 'Batch quantity updated',
    time: '1 hour ago',
    icon: 'sync-outline' as keyof typeof Ionicons.glyphMap,
    color: COLORS.yellow,
  },
  {
    title: 'Medicine scanned',
    medicine: 'Azithromycin 250mg',
    detail: 'New batch detected',
    time: '2 hours ago',
    icon: 'scan-outline' as keyof typeof Ionicons.glyphMap,
    color: COLORS.cyan,
  },
];

/* =========================================================
   SECTION HEADER
========================================================= */

type SectionHeaderProps = {
  title: string;
  action?: string;
  onPress?: () => void;
};

function SectionHeader({
  title,
  action,
  onPress,
}: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {action && onPress ? (
        <Pressable onPress={onPress} hitSlop={10}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : action ? (
        <Text style={styles.sectionAction}>{action}</Text>
      ) : null}
    </View>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

type StatCardProps = {
  value: string;
  label: string;
  footer: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  iconBackground: string;
};

function StatCard({
  value,
  label,
  footer,
  icon,
  color,
  iconBackground,
}: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View
        style={[
          styles.statIcon,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={color}
        />
      </View>

      <View style={styles.statMain}>
        <Text style={styles.statValue}>{value}</Text>

        <Text style={styles.statLabel}>{label}</Text>
      </View>

      <View style={styles.statFooter}>
        <View
          style={[
            styles.statFooterLine,
            {
              backgroundColor: color,
            },
          ]}
        />

        <Text style={styles.statFooterText}>
          {footer}
        </Text>
      </View>
    </View>
  );
}

/* =========================================================
   HOME SCREEN
========================================================= */

export default function HomeScreen() {
  const handleNotification = () => {
    router.push('/alerts');
  };

  const handleScan = () => {
    router.push('/scan');
  };

  const handleAlerts = () => {
    router.push('/alerts');
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
      />

      <View style={styles.screen}>
        {/* =====================================================
            BACKGROUND ATMOSPHERE
        ===================================================== */}

        <View style={styles.backgroundGlowTop} />

        <View style={styles.backgroundGlowMiddle} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={true}
        >
          {/* =====================================================
              HEADER
          ===================================================== */}

          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View style={styles.brandDot} />

              <Text style={styles.brandName}>
                MEDTRIX
              </Text>

              <View style={styles.brandDivider} />

              <Text style={styles.brandCategory}>
                HEALTHCARE
              </Text>
            </View>

            <View style={styles.headerContent}>
              <View style={styles.greetingContainer}>
                <Text style={styles.greeting}>
                  Good morning
                </Text>

                <Text style={styles.userName}>
                  Kishore
                </Text>

                <Text style={styles.headerSubtitle}>
                  Here's what's happening with your inventory
                </Text>
              </View>

              <Pressable
                onPress={handleNotification}
                accessibilityRole="button"
                accessibilityLabel="Open alerts"
                hitSlop={8}
                style={({ pressed }) => [
                  styles.notificationButton,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.notificationButtonInner}>
                  <Ionicons
                    name="notifications-outline"
                    size={23}
                    color={COLORS.white}
                  />

                  <View style={styles.notificationIndicator} />
                </View>
              </Pressable>
            </View>
          </View>

          {/* =====================================================
              SMART SCAN HERO
          ===================================================== */}

          <Pressable
            onPress={handleScan}
            accessibilityRole="button"
            accessibilityLabel="Scan medicine"
            style={({ pressed }) => [
              styles.scanHero,
              pressed && styles.scanHeroPressed,
            ]}
          >
            {/* Decorative background */}
            <View style={styles.scanGlow} />

            <View style={styles.scanCircleLarge} />

            <View style={styles.scanCircleSmall} />

            {/* Scanner corner details */}
            <View
              style={[
                styles.scannerCorner,
                styles.scannerCornerTopLeft,
              ]}
            />

            <View
              style={[
                styles.scannerCorner,
                styles.scannerCornerTopRight,
              ]}
            />

            <View
              style={[
                styles.scannerCorner,
                styles.scannerCornerBottomLeft,
              ]}
            />

            <View
              style={[
                styles.scannerCorner,
                styles.scannerCornerBottomRight,
              ]}
            />

            {/* Top */}
            <View style={styles.scanTopRow}>
              <View style={styles.scanIconOuter}>
                <View style={styles.scanIconInner}>
                  <Ionicons
                    name="scan-outline"
                    size={30}
                    color={COLORS.white}
                  />
                </View>
              </View>

              <View style={styles.smartScanBadge}>
                <View style={styles.smartScanDot} />

                <Text style={styles.smartScanText}>
                  SMART SCAN
                </Text>
              </View>
            </View>

            {/* Main content */}
            <View style={styles.scanTextBlock}>
              <Text style={styles.scanEyebrow}>
                INVENTORY INTELLIGENCE
              </Text>

              <Text style={styles.scanTitle}>
                Scan medicine
              </Text>

              <Text style={styles.scanDescription}>
                Identify medicine details instantly using
                camera, barcode and OCR.
              </Text>
            </View>

            {/* Bottom action */}
            <View style={styles.scanActionRow}>
              <View style={styles.scanActionText}>
                <Text style={styles.scanActionTitle}>
                  Start scanning
                </Text>

                <Text style={styles.scanActionSubtitle}>
                  Fast · Accurate · Secure
                </Text>
              </View>

              <View style={styles.scanArrowButton}>
                <Ionicons
                  name="arrow-forward"
                  size={27}
                  color={COLORS.white}
                />
              </View>
            </View>
          </Pressable>

          {/* =====================================================
              INVENTORY OVERVIEW
          ===================================================== */}

          <View style={styles.section}>
            <SectionHeader
              title="Inventory overview"
            />

            <View style={styles.statsGrid}>
              {inventoryStats.map((stat) => (
                <StatCard
                  key={stat.label}
                  {...stat}
                />
              ))}
            </View>
          </View>

          {/* =====================================================
              STOCK HEALTH
          ===================================================== */}

          <View style={styles.section}>
            <SectionHeader
              title="Stock health"
              action="View report"
            />

            <View style={styles.stockCard}>
              <View style={styles.stockHeader}>
                <View>
                  <Text style={styles.stockEyebrow}>
                    CURRENT INVENTORY
                  </Text>

                  <View style={styles.stockValueRow}>
                    <Text style={styles.stockValue}>
                      72%
                    </Text>

                    <View style={styles.stockStatus}>
                      <Ionicons
                        name="trending-up"
                        size={13}
                        color={COLORS.green}
                      />

                      <Text style={styles.stockStatusText}>
                        Healthy
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.stockIcon}>
                  <Ionicons
                    name="layers-outline"
                    size={21}
                    color={COLORS.blueBright}
                  />
                </View>
              </View>

              {/* Stock bar */}
              <View style={styles.stockBar}>
                <View
                  style={[
                    styles.stockBarHealthy,
                    { width: '72%' },
                  ]}
                />

                <View
                  style={[
                    styles.stockBarLow,
                    { width: '18%' },
                  ]}
                />

                <View
                  style={[
                    styles.stockBarEmpty,
                    { width: '10%' },
                  ]}
                />
              </View>

              {/* Legend */}
              <View style={styles.stockLegend}>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      {
                        backgroundColor:
                          COLORS.blueBright,
                      },
                    ]}
                  />

                  <Text style={styles.legendLabel}>
                    Healthy
                  </Text>

                  <Text style={styles.legendValue}>
                    72%
                  </Text>
                </View>

                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      {
                        backgroundColor:
                          COLORS.yellow,
                      },
                    ]}
                  />

                  <Text style={styles.legendLabel}>
                    Low
                  </Text>

                  <Text style={styles.legendValue}>
                    18%
                  </Text>
                </View>

                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      {
                        backgroundColor:
                          COLORS.red,
                      },
                    ]}
                  />

                  <Text style={styles.legendLabel}>
                    Empty
                  </Text>

                  <Text style={styles.legendValue}>
                    10%
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* =====================================================
              EXPIRING SOON
          ===================================================== */}

          <View style={styles.section}>
            <SectionHeader
              title="Expiring soon"
              action="View all"
              onPress={handleAlerts}
            />

            <View style={styles.expiryCard}>
              {/* Header */}
              <View style={styles.expiryHeader}>
                <View style={styles.expiryIcon}>
                  <Ionicons
                    name="time-outline"
                    size={20}
                    color={COLORS.orange}
                  />
                </View>

                <View style={styles.expiryHeaderText}>
                  <Text style={styles.expiryTitle}>
                    18 medicines need attention
                  </Text>

                  <Text style={styles.expirySubtitle}>
                    Review batches approaching their expiry
                    date.
                  </Text>
                </View>
              </View>

              {/* Medicines */}
              <View style={styles.expiryList}>
                {expiringMedicines.map(
                  (medicine, index) => (
                    <View
                      key={medicine.batch}
                      style={[
                        styles.expiryItem,
                        index <
                          expiringMedicines.length - 1 &&
                          styles.expiryItemBorder,
                      ]}
                    >
                      <View style={styles.medicineIcon}>
                        <Ionicons
                          name="medical-outline"
                          size={17}
                          color={COLORS.textSecondary}
                        />
                      </View>

                      <View style={styles.medicineInfo}>
                        <Text
                          style={styles.medicineName}
                          numberOfLines={1}
                        >
                          {medicine.name}
                        </Text>

                        <Text style={styles.medicineBatch}>
                          Batch {medicine.batch}
                        </Text>

                        <View style={styles.expiryProgressTrack}>
                          <View
                            style={[
                              styles.expiryProgressFill,
                              {
                                width: `${medicine.progress}%`,
                              },
                            ]}
                          />
                        </View>
                      </View>

                      <View style={styles.daysContainer}>
                        <Text style={styles.daysNumber}>
                          {medicine.days}
                        </Text>

                        <Text style={styles.daysLabel}>
                          days
                        </Text>
                      </View>
                    </View>
                  ),
                )}
              </View>
            </View>
          </View>

          {/* =====================================================
              RECENT ACTIVITY
          ===================================================== */}

          <View style={styles.section}>
            <SectionHeader
              title="Recent activity"
              action="View all"
            />

            <View style={styles.activityCard}>
              {recentActivities.map(
                (activity, index) => {
                  const isLast =
                    index === recentActivities.length - 1;

                  return (
                    <View
                      key={`${activity.title}-${activity.time}`}
                      style={styles.activityItem}
                    >
                      <View style={styles.activityTimeline}>
                        <View
                          style={[
                            styles.activityIcon,
                            {
                              backgroundColor:
                                activity.color + '18',
                              borderColor:
                                activity.color + '35',
                            },
                          ]}
                        >
                          <Ionicons
                            name={activity.icon}
                            size={16}
                            color={activity.color}
                          />
                        </View>

                        {!isLast && (
                          <View
                            style={styles.timelineLine}
                          />
                        )}
                      </View>

                      <View
                        style={[
                          styles.activityContent,
                          !isLast &&
                            styles.activityContentBorder,
                        ]}
                      >
                        <View style={styles.activityTop}>
                          <Text
                            style={styles.activityTitle}
                            numberOfLines={1}
                          >
                            {activity.title}
                          </Text>

                          <Text style={styles.activityTime}>
                            {activity.time}
                          </Text>
                        </View>

                        <Text
                          style={styles.activityMedicine}
                          numberOfLines={1}
                        >
                          {activity.medicine}
                        </Text>

                        <Text style={styles.activityDetail}>
                          {activity.detail}
                        </Text>
                      </View>
                    </View>
                  );
                },
              )}
            </View>
          </View>

          {/* =====================================================
              QUICK ACTIONS
          ===================================================== */}

          <View style={styles.section}>
            <SectionHeader
              title="Quick actions"
            />

            {/* Main action */}
            <Pressable
              onPress={handleScan}
              accessibilityRole="button"
              accessibilityLabel="Scan medicine"
              style={({ pressed }) => [
                styles.primaryAction,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.primaryActionIcon}>
                <Ionicons
                  name="scan-outline"
                  size={22}
                  color={COLORS.white}
                />
              </View>

              <View style={styles.primaryActionText}>
                <Text style={styles.primaryActionTitle}>
                  Scan medicine
                </Text>

                <Text style={styles.primaryActionSubtitle}>
                  Add or identify stock
                </Text>
              </View>

              <Ionicons
                name="arrow-forward"
                size={19}
                color={COLORS.white}
              />
            </Pressable>

            {/* Secondary actions */}
            <View style={styles.secondaryActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryAction,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.secondaryActionIcon,
                    {
                      backgroundColor: '#122C57',
                    },
                  ]}
                >
                  <Ionicons
                    name="add-outline"
                    size={21}
                    color={COLORS.blueBright}
                  />
                </View>

                <Text style={styles.secondaryActionText}>
                  Add stock
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.secondaryAction,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.secondaryActionIcon,
                    {
                      backgroundColor: COLORS.greenDark,
                    },
                  ]}
                >
                  <Ionicons
                    name="arrow-up-outline"
                    size={21}
                    color={COLORS.green}
                  />
                </View>

                <Text style={styles.secondaryActionText}>
                  Issue stock
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.secondaryAction,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.secondaryActionIcon,
                    {
                      backgroundColor: COLORS.purpleDark,
                    },
                  ]}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color={COLORS.purple}
                  />
                </View>

                <Text style={styles.secondaryActionText}>
                  Reports
                </Text>
              </Pressable>
            </View>
          </View>

          {/* =====================================================
              FOOTER
          ===================================================== */}

          <View style={styles.footer}>
            <View style={styles.footerLine} />

            <View style={styles.footerBrand}>
              <View style={styles.footerDot} />

              <Text style={styles.footerBrandText}>
                MEDTRIX HEALTHCARE
              </Text>
            </View>

            <Text style={styles.footerSubtitle}>
              Inventory intelligence
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  /* =========================================================
     ROOT
  ========================================================= */

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 8 : 4,
    paddingBottom: 40,
  },

  /* =========================================================
     BACKGROUND
  ========================================================= */

  backgroundGlowTop: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: '#0A1B38',
    opacity: 0.42,
    top: -205,
    right: -180,
  },

  backgroundGlowMiddle: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#07162D',
    opacity: 0.6,
    top: 490,
    left: -205,
  },

  /* =========================================================
     HEADER
  ========================================================= */

  header: {
    marginTop: 10,
    marginBottom: 27,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 27,
  },

  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.green,
    marginRight: 9,
  },

  brandName: {
    color: '#8190A7',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2.4,
  },

  brandDivider: {
    width: 1,
    height: 13,
    backgroundColor: '#29384E',
    marginHorizontal: 10,
  },

  brandCategory: {
    color: '#4D5D73',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.7,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  greetingContainer: {
    flex: 1,
    paddingRight: 12,
  },

  greeting: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 3,
  },

  userName: {
    color: COLORS.white,
    fontSize: SCREEN_WIDTH >= 400 ? 41 : 38,
    lineHeight: SCREEN_WIDTH >= 400 ? 47 : 44,
    fontWeight: '800',
    letterSpacing: -1.2,
  },

  headerSubtitle: {
    color: '#66758C',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
    marginTop: 8,
    maxWidth: 310,
  },

  notificationButton: {
    width: 59,
    height: 59,
    borderRadius: 30,
    backgroundColor: '#101B2D',
    borderWidth: 1,
    borderColor: '#26364E',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  notificationButtonInner: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#17243A',
    borderWidth: 1,
    borderColor: '#30405A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationIndicator: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.red,
    right: 9,
    top: 8,
  },

  /* =========================================================
     SMART SCAN
  ========================================================= */

  scanHero: {
    minHeight: 325,
    borderRadius: 27,
    backgroundColor: '#0D1A30',
    borderWidth: 1,
    borderColor: COLORS.borderBlue,
    padding: 26,
    marginBottom: 31,
    overflow: 'hidden',
  },

  scanHeroPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.993 }],
  },

  scanGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#173D72',
    opacity: 0.16,
    right: -80,
    top: -90,
  },

  scanCircleLarge: {
    position: 'absolute',
    width: 335,
    height: 335,
    borderRadius: 168,
    borderWidth: 1,
    borderColor: '#27476E',
    opacity: 0.27,
    right: -170,
    bottom: -210,
  },

  scanCircleSmall: {
    position: 'absolute',
    width: 205,
    height: 205,
    borderRadius: 103,
    borderWidth: 1,
    borderColor: '#315985',
    opacity: 0.22,
    right: -82,
    bottom: -95,
  },

  scannerCorner: {
    position: 'absolute',
    width: 19,
    height: 19,
    borderColor: '#4A78B5',
    opacity: 0.7,
  },

  scannerCornerTopLeft: {
    top: 15,
    left: 15,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopLeftRadius: 6,
  },

  scannerCornerTopRight: {
    top: 15,
    right: 15,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderTopRightRadius: 6,
  },

  scannerCornerBottomLeft: {
    bottom: 15,
    left: 15,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderBottomLeftRadius: 6,
  },

  scannerCornerBottomRight: {
    bottom: 15,
    right: 15,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomRightRadius: 6,
  },

  scanTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  scanIconOuter: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#102B54',
    borderWidth: 1,
    borderColor: '#244A7E',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scanIconInner: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.blue,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.3,
    shadowRadius: 13,
    elevation: 7,
  },

  smartScanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#123638',
    borderWidth: 1,
    borderColor: '#236361',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },

  smartScanDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.green,
    marginRight: 7,
  },

  smartScanText: {
    color: '#70E6C2',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },

  scanTextBlock: {
    marginTop: 37,
  },

  scanEyebrow: {
    color: '#5D99FF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: 9,
  },

  scanTitle: {
    color: COLORS.white,
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '800',
    letterSpacing: -0.9,
  },

  scanDescription: {
    color: '#8998AE',
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '500',
    maxWidth: 320,
    marginTop: 8,
  },

  scanActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 23,
  },

  scanActionText: {
    flex: 1,
  },

  scanActionTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },

  scanActionSubtitle: {
    color: '#61728B',
    fontSize: 12,
    fontWeight: '500',
  },

  scanArrowButton: {
    width: 57,
    height: 57,
    borderRadius: 18,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.blue,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.35,
    shadowRadius: 13,
    elevation: 7,
  },

  /* =========================================================
     SECTIONS
  ========================================================= */

  section: {
    marginBottom: 30,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: '700',
    letterSpacing: -0.35,
  },

  sectionAction: {
    color: '#5E99FF',
    fontSize: 12,
    fontWeight: '700',
  },

  /* =========================================================
     INVENTORY STATISTICS
  ========================================================= */

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },

  statCard: {
    width: '48.3%',
    height: 174,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 17,
    justifyContent: 'space-between',
  },

  statIcon: {
    width: 49,
    height: 49,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statMain: {
    marginTop: 9,
  },

  statValue: {
    color: COLORS.white,
    fontSize: 30,
    lineHeight: 35,
    fontWeight: '800',
    letterSpacing: -0.8,
  },

  statLabel: {
    color: '#8392A8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },

  statFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statFooterLine: {
    width: 22,
    height: 3,
    borderRadius: 2,
    marginRight: 7,
  },

  statFooterText: {
    color: '#52637A',
    fontSize: 9,
    fontWeight: '600',
  },

  /* =========================================================
     STOCK HEALTH
  ========================================================= */

  stockCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
  },

  stockHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  stockEyebrow: {
    color: '#60718A',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
  },

  stockValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  stockValue: {
    color: COLORS.white,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
  },

  stockStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.greenDark,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginLeft: 9,
  },

  stockStatusText: {
    color: COLORS.green,
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 3,
  },

  stockIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#10274A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  stockBar: {
    height: 9,
    width: '100%',
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#182235',
    marginTop: 22,
  },

  stockBarHealthy: {
    height: '100%',
    backgroundColor: COLORS.blueBright,
  },

  stockBarLow: {
    height: '100%',
    backgroundColor: COLORS.yellow,
    marginLeft: 2,
  },

  stockBarEmpty: {
    height: '100%',
    backgroundColor: COLORS.red,
    marginLeft: 2,
  },

  stockLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 17,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  legendLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '600',
  },

  legendValue: {
    color: '#9BA8BA',
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 4,
  },

  /* =========================================================
     EXPIRING MEDICINES
  ========================================================= */

  expiryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  expiryHeader: {
    flexDirection: 'row',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#18263B',
  },

  expiryIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.orangeDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  expiryHeaderText: {
    flex: 1,
  },

  expiryTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },

  expirySubtitle: {
    color: '#65758C',
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '500',
  },

  expiryList: {
    paddingHorizontal: 18,
  },

  expiryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },

  expiryItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#17253A',
  },

  medicineIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#111E31',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  medicineInfo: {
    flex: 1,
    minWidth: 0,
  },

  medicineName: {
    color: '#DDE6F3',
    fontSize: 11,
    fontWeight: '700',
  },

  medicineBatch: {
    color: '#596A82',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 3,
  },

  expiryProgressTrack: {
    width: '88%',
    height: 3,
    borderRadius: 2,
    backgroundColor: '#1A2638',
    overflow: 'hidden',
    marginTop: 7,
  },

  expiryProgressFill: {
    height: '100%',
    backgroundColor: COLORS.orange,
    borderRadius: 2,
  },

  daysContainer: {
    width: 42,
    alignItems: 'flex-end',
    marginLeft: 8,
  },

  daysNumber: {
    color: COLORS.orange,
    fontSize: 15,
    fontWeight: '800',
  },

  daysLabel: {
    color: '#596A82',
    fontSize: 8,
    fontWeight: '600',
    marginTop: 1,
  },

  /* =========================================================
     RECENT ACTIVITY
  ========================================================= */

  activityCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 17,
    paddingVertical: 5,
  },

  activityItem: {
    flexDirection: 'row',
    minHeight: 83,
  },

  activityTimeline: {
    width: 40,
    alignItems: 'center',
    position: 'relative',
  },

  activityIcon: {
    width: 35,
    height: 35,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    zIndex: 2,
  },

  timelineLine: {
    position: 'absolute',
    width: 1,
    backgroundColor: '#1B2A40',
    top: 49,
    bottom: 0,
  },

  activityContent: {
    flex: 1,
    paddingLeft: 11,
    paddingVertical: 14,
  },

  activityContentBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#17253A',
  },

  activityTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  activityTitle: {
    flex: 1,
    color: '#DCE5F2',
    fontSize: 11,
    fontWeight: '700',
    marginRight: 8,
  },

  activityTime: {
    color: '#506078',
    fontSize: 8,
    fontWeight: '600',
  },

  activityMedicine: {
    color: '#8493A9',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },

  activityDetail: {
    color: '#52647D',
    fontSize: 9,
    fontWeight: '500',
    marginTop: 2,
  },

  /* =========================================================
     QUICK ACTIONS
  ========================================================= */

  primaryAction: {
    minHeight: 75,
    borderRadius: 20,
    backgroundColor: COLORS.blueDark,
    borderWidth: 1,
    borderColor: '#245397',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  primaryActionIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#2D6FE9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  primaryActionText: {
    flex: 1,
  },

  primaryActionTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },

  primaryActionSubtitle: {
    color: '#7594C4',
    fontSize: 9,
    fontWeight: '500',
    marginTop: 3,
  },

  secondaryActions: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 10,
  },

  secondaryAction: {
    flex: 1,
    minHeight: 91,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    justifyContent: 'space-between',
  },

  secondaryActionIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryActionText: {
    color: '#8695AA',
    fontSize: 9,
    fontWeight: '700',
  },

  /* =========================================================
     FOOTER
  ========================================================= */

  footer: {
    alignItems: 'center',
    marginTop: 2,
    paddingBottom: 10,
  },

  footerLine: {
    width: 42,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#1D2E47',
    marginBottom: 14,
  },

  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  footerDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.green,
    marginRight: 6,
  },

  footerBrandText: {
    color: '#45556D',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  footerSubtitle: {
    color: '#2F3D52',
    fontSize: 8,
    fontWeight: '500',
    marginTop: 5,
  },

  /* =========================================================
     INTERACTION
  ========================================================= */

  pressed: {
    opacity: 0.72,
  },
});