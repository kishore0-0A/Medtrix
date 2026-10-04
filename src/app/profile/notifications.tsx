import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS, TYPOGRAPHY, GLASS } from '../../theme';
import { Database } from '../../supabase/database';
// expo-notifications is removed because it causes a hard crash in Expo Go SDK 53+
// import * as Notifications from 'expo-notifications';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    loadNotifications();
    checkPushPermissions();
  }, []);

  const checkPushPermissions = async () => {
    // Mocked for Expo Go compatibility
    setPermissionGranted(false);
  };

  const requestPushPermission = async () => {
    // Mocked for Expo Go compatibility
    setPermissionGranted(false);
  };

  const loadNotifications = async () => {
    const { data } = await Database.getNotifications();
    if (data) {
      setNotifications(data);
    }
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await Database.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    for (const n of unread) {
      await Database.markNotificationRead(n.id);
    }
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
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
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </Pressable>
        <View style={{flex: 1}}>
          <Text style={styles.headerTitle}>{t('profile.push_notifications')}</Text>
        </View>
        <Pressable onPress={markAllAsRead}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!permissionGranted && (
          <Pressable style={styles.permissionCard} onPress={requestPushPermission}>
            <Ionicons name="notifications-off-circle" size={24} color={COLORS.status.warning} style={{marginRight: 12}} />
            <Text style={styles.permissionText}>Enable push notifications to get real-time alerts.</Text>
          </Pressable>
        )}

        {notifications.map((item) => (
          <Pressable 
            key={item.id} 
            style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
            onPress={() => markAsRead(item.id)}
          >
            <View style={styles.iconContainer}>
              <Ionicons 
                name={item.type === 'warning' ? 'warning' : item.type === 'success' ? 'checkmark-circle' : 'information-circle'} 
                size={24} 
                color={item.type === 'warning' ? COLORS.status.warning : item.type === 'success' ? COLORS.status.healthy : COLORS.brand.primary} 
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.title, !item.is_read && styles.unreadTitle]}>{item.title}</Text>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.time}>{new Date(item.created_at).toLocaleString()}</Text>
            </View>
            {!item.is_read && <View style={styles.unreadDot} />}
          </Pressable>
        ))}

        {notifications.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={48} color={COLORS.text.muted} />
            <Text style={styles.emptyText}>No notifications yet.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background.canvas },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  backButton: { marginRight: 16 },
  headerTitle: { ...TYPOGRAPHY.heading, fontSize: 20, color: COLORS.text.primary },
  markAllText: { ...TYPOGRAPHY.bodyMedium, color: COLORS.brand.primary },
  content: { padding: 20 },
  permissionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.status.warning + '15', padding: 16, borderRadius: 12, marginBottom: 20 },
  permissionText: { flex: 1, ...TYPOGRAPHY.body, color: COLORS.text.primary },
  notificationCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border.subtle },
  unreadCard: { backgroundColor: '#f1f5f9' },
  iconContainer: { marginRight: 12, marginTop: 2 },
  textContainer: { flex: 1 },
  title: { ...TYPOGRAPHY.bodyMedium, fontSize: 16, color: COLORS.text.primary, marginBottom: 4 },
  unreadTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.text.primary },
  message: { ...TYPOGRAPHY.body, color: COLORS.text.secondary, marginBottom: 8 },
  time: { ...TYPOGRAPHY.body, fontSize: 12, color: COLORS.text.muted },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.brand.primary, marginTop: 6, marginLeft: 8 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { ...TYPOGRAPHY.body, color: COLORS.text.muted, marginTop: 16 },
});
