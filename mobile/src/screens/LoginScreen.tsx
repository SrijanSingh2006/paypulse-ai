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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { login, isLoading, biometricsEnabled } = useAuth();
  const [email, setEmail] = useState('employee@heftin.ai');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

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
      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoGlow}>
            <View style={styles.logoCircle}>
              <Ionicons name="pulse" size={40} color={Colors.primary} />
            </View>
          </View>
          <Text style={styles.brandTitle}>PayPulse AI</Text>
          <Text style={styles.brandTagline}>by Heftin AI</Text>
          <Text style={styles.brandSub}>
            Earned Wage Access · HR Expense Ecosystem · AI Copilot
          </Text>

          {/* Feature pills */}
          <View style={styles.featurePills}>
            {['0% Interest EWA', 'Instant ACH', 'AI HR Copilot'].map((f) => (
              <View key={f} style={styles.featurePill}>
                <Ionicons name="checkmark-circle" size={11} color={Colors.primary} />
                <Text style={styles.featurePillText}>{f}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Sign In</Text>

          <Text style={styles.label}>Corporate Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={16} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="you@heftin.ai"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={16} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.inputFlex]}
              placeholder="••••••••••••"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={16}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, isLoading && styles.btnDisabled]}
            onPress={() => handleLogin()}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#0B0F19" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={18} color="#0B0F19" />
                <Text style={styles.loginBtnText}>Continue to Demo</Text>
              </>
            )}
          </TouchableOpacity>

          {biometricsEnabled && (
            <TouchableOpacity
              style={styles.biometricBtn}
              onPress={() => handleLogin()}
              activeOpacity={0.8}
            >
              <Ionicons name="finger-print-outline" size={20} color={Colors.primary} />
              <Text style={styles.biometricText}>Demo Quick Unlock</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Demo Shortcuts */}
        <View style={styles.demoSection}>
          <View style={styles.demoLabelRow}>
            <View style={styles.demoLine} />
            <Text style={styles.demoLabel}>1-Tap Demo Access</Text>
            <View style={styles.demoLine} />
          </View>

          <View style={styles.demoRow}>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => {
                setEmail('employee@heftin.ai');
                handleLogin('employee@heftin.ai');
              }}
              activeOpacity={0.8}
            >
              <View style={styles.demoBtnIcon}>
                <Ionicons name="person" size={16} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.demoBtnTitle}>Employee</Text>
                <Text style={styles.demoBtnSub}>Alex Rivera</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoBtn, styles.demoBtnManager]}
              onPress={() => {
                setEmail('manager@heftin.ai');
                handleLogin('manager@heftin.ai');
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.demoBtnIcon, styles.demoBtnIconManager]}>
                <Ionicons name="shield-checkmark" size={16} color={Colors.accentLight} />
              </View>
              <View>
                <Text style={[styles.demoBtnTitle, { color: Colors.accentLight }]}>HR Manager</Text>
                <Text style={styles.demoBtnSub}>Sarah Chen</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footerText}>
          Heftin PayPulse AI v2.4.0 · ai.heftin.paypulse · Berkeley CA
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inner: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoGlow: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 14,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  brandSub: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 280,
    lineHeight: 17,
  },
  featurePills: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  featurePillText: {
    fontSize: 10,
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: Colors.card,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 6,
    marginTop: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 4,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    color: Colors.text,
    fontSize: 14,
  },
  inputFlex: {
    flex: 1,
  },
  eyeBtn: {
    padding: 4,
  },
  loginBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
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
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  biometricText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  demoSection: {
    marginBottom: 20,
  },
  demoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  demoLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  demoLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  demoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  demoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.card,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  demoBtnManager: {
    borderColor: 'rgba(129, 140, 248, 0.3)',
  },
  demoBtnIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoBtnIconManager: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  demoBtnTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  demoBtnSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
