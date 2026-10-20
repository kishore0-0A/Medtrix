import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Database, NotificationItem, NotificationCategory } from '../supabase/database';
import { supabase } from '../supabase/client';

// Configure foreground notification behavior (Expo SDK 57 NotificationBehavior)
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch {
  // Graceful fallback for non-supported runtime environments
}

const PUSH_TOKEN_STORAGE_KEY = '@medtrix_expo_push_token';
const PERMISSION_ASKED_KEY = '@medtrix_push_permission_asked';

type NotificationChangeListener = () => void;
const changeListeners: Set<NotificationChangeListener> = new Set();

function notifyListeners() {
  changeListeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.warn('[NotificationService] Listener error:', e);
    }
  });
}

export const NotificationService = {
  /**
   * Register a callback to be called whenever notifications change (created, read, etc.)
   */
  addChangeListener(listener: NotificationChangeListener): () => void {
    changeListeners.add(listener);
    return () => {
      changeListeners.delete(listener);
    };
  },

  /**
   * Check current push notification permission without prompting
   */
  async checkPermissions(): Promise<{ granted: boolean; canAskAgain: boolean }> {
    if (Platform.OS === 'web') {
      return { granted: false, canAskAgain: false };
    }
    try {
      const { status, canAskAgain } = await Notifications.getPermissionsAsync();
      return {
        granted: status === 'granted',
        canAskAgain: canAskAgain ?? true,
      };
    } catch (error) {
      console.warn('[NotificationService] checkPermissions error:', error);
      return { granted: false, canAskAgain: false };
    }
  },

  /**
   * Explicitly request push notification permissions with Android channel configuration
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        finalStatus = status;
        await AsyncStorage.setItem(PERMISSION_ASKED_KEY, 'true');
      }

      if (finalStatus !== 'granted') {
        return false;
      }

      // Configure Android channel for high-priority clinical notifications (available in development/standalone builds)
      if (Platform.OS === 'android') {
        try {
          await Notifications.setNotificationChannelAsync('medtrix-alerts', {
            name: 'Medtrix Clinical Alerts',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#2563EB',
            sound: 'default',
            enableLights: true,
            enableVibrate: true,
          });
        } catch {
          // Expo Go on Android lacks NotificationsChannelsProvider; channels will be active in standalone/dev builds
        }
      }

      return true;
    } catch (error) {
      console.warn('[NotificationService] requestPermissions error:', error);
      return false;
    }
  },

  /**
   * Register for remote push notifications, obtain Expo push token, and store in database
   */
  async registerForPushNotificationsAsync(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('[NotificationService] Must use a physical device for remote push notifications.');
      return null;
    }

    if (Platform.OS === 'web') {
      return null;
    }

    // In Expo Go on Android, remote push notifications are disabled by Expo since SDK 53
    // (local notifications and scheduled reminders remain fully functional).
    const isExpoGo =
      (Constants as any)?.appOwnership === 'expo' ||
      (Constants as any)?.executionEnvironment === 'storeClient';

    if (Platform.OS === 'android' && isExpoGo) {
      return null;
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // Project ID from Expo configuration
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId ??
        Constants?.expoConfig?.slug;

      let pushToken: string | null = null;
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined
        );
        pushToken = tokenData.data;
      } catch {
        return null;
      }

      if (pushToken) {
        await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, pushToken);
        const deviceName = Device.deviceName ?? `${Device.manufacturer || ''} ${Device.modelName || ''}`.trim();
        await Database.savePushToken(pushToken, deviceName, Platform.OS);
        console.log('[NotificationService] Push token registered:', pushToken);
      }

      return pushToken;
    } catch (error) {
      console.warn('[NotificationService] registerForPushNotificationsAsync error:', error);
      return null;
    }
  },

  /**
   * Clear push token on user logout
   */
  async unregisterPushNotificationsAsync(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
      if (token) {
        await Database.removePushToken(token);
        await AsyncStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
      }
    } catch (error) {
      console.warn('[NotificationService] unregisterPushNotificationsAsync error:', error);
    }
  },

  /**
   * Schedule an instant local heads-up notification (displays in system notification tray)
   */
  async presentLocalNotification(params: {
    title: string;
    body: string;
    data?: Record<string, any>;
    category?: NotificationCategory;
  }): Promise<string | null> {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: params.title,
          body: params.body,
          data: params.data ?? {},
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          badge: await Database.getUnreadNotificationCount(),
        },
        trigger: null, // Display immediately
      });
      return id;
    } catch (error) {
      console.warn('[NotificationService] presentLocalNotification error:', error);
      return null;
    }
  },

  /**
   * Initialize notification listeners (foreground and interaction responses)
   */
  initializeListeners(): () => void {
    // Listener for response when user taps a notification (mobile only)
    let responseSubscription: any = null;
    if (Platform.OS !== 'web') {
      responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
        try {
          const data = response.notification.request.content.data;
          if (data && typeof data.route === 'string' && data.route.length > 0) {
            console.log('[NotificationService] Deep linking to:', data.route);
            router.push(data.route as any);
          }
        } catch (e) {
          console.warn('[NotificationService] Deep link handling failed:', e);
        }
      });
    }

    // Realtime subscription to Supabase notifications table if Supabase is active
    let realtimeChannel: any = null;
    if (process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-ref.supabase.co') {
      try {
        realtimeChannel = supabase
          .channel('public:notifications')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'notifications' },
            async (payload) => {
              const newRow = payload.new as NotificationItem;
              if (newRow) {
                // Show local heads-up notification
                await NotificationService.presentLocalNotification({
                  title: newRow.title,
                  body: newRow.message,
                  data: newRow.data,
                  category: newRow.category,
                });
                notifyListeners();
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('[NotificationService] Supabase Realtime subscription error:', err);
      }
    }

    return () => {
      if (responseSubscription) {
        responseSubscription.remove();
      }
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  },

  // ==========================================================
  // MEDTRIX EVENT DISPATCHERS
  // ==========================================================

  /**
   * Dispatch Low Stock Alert
   */
  async dispatchLowStockAlert(params: {
    medicineName: string;
    currentQty: number;
    threshold?: number;
    medicineId?: string;
  }) {
    const threshold = params.threshold ?? 20;
    const title = 'Low Stock Alert';
    const message = `${params.medicineName} is running low (${params.currentQty} units left). Reorder recommended.`;
    const data = {
      route: '/(tabs)/inventory',
      medicineId: params.medicineId,
      quantity: params.currentQty,
      threshold,
    };

    const { data: record } = await Database.createNotification({
      title,
      message,
      type: 'warning',
      category: 'stock_alert',
      data,
    });

    await this.presentLocalNotification({ title, body: message, data, category: 'stock_alert' });
    notifyListeners();
    return record;
  },

  /**
   * Dispatch Batch Expiry Alert
   */
  async dispatchExpiryAlert(params: {
    medicineName: string;
    batchNumber: string;
    expiryDate: string;
    daysRemaining: number;
  }) {
    const isExpired = params.daysRemaining <= 0;
    const title = isExpired ? 'Expired Stock Detected' : 'Medicine Approaching Expiry';
    const message = isExpired
      ? `${params.medicineName} (Batch ${params.batchNumber}) has expired. Remove immediately.`
      : `${params.medicineName} (Batch ${params.batchNumber}) expires in ${params.daysRemaining} days (${params.expiryDate}).`;
    const data = {
      route: '/(tabs)/alerts',
      batchNumber: params.batchNumber,
      expiryDate: params.expiryDate,
      isExpired,
    };

    const { data: record } = await Database.createNotification({
      title,
      message,
      type: isExpired ? 'critical' : 'warning',
      category: 'expiry',
      data,
    });

    await this.presentLocalNotification({ title, body: message, data, category: 'expiry' });
    notifyListeners();
    return record;
  },

  /**
   * Dispatch Stock In / Out Confirmation
   */
  async dispatchStockMovementAlert(params: {
    type: 'received' | 'dispensed';
    medicineName: string;
    quantity: number;
    batchNumber?: string;
  }) {
    const isIn = params.type === 'received';
    const title = isIn ? 'Stock In Confirmed' : 'Stock Out Dispensed';
    const message = isIn
      ? `Received and verified ${params.quantity} units of ${params.medicineName}${params.batchNumber ? ` (Batch ${params.batchNumber})` : ''}.`
      : `Dispensed ${params.quantity} units of ${params.medicineName}${params.batchNumber ? ` (Batch ${params.batchNumber})` : ''}.`;
    const data = {
      route: '/(tabs)/inventory',
      movementType: params.type,
      quantity: params.quantity,
    };

    const { data: record } = await Database.createNotification({
      title,
      message,
      type: isIn ? 'success' : 'info',
      category: 'inventory_movement',
      data,
    });

    await this.presentLocalNotification({ title, body: message, data, category: 'inventory_movement' });
    notifyListeners();
    return record;
  },

  /**
   * Dispatch AI Triage Recommendation Alert
   */
  async dispatchAiTriageAlert(params: {
    title: string;
    message: string;
    urgency?: 'low' | 'medium' | 'high';
  }) {
    const data = {
      route: '/profile/ai-triage',
      urgency: params.urgency || 'medium',
    };

    const { data: record } = await Database.createNotification({
      title: params.title,
      message: params.message,
      type: params.urgency === 'high' ? 'warning' : 'info',
      category: 'ai_triage',
      data,
    });

    await this.presentLocalNotification({
      title: params.title,
      body: params.message,
      data,
      category: 'ai_triage',
    });
    notifyListeners();
    return record;
  },

  /**
   * Send push notification via Expo Push API to specific device tokens
   * (Used on server or backend delivery)
   */
  async sendExpoPushNotification(params: {
    to: string | string[];
    title: string;
    body: string;
    data?: Record<string, any>;
  }): Promise<{ success: boolean; data?: any; error?: any }> {
    const tokens = Array.isArray(params.to) ? params.to : [params.to];
    const validTokens = tokens.filter((t) => typeof t === 'string' && t.startsWith('ExponentPushToken['));

    if (validTokens.length === 0) {
      return { success: false, error: 'No valid Expo push tokens provided.' };
    }

    const messages = validTokens.map((token) => ({
      to: token,
      sound: 'default',
      title: params.title,
      body: params.body,
      data: params.data ?? {},
      channelId: 'medtrix-alerts',
      priority: 'high',
    }));

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      const result = await response.json();
      return { success: response.ok, data: result };
    } catch (error) {
      console.warn('[NotificationService] sendExpoPushNotification error:', error);
      return { success: false, error };
    }
  },

  /**
   * Trigger manual UI refresh
   */
  refresh() {
    notifyListeners();
  },
};
