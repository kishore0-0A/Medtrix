import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS, TYPOGRAPHY, GLASS } from '../../theme';
import { AuthHelpers } from '../../supabase/auth';

export default function SecurityScreen() {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    if (!password || password.length < 6) return 'Password must be at least 6 characters long';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }
    
    setSaving(true);
    try {
      const res = await AuthHelpers.updateUser({ password });
      if (res.error) throw res.error;
      Alert.alert(t('common.success'), 'Password updated successfully.');
      router.back();
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>{t('profile.security')}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardSubtitle}>Change your account password securely.</Text>

            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputFlex}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="••••••••"
                placeholderTextColor={COLORS.text.muted}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.text.secondary} />
              </Pressable>
            </View>

            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputFlex}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                placeholder="••••••••"
                placeholderTextColor={COLORS.text.muted}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={[styles.saveButton, saving && {opacity: 0.7}]} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>{t('common.save')}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background.canvas },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  backButton: { marginRight: 16 },
  headerTitle: { ...TYPOGRAPHY.heading, fontSize: 20, color: COLORS.text.primary },
  content: { padding: 20 },
  card: { ...GLASS.standard, backgroundColor: '#fff', padding: 20, borderRadius: 16 },
  cardSubtitle: { ...TYPOGRAPHY.body, color: COLORS.text.secondary, marginBottom: 20 },
  label: { ...TYPOGRAPHY.bodyMedium, color: COLORS.text.secondary, marginBottom: 8, marginTop: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border.subtle, borderRadius: 12, backgroundColor: '#f9fafb' },
  inputFlex: { flex: 1, ...TYPOGRAPHY.body, fontSize: 16, color: COLORS.text.primary, padding: 16 },
  eyeBtn: { padding: 16 },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.border.subtle },
  saveButton: { backgroundColor: COLORS.brand.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  saveText: { ...TYPOGRAPHY.bodyBold, color: '#fff', fontSize: 16 },
});
