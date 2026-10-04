import React, { useEffect, useRef } from 'react';

import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
   TEMPORARY HOME DATA
   Later these can come from Supabase.
============================================================ */

const inventorySummary = {
  totalMedicines: '1,248',
  lowStock: '24',
  expiringSoon: '18',
  outOfStock: '07',
};

const attentionItems = [
  {
    name: 'Low stock medicines',
    value: '24',
    description: 'Medicines need restocking',
    icon: 'warning-outline' as const,
    color: COLORS.warning,
    background: COLORS.warningSoft,
  },
  {
    name: 'Expiring soon',
    value: '18',
    description: 'Batches within 30 days',
    icon: 'time-outline' as const,
    color: COLORS.orange,
    background: COLORS.orangeSoft,
  },
];

/* ============================================================
   TYPES
============================================================ */

type IoniconName = keyof typeof Ionicons.glyphMap;

/* ============================================================
   HOME SCREEN
============================================================ */

export default function HomeScreen() {
  const { t } = useTranslation();
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
      style={styles.safeArea}
      edges={['top']}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      {/* =====================================================
          BACKGROUND ATMOSPHERE
      ===================================================== */}

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
              <Text style={styles.brandName}>
                MEDTRIX
              </Text>

              <Text style={styles.brandSub}>
                CLINICAL OPERATIONS
              </Text>
            </View>
          </Pressable>

          {/* Header Actions */}

          <View style={styles.headerActions}>
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

            <Text style={styles.greetingName}>
              Kishore
            </Text>

            <Text style={styles.greetingDescription}>
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

                <Text style={styles.inventoryValue}>
                  {inventorySummary.totalMedicines}
                </Text>

                <Text style={styles.inventorySubtitle}>
                  Medicines currently in inventory
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={COLORS.textLight}
              />
            </View>

            {/* Divider */}

            <View style={styles.inventoryDivider} />

            {/* Compact metrics */}

            <View style={styles.inventoryMetrics}>
              <MiniMetric
                value={inventorySummary.lowStock}
                label="Low stock"
                color={COLORS.warning}
                background={COLORS.warningSoft}
              />

              <View style={styles.metricDivider} />

              <MiniMetric
                value={inventorySummary.expiringSoon}
                label="Expiring soon"
                color={COLORS.orange}
                background={COLORS.orangeSoft}
              />

              <View style={styles.metricDivider} />

              <MiniMetric
                value={inventorySummary.outOfStock}
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

          <View style={styles.attentionCard}>
            {attentionItems.map((item, index) => (
              <Pressable
                key={item.name}
                style={({ pressed }) => [
                  styles.attentionRow,
                  index ===
                    attentionItems.length - 1 &&
                    styles.lastRow,
                  pressed && styles.rowPressed,
                ]}
                onPress={() =>
                  handleNavigation('/alerts')
                }
              >
                <View
                  style={[
                    styles.attentionIcon,
                    {
                      backgroundColor: item.background,
                    },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={18}
                    color={item.color}
                  />
                </View>

                <View style={styles.attentionContent}>
                  <Text style={styles.attentionTitle}>
                    {item.name}
                  </Text>

                  <Text style={styles.attentionDescription}>
                    {item.description}
                  </Text>
                </View>

                <View style={styles.attentionRight}>
                  <Text
                    style={[
                      styles.attentionValue,
                      {
                        color: item.color,
                      },
                    ]}
                  >
                    {item.value}
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={COLORS.textLight}
                  />
                </View>
              </Pressable>
            ))}
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
  return (
    <View style={styles.miniMetric}>
      <View
        style={[
          styles.miniMetricIcon,
          {
            backgroundColor: background,
          },
        ]}
      >
        <View
          style={[
            styles.miniMetricDot,
            {
              backgroundColor: color,
            },
          ]}
        />
      </View>

      <Text
        style={[
          styles.miniMetricValue,
          {
            color,
          },
        ]}
      >
        {value}
      </Text>

      <Text style={styles.miniMetricLabel}>
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