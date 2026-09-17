import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_ENABLED_KEY = 'MEDTRIX_BIOMETRIC_ENABLED';

export type BiometricType = 'fingerprint' | 'face' | 'iris' | 'none';

export interface BiometricAvailability {
  available: boolean;
  type: BiometricType;
  enrolled: boolean;
}

export interface BiometricResult {
  success: boolean;
  error?: string;
}

export const BiometricHelpers = {
  /**
   * Check if the device has biometric hardware and is enrolled.
   */
  async checkBiometricAvailability(): Promise<BiometricAvailability> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        return { available: false, type: 'none', enrolled: false };
      }

      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      let type: BiometricType = 'none';
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        type = 'face';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        type = 'fingerprint';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        type = 'iris';
      }

      return {
        available: true,
        type,
        enrolled: isEnrolled,
      };
    } catch (error) {
      console.warn('Biometric availability check failed:', error);
      return { available: false, type: 'none', enrolled: false };
    }
  },

  /**
   * Retrieves a human readable string for the supported biometric type.
   */
  async getBiometricLabel(): Promise<string> {
    const { available, type } = await this.checkBiometricAvailability();
    if (!available) return 'Biometrics';
    
    switch (type) {
      case 'face': return 'Face ID';
      case 'fingerprint': return 'Fingerprint';
      case 'iris': return 'Iris Scanner';
      default: return 'Biometrics';
    }
  },

  /**
   * Prompt the OS level biometric authentication dialog.
   */
  async authenticateWithBiometrics(promptMessage?: string): Promise<BiometricResult> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMessage || 'Authenticate to unlock Medtrix',
        fallbackLabel: 'Use Password',
        disableDeviceFallback: false, // Allows using device PIN if biometric fails multiple times
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        return { success: true };
      } else {
        let errorMessage = 'Biometric authentication failed.';
        if (result.error === 'user_cancel') errorMessage = 'Biometric authentication was cancelled.';
        if (result.error === 'lockout') errorMessage = 'Too many attempts. Biometrics locked.';
        
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
      return { success: false, error: 'An unknown error occurred during biometric authentication.' };
    }
  },

  /**
   * Checks SecureStore if the user has opted-in to biometric login.
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const result = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
      return result === 'true';
    } catch (error) {
      return false;
    }
  },

  /**
   * Saves the user's preference to use biometric login.
   */
  async enableBiometricLogin(): Promise<void> {
    try {
      await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
    } catch (error) {
      console.error('Failed to save biometric preference', error);
    }
  },

  /**
   * Disables biometric login preference.
   */
  async disableBiometricLogin(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
    } catch (error) {
      console.error('Failed to delete biometric preference', error);
    }
  }
};
