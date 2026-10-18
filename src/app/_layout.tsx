import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
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
import { LogBox, View, StyleSheet } from 'react-native';
import { Auth } from '../supabase';
import { initI18n } from '../i18n';
import FloatingAssistant from '../components/FloatingAssistant';
import { ThemeProvider } from '../context/ThemeContext';
SplashScreen.preventAutoHideAsync();

LogBox.ignoreLogs([
  "Can't perform a React state update on a component that hasn't mounted yet",
  "Animated: `useNativeDriver` is not supported",
]);

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

  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    async function checkAuthAndRoute() {
      if (!loaded && !error) return; // Wait until fonts load
      
      try {
        await initI18n();
        const user = await Auth.getCurrentUser();
        if (!user) {
          router.replace('/auth/login');
        }
      } catch (err) {
        console.error('Error during initial check:', err);
      } finally {
        setAuthChecked(true);
        SplashScreen.hideAsync();
      }
    }
    
    checkAuthAndRoute();
  }, [loaded, error]);

  useEffect(() => {
    if (loaded && authChecked) {
      setTimeout(() => router.replace('/(tabs)'), 0);
    }
  }, [loaded, authChecked]);

  if (!loaded || !authChecked) {
    return null;
  }

  return (
    <ThemeProvider>
      <View style={styles.root}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
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