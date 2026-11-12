import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { PayslipModal } from '../components/PayslipModal';
import { Api } from '../api/endpoints';
import { Payslip } from '../types';

export const ProfileSettingsScreen: React.FC = () => {
  const { user, switchRole, logout, biometricsEnabled, setBiometricsEnabled } = useAuth();
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

  const isManager = user?.role === 'HR_MANAGER';

  const handleOpenPayslip = async () => {
    const slips = await Api.getPayslips();
    if (slips && slips.length > 0) {
      setSelectedPayslip(slips[0]);
    } else {
      Alert.alert('No Payslips', 'No processed payslips found.');
    }
  };

  const handleShowStoreSigning = () => {
    Alert.alert(
      'EAS build configuration',
      'Preview and production profiles are defined in mobile/eas.json. This portfolio demo does not include signing keys or published mobile store builds.'
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* User Card */}
        <View style={styles.profileCard}>
          <Image
            source={{ uri: user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.designation}>{user?.designation}</Text>
          <Text style={styles.department}>{user?.department}</Text>
          <View style={[styles.badge, isManager ? styles.badgeManager : styles.badgeEmployee]}>
            <Text style={styles.badgeText}>
              {isManager ? 'ROLE: HR & FINANCE MANAGER' : 'ROLE: EMPLOYEE (HEFTIN)'}
            </Text>
          </View>
        </View>

        {/* Demo Fast Switcher */}
        <Text style={styles.sectionHeader}>Role Switching (Demo Evaluator)</Text>
        <View style={styles.switchRow}>
          <TouchableOpacity
            style={[styles.roleBtn, !isManager && styles.roleBtnActive]}
            onPress={() => switchRole('EMPLOYEE')}
          >
            <Ionicons name="person" size={16} color={!isManager ? Colors.onPrimary : Colors.textSecondary} />
            <Text style={[styles.roleBtnText, !isManager && styles.roleBtnTextActive]}>
              Alex (Employee)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleBtn, isManager && styles.roleBtnActive]}
            onPress={() => switchRole('HR_MANAGER')}
          >
            <Ionicons name="shield-checkmark" size={16} color={isManager ? Colors.onPrimary : Colors.textSecondary} />
            <Text style={[styles.roleBtnText, isManager && styles.roleBtnTextActive]}>
              Sarah (HR Manager)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Security & Biometrics */}
        <Text style={styles.sectionHeader}>Demo preferences</Text>
        <View style={styles.cardGroup}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="finger-print-outline" size={20} color={Colors.primary} />
              <View>
                <Text style={styles.settingTitle}>Quick unlock shortcut</Text>
                <Text style={styles.settingSubtitle}>Demo preference only; no device biometric check runs</Text>
              </View>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={setBiometricsEnabled}
              trackColor={{ false: Colors.cardSecondary, true: Colors.primary }}
              thumbColor="#FFF"
            />
          </View>

          <TouchableOpacity style={styles.settingItem} onPress={handleOpenPayslip}>
            <View style={styles.settingLeft}>
              <Ionicons name="document-text-outline" size={20} color={Colors.warning} />
              <View>
                <Text style={styles.settingTitle}>View payslip breakdown</Text>
                <Text style={styles.settingSubtitle}>Demo tax, retirement, insurance, and net pay</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Release & DevOps Diagnostics (For Heftin AI JD) */}
        <Text style={styles.sectionHeader}>Build configuration</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity style={styles.settingItem} onPress={handleShowStoreSigning}>
            <View style={styles.settingLeft}>
              <Ionicons name="key-outline" size={20} color={Colors.accentLight} />
              <View>
                <Text style={styles.settingTitle}>EAS build profiles</Text>
                <Text style={styles.settingSubtitle}>Preview and production settings</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Package Identifier</Text>
            <Text style={styles.infoValue}>ai.heftin.paypulse</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build Version / Code</Text>
            <Text style={styles.infoValue}>v2.4.0 (104)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mobile Architecture</Text>
            <Text style={styles.infoValue}>React Native New Arch (Fabric + Turbo)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Architecture notes</Text>
            <Text style={styles.infoValue}>React Native implementation + RFC</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Demo environment</Text>
            <Text style={styles.infoValue}>Local state · no real money movement</Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.footerVersion}>
          PayPulse AI · interactive portfolio demo
        </Text>
      </ScrollView>

      <PayslipModal payslip={selectedPayslip} onClose={() => setSelectedPayslip(null)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: Colors.primary,
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  designation: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  department: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 10,
  },
  badgeEmployee: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  badgeManager: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryLight,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginVertical: 10,
    marginLeft: 4,
  },
  switchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.card,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  roleBtnTextActive: {
    color: Colors.onPrimary,
  },
  cardGroup: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    gap: 14,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  settingSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 14,
    paddingVertical: 14,
    marginVertical: 12,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.danger,
  },
  footerVersion: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 8,
  },
});

