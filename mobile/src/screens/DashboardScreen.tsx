import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { WageCard } from '../components/WageCard';
import { VersionUpdateBanner } from '../components/VersionUpdateBanner';
import { ModalAdvance } from '../components/ModalAdvance';
import { ModalSubmitExpense } from '../components/ModalSubmitExpense';
import { PayslipModal } from '../components/PayslipModal';
import { TransactionItem } from '../components/TransactionItem';
import { ExpenseItem } from '../components/ExpenseItem';
import { Api } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { EwaSummary, ExpenseClaim, Payslip } from '../types';

const QUICK_ACTIONS = [
  {
    key: 'advance',
    icon: 'flash' as const,
    iconColor: Colors.primary,
    iconBg: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    title: 'Advance Wage',
    sub: 'Demo ledger · no fee',
  },
  {
    key: 'claim',
    icon: 'receipt' as const,
    iconColor: Colors.edTech,
    iconBg: 'rgba(139, 92, 246, 0.12)',
    borderColor: 'rgba(139, 92, 246, 0.2)',
    title: 'Submit Claim',
    sub: 'EdTech & Travel',
  },
  {
    key: 'allowance',
    icon: 'stats-chart' as const,
    iconColor: Colors.info,
    iconBg: 'rgba(59, 130, 246, 0.12)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
    title: 'Allowance Hub',
    sub: '\$1,200 Cap',
  },
  {
    key: 'payslip',
    icon: 'document-text' as const,
    iconColor: Colors.warning,
    iconBg: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
    title: 'Latest Payslip',
    sub: 'Oct 2026 Ready',
  },
];

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const wideLayout = width >= 900;
  const { user } = useAuth();
  const {
    refreshKey,
    triggerRefresh,
    selectedPayslip,
    setSelectedPayslip,
    isAdvanceModalOpen,
    setIsAdvanceModalOpen,
    isExpenseModalOpen,
    setIsExpenseModalOpen,
  } = useApp();

  const [summary, setSummary] = useState<EwaSummary | null>(null);
  const [expenses, setExpenses] = useState<ExpenseClaim[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isManager = user?.role === 'HR_MANAGER';

  const loadData = async () => {
    try {
      const [sumData, expData, payData] = await Promise.all([
        Api.getEwaSummary(),
        Api.getExpenses(),
        Api.getPayslips(),
      ]);
      setSummary(sumData);
      setExpenses(expData);
      setPayslips(payData);
    } catch (e) {
      console.warn('Dashboard load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshKey, user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleApprove = async (id: string) => {
    try {
      await Api.reviewExpense(id, 'APPROVE');
      triggerRefresh();
    } catch (error: any) {
      Alert.alert('Could not approve claim', error.response?.data?.message || error.message || 'Please try again.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await Api.reviewExpense(id, 'REJECT');
      triggerRefresh();
    } catch (error: any) {
      Alert.alert('Could not reject claim', error.response?.data?.message || error.message || 'Please try again.');
    }
  };

  const handleActionPress = (key: string) => {
    if (key === 'advance') setIsAdvanceModalOpen(true);
    else if (key === 'claim') setIsExpenseModalOpen(true);
    else if (key === 'allowance') navigation.navigate('Expenses');
    else if (key === 'payslip' && payslips.length > 0) setSelectedPayslip(payslips[0]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your pulse…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header onNotificationPress={() => navigation.navigate('Notifications')} />
      <VersionUpdateBanner />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Wage Pulse Card */}
        <WageCard
          summary={summary}
          onRequestAdvance={() => setIsAdvanceModalOpen(true)}
          isLoading={loading}
        />

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.gridRow}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={[styles.actionCard, wideLayout && styles.actionCardWide, { borderColor: action.borderColor }]}
              onPress={() => handleActionPress(action.key)}
              activeOpacity={0.78}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: action.iconBg }]}>
                <Ionicons name={action.icon} size={21} color={action.iconColor} />
              </View>
              <Text style={styles.actionCardTitle}>{action.title}</Text>
              <Text style={styles.actionCardSubtitle}>{action.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.copilotCard}
          onPress={() => navigation.navigate('Copilot')}
          activeOpacity={0.82}
        >
          <View style={styles.copilotIcon}>
            <Ionicons name="sparkles" size={19} color={Colors.accentLight} />
          </View>
          <View style={styles.copilotCopy}>
            <Text style={styles.copilotEyebrow}>PAYPULSE AI</Text>
            <Text style={styles.copilotTitle}>Your benefits, answered</Text>
            <Text style={styles.copilotSubtitle}>Ask about pay, claims, and your learning allowance.</Text>
          </View>
          <Ionicons name="arrow-forward" size={17} color={Colors.accentLight} />
        </TouchableOpacity>

        {/* Recent Wage Advances */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Recent Wage Advances</Text>
          </View>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => navigation.navigate('FinTech')}
          >
            <Text style={styles.seeAllText}>Ledger</Text>
            <Ionicons name="chevron-forward" size={12} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {summary?.transactions && summary.transactions.length > 0 ? (
          summary.transactions.slice(0, 2).map((item) => (
            <TransactionItem key={item.id} item={item} />
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="wallet-outline" size={30} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No advances yet</Text>
            <Text style={styles.emptyText}>Your wage advance history will appear here.</Text>
          </View>
        )}

        {/* Expense Claims */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            {isManager ? 'Pending Review' : 'Your Expense Claims'}
          </Text>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => navigation.navigate('Expenses')}
          >
            <Text style={styles.seeAllText}>View All ({expenses.length})</Text>
            <Ionicons name="chevron-forward" size={12} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {expenses.length > 0 ? (
          expenses.slice(0, 3).map((item) => (
            <ExpenseItem
              key={item.id}
              claim={item}
              isManager={isManager}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="folder-open-outline" size={30} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No claims found</Text>
            <Text style={styles.emptyText}>Submit a new claim to get started.</Text>
          </View>
        )}

        {/* Build Footer */}
        <View style={styles.buildFooter}>
          <Ionicons name="code-slash-outline" size={12} color={Colors.textMuted} />
          <Text style={styles.buildText}>Portfolio demo · React Native · Expo SDK 52</Text>
        </View>
      </ScrollView>

      <ModalAdvance
        visible={isAdvanceModalOpen}
        onClose={() => setIsAdvanceModalOpen(false)}
        summary={summary}
        onSuccess={(updated) => {
          setSummary(updated);
          triggerRefresh();
        }}
      />

      <ModalSubmitExpense
        visible={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={() => triggerRefresh()}
      />

      <PayslipModal
        payslip={selectedPayslip}
        onClose={() => setSelectedPayslip(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 48,
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
    marginBottom: 10,
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 2,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 4,
  },
  copilotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.09)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.26)',
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
    marginBottom: 6,
  },
  copilotIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
  },
  copilotCopy: {
    flex: 1,
  },
  copilotEyebrow: {
    color: Colors.accentLight,
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: '800',
  },
  copilotTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  copilotSubtitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },
  actionCard: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
  },
  actionCardWide: {
    width: '23.5%',
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
  actionCardSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 3,
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  emptyTitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  buildFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  buildText: {
    color: Colors.textMuted,
    fontSize: 10,
  },
});
