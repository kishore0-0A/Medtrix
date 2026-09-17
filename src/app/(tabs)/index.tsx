import React, { useEffect, useRef } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Data Definitions matching EXACT request
const inventoryStats = [
  {
    value: '1,248',
    label: 'TOTAL MEDICINES',
    footer: '+12 this week',
    icon: 'medical' as keyof typeof Ionicons.glyphMap,
    color: '#2563EB',
    bgColor: '#EFF6FF',
  },
  {
    value: '24',
    label: 'LOW STOCK',
    footer: 'Needs attention',
    icon: 'warning' as keyof typeof Ionicons.glyphMap,
    color: '#F59E0B',
    bgColor: '#FEF3C7',
  },
  {
    value: '18',
    label: 'EXPIRING SOON',
    footer: 'Within 30 days',
    icon: 'time' as keyof typeof Ionicons.glyphMap,
    color: '#F97316',
    bgColor: '#FFEDD5',
  },
  {
    value: '07',
    label: 'OUT OF STOCK',
    footer: 'Action required',
    icon: 'close-circle' as keyof typeof Ionicons.glyphMap,
    color: '#E11D48',
    bgColor: '#FFE4E6',
  },
];

const expiringMedicines = [
  {
    name: 'Paracetamol 500mg',
    batch: 'BT-24081',
    days: 12,
    date: '12/2027',
  },
  {
    name: 'Amoxicillin 500mg',
    batch: 'AM-13622',
    days: 16,
    date: '16/2027',
  },
  {
    name: 'Cetirizine 10mg',
    batch: 'CT-33104',
    days: 24,
    date: '24/2028',
  },
];

const recentActivities = [
  {
    title: 'Medicine received',
    medicine: 'Paracetamol 500mg',
    detail: '+24 units added to main store',
    time: '2h ago',
    icon: 'arrow-down' as keyof typeof Ionicons.glyphMap,
    color: '#10B981',
    bgColor: '#D1FAE5',
  },
  {
    title: 'Medicine issued',
    medicine: 'Amoxicillin 500mg',
    detail: '12 units issued to Surgery Ward',
    time: '5h ago',
    icon: 'arrow-up' as keyof typeof Ionicons.glyphMap,
    color: '#E11D48',
    bgColor: '#FFE4E6',
  },
  {
    title: 'Stock adjusted',
    medicine: 'Cetirizine 10mg',
    detail: 'Quantity corrected post physical count',
    time: '7h ago',
    icon: 'sync' as keyof typeof Ionicons.glyphMap,
    color: '#2563EB',
    bgColor: '#EFF6FF',
  },
  {
    title: 'Medicine expensed',
    medicine: 'Aspirin 325mg',
    detail: 'New batch verified & registered',
    time: '9h ago',
    icon: 'checkmark-done' as keyof typeof Ionicons.glyphMap,
    color: '#475569',
    bgColor: '#F1F5F9',
  },
];

// Helper for Pressable animations
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HomeScreen() {
  const handleNavigation = (route: string) => {
    // @ts-ignore
    router.push(route);
  };

  // Entrance Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const greetingAnim = useRef(new Animated.Value(0)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;
  const tacticalAnim = useRef(new Animated.Value(0)).current;
  const kpiAnim = useRef(new Animated.Value(0)).current;
  const expiringAnim = useRef(new Animated.Value(0)).current;
  const activityAnim = useRef(new Animated.Value(0)).current;

  // Pulse Animation for Smart Scan
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered Entry
    Animated.stagger(100, [
      Animated.timing(headerAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(greetingAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(scanAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(tacticalAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(kpiAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(expiringAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(activityAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    // Infinite Pulse Loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const getTransform = (animValue: Animated.Value, translateY = 20) => ({
    opacity: animValue,
    transform: [{
      translateY: animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [translateY, 0],
      })
    }]
  });

  const getScale = (animValue: Animated.Value) => ({
    opacity: animValue,
    transform: [{
      scale: animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.95, 1],
      })
    }]
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FCFF" />

      {/* Atmospheric Background Lighting */}
      <View style={styles.ambientLightTop} pointerEvents="none" />
      <View style={styles.ambientLightCenter} pointerEvents="none" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* =====================================================
            1. MOBILE STATUS/HEADER AREA & 2. BRAND HEADER
        ===================================================== */}
        <Animated.View style={[styles.header, getTransform(headerAnim, 10)]}>
          <View style={styles.headerLeft}>
            <View style={styles.logoBox}>
              <MaterialCommunityIcons name="medical-bag" size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.brandName}>MEDTRIX</Text>
              <Text style={styles.brandSub}>CLINICAL OPS</Text>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <Pressable style={styles.headerGlassButton}>
              <Ionicons name="search" size={18} color="#0F172A" />
            </Pressable>
            <Pressable style={styles.headerGlassButton}>
              <Ionicons name="notifications-outline" size={18} color="#0F172A" />
              <View style={styles.notificationDot} />
            </Pressable>
            <Pressable style={styles.headerGlassButton} onPress={() => handleNavigation('/profile')}>
              <Ionicons name="person-outline" size={18} color="#0F172A" />
            </Pressable>
          </View>
        </Animated.View>

        {/* =====================================================
            3. GREETING & 4. DATE CARD
        ===================================================== */}
        <Animated.View style={[styles.greetingSection, getTransform(greetingAnim)]}>
          <View style={styles.greetingLeft}>
            <View style={styles.liveIndicatorRow}>
              <Text style={styles.greetingLabel}>GOOD MORNING</Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live</Text>
              </View>
            </View>
            <Text style={styles.greetingName}>Kishore</Text>
            <Text style={styles.greetingDesc}>Real-time medicine inventory overview</Text>
          </View>

          <View style={styles.dateCard}>
            <Ionicons name="calendar-outline" size={14} color="#64748B" />
            <View style={{ marginLeft: 6 }}>
              <Text style={styles.dateDay}>THU, APR 24</Text>
              <Text style={styles.dateTime}>09:41 AM</Text>
            </View>
          </View>
        </Animated.View>

        {/* =====================================================
            5. SMART SCAN OCR HERO
        ===================================================== */}
        <Animated.View style={[styles.heroCard, getScale(scanAnim)]}>
          <View style={styles.heroTop}>
            <View>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>✦ SMART SCAN OCR</Text>
              </View>
              <Text style={styles.heroTitle}>Scan medicine</Text>
              <Text style={styles.heroDesc}>
                Extract medicine batch, expiry, and dosage{'\n'}details instantly using camera-based OCR.
              </Text>
            </View>
            <Animated.View style={[
              styles.scannerIconWrapper,
              {
                opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.8] }),
                transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] }) }]
              }
            ]}>
              <Ionicons name="scan" size={36} color="#60A5FA" />
            </Animated.View>
          </View>
          
          <Pressable 
            style={({ pressed }) => [styles.scanButton, pressed && { transform: [{ scale: 0.97 }] }]}
            onPress={() => handleNavigation('/scan')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="scan-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.scanButtonText}>Start scanning</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
          </Pressable>
        </Animated.View>

        {/* =====================================================
            6. TACTICAL ACTIONS
        ===================================================== */}
        <Animated.View style={[styles.sectionContainer, getTransform(tacticalAnim)]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TACTICAL ACTIONS</Text>
            <Text style={styles.viewAllText}>View All →</Text>
          </View>
          
          <View style={styles.tacticalGrid}>
            {[
              { label: 'Scan', icon: 'scan', color: '#2563EB', route: '/scan' },
              { label: 'Receive', icon: 'download-outline', color: '#10B981', route: '/inventory' },
              { label: 'Issue', icon: 'push-outline', color: '#E11D48', route: '/inventory' },
              { label: 'Reports', icon: 'bar-chart-outline', color: '#475569', route: '/inventory' },
            ].map((action, idx) => (
              <Pressable 
                key={idx} 
                style={({ pressed }) => [styles.tacticalCard, pressed && { transform: [{ scale: 0.97 }] }]}
                onPress={() => handleNavigation(action.route)}
              >
                <Ionicons name={action.icon as any} size={20} color={action.color} style={{ marginBottom: 6 }} />
                <Text style={styles.tacticalLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* =====================================================
            7. INVENTORY OVERVIEW
        ===================================================== */}
        <Animated.View style={[styles.sectionContainer, getTransform(kpiAnim)]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleCapitalized}>Inventory overview</Text>
            <Text style={styles.viewAllText}>View All →</Text>
          </View>
          
          <View style={styles.kpiGrid}>
            {inventoryStats.map((stat, idx) => (
              <View key={idx} style={styles.kpiCard}>
                <View style={[styles.kpiIconBox, { backgroundColor: stat.bgColor }]}>
                  <Ionicons name={stat.icon} size={16} color={stat.color} />
                </View>
                <Text style={styles.kpiLabel}>{stat.label}</Text>
                <Text style={[styles.kpiValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={[styles.kpiFooter, { color: stat.color }]}>{stat.footer}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* =====================================================
            8. EXPIRING SOON
        ===================================================== */}
        <Animated.View style={[styles.sectionContainer, getTransform(expiringAnim)]}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.sectionTitleCapitalized}>Expiring soon</Text>
              <View style={styles.alertBadge}>
                <Text style={styles.alertBadgeText}>⚠ ALERTS</Text>
              </View>
            </View>
            <Pressable onPress={() => handleNavigation('/alerts')}>
              <Text style={styles.viewAllText}>View All →</Text>
            </Pressable>
          </View>

          <View style={styles.glassContainer}>
            {expiringMedicines.map((med, idx) => (
              <View key={idx} style={[styles.listRow, idx === expiringMedicines.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.listIconBox}>
                  <MaterialCommunityIcons name="pill" size={18} color="#64748B" />
                </View>
                <View style={styles.listContent}>
                  <Text style={styles.listTitle}>{med.name}</Text>
                  <Text style={styles.listSubtitle}>Batch {med.batch}</Text>
                </View>
                <View style={styles.listRight}>
                  <View style={styles.expiryPill}>
                    <Text style={styles.expiryPillText}>{med.days} days</Text>
                  </View>
                  <Text style={styles.expiryDate}>EXP: {med.date}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#CBD5E1" style={{ marginLeft: 8 }} />
              </View>
            ))}
          </View>
        </Animated.View>

        {/* =====================================================
            9. RECENT ACTIVITY
        ===================================================== */}
        <Animated.View style={[styles.sectionContainer, getTransform(activityAnim)]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleCapitalized}>Recent activity</Text>
            <Text style={styles.viewAllText}>View All →</Text>
          </View>

          <View style={styles.glassContainer}>
            {recentActivities.map((act, idx) => (
              <View key={idx} style={[styles.timelineRow, idx === recentActivities.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[styles.timelineIconBox, { backgroundColor: act.bgColor }]}>
                  <Ionicons name={act.icon} size={14} color={act.color} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>{act.title}</Text>
                  <Text style={styles.timelineMedicine}>{act.medicine}</Text>
                  <Text style={styles.timelineDetail}>{act.detail}</Text>
                </View>
                <Text style={styles.timelineTime}>{act.time}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* =====================================================
            10. AUDIT TRAIL STATUS
        ===================================================== */}
        <Animated.View style={[styles.auditContainer, getTransform(activityAnim, 30)]}>
          <Ionicons name="shield-checkmark" size={14} color="#10B981" />
          <Text style={styles.auditText}>Audit trail active • Synchronized</Text>
        </Animated.View>

        {/* Bottom padding for fixed navigation */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// --------------------------------------------------------
// STYLES
// --------------------------------------------------------

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FCFF',
  },
  // AMBIENT BACKGROUND
  ambientLightTop: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#EEF7FF',
    filter: 'blur(40px)', // web only, subtle effect
    opacity: 0.8,
  },
  ambientLightCenter: {
    position: 'absolute',
    top: '30%',
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#EAF4FC',
    filter: 'blur(50px)',
    opacity: 0.6,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  // HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 32,
    height: 32,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    ...SHADOWS.soft,
  },
  brandName: {
    fontFamily: 'Outfit-Bold',
    fontSize: 16,
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  brandSub: {
    fontFamily: 'Jakarta-Medium',
    fontSize: 9,
    color: '#64748B',
    letterSpacing: 0.8,
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerGlassButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.80)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    ...SHADOWS.soft,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E11D48',
  },
  // GREETING
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
    flexWrap: 'wrap',
  },
  greetingLeft: {
    flex: 1,
    minWidth: 200,
  },
  liveIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  greetingLabel: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 10,
    color: '#0284C7',
    letterSpacing: 1,
    marginRight: 10,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  liveText: {
    fontFamily: 'Jakarta-Medium',
    fontSize: 9,
    color: '#10B981',
  },
  greetingName: {
    fontFamily: 'Outfit-Bold',
    fontSize: 28,
    color: '#0F172A',
    marginBottom: 2,
  },
  greetingDesc: {
    fontFamily: 'Jakarta-Medium',
    fontSize: 13,
    color: '#64748B',
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.80)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: Platform.OS === 'web' ? 0 : 4,
    ...SHADOWS.soft,
  },
  dateDay: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 10,
    color: '#0F172A',
  },
  dateTime: {
    fontFamily: 'Jakarta-Medium',
    fontSize: 10,
    color: '#64748B',
  },
  // SMART SCAN HERO (LEVEL 1)
  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.70)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.80)',
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 4,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  heroBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  heroBadgeText: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 9,
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontFamily: 'Outfit-Bold',
    fontSize: 24,
    color: '#0F172A',
    marginBottom: 6,
  },
  heroDesc: {
    fontFamily: 'Jakarta-Medium',
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  scannerIconWrapper: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButton: {
    height: 48,
    backgroundColor: '#172B4D',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  scanButtonText: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  // SECTIONS
  sectionContainer: {
    marginBottom: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 10,
    color: '#64748B',
    letterSpacing: 1,
  },
  sectionTitleCapitalized: {
    fontFamily: 'Outfit-Medium',
    fontSize: 18,
    color: '#0F172A',
  },
  viewAllText: {
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 12,
    color: '#2563EB',
  },
  // TACTICAL
  tacticalGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tacticalCard: {
    flex: 1,
    height: 76,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    ...SHADOWS.soft,
  },
  tacticalLabel: {
    fontFamily: 'Jakarta-Medium',
    fontSize: 11,
    color: '#475569',
  },
  // KPI
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  kpiCard: {
    width: (SCREEN_WIDTH - 32 - 12) / 2,
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.78)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.soft,
  },
  kpiIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  kpiLabel: {
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 11,
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  kpiValue: {
    fontFamily: 'Outfit-Bold',
    fontSize: 28,
    marginBottom: 4,
  },
  kpiFooter: {
    fontFamily: 'Jakarta-Medium',
    fontSize: 11,
  },
  // EXPIRING SOON & TIMELINE (LEVEL 2 GLASS CONTAINER)
  alertBadge: {
    backgroundColor: '#FFE4E6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  alertBadgeText: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 8,
    color: '#E11D48',
    letterSpacing: 0.5,
  },
  glassContainer: {
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.78)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    ...SHADOWS.soft,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  listIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 2,
  },
  listSubtitle: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#64748B',
  },
  listRight: {
    alignItems: 'flex-end',
  },
  expiryPill: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  expiryPillText: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 10,
    color: '#F97316',
  },
  expiryDate: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    color: '#64748B',
  },
  // RECENT ACTIVITY
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  timelineIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 12,
    color: '#475569',
    marginBottom: 2,
  },
  timelineMedicine: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 2,
  },
  timelineDetail: {
    fontFamily: 'Jakarta-Medium',
    fontSize: 12,
    color: '#64748B',
  },
  timelineTime: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#94A3B8',
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  // AUDIT STATUS
  auditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.75)',
    borderRadius: 20,
    height: 38,
    alignSelf: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
    ...SHADOWS.soft,
  },
  auditText: {
    fontFamily: 'Jakarta-Medium',
    fontSize: 12,
    color: '#10B981',
    marginLeft: 6,
  },
});