import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useState } from 'react';

import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email === 'test@test.com' && password === '123456') {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Error', 'Invalid email or password');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>MEDTRIX</Text>

        <Text style={styles.title}>
          Welcome Back
        </Text>

        <Text style={styles.subtitle}>
          Sign in to manage your medical inventory
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>

        <TextInput
          placeholder="Enter your email"
          placeholderTextColor="#64748B"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>

        <TextInput
          placeholder="Enter your password"
          placeholderTextColor="#64748B"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>
            Sign In
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        Medtrix • Smart Medical Inventory
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },

  header: {
    marginBottom: 40,
  },

  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 3,
    marginBottom: 32,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    marginTop: 10,
    lineHeight: 22,
  },

  form: {
    width: '100%',
  },

  label: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },

  input: {
    height: 54,
    borderWidth: 1,
    borderColor: '#263449',
    borderRadius: 12,
    backgroundColor: '#111B2E',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    marginBottom: 20,
    fontSize: 15,
  },

  button: {
    height: 54,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  footer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    color: '#64748B',
    fontSize: 12,
  },
});