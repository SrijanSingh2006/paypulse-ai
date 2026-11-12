import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
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

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
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
    await Api.reviewExpense(id, 'APPROVE');
    triggerRefresh();
  };

  const handleReject = async (id: string) => {
    await Api.reviewExpense(id, 'REJECT');
    triggerRefresh();
  };

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
        {/* Top FinTech Wage Pulse Card */}
        <WageCard
          summary={summary}
          onRequestAdvance={() => setIsAdvanceModalOpen(true)}
          isLoading={loading}
        />

        {/* Quick Action Tiles */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.gridRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setIsAdvanceModalOpen(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name="flash" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.actionCardTitle}>Advance Wage</Text>
            <Text style={styles.actionCardSubtitle}>Instant 0% APR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setIsExpenseModalOpen(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
              <Ionicons name="receipt" size={20} color={Colors.edTech} />
            </View>
            <Text style={styles.actionCardTitle}>Submit Claim</Text>
            <Text style={styles.actionCardSubtitle}>EdTech & Travel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Expenses')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Ionicons name="stats-chart" size={20} color={Colors.info} />
            </View>
            <Text style={styles.actionCardTitle}>Allowance Hub</Text>
            <Text style={styles.actionCardSubtitle}>$1,200 Cap</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => {
              if (payslips.length > 0) setSelectedPayslip(payslips[0]);
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Ionicons name="document-text" size={20} color={Colors.warning} />
            </View>
            <Text style={styles.actionCardTitle}>Latest Payslip</Text>
            <Text style={styles.actionCardSubtitle}>Oct 2026 Ready</Text>
          </TouchableOpacity>
        </View>

        {/* Recent EWA Advances */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Wage Advances</Text>
          <TouchableOpacity onPress={() => navigation.navigate('FinTech')}>
            <Text style={styles.seeAllText}>Ledger</Text>
          </TouchableOpacity>
        </View>

        {summary?.transactions && summary.transactions.length > 0 ? (
          summary.transactions.slice(0, 2).map((item) => (
            <TransactionItem key={item.id} item={item} />
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="wallet-outline" size={28} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No salary advances taken this month.</Text>
          </View>
        )}

        {/* HR Expense Reimbursements */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            {isManager ? 'Pending Review Requests' : 'Your Expense Claims'}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Expenses')}>
            <Text style={styles.seeAllText}>View All ({expenses.length})</Text>
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
            <Ionicons name="folder-open-outline" size={28} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No recent expense claims recorded.</Text>
          </View>
        )}
      </ScrollView>

      {/* Modals */}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
    marginVertical: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 4,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  actionCard: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  actionCardSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 8,
  },
});

