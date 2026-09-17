import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, GLASS, SHADOWS } from '../../theme';
import { Auth, Biometric } from '../../supabase';

export default function BiometricUnlockScreen() {
  const [label, setLabel] = useState('Biometrics');
  const [icon, setIcon] = useState<any>('finger-print-outline');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function init() {
      const { type } = await Biometric.checkBiometricAvailability();
      if (type === 'face') {
        setLabel('Face ID');
        setIcon('scan-outline'); // Approximate FaceID icon using Ionicons
      } else if (type === 'fingerprint') {
        setLabel('Fingerprint');
        setIcon('finger-print-outline');
      }
      
      // Auto prompt on mount
      handleUnlock();
    }
    init();
  }, []);

  const handleUnlock = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // First ensure they actually have a valid Supabase session
      const session = await Auth.getSession();
      if (!session) {
        Alert.alert('Session Expired', 'Your session has expired. Please sign in with your password again.');
        router.replace('/auth/login');
        return;
      }

      const result = await Biometric.authenticateWithBiometrics(`Unlock Medtrix using ${label}`);
      
      if (result.success) {
        router.replace('/(tabs)');
      } else {
        // Just fail silently or show a toast, let them click retry or use password
      }
    } catch (e: any) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  const usePassword = async () => {
    // If they want to use a password, they are choosing to re-authenticate manually
    await Auth.signOut(); 
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.canvas} />
      
      {/* Subtle Background Elements */}
      <View style={styles.bgGlowTop} pointerEvents="none" />

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.brandName}>MEDTRIX</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={64} color={COLORS.brand.primary} />
          </View>
          
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Unlock Medtrix with biometrics</Text>

          <TouchableOpacity style={styles.button} onPress={handleUnlock} disabled={loading}>
            <Text style={styles.buttonText}>Use {label}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={usePassword}>
            <Text style={styles.secondaryButtonText}>Use Password Instead</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    left: '10%',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.brand.soft,
    opacity: 0.5,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  brandName: {
    ...TYPOGRAPHY.heading800,
    fontSize: 20,
    color: COLORS.brand.primary,
    letterSpacing: 1.5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    ...SHADOWS.soft,
  },
  title: {
    ...TYPOGRAPHY.heading,
    fontSize: 28,
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: 48,
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: COLORS.brand.primary,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...SHADOWS.soft,
  },
  buttonText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  secondaryButton: {
    padding: 16,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 15,
    color: COLORS.text.secondary,
  }
});
