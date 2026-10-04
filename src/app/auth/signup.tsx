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

/* ============================================================
   SIGN UP SCREEN
============================================================ */

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  /* ============================================================
     SIGN UP
  ============================================================ */

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert(
        'Missing information',
        'Please complete all required fields.'
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Weak password',
        'Password must be at least 6 characters long.'
      );
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await Auth.signUp(
        email.trim(),
        password,
        name.trim()
      );

      if (error) {
        Alert.alert('Sign up failed', error.message);
        setLoading(false);
        return;
      }

      setLoading(false);

      /* --------------------------------------------------------
         Email confirmation required
      -------------------------------------------------------- */

      if (data?.user && !data?.session) {
        Alert.alert(
          'Registration successful',
          'Your account has been created. Please check your email to confirm your account.',
          [
            {
              text: 'Go to Log In',
              onPress: () => router.replace('/auth/login'),
            },
          ]
        );

        return;
      }

      /* --------------------------------------------------------
         Account created and session available
      -------------------------------------------------------- */

      if (data?.session) {
        Alert.alert(
          'Account created',
          'Your Medtrix account has been created successfully.',
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );

        return;
      }

      /* --------------------------------------------------------
         Fallback
      -------------------------------------------------------- */

      router.replace('/auth/login');
    } catch (err: any) {
      Alert.alert(
        'Something went wrong',
        err?.message || 'Unable to create your account.'
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

      <View pointerEvents="none" style={styles.backgroundLayer}>
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
            <Text style={styles.eyebrow}>
              GET STARTED
            </Text>

            <Text style={styles.title}>
              Create your account.
            </Text>

            <Text style={styles.subtitle}>
              Set up your Medtrix account to manage medical
              inventory, stock levels and dispensing activity.
            </Text>
          </View>

          {/* ==================================================
              SIGN UP CARD
          ================================================== */}

          <View style={styles.signupCard}>
            <View style={styles.cardAccent} />

            {/* ==================================================
                FULL NAME
            ================================================== */}

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>
                  FULL NAME
                </Text>

                <Text style={styles.required}>
                  REQUIRED
                </Text>
              </View>

              <View
                style={[
                  styles.inputContainer,
                  nameFocused && styles.inputContainerFocused,
                ]}
              >
                <View
                  style={[
                    styles.inputIconBox,
                    nameFocused && styles.inputIconBoxFocused,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={17}
                    color={
                      nameFocused
                        ? COLORS.brand.primary
                        : COLORS.text.muted
                    }
                  />
                </View>

                <TextInput
                  placeholder="Enter your full name"
                  placeholderTextColor={COLORS.text.disabled}
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoComplete="name"
                  textContentType="name"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  editable={!loading}
                />
              </View>
            </View>

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
                    name="mail-outline"
                    size={17}
                    color={
                      emailFocused
                        ? COLORS.brand.primary
                        : COLORS.text.muted
                    }
                  />
                </View>

                <TextInput
                  placeholder="name@hospital.org"
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

                <Text style={styles.passwordHint}>
                  MIN. 6 CHARACTERS
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
                  placeholder="Create a password"
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

              {/* Password guidance */}

              <View style={styles.passwordInfo}>
                <Ionicons
                  name="information-circle-outline"
                  size={13}
                  color={COLORS.text.muted}
                />

                <Text style={styles.passwordInfoText}>
                  Use a password you don&apos;t use for other accounts.
                </Text>
              </View>
            </View>

            {/* ==================================================
                SIGN UP BUTTON
            ================================================== */}

            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.signUpButton,
                loading && styles.signUpButtonDisabled,
              ]}
              onPress={handleSignUp}
              disabled={loading}
            >
              <View style={styles.signUpButtonInner}>
                {loading ? (
                  <>
                    <View style={styles.loadingDot} />

                    <Text style={styles.signUpButtonText}>
                      CREATING ACCOUNT...
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.signUpButtonText}>
                      Create Account
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
                Your account is protected by secure authentication
              </Text>
            </View>
          </View>

          {/* ==================================================
              GOOGLE
          ================================================== */}

          <View style={styles.alternativeArea}>
            <View style={styles.dividerRow}>
              <View style={styles.divider} />

              <Text style={styles.orText}>
                OR
              </Text>

              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.googleButton}
              onPress={() =>
                Alert.alert(
                  'Google Sign Up',
                  'Google authentication is not connected yet.'
                )
              }
            >
              <View style={styles.googleIcon}>
                <Text style={styles.googleG}>
                  G
                </Text>
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
              LOGIN
          ================================================== */}

          <View style={styles.loginArea}>
            <Text style={styles.loginText}>
              Already have an account?
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.replace('/auth/login')}
            >
              <Text style={styles.loginLink}>
                login
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
    left: -110,
    backgroundColor: '#DCEAFF',
    opacity: 0.75,
  },

  blueGlowSmall: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    bottom: -90,
    right: -80,
    backgroundColor: '#E8F1FF',
    opacity: 0.7,
  },

  gridTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 180,
    height: 130,
    opacity: 0.35,
  },

  gridLineVertical: {
    position: 'absolute',
    left: 40,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#BFD2ED',
  },

  gridLineVerticalTwo: {
    position: 'absolute',
    left: 90,
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
    marginBottom: 34,
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
    marginBottom: 21,
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
    fontSize: 30,
    lineHeight: 36,
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
     SIGN UP CARD
  ========================================================== */

  signupCard: {
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

  passwordHint: {
    ...TYPOGRAPHY.monoBold,
    fontSize: 7.5,
    letterSpacing: 0.6,
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
     PASSWORD INFO
  ========================================================== */

  passwordInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
    paddingHorizontal: 2,
  },

  passwordInfoText: {
    ...TYPOGRAPHY.body,
    fontSize: 9.5,
    color: COLORS.text.muted,
    marginLeft: 5,
  },

  /* ==========================================================
     BUTTON
  ========================================================== */

  signUpButton: {
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

  signUpButtonDisabled: {
    opacity: 0.72,
  },

  signUpButtonInner: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  signUpButtonText: {
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
    fontSize: 10,
    color: COLORS.text.muted,
    marginLeft: 6,
  },

  /* ==========================================================
     ALTERNATIVE SIGN UP
  ========================================================== */

  alternativeArea: {
    marginBottom: 20,
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
     LOGIN LINK
  ========================================================== */

  loginArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  loginText: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: COLORS.text.secondary,
  },

  loginLink: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 12,
    color: COLORS.brand.primary,
    marginLeft: 5,
  },
});
