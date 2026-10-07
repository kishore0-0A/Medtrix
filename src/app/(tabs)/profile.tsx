import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, GLASS } from '../../theme';
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
  const [toggles, setToggles] = React.useState<Record<string, boolean>>({
    '4': false,
    '5': true,
  });
  React.useEffect(() => {
    // Other settings loads could go here
  }, []);

  const toggleSwitch = async (id: string) => {
    const newValue = !toggles[id];
    setToggles(prev => ({ ...prev, [id]: newValue }));
  };

  const handleLogout = async () => {
    await Auth.signOut();
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.canvas} />

      {/* Subtle Background Elements */}
      <View style={[styles.bgGlowTop, { pointerEvents: 'none' }]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* PROFILE HEADER (LEVEL 1 GLASS) */}
        <View style={[styles.profileHeader, GLASS.hero]}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>K</Text>
            </View>
          </View>
          <Text style={styles.userName}>Kishore</Text>
          <Text style={styles.userRole}>Inventory Manager</Text>
        </View>

        
        {/* NEW AI TRIAGE & BARCODE CARDS */}
        <View style={styles.groupContainer}>
          <Pressable 
            style={[styles.glassGroup, GLASS.standard, { padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center' }]}
            onPress={() => router.push('/scan' as any)} // Route to existing scan tab or a specialized scan UI
          >
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.brand.soft, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
              <Ionicons name="barcode-outline" size={24} color={COLORS.brand.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ ...TYPOGRAPHY.heading, fontSize: 16, color: COLORS.text.primary, marginBottom: 4 }}>{t('profile.barcode_stock_check')}</Text>
              <Text style={{ ...TYPOGRAPHY.body, fontSize: 13, color: COLORS.text.secondary }}>{t('profile.barcode_stock_desc')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.text.muted} />
          </Pressable>

          <Pressable 
            style={[styles.glassGroup, GLASS.standard, { padding: 16, flexDirection: 'row', alignItems: 'center' }]}
            onPress={() => router.push('/profile/ai-triage' as any)}
          >
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.status.infoBg, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
              <Ionicons name="flash-outline" size={24} color={COLORS.status.info} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ ...TYPOGRAPHY.heading, fontSize: 16, color: COLORS.text.primary, marginBottom: 4 }}>{t('profile.ai_triage')}</Text>
              <Text style={{ ...TYPOGRAPHY.body, fontSize: 13, color: COLORS.text.secondary }}>{t('profile.ai_triage_desc')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.text.muted} />
          </Pressable>
        </View>

        {/* SETTINGS GROUPS (LEVEL 2 GLASS) */}
        {SETTINGS_GROUPS.map((group) => (
          <View key={group.titleKey} style={styles.groupContainer}>
            <Text style={styles.groupTitle}>{t(group.titleKey)}</Text>
            <View style={[styles.glassGroup, GLASS.standard]}>
              {group.items.map((item, index) => (
                <Pressable 
                  key={item.id} 
                  style={[
                    styles.settingRow, 
                    index !== group.items.length - 1 && styles.settingRowBorder
                  ]}
                  onPress={() => item.route && router.push(item.route as any)}
                >
                  <View style={styles.settingRowLeft}>
                    <Ionicons name={item.icon as any} size={20} color={COLORS.text.secondary} style={styles.settingIcon} />
                    <Text style={styles.settingLabel}>{t(item.labelKey)}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.text.muted} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* LOGOUT BUTTON */}
        <Pressable style={[styles.logoutButton, GLASS.secondary]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.status.critical} style={styles.logoutIcon} />
          <Text style={styles.logoutText}>{t('profile.logout')}</Text>
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
    paddingTop: 20,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 32,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  avatarText: {
    ...TYPOGRAPHY.heading,
    fontSize: 32,
    color: '#FFFFFF',
  },
  userName: {
    ...TYPOGRAPHY.heading,
    fontSize: 24,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  userRole: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  groupContainer: {
    marginBottom: 24,
  },
  groupTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 12,
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  glassGroup: {
    overflow: 'hidden',
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
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 15,
    color: COLORS.text.primary,
  },
  settingRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.text.secondary,
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 8,
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