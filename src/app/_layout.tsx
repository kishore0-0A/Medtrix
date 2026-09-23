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
import { Auth } from '../supabase';
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Jakarta-Regular': PlusJakartaSans_400Regular,
    'Jakarta-Medium': PlusJakartaSans_500Medium,
    'Jakarta-SemiBold': PlusJakartaSans_600SemiBold,
    'Jakarta-Bold': PlusJakartaSans_700Bold,
  });

  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    async function checkAuthAndRoute() {
      if (!loaded && !error) return; // Wait until fonts load
      
      try {
        const session = await Auth.getSession();
        if (session) {
          router.replace('/(tabs)');
        }
      } catch (err) {
        console.warn('Auth check error:', err);
      } finally {
        setAuthChecked(true);
        SplashScreen.hideAsync();
      }
    }
    
    checkAuthAndRoute();
  }, [loaded, error]);

  if (!loaded || !authChecked) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}