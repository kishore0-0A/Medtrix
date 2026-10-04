import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS, TYPOGRAPHY, GLASS } from '../../theme';
import { AuthHelpers } from '../../supabase/auth';

export default function HospitalScreen() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [hospital, setHospital] = useState<{name: string, role: string, dept: string} | null>(null);
  
  

  const loadHospital = async () => {
    try {
      const user = await AuthHelpers.getCurrentUser();
      if (user) {
        setHospital({
          name: user.user_metadata?.hospital_name || 'Medtrix Central Hospital',
          role: user.user_metadata?.role || 'Inventory Manager',
          dept: user.user_metadata?.department || 'Pharmacy & Dispensing'
        });
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospital();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator style={{marginTop: 50}} size="large" color={COLORS.brand.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('profile.hospital_affiliation')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="business" size={32} color={COLORS.brand.primary} />
          </View>
          
          <Text style={styles.hospitalName}>{hospital?.name}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Verified Affiliation</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Role / Designation</Text>
            <Text style={styles.detailValue}>{hospital?.role}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Department</Text>
            <Text style={styles.detailValue}>{hospital?.dept}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>System Access Level</Text>
            <Text style={styles.detailValue}>Standard User</Text>
          </View>
        </View>
        
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={24} color={COLORS.status.info} style={{marginRight: 12}} />
          <Text style={styles.infoText}>
            Your hospital affiliation is managed by your Super Administrator. To request a change or transfer to a different facility, please contact IT Support.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background.canvas },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  backButton: { marginRight: 16 },
  headerTitle: { ...TYPOGRAPHY.heading, fontSize: 20, color: COLORS.text.primary },
  content: { padding: 20 },
  card: { ...GLASS.standard, backgroundColor: '#fff', padding: 24, borderRadius: 16, alignItems: 'center' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.brand.soft, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  hospitalName: { ...TYPOGRAPHY.heading, fontSize: 22, color: COLORS.text.primary, textAlign: 'center', marginBottom: 8 },
  badge: { backgroundColor: COLORS.status.healthy + '20', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 24 },
  badgeText: { ...TYPOGRAPHY.bodyMedium, color: COLORS.status.healthy, fontSize: 12 },
  divider: { height: 1, width: '100%', backgroundColor: COLORS.border.subtle, marginBottom: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingVertical: 8 },
  detailLabel: { ...TYPOGRAPHY.body, color: COLORS.text.secondary },
  detailValue: { ...TYPOGRAPHY.bodyMedium, color: COLORS.text.primary },
  infoBox: { flexDirection: 'row', backgroundColor: COLORS.status.info + '15', padding: 16, borderRadius: 12, marginTop: 20 },
  infoText: { flex: 1, ...TYPOGRAPHY.body, color: COLORS.text.primary, fontSize: 14, lineHeight: 20 },
});
