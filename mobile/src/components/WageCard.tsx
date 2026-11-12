import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { EwaSummary } from '../types';
import { formatINR } from '../utils/currency';

interface WageCardProps {
  summary: EwaSummary | null;
  onRequestAdvance: () => void;
  isLoading?: boolean;
}

export const WageCard: React.FC<WageCardProps> = ({ summary, onRequestAdvance, isLoading }) => {
  const available = summary ? summary.availableToWithdraw : 19500;
  const accrued = summary ? summary.grossAccruedToDate : 52000;
  const monthly = summary ? summary.monthlySalary : 120000;
  const currentDay = summary ? summary.currentDayOfMonth : 13;
  const daysInMonth = summary ? summary.daysInMonth : 30;

  const monthProgress = Math.min(100, Math.round((currentDay / daysInMonth) * 100));
  const availablePct = Math.min(100, Math.round((available / monthly) * 100));

  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: monthProgress,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [monthProgress]);

  return (
    <View style={styles.cardContainer}>
      {/* Glow top border accent */}
      <View style={styles.glowBorder} />

      <View style={styles.topRow}>
        <View style={styles.pulseBadge}>
          <View style={styles.pulseDot} />
          <Text style={styles.pulseText}>EARNED WAGE PULSE</Text>
        </View>
        <View style={styles.dayPill}>
          <Ionicons name="calendar-outline" size={11} color={Colors.textMuted} />
          <Text style={styles.dayCounter}>Day {currentDay}/{daysInMonth}</Text>
        </View>
      </View>

      <View style={styles.balanceSection}>
        <Text style={styles.availableLabel}>Available in Demo Ledger</Text>
        <View style={styles.amountRow}>
          <Text style={styles.amountText}>
            {formatINR(available)}
          </Text>
          <View style={styles.changePill}>
            <Ionicons name="trending-up" size={11} color={Colors.primary} />
            <Text style={styles.changeText}>{availablePct}% liquid</Text>
          </View>
        </View>
        <Text style={styles.subtext}>
          Accrued so far:{' '}
          <Text style={styles.boldText}>{formatINR(accrued)}</Text>{' '}
          of {formatINR(monthly)} gross
        </Text>
      </View>

      {/* Animated Accrual Progress */}
      <View style={styles.progressBarWrapper}>
        <View style={styles.progressLabelsTop}>
          <Text style={styles.progressLabelLeft}>Payroll accrual progress</Text>
          <Text style={styles.progressLabelRight}>{monthProgress}%</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: animWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
          {/* 50% cap marker */}
          <View style={styles.capMarker} />
        </View>
        <Text style={styles.capText}>50% liquidity cap</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatINR(summary?.dailyEarnings ?? 4000, 0)}</Text>
          <Text style={styles.statLabel}>Daily Rate</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatINR(summary?.withdrawnToDate ?? 6500, 0)}</Text>
          <Text style={[styles.statLabel, { color: Colors.danger }]}>Disbursed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatINR(summary?.maxEligibleAccrual ?? 26000, 0)}</Text>
          <Text style={styles.statLabel}>Eligible Cap</Text>
        </View>
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={[styles.advanceButton, available <= 0 && styles.disabledButton]}
        onPress={onRequestAdvance}
        disabled={available <= 0 || isLoading}
        activeOpacity={0.85}
      >
        <Ionicons name="flash" size={18} color={Colors.onPrimary} />
        <Text style={styles.advanceButtonText}>
          {available > 0 ? 'Simulate Wage Advance' : 'Advance Limit Reached'}
        </Text>
      </TouchableOpacity>

      <View style={styles.footerNote}>
        <Ionicons name="shield-checkmark-outline" size={12} color={Colors.textMuted} />
        <Text style={styles.footerNoteText}>
          Demo ledger · no real funds move · {summary?.bankAccount.accountMasked || '•••• 4829'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 5,
    marginVertical: 10,
    overflow: 'hidden',
  },
  glowBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primary,
    opacity: 0.7,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  pulseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryTint,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  pulseText: {
    color: Colors.primaryLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  dayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.cardSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayCounter: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  balanceSection: {
    marginBottom: 16,
  },
  availableLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
    gap: 6,
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  amountText: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -1,
    lineHeight: 48,
  },
  changePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.primaryTint,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  changeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  subtext: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  boldText: {
    color: Colors.text,
    fontWeight: '700',
  },
  progressBarWrapper: {
    marginBottom: 16,
  },
  progressLabelsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabelLeft: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  progressLabelRight: {
    fontSize: 11,
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: Colors.cardSecondary,
    borderRadius: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 5,
  },
  capMarker: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: Colors.warning,
    opacity: 0.8,
  },
  capText: {
    fontSize: 10,
    color: Colors.warning,
    marginTop: 4,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.cardSecondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  advanceButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  disabledButton: {
    backgroundColor: Colors.cardSecondary,
    opacity: 0.6,
  },
  advanceButtonText: {
    color: Colors.onPrimary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 12,
  },
  footerNoteText: {
    color: Colors.textMuted,
    fontSize: 11,
  },
});
