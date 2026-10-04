import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS, TYPOGRAPHY, GLASS } from '../../theme';
import { AuthHelpers } from '../../supabase/auth';

export default function PersonalInfoScreen() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  

  async function loadProfile() {
    try {
      const user = await AuthHelpers.getCurrentUser();
      if (user) {
        setName(user.user_metadata?.full_name || '');
        setEmail(user.email || '');
        setPhone(user.user_metadata?.phone || '');
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const validate = () => {
    if (!name.trim()) return 'Name is required';
    if (!email.trim() || !email.includes('@')) return 'Valid email is required';
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
      const res = await AuthHelpers.updateUser({
        email,
        data: { full_name: name, phone: phone }
      });
      if (res.error) throw res.error;
      Alert.alert(t('common.success'), 'Profile updated successfully.');
      router.back();
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator style={{marginTop: 50}} size="large" color={COLORS.brand.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>{t('profile.personal_info')}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="John Doe"
              placeholderTextColor={COLORS.text.muted}
            />

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="email@example.com"
              placeholderTextColor={COLORS.text.muted}
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+1 234 567 8900"
              placeholderTextColor={COLORS.text.muted}
            />
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
  label: { ...TYPOGRAPHY.bodyMedium, color: COLORS.text.secondary, marginBottom: 8, marginTop: 16 },
  input: { ...TYPOGRAPHY.body, fontSize: 16, color: COLORS.text.primary, borderWidth: 1, borderColor: COLORS.border.subtle, borderRadius: 12, padding: 16, backgroundColor: '#f9fafb' },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.border.subtle },
  saveButton: { backgroundColor: COLORS.brand.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  saveText: { ...TYPOGRAPHY.bodyBold, color: '#fff', fontSize: 16 },
});
