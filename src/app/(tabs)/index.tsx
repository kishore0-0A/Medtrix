import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
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
import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

const inventoryStats = [
  {
    value: '1,248',
    label: 'TOTAL MEDICINES',
    footer: '+12 this week',
    icon: 'medical',
    color: COLORS.primary,
    bgColor: COLORS.primarySoft,
  },
  {
    value: '24',
    label: 'LOW STOCK',
    footer: 'Needs attention',
    icon: 'warning',
    color: COLORS.warning,
    bgColor: COLORS.warningSoft,
  },
  {
    value: '18',
    label: 'EXPIRING SOON',
    footer: 'Within 30 days',
    icon: 'time',
    color: COLORS.orange,
    bgColor: COLORS.orangeSoft,
  },
  {
    value: '07',
    label: 'OUT OF STOCK',
    footer: 'Action required',
    icon: 'close-circle',
    color: COLORS.critical,
    bgColor: COLORS.criticalSoft,
  },
];

const expiringMedicines = [
  {
    name: 'Paracetamol 500mg',
    batch: 'BT-24081',
    days: 12,
    date: '12/2027',
    severity: 'medium',
  },
  {
    name: 'Amoxicillin 500mg',
    batch: 'AM-13622',
    days: 16,
    date: '16/2027',
    severity: 'medium',
  },
  {
    name: 'Cetirizine 10mg',
    batch: 'CT-33104',
    days: 24,
    date: '24/2028',
    severity: 'low',
  },
];

const recentActivities = [
  {
    title: 'Medicine received',
    medicine: 'Paracetamol 500mg',
    detail: '+24 units added to inventory',
    time: '2h ago',
    icon: 'arrow-down',
    color: COLORS.success,
    bgColor: COLORS.successSoft,
  },
  {
    title: 'Medicine issued',
    medicine: 'Amoxicillin 500mg',
    detail: '12 units issued to Surgery Ward',
    time: '5h ago',
    icon: 'arrow-up',
    color: COLORS.critical,
    bgColor: COLORS.criticalSoft,
  },
  {
    title: 'Stock adjusted',
    medicine: 'Cetirizine 10mg',
    detail: 'Quantity corrected after physical count',
    time: '7h ago',
    icon: 'sync',
    color: COLORS.primary,
    bgColor: COLORS.primarySoft,
  },
  {
    title: 'Batch verified',
    medicine: 'Aspirin 325mg',
    detail: 'New batch registered successfully',
    time: '9h ago',
    icon: 'checkmark-done',
    color: COLORS.purple,
    bgColor: COLORS.purpleSoft,
  },
];

type IoniconName = keyof typeof Ionicons.glyphMap;
type MaterialIconName = keyof typeof MaterialCommunityIcons.glyphMap;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HomeScreen() {
  const headerAnim = useRef(new Animated.Value(0)).current;
  const greetingAnim = useRef(new Animated.Value(0)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;
  const tacticalAnim = useRef(new Animated.Value(0)).current;
  const kpiAnim = useRef(new Animated.Value(0)).current;
  const healthAnim = useRef(new Animated.Value(0)).current;
  const expiringAnim = useRef(new Animated.Value(0)).current;
  const activityAnim = useRef(new Animated.Value(0)).current;

  const scanPulse = useRef(new Animated.Value(0)).current;
  const scanLine = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(85, [
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
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(tacticalAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(kpiAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(healthAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(expiringAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(activityAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
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
    ).start();

    Animated.loop(
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
    ).start();
  }, [
    headerAnim,
    greetingAnim,
    scanAnim,
    tacticalAnim,
    kpiAnim,
    healthAnim,
    expiringAnim,
    activityAnim,
    scanPulse,
    scanLine,
  ]);

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

  const today = useMemo(() => {
    const date = new Date();

    const weekday = date
      .toLocaleDateString('en-US', {
        weekday: 'short',
      })
      .toUpperCase();

    const month = date
      .toLocaleDateString('en-US', {
        month: 'short',
      })
      .toUpperCase();

    const day = date.getDate();

    return `${weekday}, ${month} ${day}`;
  }, []);

  const currentTime = useMemo(() => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      {/* Background atmosphere */}
      <View
        pointerEvents="none"
        style={styles.backgroundGlowBlue}
      />

      <View
        pointerEvents="none"
        style={styles.backgroundGlowGreen}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <Animated.View
          style={[
            styles.header,
            getTransform(headerAnim, 10),
          ]}
        >
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
              <Text style={styles.brandName}>
                MEDTRIX
              </Text>

              <Text style={styles.brandSub}>
                CLINICAL OPERATIONS
              </Text>
            </View>
          </Pressable>

          <View style={styles.headerActions}>
            <Pressable
              style={styles.headerButton}
              onPress={() => {}}
            >
              <Ionicons
                name="search-outline"
                size={19}
                color={COLORS.text}
              />
            </Pressable>

            <Pressable
              style={styles.headerButton}
              onPress={() =>
                handleNavigation('/notifications')
              }
            >
              <Ionicons
                name="notifications-outline"
                size={19}
                color={COLORS.text}
              />

              <View style={styles.notificationDot} />
            </Pressable>

            <Pressable
              style={styles.headerButton}
              onPress={() =>
                handleNavigation('/profile')
              }
            >
              <Ionicons
                name="person-outline"
                size={18}
                color={COLORS.text}
              />
            </Pressable>
          </View>
        </Animated.View>

        {/* =====================================================
            GREETING
        ===================================================== */}

        <Animated.View
          style={[
            styles.greetingSection,
            getTransform(greetingAnim),
          ]}
        >
          <View style={styles.greetingContent}>
            <View style={styles.greetingMeta}>
            </View>

            <Text style={styles.greetingName}>
              Kishore
            </Text>

            <Text style={styles.greetingDescription}>
              Here&apos;s your medicine inventory overview.
            </Text>
          </View>
        </Animated.View>

        {/* =====================================================
            SMART SCAN HERO
        ===================================================== */}

        <Animated.View
          style={[
            styles.scanHero,
            getScale(scanAnim),
          ]}
        >
          <View style={styles.scanHeroGlow} />

          <View style={styles.scanHeroContent}>
            <View style={styles.scanHeroTop}>
              <View style={styles.scanHeroText}>
                <View style={styles.scanLabelRow}>
                  <View style={styles.scanStatusDot} />

                  <Text style={styles.scanLabel}>
                    SMART SCAN
                  </Text>

                  <View style={styles.ocrTag}>
                    <Text style={styles.ocrTagText}>
                      OCR
                    </Text>
                  </View>
                </View>

                <Text style={styles.scanTitle}>
                  Identify medicine{'\n'}
                  in seconds.
                </Text>

                <Text style={styles.scanDescription}>
                  Capture a medicine package to extract
                  name, batch, expiry and dosage details.
                </Text>
              </View>

              {/* Animated scanner visual */}
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
                  <View style={styles.scanCornerTL} />
                  <View style={styles.scanCornerTR} />
                  <View style={styles.scanCornerBL} />
                  <View style={styles.scanCornerBR} />

                  <Ionicons
                    name="scan-outline"
                    size={34}
                    color="#93C5FD"
                  />

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

        {/* =====================================================
            TACTICAL ACTIONS
        ===================================================== */}

        <Animated.View
          style={[
            styles.section,
            getTransform(tacticalAnim),
          ]}
        >
          <SectionHeader
            title="Quick actions"
            subtitle="Common operations"
          />

          <View style={styles.actionGrid}>
            <ActionCard
              label="Scan"
              description="Identify medicine"
              icon="scan-outline"
              color={COLORS.primary}
              background={COLORS.primarySoft}
              onPress={() =>
                handleNavigation('/scan')
              }
            />

            <ActionCard
              label="Receive"
              description="Add stock"
              icon="arrow-down-outline"
              color={COLORS.success}
              background={COLORS.successSoft}
              onPress={() =>
                handleNavigation('/inventory')
              }
            />

            <ActionCard
              label="Issue"
              description="Record usage"
              icon="arrow-up-outline"
              color={COLORS.critical}
              background={COLORS.criticalSoft}
              onPress={() =>
                handleNavigation('/inventory')
              }
            />

            <ActionCard
              label="Reports"
              description="View analytics"
              icon="bar-chart-outline"
              color={COLORS.purple}
              background={COLORS.purpleSoft}
              onPress={() =>
                handleNavigation('/inventory')
              }
            />
          </View>
        </Animated.View>

        {/* =====================================================
            INVENTORY OVERVIEW
        ===================================================== */}

        <Animated.View
          style={[
            styles.section,
            getTransform(kpiAnim),
          ]}
        >
          <SectionHeader
            title="Inventory overview"
            action="View inventory"
            onAction={() =>
              handleNavigation('/inventory')
            }
          />

          <View style={styles.kpiGrid}>
            {inventoryStats.map((stat) => (
              <KpiCard
                key={stat.label}
                value={stat.value}
                label={stat.label}
                footer={stat.footer}
                icon={stat.icon as IoniconName}
                color={stat.color}
                bgColor={stat.bgColor}
              />
            ))}
          </View>
        </Animated.View>

        {/* =====================================================
            STOCK HEALTH
        ===================================================== */}

        <Animated.View
          style={[
            styles.section,
            getTransform(healthAnim),
          ]}
        >
          <SectionHeader
            title="Stock health"
            subtitle="Current inventory condition"
          />

          <View style={styles.healthCard}>
            <View style={styles.healthHeader}>
              <View>
                <Text style={styles.healthHeadline}>
                  Overall stock condition
                </Text>

                <Text style={styles.healthSubline}>
                  Based on current inventory levels
                </Text>
              </View>

              <View style={styles.healthScore}>
                <Text style={styles.healthScoreValue}>
                  72%
                </Text>

                <Text style={styles.healthScoreLabel}>
                  HEALTHY
                </Text>
              </View>
            </View>

            <View style={styles.healthBar}>
              <View
                style={[
                  styles.healthSegmentHealthy,
                  { flex: 72 },
                ]}
              />

              <View
                style={[
                  styles.healthSegmentLow,
                  { flex: 18 },
                ]}
              />

              <View
                style={[
                  styles.healthSegmentCritical,
                  { flex: 10 },
                ]}
              />
            </View>

            <View style={styles.healthLegend}>
              <HealthLegend
                label="Healthy"
                value="72%"
                color={COLORS.success}
              />

              <HealthLegend
                label="Low stock"
                value="18%"
                color={COLORS.warning}
              />

              <HealthLegend
                label="Critical"
                value="10%"
                color={COLORS.critical}
              />
            </View>
          </View>
        </Animated.View>

        {/* =====================================================
            EXPIRING SOON
        ===================================================== */}

        <Animated.View
          style={[
            styles.section,
            getTransform(expiringAnim),
          ]}
        >
          <SectionHeader
            title="Expiring soon"
            subtitle="Priority batches"
            action="View alerts"
            onAction={() =>
              handleNavigation('/alerts')
            }
          />

          <View style={styles.expiryCard}>
            {expiringMedicines.map((medicine, index) => (
              <Pressable
                key={medicine.batch}
                style={[
                  styles.expiryRow,
                  index ===
                    expiringMedicines.length - 1 &&
                    styles.lastRow,
                ]}
                onPress={() =>
                  handleNavigation('/alerts')
                }
              >
                <View style={styles.medicineIcon}>
                  <MaterialCommunityIcons
                    name="pill"
                    size={18}
                    color={COLORS.textSecondary}
                  />
                </View>

                <View style={styles.expiryMedicineInfo}>
                  <Text
                    style={styles.expiryMedicineName}
                    numberOfLines={1}
                  >
                    {medicine.name}
                  </Text>

                  <View style={styles.batchRow}>
                    <Text style={styles.batchLabel}>
                      BATCH
                    </Text>

                    <Text style={styles.batchValue}>
                      {medicine.batch}
                    </Text>
                  </View>
                </View>

                <View style={styles.expiryRight}>
                  <View
                    style={[
                      styles.daysBadge,
                      medicine.days <= 14 &&
                        styles.daysBadgeUrgent,
                    ]}
                  >
                    <Text
                      style={[
                        styles.daysBadgeText,
                        medicine.days <= 14 &&
                          styles.daysBadgeTextUrgent,
                      ]}
                    >
                      {medicine.days}d
                    </Text>
                  </View>

                  <Text style={styles.expiryDate}>
                    EXP {medicine.date}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={COLORS.textLight}
                  style={styles.rowChevron}
                />
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* =====================================================
            RECENT ACTIVITY
        ===================================================== */}

        <Animated.View
          style={[
            styles.section,
            getTransform(activityAnim),
          ]}
        >
          <SectionHeader
            title="Recent activity"
            subtitle="Latest inventory events"
            action="View all"
            onAction={() =>
              handleNavigation('/activity')
            }
          />

          <View style={styles.activityCard}>
            {recentActivities.map((activity, index) => (
              <View
                key={`${activity.medicine}-${activity.time}`}
                style={[
                  styles.activityRow,
                  index ===
                    recentActivities.length - 1 &&
                    styles.lastRow,
                ]}
              >
                <View style={styles.activityTimeline}>
                  <View
                    style={[
                      styles.activityIcon,
                      {
                        backgroundColor:
                          activity.bgColor,
                      },
                    ]}
                  >
                    <Ionicons
                      name={activity.icon as IoniconName}
                      size={15}
                      color={activity.color}
                    />
                  </View>

                  {index !==
                    recentActivities.length - 1 && (
                    <View
                      style={styles.timelineLine}
                    />
                  )}
                </View>

                <View style={styles.activityContent}>
                  <View style={styles.activityTitleRow}>
                    <Text style={styles.activityTitle}>
                      {activity.title}
                    </Text>

                    <Text style={styles.activityTime}>
                      {activity.time}
                    </Text>
                  </View>

                  <Text style={styles.activityMedicine}>
                    {activity.medicine}
                  </Text>

                  <Text style={styles.activityDetail}>
                    {activity.detail}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* =====================================================
            SYSTEM STATUS
        ===================================================== */}

        <Animated.View
          style={[
            styles.systemStatus,
            getTransform(activityAnim, 10),
          ]}
        >
          <View style={styles.systemStatusIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color={COLORS.success}
            />
          </View>

          <View style={styles.systemStatusText}>
            <Text style={styles.systemStatusTitle}>
              Inventory sync active
            </Text>

            <Text style={styles.systemStatusSubtitle}>
              Latest changes synchronized successfully
            </Text>
          </View>

          <View style={styles.syncIndicator}>
            <View style={styles.syncDot} />

            <Text style={styles.syncText}>
              LIVE
            </Text>
          </View>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================================================
   COMPONENTS
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
  return (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionTitle}>
          {title}
        </Text>

        {subtitle && (
          <Text style={styles.sectionSubtitle}>
            {subtitle}
          </Text>
        )}
      </View>

      {action && onAction && (
        <Pressable
          style={styles.sectionAction}
          onPress={onAction}
        >
          <Text style={styles.sectionActionText}>
            {action}
          </Text>

          <Ionicons
            name="chevron-forward"
            size={13}
            color={COLORS.primary}
          />
        </Pressable>
      )}
    </View>
  );
}

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

function ActionCard({
  label,
  description,
  icon,
  color,
  background,
  onPress,
}: {
  label: string;
  description: string;
  icon: IoniconName;
  color: string;
  background: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionCard,
        pressed && styles.buttonPressed,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.actionIcon,
          {
            backgroundColor: background,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color={color}
        />
      </View>

      <Text style={styles.actionLabel}>
        {label}
      </Text>

      <Text style={styles.actionDescription}>
        {description}
      </Text>
    </Pressable>
  );
}

function KpiCard({
  value,
  label,
  footer,
  icon,
  color,
  bgColor,
}: {
  value: string;
  label: string;
  footer: string;
  icon: IoniconName;
  color: string;
  bgColor: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.kpiCard,
        pressed && styles.buttonPressed,
      ]}
    >
      <View style={styles.kpiTop}>
        <View
          style={[
            styles.kpiIcon,
            {
              backgroundColor: bgColor,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={16}
            color={color}
          />
        </View>

        <Ionicons
          name="ellipsis-horizontal"
          size={15}
          color={COLORS.textLight}
        />
      </View>

      <Text style={styles.kpiLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.kpiValue,
          {
            color,
          },
        ]}
      >
        {value}
      </Text>

      <View style={styles.kpiFooterRow}>
        <View
          style={[
            styles.kpiFooterDot,
            {
              backgroundColor: color,
            },
          ]}
        />

        <Text
          style={[
            styles.kpiFooter,
            {
              color,
            },
          ]}
        >
          {footer}
        </Text>
      </View>
    </Pressable>
  );
}

function HealthLegend({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.healthLegendItem}>
      <View
        style={[
          styles.healthLegendDot,
          {
            backgroundColor: color,
          },
        ]}
      />

      <Text style={styles.healthLegendLabel}>
        {label}
      </Text>

      <Text style={styles.healthLegendValue}>
        {value}
      </Text>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
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

  /* ========================================================
     HEADER
  ======================================================== */

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
    gap: 7,
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

  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.critical,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },

  /* ========================================================
     GREETING
  ======================================================== */

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

  greetingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },

  greetingEyebrow: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 9,
    color: COLORS.primary,
    letterSpacing: 1.25,
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: COLORS.successSoft,
    borderWidth: 1,
    borderColor: COLORS.successBorder,
  },

  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginRight: 4,
  },

  liveText: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 8,
    color: COLORS.success,
    letterSpacing: 0.6,
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

  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 118,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  dateIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  dateLabel: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 7,
    color: COLORS.textLight,
    letterSpacing: 0.8,
    marginBottom: 1,
  },

  dateValue: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 9,
    color: COLORS.text,
  },

  dateTime: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 8,
    color: COLORS.textMuted,
    marginTop: 1,
  },

  /* ========================================================
     SMART SCAN
  ======================================================== */

  scanHero: {
    overflow: 'hidden',
    borderRadius: 24,
    marginBottom: 26,
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

  /* ========================================================
     SECTIONS
  ======================================================== */

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

  /* ========================================================
     QUICK ACTIONS
  ======================================================== */

  actionGrid: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },

  actionCard: {
    flex: 1,
    minHeight: 108,
    marginHorizontal: 4,
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.045,
    shadowRadius: 9,
    elevation: 2,
  },

  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  actionLabel: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 11,
    color: COLORS.text,
  },

  actionDescription: {
    fontFamily: 'Jakarta-Medium',
    fontSize: 8,
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },

  /* ========================================================
     KPI
  ======================================================== */

  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  kpiCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    minHeight: 145,
    borderRadius: 18,
    padding: 15,
    marginBottom: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.045,
    shadowRadius: 10,
    elevation: 2,
  },

  kpiTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  kpiIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  kpiLabel: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 8.5,
    color: COLORS.textMuted,
    letterSpacing: 0.7,
    marginBottom: 2,
  },

  kpiValue: {
    fontFamily: 'Outfit-Bold',
    fontSize: 29,
    lineHeight: 34,
    letterSpacing: -0.5,
  },

  kpiFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  kpiFooterDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 5,
  },

  kpiFooter: {
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 9,
  },

  /* ========================================================
     STOCK HEALTH
  ======================================================== */

  healthCard: {
    backgroundColor: COLORS.white,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 17,
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.045,
    shadowRadius: 10,
    elevation: 2,
  },

  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  healthHeadline: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 12,
    color: COLORS.text,
  },

  healthSubline: {
    fontFamily: 'Jakarta-Medium',
    fontSize: 9.5,
    color: COLORS.textMuted,
    marginTop: 3,
  },

  healthScore: {
    alignItems: 'flex-end',
  },

  healthScoreValue: {
    fontFamily: 'Outfit-Bold',
    fontSize: 21,
    color: COLORS.success,
  },

  healthScoreLabel: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 7,
    color: COLORS.success,
    letterSpacing: 0.6,
    marginTop: -1,
  },

  healthBar: {
    width: '100%',
    height: 9,
    borderRadius: 6,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: COLORS.borderLight,
    marginBottom: 14,
  },

  healthSegmentHealthy: {
    backgroundColor: COLORS.success,
  },

  healthSegmentLow: {
    backgroundColor: COLORS.warning,
  },

  healthSegmentCritical: {
    backgroundColor: COLORS.critical,
  },

  healthLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  healthLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  healthLegendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  healthLegendLabel: {
    fontFamily: 'Jakarta-Medium',
    fontSize: 8.5,
    color: COLORS.textMuted,
  },

  healthLegendValue: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 8.5,
    color: COLORS.text,
    marginLeft: 4,
  },

  /* ========================================================
     EXPIRY
  ======================================================== */

  expiryCard: {
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

  expiryRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },

  lastRow: {
    borderBottomWidth: 0,
  },

  medicineIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  expiryMedicineInfo: {
    flex: 1,
    minWidth: 0,
  },

  expiryMedicineName: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 11.5,
    color: COLORS.text,
    marginBottom: 4,
  },

  batchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  batchLabel: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 7,
    color: COLORS.textLight,
    letterSpacing: 0.5,
    marginRight: 4,
  },

  batchValue: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 8.5,
    color: COLORS.textMuted,
  },

  expiryRight: {
    alignItems: 'flex-end',
    marginLeft: 6,
  },

  daysBadge: {
    minWidth: 36,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
    alignItems: 'center',
    backgroundColor: COLORS.orangeSoft,
    marginBottom: 4,
  },

  daysBadgeUrgent: {
    backgroundColor: COLORS.criticalSoft,
  },

  daysBadgeText: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 9,
    color: COLORS.orange,
  },

  daysBadgeTextUrgent: {
    color: COLORS.critical,
  },

  expiryDate: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 7.5,
    color: COLORS.textLight,
  },

  rowChevron: {
    marginLeft: 6,
  },

  /* ========================================================
     ACTIVITY
  ======================================================== */

  activityCard: {
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

  activityRow: {
    flexDirection: 'row',
    minHeight: 82,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },

  activityTimeline: {
    width: 38,
    alignItems: 'center',
    position: 'relative',
  },

  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  timelineLine: {
    position: 'absolute',
    top: 32,
    bottom: -13,
    width: 1,
    backgroundColor: COLORS.border,
  },

  activityContent: {
    flex: 1,
    paddingLeft: 6,
  },

  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },

  activityTitle: {
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 9.5,
    color: COLORS.textMuted,
  },

  activityTime: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 7.5,
    color: COLORS.textLight,
  },

  activityMedicine: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 12,
    color: COLORS.text,
    marginBottom: 2,
  },

  activityDetail: {
    fontFamily: 'Jakarta-Medium',
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.textMuted,
  },

  /* ========================================================
     SYSTEM STATUS
  ======================================================== */

  systemStatus: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  systemStatusIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  systemStatusText: {
    flex: 1,
  },

  systemStatusTitle: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 10.5,
    color: COLORS.text,
  },

  systemStatusSubtitle: {
    fontFamily: 'Jakarta-Medium',
    fontSize: 8.5,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  syncIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: COLORS.successSoft,
  },

  syncDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginRight: 4,
  },

  syncText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 7,
    color: COLORS.success,
    letterSpacing: 0.5,
  },

  /* ========================================================
     PRESS
  ======================================================== */

  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.975 }],
  },
});