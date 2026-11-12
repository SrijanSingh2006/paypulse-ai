import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { EwaSummary } from '../types';

interface WageCardProps {
  summary: EwaSummary | null;
  onRequestAdvance: () => void;
  isLoading?: boolean;
}

export const WageCard: React.FC<WageCardProps> = ({ summary, onRequestAdvance, isLoading }) => {
  const available = summary ? summary.availableToWithdraw : 790;
  const accrued = summary ? summary.grossAccruedToDate : 2880;
  const monthly = summary ? summary.monthlySalary : 7200;
  const currentDay = summary ? summary.currentDayOfMonth : 12;
  const daysInMonth = summary ? summary.daysInMonth : 30;

  // Accrual progress percentage (e.g. 12/30 = 40%)
  const monthProgress = Math.min(100, Math.round((currentDay / daysInMonth) * 100));

  return (
    <View style={styles.cardContainer}>
      <View style={styles.topRow}>
        <View style={styles.pulseBadge}>
          <View style={styles.pulseDot} />
          <Text style={styles.pulseText}>EARNED WAGE PULSE</Text>
        </View>
        <Text style={styles.dayCounter}>Day {currentDay} of {daysInMonth}</Text>
      </View>

      <View style={styles.balanceSection}>
        <Text style={styles.availableLabel}>Available to Disburse Today</Text>
        <View style={styles.amountRow}>
          <Text style={styles.currencySymbol}>$</Text>
          <Text style={styles.amountText}>{available.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        </View>
        <Text style={styles.subtext}>
          Accrued so far: <Text style={styles.boldText}>${accrued.toFixed(2)}</Text> of ${monthly.toFixed(2)} gross
        </Text>
      </View>

      {/* Accrual Progress Bar */}
      <View style={styles.progressBarWrapper}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${monthProgress}%` }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabelText}>Payroll Month: {monthProgress}% elapsed</Text>
          <Text style={styles.progressLabelText}>50% Liquidity Cap</Text>
        </View>
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={[styles.advanceButton, available <= 0 && styles.disabledButton]}
        onPress={onRequestAdvance}
        disabled={available <= 0 || isLoading}
        activeOpacity={0.85}
      >
        <Ionicons name="flash" size={18} color="#0B0F19" />
        <Text style={styles.advanceButtonText}>
          {available > 0 ? 'Request Instant Advance' : 'Advance Limit Reached'}
        </Text>
      </TouchableOpacity>

      <View style={styles.footerNote}>
        <Ionicons name="shield-checkmark-outline" size={13} color={Colors.textMuted} />
        <Text style={styles.footerNoteText}>
          0% Interest • No Credit Check • Deposited to {summary?.bankAccount.accountMasked || '•••• 4829'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    marginVertical: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pulseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  pulseText: {
    color: Colors.primaryLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  dayCounter: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  balanceSection: {
    marginVertical: 8,
  },
  availableLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 4,
    marginRight: 2,
  },
  amountText: {
    fontSize: 38,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtext: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  boldText: {
    color: Colors.text,
    fontWeight: '600',
  },
  progressBarWrapper: {
    marginVertical: 14,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: Colors.cardSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressLabelText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  advanceButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  disabledButton: {
    backgroundColor: Colors.cardSecondary,
    opacity: 0.6,
  },
  advanceButtonText: {
    color: '#0B0F19',
    fontSize: 15,
    fontWeight: '700',
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  footerNoteText: {
    color: Colors.textMuted,
    fontSize: 11,
  },
});

