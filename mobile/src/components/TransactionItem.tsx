import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { EwaTransaction } from '../types';

export const TransactionItem: React.FC<{ item: EwaTransaction }> = ({ item }) => {
  const formattedDate = new Date(item.disbursedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.iconCircle}>
          <Ionicons name="arrow-down" size={18} color={Colors.primary} />
        </View>
        <View style={styles.details}>
          <Text style={styles.noteText} numberOfLines={1}>
            {item.note || 'Wage Advance'}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.accountText}>To {item.destinationAccount}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.amount}>+${item.amount.toFixed(2)}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.transferType === 'INSTANT_ACH' ? 'Instant ACH' : 'PayPulse Standard'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  noteText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  accountText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  dot: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  dateText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  statusBadge: {
    backgroundColor: Colors.cardSecondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});

