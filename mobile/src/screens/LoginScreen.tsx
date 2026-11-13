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
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { width } = useWindowDimensions();
  const wideLayout = width >= 820;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (targetEmail?: string, targetPassword = password) => {
    try {
      await login(targetEmail || email, targetPassword);
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
        contentContainerStyle={[styles.inner, wideLayout && styles.innerWide]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={[styles.brandContainer, wideLayout && styles.brandContainerWide]}>
          <View style={styles.logoGlow}>
            <View style={styles.logoCircle}>
              <Ionicons name="pulse" size={40} color={Colors.primary} />
            </View>
          </View>
          <Text style={styles.brandTitle}>PayPulse AI</Text>
          <Text style={styles.brandTagline}>Your pay, on your terms.</Text>
          <Text style={[styles.brandSub, wideLayout && styles.brandSubWide]}>
            See what you have earned, follow reimbursements, and keep your month in view.
          </Text>

          {/* Feature pills */}
          <View style={styles.featurePills}>
            {['Earned wage access', 'Expense workflows', 'Pay insights'].map((f) => (
              <View key={f} style={styles.featurePill}>
                <Ionicons name="checkmark-circle" size={11} color={Colors.primary} />
                <Text style={styles.featurePillText}>{f}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.authColumn, wideLayout && styles.authColumnWide]}>
        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formEyebrow}>MEMBER ACCESS</Text>
          <Text style={styles.formTitle}>Sign in</Text>
          <Text style={styles.formSubtitle}>Use your work email, or choose a demo role to explore PayPulse.</Text>

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
              autoComplete="email"
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
              autoComplete="current-password"
              returnKeyType="go"
              onSubmitEditing={() => handleLogin()}
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
              <ActivityIndicator color={Colors.onPrimary} />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={18} color={Colors.onPrimary} />
                <Text style={styles.loginBtnText}>Sign in to PayPulse</Text>
              </>
            )}
          </TouchableOpacity>

        </View>

        {/* Demo Shortcuts */}
        <View style={styles.demoSection}>
          <View style={styles.demoLabelRow}>
            <View style={styles.demoLine} />
            <Text style={styles.demoLabel}>EXPLORE A DEMO ROLE</Text>
            <View style={styles.demoLine} />
          </View>

          <View style={styles.demoRow}>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => {
                setEmail('employee@heftin.ai');
                handleLogin('employee@heftin.ai', 'password123');
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
                handleLogin('manager@heftin.ai', 'password123');
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
          <Text style={styles.demoHint}>Demo password: <Text style={styles.demoPassword}>password123</Text></Text>
        </View>

        <Text style={styles.footerText}>
          Demo environment · Sample data only · No real payments are processed
        </Text>
        </View>
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
    paddingTop: 28,
    paddingBottom: 32,
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
  },
  innerWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 44,
    maxWidth: 1240,
    paddingHorizontal: 42,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 28,
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 9,
    paddingHorizontal: 22,
    paddingVertical: 25,
  },
  brandContainerWide: {
    alignItems: 'flex-start',
    flex: 1,
    width: 'auto',
    marginBottom: 0,
    minHeight: 435,
    justifyContent: 'center',
    paddingHorizontal: 42,
    paddingVertical: 38,
  },
  authColumn: {
    width: '100%',
  },
  authColumnWide: {
    flex: 1,
    maxWidth: 430,
    width: 'auto',
  },
  logoGlow: {
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 14,
  },
  logoCircle: {
    width: 58,
    height: 58,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5896F',
  },
  brandTitle: {
    fontSize: 39,
    fontWeight: '700',
    color: Colors.onPrimary,
    letterSpacing: -1.1,
  },
  brandTagline: {
    fontSize: 19,
    color: '#F5B79D',
    fontWeight: '700',
    marginTop: 10,
  },
  brandSub: {
    fontSize: 14,
    color: '#CBD7D8',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 390,
    lineHeight: 22,
  },
  brandSubWide: {
    textAlign: 'left',
  },
  featurePills: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#294B60',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#3A5A6C',
  },
  featurePillText: {
    fontSize: 10,
    color: '#E3E8E5',
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: Colors.card,
    borderRadius: 9,
    padding: 25,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    shadowColor: '#1F2933',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.055,
    shadowRadius: 12,
    elevation: 2,
  },
  formEyebrow: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  formSubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
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
    borderRadius: 6,
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
    borderRadius: 6,
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
    color: Colors.onPrimary,
    fontSize: 15,
    fontWeight: '800',
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
    borderRadius: 7,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  demoBtnManager: {
    borderColor: Colors.border,
  },
  demoBtnIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoBtnIconManager: {
    backgroundColor: Colors.accentTint,
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
  demoHint: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 10,
    textAlign: 'center',
  },
  demoPassword: {
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
