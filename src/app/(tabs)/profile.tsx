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
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../theme';
import { useThemeContext } from '../../context/ThemeContext';
import { router } from 'expo-router';
import { Auth } from '../../supabase';
import { useTranslation } from 'react-i18next';

const SETTINGS_GROUPS = [
  {
    titleKey: 'profile.account',
    items: [
      { id: '1', icon: 'person-outline', labelKey: 'profile.personal_info', route: '/profile/personal-info' },
      { id: '2', icon: 'business-outline', labelKey: 'profile.hospital_affiliation', route: '/profile/hospital' },
    ],
  },
  {
    titleKey: 'profile.security',
    items: [
      { id: '3', icon: 'lock-closed-outline', labelKey: 'profile.change_password', route: '/profile/security' },
    ],
  },
  {
    titleKey: 'profile.preferences',
    items: [
      { id: '5', icon: 'notifications-outline', labelKey: 'profile.push_notifications', route: '/profile/notifications' },
      { id: '6', icon: 'language-outline', labelKey: 'profile.language', route: '/profile/language' },
    ],
  },
];

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { isDark, glass } = useThemeContext();

  const handleLogout = async () => {
    await Auth.signOut();
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark && { backgroundColor: '#000000' }]} edges={['top']}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? '#000000' : COLORS.background.canvas} />

      {/* Subtle Background Atmosphere */}
      <View style={[styles.bgGlowTop, isDark && { backgroundColor: '#1D4ED8', opacity: 0.15 }, { pointerEvents: 'none' }]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* PROFILE HEADER (LEVEL 1 GLASS) */}
        <View style={[styles.profileHeader, glass.hero, isDark && { backgroundColor: '#0D1117', borderColor: '#1E293B' }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, isDark && { borderColor: '#1E293B', backgroundColor: '#2563EB' }]}>
              <Text style={styles.avatarText}>K</Text>
            </View>
            <View style={[styles.onlineBadge, isDark && { borderColor: '#0D1117', backgroundColor: '#3B82F6' }]} />
          </View>
          <Text style={[styles.userName, isDark && { color: '#FFFFFF' }]}>Kishore</Text>
          <Text style={[styles.userRole, isDark && { color: '#CBD5E1' }]}>Inventory Manager</Text>
        </View>

        {/* AI TRIAGE & CLINICAL TOOL CARDS */}
        <View style={styles.groupContainer}>
          <Pressable 
            style={[styles.actionCard, glass.standard, isDark && { backgroundColor: '#0D1117', borderColor: '#1E293B' }]}
            onPress={() => router.push('/scan' as any)}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: isDark ? 'rgba(37, 99, 235, 0.16)' : COLORS.brand.soft }]}>
              <Ionicons name="barcode-outline" size={24} color={isDark ? '#60A5FA' : COLORS.brand.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionCardTitle, isDark && { color: '#FFFFFF' }]}>{t('profile.barcode_stock_check')}</Text>
              <Text style={[styles.actionCardSub, isDark && { color: '#CBD5E1' }]}>{t('profile.barcode_stock_desc')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={isDark ? '#CBD5E1' : COLORS.text.muted} />
          </Pressable>

          <Pressable 
            style={[styles.actionCard, glass.standard, isDark && { backgroundColor: '#0D1117', borderColor: '#1E293B' }]}
            onPress={() => router.push('/clinical-triage' as any)}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: isDark ? 'rgba(37, 99, 235, 0.16)' : COLORS.status.criticalBg }]}>
              <Ionicons name="medical-outline" size={24} color={isDark ? '#3B82F6' : COLORS.status.critical} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionCardTitle, isDark && { color: '#FFFFFF' }]}>Patient Clinical Triage</Text>
              <Text style={[styles.actionCardSub, isDark && { color: '#CBD5E1' }]}>Evaluate patient symptoms and vitals.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={isDark ? '#CBD5E1' : COLORS.text.muted} />
          </Pressable>

          <Pressable 
            style={[styles.actionCard, glass.standard, isDark && { backgroundColor: '#0D1117', borderColor: '#1E293B' }]}
            onPress={() => router.push('/profile/ai-triage' as any)}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: isDark ? 'rgba(37, 99, 235, 0.16)' : COLORS.status.infoBg }]}>
              <Ionicons name="flash-outline" size={24} color={isDark ? '#60A5FA' : COLORS.status.info} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionCardTitle, isDark && { color: '#FFFFFF' }]}>{t('profile.ai_triage')}</Text>
              <Text style={[styles.actionCardSub, isDark && { color: '#CBD5E1' }]}>{t('profile.ai_triage_desc')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={isDark ? '#CBD5E1' : COLORS.text.muted} />
          </Pressable>
        </View>

        {/* SETTINGS GROUPS (LEVEL 2 GLASS) */}
        {SETTINGS_GROUPS.map((group) => (
          <View key={group.titleKey} style={styles.groupContainer}>
            <Text style={[styles.groupTitle, isDark && { color: '#CBD5E1' }]}>{t(group.titleKey)}</Text>
            <View style={[styles.glassGroup, glass.standard, isDark && { backgroundColor: '#0D1117', borderColor: '#1E293B' }]}>
              {group.items.map((item, index) => (
                <Pressable 
                  key={item.id} 
                  style={[
                    styles.settingRow, 
                    index !== group.items.length - 1 && styles.settingRowBorder,
                    index !== group.items.length - 1 && isDark && { borderBottomColor: '#1E293B' }
                  ]}
                  onPress={() => item.route && router.push(item.route as any)}
                >
                  <View style={styles.settingRowLeft}>
                    <View style={[styles.settingIconWrapper, isDark && { backgroundColor: 'rgba(37, 99, 235, 0.16)' }]}>
                      <Ionicons name={item.icon as any} size={18} color={isDark ? '#60A5FA' : COLORS.brand.primary} />
                    </View>
                    <Text style={[styles.settingLabel, isDark && { color: '#FFFFFF' }]}>{t(item.labelKey)}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={isDark ? '#CBD5E1' : COLORS.text.muted} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* LOGOUT BUTTON */}
        <Pressable
          style={[
            styles.logoutButton,
            glass.secondary,
            isDark && { backgroundColor: '#111827', borderColor: '#1E293B' }
          ]}
          onPress={handleLogout}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color={isDark ? '#60A5FA' : COLORS.status.critical}
            style={styles.logoutIcon}
          />
          <Text style={[styles.logoutText, isDark && { color: '#60A5FA' }]}>{t('profile.logout')}</Text>
        </Pressable>

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
    left: '20%',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.brand.soft,
    opacity: 0.4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 28,
    marginBottom: 24,
    borderRadius: 24,
    ...SHADOWS.soft,
  },
  avatarContainer: {
    marginBottom: 14,
    position: 'relative',
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: COLORS.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    ...SHADOWS.medium,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.status.healthy,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    ...TYPOGRAPHY.heading,
    fontSize: 34,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  userName: {
    ...TYPOGRAPHY.heading,
    fontSize: 22,
    color: COLORS.text.primary,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  userRole: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  groupContainer: {
    marginBottom: 20,
  },
  groupTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 13,
    color: COLORS.text.secondary,
    marginBottom: 10,
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  actionCard: {
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    ...SHADOWS.soft,
  },
  actionIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  actionCardTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 15,
    color: COLORS.text.primary,
    marginBottom: 3,
  },
  actionCardSub: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: COLORS.text.secondary,
    lineHeight: 16,
  },
  glassGroup: {
    overflow: 'hidden',
    borderRadius: 18,
    ...SHADOWS.soft,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.subtle,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: COLORS.brand.verySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingLabel: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 14,
    color: COLORS.text.primary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.status.critical + '25',
    backgroundColor: COLORS.status.criticalBg,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 15,
    color: COLORS.status.critical,
  },
});