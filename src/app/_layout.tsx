import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
} from '@expo-google-fonts/outfit';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import { LogBox, View, StyleSheet, Platform } from 'react-native';
import { initI18n } from '../i18n';
import FloatingAssistant from '../components/FloatingAssistant';
import { ThemeProvider } from '../context/ThemeContext';
import { NotificationService } from '../services/notificationService';

SplashScreen.preventAutoHideAsync().catch(() => {});

LogBox.ignoreLogs([
  "Can't perform a React state update on a component that hasn't mounted yet",
  "Animated: `useNativeDriver` is not supported",
  '"shadow*" style props are deprecated',
  'props.pointerEvents is deprecated',
  '[expo-notifications]',
  'expo-notifications',
  'Push notifications (remote notifications) are unavailable in Expo Go',
  'Could not fetch Expo push token',
  'functionality is not fully supported in Expo Go',
  'is missing the required default export',
]);

// Clean console output by filtering library-level notices and transient bundler logs
if (typeof console !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    if (
      msg.includes('"shadow*" style props are deprecated') ||
      msg.includes('props.pointerEvents is deprecated') ||
      msg.includes('[expo-notifications] Listening to push token changes') ||
      msg.includes('[expo-notifications] Push notifications (remote notifications) are unavailable in Expo Go') ||
      msg.includes('is missing the required default export') ||
      msg.includes('expo-notifications` functionality is not fully supported in Expo Go')
    ) {
      return;
    }
    originalWarn(...args);
  };
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Jakarta-Regular': PlusJakartaSans_400Regular,
    'Jakarta-Medium': PlusJakartaSans_500Medium,
    'Jakarta-SemiBold': PlusJakartaSans_600SemiBold,
    'Jakarta-Bold': PlusJakartaSans_700Bold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    'Outfit-Regular': Outfit_400Regular,
    'Outfit-Medium': Outfit_500Medium,
    'Outfit-SemiBold': Outfit_600SemiBold,
    'Outfit-Bold': Outfit_700Bold,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });

  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await initI18n();
      } catch (err) {
        console.error('Error during initial setup:', err);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();

    const cleanup = NotificationService.initializeListeners();
    // Attempt push token registration on mobile devices if permission is already granted
    if (Platform.OS !== 'web') {
      NotificationService.checkPermissions().then(({ granted }) => {
        if (granted) {
          NotificationService.registerForPushNotificationsAsync().catch(() => {});
        }
      });
    }

    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if ((loaded || error) && appIsReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error, appIsReady]);

  if ((!loaded && !error) || !appIsReady) {
    return null;
  }

  return (
    <ThemeProvider>
      <View style={styles.root}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
          <Stack.Screen name="splash" options={{ headerShown: false }} />
          <Stack.Screen name="checkout" options={{ headerShown: false }} />
          <Stack.Screen name="bulk-import" options={{ headerShown: false }} />
          <Stack.Screen name="clinical-triage" options={{ headerShown: false }} />
          <Stack.Screen name="profile/ai-triage" options={{ headerShown: false }} />
          <Stack.Screen name="profile/hospital" options={{ headerShown: false }} />
          <Stack.Screen name="profile/language" options={{ headerShown: false }} />
          <Stack.Screen name="profile/notifications" options={{ headerShown: false }} />
          <Stack.Screen name="notifications" options={{ headerShown: false }} />
          <Stack.Screen name="profile/personal-info" options={{ headerShown: false }} />
          <Stack.Screen name="profile/security" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
        <FloatingAssistant />
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'relative',
  },
});