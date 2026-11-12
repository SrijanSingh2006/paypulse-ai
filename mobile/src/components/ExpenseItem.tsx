import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { ExpenseClaim } from '../types';

interface ExpenseItemProps {
  claim: ExpenseClaim;
  isManager?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onViewReceipt?: (url?: string) => void;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({
  claim,
  isManager,
  onApprove,
  onReject,
  onViewReceipt,
}) => {
  const getCategoryMeta = (cat: string) => {
    switch (cat) {
      case 'EDUCATION_EDTECH':
        return { label: 'EdTech & Learning', color: Colors.edTech, icon: 'school-outline' };
      case 'TRAVEL':
        return { label: 'Travel & Mobility', color: Colors.travel, icon: 'airplane-outline' };
      case 'HARDWARE_OFFICE':
        return { label: 'Hardware & Tech', color: Colors.hardware, icon: 'hardware-chip-outline' };
      case 'MEALS_ENTERTAINMENT':
        return { label: 'Client Meals', color: Colors.meals, icon: 'restaurant-outline' };
      default:
        return { label: 'General Expense', color: Colors.accent, icon: 'receipt-outline' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { text: 'Approved', bg: 'rgba(16, 185, 129, 0.15)', textCol: Colors.success };
      case 'REJECTED':
        return { text: 'Rejected', bg: 'rgba(239, 68, 68, 0.15)', textCol: Colors.danger };
      default:
        return { text: 'Pending Review', bg: 'rgba(245, 158, 11, 0.15)', textCol: Colors.warning };
    }
  };

  const catMeta = getCategoryMeta(claim.category);
  const statusMeta = getStatusBadge(claim.status);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.categoryPill, { backgroundColor: `${catMeta.color}22` }]}>
          <Ionicons name={catMeta.icon as any} size={12} color={catMeta.color} />
          <Text style={[styles.categoryText, { color: catMeta.color }]}>{catMeta.label}</Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
          <Text style={[styles.statusText, { color: statusMeta.textCol }]}>{statusMeta.text}</Text>
        </View>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.leftCol}>
          <Text style={styles.title} numberOfLines={2}>{claim.title}</Text>
          <Text style={styles.merchant}>{claim.merchant} • {claim.date}</Text>
          {isManager && (
            <Text style={styles.employeeName}>Submitted by: <Text style={styles.bold}>{claim.employeeName}</Text></Text>
          )}
        </View>
        <View style={styles.rightCol}>
          <Text style={styles.amount}>${claim.amount.toFixed(2)}</Text>
        </View>
      </View>

      {claim.approvalNotes && (
        <View style={styles.notesBox}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.notesText}>{claim.approvalNotes}</Text>
        </View>
      )}

      {/* Action Row */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.receiptButton}
          onPress={() => onViewReceipt && onViewReceipt(claim.receiptUrl)}
          activeOpacity={0.7}
        >
          <Ionicons name="document-attach-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.receiptButtonText}>View Receipt Attached</Text>
        </TouchableOpacity>

        {isManager && claim.status === 'PENDING' && (
          <View style={styles.managerActionButtons}>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => onReject && onReject(claim.id)}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={14} color={Colors.danger} />
              <Text style={styles.rejectText}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.approveBtn}
              onPress={() => onApprove && onApprove(claim.id)}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark" size={14} color="#FFF" />
              <Text style={styles.approveText}>Approve</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftCol: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 20,
  },
  merchant: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  employeeName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  bold: {
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  notesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardSecondary,
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    gap: 6,
  },
  notesText: {
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  receiptButtonText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  managerActionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  rejectText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.danger,
  },
  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: Colors.success,
  },
  approveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0B0F19',
  },
});

