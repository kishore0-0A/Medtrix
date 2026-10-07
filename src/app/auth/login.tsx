import React, { useState } from 'react';

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS, TYPOGRAPHY, SHADOWS } from '../../theme';
import { Auth } from '../../supabase';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../i18n';
/* ============================================================
   LOGIN SCREEN
============================================================ */

export default function LoginScreen() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  /* ============================================================
     LOGIN
  ============================================================ */

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(
        'Missing information',
        'Please enter your email or employee ID and password.'
      );
      return;
    }

    setLoading(true);

    try {
      const { error } = await Auth.signIn(email.trim(), password);

      if (error) {
        Alert.alert('Sign in failed', error.message);
        setLoading(false);
        return;
      }

      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert(
        'Something went wrong',
        err?.message || 'Unable to sign in. Please try again.'
      );

      setLoading(false);
    }
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background.canvas}
      />

      {/* ======================================================
          BACKGROUND ATMOSPHERE
      ====================================================== */}

      <View style={[styles.backgroundLayer, { pointerEvents: 'none' }]}>
        <View style={styles.blueGlow} />
        <View style={styles.blueGlowSmall} />

        <View style={styles.gridTop}>
          <View style={styles.gridLineVertical} />
          <View style={styles.gridLineVerticalTwo} />
          <View style={styles.gridLineHorizontal} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* ==================================================
              BRAND
          ================================================== */}

          <View style={styles.brandArea}>
            <View style={styles.brandMark}>
              <MaterialCommunityIcons
                name="medical-bag"
                size={25}
                color="#FFFFFF"
              />
            </View>

            <View>
              <Text style={styles.brandName}>MEDTRIX</Text>

              <View style={styles.brandMetaRow}>
                <View style={styles.statusDot} />
                <Text style={styles.brandMeta}>
                  CLINICAL INVENTORY
                </Text>
              </View>
            </View>
          </View>

          {/* ==================================================
              WELCOME
          ================================================== */}

          <View style={styles.welcomeArea}>
            <Text style={styles.eyebrow}>{t('auth.secure_access')}</Text>

            <Text style={styles.title}>
              {t('auth.welcome_back')}
            </Text>

            <Text style={styles.subtitle}>
              Sign in to manage your medical inventory,
              stock levels and dispensing activity.
            </Text>
          </View>

          {/* ==================================================
              LOGIN CARD
          ================================================== */}

          <View style={styles.loginCard}>
            {/* Card top accent */}
            <View style={styles.cardAccent} />

            {/* ==================================================
                EMAIL
            ================================================== */}

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>
                  EMAIL
                </Text>

                <Text style={styles.required}>
                  REQUIRED
                </Text>
              </View>

              <View
                style={[
                  styles.inputContainer,
                  emailFocused && styles.inputContainerFocused,
                ]}
              >
                <View
                  style={[
                    styles.inputIconBox,
                    emailFocused && styles.inputIconBoxFocused,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={17}
                    color={
                      emailFocused
                        ? COLORS.brand.primary
                        : COLORS.text.muted
                    }
                  />
                </View>

                <TextInput
                  placeholder={t('auth.email_placeholder')}
                  placeholderTextColor={COLORS.text.disabled}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  editable={!loading}
                />
              </View>
            </View>

            {/* ==================================================
                PASSWORD
            ================================================== */}

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>
                  PASSWORD
                </Text>
              </View>

              <View
                style={[
                  styles.inputContainer,
                  passwordFocused && styles.inputContainerFocused,
                ]}
              >
                <View
                  style={[
                    styles.inputIconBox,
                    passwordFocused && styles.inputIconBoxFocused,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={17}
                    color={
                      passwordFocused
                        ? COLORS.brand.primary
                        : COLORS.text.muted
                    }
                  />
                </View>

                <TextInput
                  placeholder={t('auth.password_placeholder')}
                  placeholderTextColor={COLORS.text.disabled}
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  textContentType="password"
                  returnKeyType="done"
                  editable={!loading}
                />

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  disabled={loading}
                >
                  <Ionicons
                    name={
                      showPassword
                        ? 'eye-outline'
                        : 'eye-off-outline'
                    }
                    size={19}
                    color={COLORS.text.muted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* ==================================================
                REMEMBER + FORGOT
            ================================================== */}

            <View style={styles.optionsRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.rememberButton}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberMe && styles.checkboxActive,
                  ]}
                >
                  {rememberMe && (
                    <Ionicons
                      name="checkmark"
                      size={12}
                      color="#FFFFFF"
                    />
                  )}
                </View>

                <Text style={styles.rememberText}>
                  Remember this device
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  Alert.alert(
                    'Password recovery',
                    'Password recovery will be available here.'
                  )
                }
              >
                <Text style={styles.forgotText}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* ==================================================
                SIGN IN
            ================================================== */}

            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.signInButton,
                loading && styles.signInButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              <View style={styles.signInButtonInner}>
                {loading ? (
                  <>
                    <View style={styles.loadingDot} />
                    <Text style={styles.signInText}>
                      AUTHENTICATING...
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.signInText}>
                      Sign In
                    </Text>

                    <View style={styles.arrowCircle}>
                      <Ionicons
                        name="arrow-forward"
                        size={15}
                        color={COLORS.brand.primary}
                      />
                    </View>
                  </>
                )}
              </View>
            </TouchableOpacity>

            {/* ==================================================
                SECURITY NOTE
            ================================================== */}

            <View style={styles.securityRow}>
              <Ionicons
                name="shield-checkmark-outline"
                size={15}
                color={COLORS.status.healthy}
              />

              <Text style={styles.securityText}>
                Secure authentication powered by Medtrix
              </Text>
            </View>
          </View>

          {/* ==================================================
              ALTERNATIVE SIGN IN
          ================================================== */}

          <View style={styles.alternativeArea}>
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.orText}>{t('auth.or')}</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.googleButton}
              onPress={() =>
                Alert.alert(
                  'Google Sign In',
                  'Google authentication is not connected yet.'
                )
              }
            >
              <View style={styles.googleIcon}>
                <Text style={styles.googleG}>G</Text>
              </View>

              <View style={styles.googleContent}>
                <Text style={styles.googleTitle}>
                  Continue with Google
                </Text>

                <Text style={styles.googleSubtitle}>
                  Use your hospital Google account
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={17}
                color={COLORS.text.muted}
              />
            </TouchableOpacity>
          </View>

          {/* ==================================================
              SIGN UP
          ================================================== */}

          <View style={styles.signupArea}>
            <Text style={styles.signupText}>
              Don&apos;t have an account?
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.replace('/auth/signup')}
            >
              <Text style={styles.signupLink}>
                Create account
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  /* ==========================================================
     SCREEN
  ========================================================== */

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.canvas,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 28,
  },

  /* ==========================================================
     BACKGROUND
  ========================================================== */

  backgroundLayer: {
    ...(StyleSheet.absoluteFill as any),
    overflow: 'hidden',
  },

  blueGlow: {
    position: 'absolute',
    width: 330,
    height: 330,
    borderRadius: 165,
    top: -175,
    right: -105,
    backgroundColor: '#DCEAFF',
    opacity: 0.75,
  },

  blueGlowSmall: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    bottom: -90,
    left: -80,
    backgroundColor: '#E8F1FF',
    opacity: 0.7,
  },

  gridTop: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 180,
    height: 130,
    opacity: 0.35,
  },

  gridLineVertical: {
    position: 'absolute',
    right: 40,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#BFD2ED',
  },

  gridLineVerticalTwo: {
    position: 'absolute',
    right: 90,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#BFD2ED',
  },

  gridLineHorizontal: {
    position: 'absolute',
    top: 42,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#BFD2ED',
  },

  /* ==========================================================
     BRAND
  ========================================================== */

  brandArea: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 38,
  },

  brandMark: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    ...SHADOWS.soft,
  },

  brandName: {
    ...TYPOGRAPHY.heading800,
    fontSize: 22,
    color: COLORS.text.primary,
    letterSpacing: 2,
  },

  brandMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },

  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.status.healthy,
    marginRight: 6,
  },

  brandMeta: {
    ...TYPOGRAPHY.monoBold,
    fontSize: 8,
    letterSpacing: 1.2,
    color: COLORS.text.muted,
  },

  /* ==========================================================
     WELCOME
  ========================================================== */

  welcomeArea: {
    marginBottom: 22,
  },

  eyebrow: {
    ...TYPOGRAPHY.monoBold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: COLORS.brand.primary,
    marginBottom: 8,
  },

  title: {
    ...TYPOGRAPHY.heading800,
    fontSize: 32,
    lineHeight: 38,
    color: COLORS.text.primary,
    letterSpacing: -0.6,
    marginBottom: 9,
  },

  subtitle: {
    ...TYPOGRAPHY.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: COLORS.text.secondary,
    maxWidth: 355,
  },

  /* ==========================================================
     LOGIN CARD
  ========================================================== */

  loginCard: {
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E1E8F1',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 19,
    marginBottom: 20,

    shadowColor: '#17365D',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,

    overflow: 'hidden',
  },

  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 22,
    right: 22,
    height: 2,
    backgroundColor: COLORS.brand.primary,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },

  /* ==========================================================
     FORM
  ========================================================== */

  fieldGroup: {
    marginBottom: 18,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },

  label: {
    ...TYPOGRAPHY.monoBold,
    fontSize: 9.5,
    letterSpacing: 0.9,
    color: COLORS.text.secondary,
  },

  required: {
    ...TYPOGRAPHY.monoBold,
    fontSize: 8,
    letterSpacing: 0.7,
    color: COLORS.text.muted,
  },

  inputContainer: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFD',
    borderWidth: 1,
    borderColor: '#E0E7F0',
    borderRadius: 13,
    paddingHorizontal: 10,
  },

  inputContainerFocused: {
    borderColor: COLORS.brand.primary,
  },

  inputIconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF3F8',
    marginRight: 9,
  },

  inputIconBoxFocused: {
    backgroundColor: '#EAF2FF',
  },

  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.text.primary,
    paddingVertical: 0,
  },

  eyeButton: {
    width: 38,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ==========================================================
     OPTIONS
  ========================================================== */

  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 1,
    marginBottom: 20,
  },

  rememberButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  checkboxActive: {
    backgroundColor: COLORS.brand.primary,
    borderColor: COLORS.brand.primary,
  },

  rememberText: {
    ...TYPOGRAPHY.body,
    fontSize: 11.5,
    color: COLORS.text.secondary,
  },

  forgotText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 11.5,
    color: COLORS.brand.primary,
  },

  /* ==========================================================
     SIGN IN BUTTON
  ========================================================== */

  signInButton: {
    height: 52,
    borderRadius: 13,
    backgroundColor: COLORS.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: COLORS.brand.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },

  signInButtonDisabled: {
    opacity: 0.72,
  },

  signInButtonInner: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  signInText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  arrowCircle: {
    position: 'absolute',
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 9,
    opacity: 0.9,
  },

  /* ==========================================================
     SECURITY
  ========================================================== */

  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },

  securityText: {
    ...TYPOGRAPHY.body,
    fontSize: 10.5,
    color: COLORS.text.muted,
    marginLeft: 6,
  },

  /* ==========================================================
     ALTERNATIVE LOGIN
  ========================================================== */

  alternativeArea: {
    marginBottom: 19,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDE4ED',
  },

  orText: {
    ...TYPOGRAPHY.monoBold,
    fontSize: 9,
    color: COLORS.text.muted,
    marginHorizontal: 12,
    letterSpacing: 1,
  },

  googleButton: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: '#DCE4ED',
    borderRadius: 15,
    paddingHorizontal: 13,
  },

  googleIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E7EF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  googleG: {
    fontSize: 17,
    fontWeight: '700',
    color: '#4285F4',
  },

  googleContent: {
    flex: 1,
    marginLeft: 11,
  },

  googleTitle: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 12.5,
    color: COLORS.text.primary,
    marginBottom: 3,
  },

  googleSubtitle: {
    ...TYPOGRAPHY.body,
    fontSize: 10.5,
    color: COLORS.text.muted,
  },

  /* ==========================================================
     SIGN UP
  ========================================================== */

  signupArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26,
  },

  signupText: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: COLORS.text.secondary,
  },

  signupLink: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 12,
    color: COLORS.brand.primary,
    marginLeft: 5,
  },
});
