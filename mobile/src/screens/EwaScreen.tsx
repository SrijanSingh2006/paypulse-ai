import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { WageCard } from '../components/WageCard';
import { TransactionItem } from '../components/TransactionItem';
import { ModalAdvance } from '../components/ModalAdvance';
import { Api } from '../api/endpoints';
import { useApp } from '../context/AppContext';
import { EwaSummary } from '../types';

export const EwaScreen: React.FC = () => {
  const { refreshKey, triggerRefresh, isAdvanceModalOpen, setIsAdvanceModalOpen } = useApp();
  const [summary, setSummary] = useState<EwaSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadEwa = async () => {
    try {
      const data = await Api.getEwaSummary();
      setSummary(data);
    } catch (e) {
      console.warn('Error loading EWA:', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEwa();
  }, [refreshKey]);

  const onRefresh = () => {
    setRefreshing(true);
    loadEwa();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        <Text style={styles.headerTitle}>Earned Wage Access (EWA)</Text>
        <Text style={styles.headerSubtitle}>
          Access wages you've already worked for before month-end payday with zero predatory interest.
        </Text>

        <WageCard
          summary={summary}
          onRequestAdvance={() => setIsAdvanceModalOpen(true)}
        />

        {/* Accrual Mechanics Breakdown Card */}
        <View style={styles.metricsCard}>
          <Text style={styles.cardHeader}>Accrual Formula & Limits</Text>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Monthly Base Salary</Text>
            <Text style={styles.metricValue}>${summary?.monthlySalary.toFixed(2) || '7,200.00'}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Daily Accrual Rate (30-day)</Text>
            <Text style={styles.metricValue}>${summary?.dailyEarnings.toFixed(2) || '240.00'} / day</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Days Accrued This Cycle</Text>
            <Text style={styles.metricValue}>{summary?.currentDayOfMonth || 12} days</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Gross Accrued</Text>
            <Text style={styles.metricValueHighlight}>${summary?.grossAccruedToDate.toFixed(2) || '2,880.00'}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Company Liquidity Cap (50%)</Text>
            <Text style={styles.metricValue}>${summary?.maxEligibleAccrual.toFixed(2) || '1,440.00'}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Disbursed Advance Balance</Text>
            <Text style={styles.metricValueDanger}>-${summary?.withdrawnToDate.toFixed(2) || '650.00'}</Text>
          </View>
        </View>

        {/* Bank Account Details Card */}
        <View style={styles.bankCard}>
          <View style={styles.bankLeft}>
            <Ionicons name="card-outline" size={24} color={Colors.primary} />
            <View>
              <Text style={styles.bankName}>{summary?.bankAccount.bankName || 'Silicon Valley Bank'}</Text>
              <Text style={styles.bankAccount}>{summary?.bankAccount.accountMasked || '•••• 4829'} • Checking</Text>
            </View>
          </View>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        </View>

        {/* Transactions Ledger */}
        <Text style={styles.sectionTitle}>Disbursement History</Text>
        {summary?.transactions && summary.transactions.length > 0 ? (
          summary.transactions.map((tx) => (
            <TransactionItem key={tx.id} item={tx} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={32} color={Colors.textMuted} />
            <Text style={styles.emptyStateText}>No wage advances on record this cycle.</Text>
          </View>
        )}
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 8,
    lineHeight: 18,
  },
  metricsCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: 10,
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 14,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  metricLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  metricValueHighlight: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primaryLight,
  },
  metricValueDanger: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.danger,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  bankCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  bankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bankName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  bankAccount: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: Colors.card,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateText: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 8,
  },
});

