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
import { Auth } from '../../supabase';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await Auth.signUp(email.trim(), password, name.trim());

      if (error) {
        Alert.alert('Sign Up Failed', error.message);
        setLoading(false);
        return;
      }

      setLoading(false);

      if (data?.user && !data?.session) {
        // Email confirmation is required by Supabase project settings
        Alert.alert(
          'Registration Successful',
          'Your account has been created! Please check your email to confirm your account (or disable email confirmation in Supabase if testing).',
          [
            {
              text: 'Go to Log In',
              onPress: () => router.replace('/auth/login'),
            },
          ]
        );
      } else if (data?.session) {
        Alert.alert(
          'Success',
          'Account created successfully!',
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      } else {
        router.replace('/auth/login');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to sign up');
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

          {/* MAIN SIGN UP CARD (HERO GLASS) */}
          <View style={[styles.card, GLASS.hero]}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join Medtrix hospital medicine inventory</Text>
            </View>

            <View style={styles.form}>
              {/* NAME */}
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={16} color={COLORS.text.muted} style={styles.inputIcon} />
                <TextInput
                  placeholder="Dr. Jane Doe"
                  placeholderTextColor={COLORS.text.disabled}
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                />
              </View>

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
                  placeholder="Create a password"
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

              {/* SIGN UP BUTTON */}
              <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Sign Up for Medtrix'}</Text>
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

            {/* GOOGLE SIGN UP */}
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
                <Text style={styles.verifyButtonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* LOGIN LINK */}
          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginLinkText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/auth/login')}>
              <Text style={styles.loginLinkHighlight}>Log In</Text>
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
    right: '10%',
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
