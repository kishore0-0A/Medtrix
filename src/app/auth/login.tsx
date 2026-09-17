import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, GLASS, SHADOWS } from '../../theme';

import { Auth, Biometric } from '../../supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const { error } = await Auth.signIn(email, password);
      
      if (error) {
        Alert.alert('Error', error.message);
        setLoading(false);
        return;
      }

      // Check for Biometric Capability
      const bioStatus = await Biometric.checkBiometricAvailability();
      const isAlreadyEnabled = await Biometric.isBiometricEnabled();

      if (bioStatus.available && !isAlreadyEnabled) {
        setLoading(false);
        const label = bioStatus.type === 'face' ? 'Face ID' : 'fingerprint';
        Alert.alert(
          'Enable Biometric Login',
          `Use ${label} to quickly unlock Medtrix on this device.`,
          [
            { 
              text: 'Not Now', 
              style: 'cancel', 
              onPress: () => router.replace('/(tabs)') 
            },
            { 
              text: 'Enable', 
              onPress: async () => {
                const result = await Biometric.authenticateWithBiometrics(`Verify ${label} to enable quick login`);
                if (result.success) {
                  await Biometric.enableBiometricLogin();
                } else {
                  // Even if biometric fails here, they are still logged in via Supabase
                  Alert.alert('Setup Failed', result.error);
                }
                router.replace('/(tabs)');
              }
            }
          ]
        );
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to sign in');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.canvas} />
      
      {/* Subtle Background Elements */}
      <View style={styles.bgGlowTop} pointerEvents="none" />

      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* BRANDING */}
          <View style={styles.brandContainer}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="medical-bag" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.brandTextRow}>
              <Text style={styles.brandName}>MEDTRIX</Text>
            </View>
          </View>

          {/* MAIN LOGIN CARD (HERO GLASS) */}
          <View style={[styles.card, GLASS.hero]}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>Sign in to access hospital medicine inventory</Text>
            </View>

            <View style={styles.form}>
              {/* EMAIL */}
              <Text style={styles.label}>Email or Employee ID</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="id-card-outline" size={16} color={COLORS.text.muted} style={styles.inputIcon} />
                <TextInput
                  placeholder="name@hospital.org or EMP-ID"
                  placeholderTextColor={COLORS.text.disabled}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* PASSWORD */}
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={16} color={COLORS.text.muted} style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.text.disabled}
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={18} color={COLORS.text.muted} />
                </TouchableOpacity>
              </View>

              {/* REMEMBER ROW */}
              <View style={styles.rememberRow}>
                <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
                  <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                    {rememberMe && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.rememberText}>Remember this device</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              {/* SIGN IN BUTTON */}
              <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Signing In...' : 'Sign In to Medtrix'}</Text>
              </TouchableOpacity>
            </View>

            {/* OR DIVIDER */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <View style={styles.dividerCapsule}>
                <Text style={styles.dividerText}>OR</Text>
              </View>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.biometricContainer}>
              <View style={styles.biometricLeft}>
                <View style={styles.biometricIconWrapper}>
                  <Ionicons name="logo-google" size={18} color="#2563EB" />
                </View>
                <View style={styles.biometricTextWrapper}>
                  <Text style={styles.biometricTitle}>Continue with Google</Text>
                  <Text style={styles.biometricSubtitle}>Use your hospital account</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.verifyButton}>
                <Text style={styles.verifyButtonText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* SIGN UP LINK */}
          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginLinkText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/auth/signup')}>
              <Text style={styles.loginLinkHighlight}>Sign Up</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  // BRANDING
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 56,
    height: 56,
    backgroundColor: COLORS.brand.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...SHADOWS.soft,
  },
  brandTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandName: {
    ...TYPOGRAPHY.heading800,
    fontSize: 20,
    color: COLORS.brand.primary,
    letterSpacing: 1.5,
  },
  // MAIN LOGIN CARD
  card: {
    padding: 24,
    marginBottom: 20,
  },
  cardHeader: {
    marginBottom: 24,
  },
  title: {
    ...TYPOGRAPHY.heading,
    fontSize: 24,
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  form: {},
  label: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 13,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: '#DCE5EF',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  inputContainerFocused: {
    borderColor: COLORS.brand.primary,
    backgroundColor: '#FFFFFF',
    shadowColor: COLORS.brand.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
    fontSize: 15,
    color: COLORS.text.primary,
  },
  eyeIcon: {
    padding: 4,
  },
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: COLORS.border.secondary,
    borderRadius: 6,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  checkboxActive: {
    backgroundColor: COLORS.brand.primary,
    borderColor: COLORS.brand.primary,
  },
  rememberText: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  forgotText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 13,
    color: COLORS.brand.primary,
  },
  button: {
    height: 48,
    backgroundColor: COLORS.brand.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },
  buttonText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border.subtle,
  },
  dividerCapsule: {
    paddingHorizontal: 12,
  },
  dividerText: {
    ...TYPOGRAPHY.monoBold,
    fontSize: 11,
    color: COLORS.text.muted,
  },
  biometricContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    borderRadius: 16,
    padding: 16,
  },
  biometricLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  biometricIconWrapper: {
    width: 36,
    height: 36,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  biometricTextWrapper: {
    flex: 1,
  },
  biometricTitle: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 14,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  biometricSubtitle: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  verifyButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  verifyButtonText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 12,
    color: COLORS.brand.primary,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  loginLinkText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  loginLinkHighlight: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 14,
    color: COLORS.brand.primary,
  },
});