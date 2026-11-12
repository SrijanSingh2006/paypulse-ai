import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { login, isLoading, biometricsEnabled } = useAuth();
  const [email, setEmail] = useState('employee@heftin.ai');
  const [password, setPassword] = useState('password123');

  const handleLogin = async (targetEmail?: string) => {
    try {
      await login(targetEmail || email, password);
    } catch (e: any) {
      Alert.alert('Login Failed', e.message || 'Please check your credentials.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="pulse" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.brandTitle}>PayPulse AI</Text>
          <Text style={styles.brandSub}>
            Heftin AI • Earned Wage Access & HR Expense Ecosystem
          </Text>
        </View>

        {/* Inputs */}
        <View style={styles.formCard}>
          <Text style={styles.label}>Corporate Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@heftin.ai"
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••••••"
            placeholderTextColor={Colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.loginBtn, isLoading && styles.btnDisabled]}
            onPress={() => handleLogin()}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#0B0F19" />
            ) : (
              <Text style={styles.loginBtnText}>Sign In with SSO / Password</Text>
            )}
          </TouchableOpacity>

          {biometricsEnabled && (
            <TouchableOpacity
              style={styles.biometricBtn}
              onPress={() => handleLogin()}
              activeOpacity={0.8}
            >
              <Ionicons name="finger-print-outline" size={20} color={Colors.primary} />
              <Text style={styles.biometricText}>Quick Unlock with Biometrics</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Demo Fast Login Shortcuts */}
        <Text style={styles.demoLabel}>1-Tap Demo Shortcuts for Interview Reviewers</Text>
        <View style={styles.demoRow}>
          <TouchableOpacity
            style={styles.demoBtn}
            onPress={() => {
              setEmail('employee@heftin.ai');
              handleLogin('employee@heftin.ai');
            }}
          >
            <Ionicons name="person-outline" size={16} color={Colors.primary} />
            <Text style={styles.demoBtnText}>Employee Demo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoBtn}
            onPress={() => {
              setEmail('manager@heftin.ai');
              handleLogin('manager@heftin.ai');
            }}
          >
            <Ionicons name="shield-checkmark-outline" size={16} color={Colors.accentLight} />
            <Text style={styles.demoBtnText}>HR Manager Demo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  brandSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 280,
    lineHeight: 16,
  },
  formCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    color: Colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  loginBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: '#0B0F19',
    fontSize: 15,
    fontWeight: '800',
  },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    paddingVertical: 8,
  },
  biometricText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  demoLabel: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 24,
    marginBottom: 10,
  },
  demoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  demoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.cardSecondary,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
});

