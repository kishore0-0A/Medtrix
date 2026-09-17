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
import { Auth, Biometric } from '../../supabase';

const SETTINGS_GROUPS = [
  {
    title: 'Account',
    items: [
      { id: '1', icon: 'person-outline', label: 'Personal Information' },
      { id: '2', icon: 'business-outline', label: 'Hospital Affiliation' },
    ],
  },
  {
    title: 'Security',
    items: [
      { id: '3', icon: 'lock-closed-outline', label: 'Change Password' },
      { id: '4', icon: 'finger-print-outline', label: 'Biometric Login', type: 'toggle', value: true },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { id: '5', icon: 'notifications-outline', label: 'Push Notifications', type: 'toggle', value: true },
      { id: '6', icon: 'language-outline', label: 'Language', valueText: 'English' },
    ],
  },
];

export default function ProfileScreen() {
  const [toggles, setToggles] = React.useState<Record<string, boolean>>({
    '4': false,
    '5': true,
  });
  const [bioLabel, setBioLabel] = React.useState('Biometric Login');

  React.useEffect(() => {
    async function loadSettings() {
      const enabled = await Biometric.isBiometricEnabled();
      setToggles(prev => ({ ...prev, '4': enabled }));
      
      const label = await Biometric.getBiometricLabel();
      setBioLabel(`${label} Login`);
    }
    loadSettings();
  }, []);

  const toggleSwitch = async (id: string) => {
    const newValue = !toggles[id];
    setToggles(prev => ({ ...prev, [id]: newValue }));
    
    if (id === '4') {
      if (newValue) {
        const result = await Biometric.authenticateWithBiometrics('Verify to enable quick login');
        if (result.success) {
          await Biometric.enableBiometricLogin();
        } else {
          setToggles(prev => ({ ...prev, '4': false })); // Revert visually
          Alert.alert('Setup Failed', result.error);
        }
      } else {
        await Biometric.disableBiometricLogin();
      }
    }
  };

  const handleLogout = async () => {
    await Auth.signOut();
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.canvas} />

      {/* Subtle Background Elements */}
      <View style={styles.bgGlowTop} pointerEvents="none" />

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

        {/* SETTINGS GROUPS (LEVEL 2 GLASS) */}
        {SETTINGS_GROUPS.map((group) => (
          <View key={group.title} style={styles.groupContainer}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={[styles.glassGroup, GLASS.standard]}>
              {group.items.map((item, index) => (
                <View 
                  key={item.id} 
                  style={[
                    styles.settingRow, 
                    index !== group.items.length - 1 && styles.settingRowBorder
                  ]}
                >
                  <View style={styles.settingRowLeft}>
                    <Ionicons name={item.icon as any} size={20} color={COLORS.text.secondary} style={styles.settingIcon} />
                    <Text style={styles.settingLabel}>{item.id === '4' ? bioLabel : item.label}</Text>
                  </View>
                  
                  {item.type === 'toggle' ? (
                    <Switch
                      trackColor={{ false: COLORS.border.subtle, true: COLORS.brand.primary }}
                      thumbColor="#FFFFFF"
                      ios_backgroundColor={COLORS.border.subtle}
                      onValueChange={() => toggleSwitch(item.id)}
                      value={toggles[item.id]}
                      style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                    />
                  ) : (item as any).valueText ? (
                    <View style={styles.settingRowRight}>
                      <Text style={styles.settingValueText}>{(item as any).valueText}</Text>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.text.muted} />
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={16} color={COLORS.text.muted} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* LOGOUT BUTTON */}
        <Pressable style={[styles.logoutButton, GLASS.secondary]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.status.critical} style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Log Out</Text>
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