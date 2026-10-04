import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../i18n';
import { COLORS, TYPOGRAPHY, GLASS } from '../../theme';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
];

export default function LanguageScreen() {
  const { t, i18n } = useTranslation();

  const handleSelect = async (code: string) => {
    await changeLanguage(code);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('profile.language')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          {LANGUAGES.map((lang, index) => {
            const isSelected = i18n.language === lang.code;
            return (
              <Pressable
                key={lang.code}
                style={[styles.row, index !== LANGUAGES.length - 1 && styles.borderBottom]}
                onPress={() => handleSelect(lang.code)}
              >
                <View>
                  <Text style={styles.nativeLabel}>{lang.native}</Text>
                  <Text style={styles.label}>{lang.label}</Text>
                </View>
                {isSelected && <Ionicons name="checkmark-circle" size={24} color={COLORS.brand.primary} />}
              </Pressable>
            );
          })}
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
  card: { ...GLASS.standard, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: COLORS.border.subtle },
  nativeLabel: { ...TYPOGRAPHY.heading, fontSize: 16, color: COLORS.text.primary, marginBottom: 4 },
  label: { ...TYPOGRAPHY.body, fontSize: 14, color: COLORS.text.secondary },
});
