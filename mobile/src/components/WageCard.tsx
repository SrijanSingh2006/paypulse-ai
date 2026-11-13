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
      {/* Ledger marker */}
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
            <Ionicons name="trending-up" size={11} color="#BFD9D9" />
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
    backgroundColor: Colors.primary,
    borderRadius: 9,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.11,
    shadowRadius: 12,
    elevation: 3,
    marginVertical: 12,
    overflow: 'hidden',
  },
  glowBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: Colors.accent,
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
    backgroundColor: '#294B60',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 4,
    gap: 6,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  pulseText: {
    color: '#F9DDD0',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  dayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#294B60',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 4,
  },
  dayCounter: {
    color: '#D5E0E2',
    fontSize: 11,
    fontWeight: '600',
  },
  balanceSection: {
    marginBottom: 16,
  },
  availableLabel: {
    color: '#BDCCD0',
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
    color: Colors.onPrimary,
    letterSpacing: -1,
    lineHeight: 48,
  },
  changePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#36566A',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
    marginBottom: 6,
  },
  changeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#BFD9D9',
  },
  subtext: {
    color: '#D5E0E2',
    fontSize: 12,
    marginTop: 2,
  },
  boldText: {
    color: Colors.onPrimary,
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
    color: '#BDCCD0',
  },
  progressLabelRight: {
    fontSize: 11,
    color: '#F7C3AB',
    fontWeight: '700',
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#36566A',
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  capMarker: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#FFFDF8',
    opacity: 0.8,
  },
  capText: {
    fontSize: 10,
    color: '#F2C88F',
    marginTop: 4,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#24465A',
    borderRadius: 5,
    padding: 14,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.onPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: '#B9C9CE',
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#496477',
    marginHorizontal: 8,
  },
  advanceButton: {
    backgroundColor: Colors.accent,
    borderRadius: 6,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#3A515D',
    opacity: 0.6,
  },
  advanceButtonText: {
    color: Colors.onPrimary,
    fontSize: 14,
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
    color: '#B9C9CE',
    fontSize: 11,
  },
});
