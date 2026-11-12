import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Payslip } from '../types';
import { formatINR } from '../utils/currency';

interface PayslipModalProps {
  payslip: Payslip | null;
  onClose: () => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ payslip, onClose }) => {
  if (!payslip) return null;

  const handleExport = async () => {
    const rows = [
      ['PayPulse demo payslip', payslip.month],
      ['Pay period', payslip.payPeriod],
      ['Gross salary', formatINR(payslip.grossPay)],
      ['Income tax and TDS', `-${formatINR(payslip.taxDeduction)}`],
      ['Health insurance', `-${formatINR(payslip.insuranceDeduction)}`],
      ['Employee Provident Fund', `-${formatINR(payslip.providentFund)}`],
      ['Earned wage advance', `-${formatINR(payslip.earnedWageWithdrawn)}`],
      ['Net pay', formatINR(payslip.netPay)],
      ['Payout date', payslip.payoutDate],
      ['Status', payslip.status],
    ];
    const csv = rows.map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(',')).join('\n');
    const fileName = `paypulse-payslip-${payslip.month.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`;

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = href;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(href);
      return;
    }

    await Share.share({ title: `${payslip.month} PayPulse payslip`, message: csv });
  };

  return (
    <Modal visible={!!payslip} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Payslip Breakdown</Text>
              <Text style={styles.period}>{payslip.payPeriod}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Gross Box */}
          <View style={styles.grossBox}>
            <Text style={styles.grossLabel}>Total Gross Salary</Text>
            <Text style={styles.grossAmount}>{formatINR(payslip.grossPay)}</Text>
          </View>

          {/* Breakdown Items */}
          <View style={styles.breakdownList}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Income tax & TDS</Text>
              <Text style={styles.deductionText}>−{formatINR(payslip.taxDeduction)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Health & Vision Insurance</Text>
              <Text style={styles.deductionText}>−{formatINR(payslip.insuranceDeduction)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Employee Provident Fund</Text>
              <Text style={styles.deductionText}>−{formatINR(payslip.providentFund)}</Text>
            </View>
            {payslip.earnedWageWithdrawn > 0 && (
              <View style={styles.row}>
                <View style={styles.ewaLabelRow}>
                  <Text style={styles.rowLabel}>EWA Wage Advances Deducted</Text>
                  <Text style={styles.badgeZeroFee}>0% fee</Text>
                </View>
                <Text style={styles.deductionText}>−{formatINR(payslip.earnedWageWithdrawn)}</Text>
              </View>
            )}
          </View>

          {/* Net Pay Box */}
          <View style={styles.netBox}>
            <View>
              <Text style={styles.netLabel}>Net Disbursed Take-Home</Text>
              <Text style={styles.payoutDate}>Disbursed on {payslip.payoutDate}</Text>
            </View>
            <Text style={styles.netAmount}>{formatINR(payslip.netPay)}</Text>
          </View>

          {/* Export Button */}
          <TouchableOpacity style={styles.pdfBtn} onPress={handleExport} activeOpacity={0.8}>
            <Ionicons name="download-outline" size={18} color={Colors.text} />
            <Text style={styles.pdfBtnText}>Export payslip summary</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 35, 28, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  period: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grossBox: {
    backgroundColor: Colors.cardSecondary,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  grossLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  grossAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 2,
  },
  breakdownList: {
    gap: 12,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ewaLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeZeroFee: {
    fontSize: 10,
    color: Colors.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    fontWeight: '700',
  },
  rowLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  deductionText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.danger,
  },
  netBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  netLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryLight,
  },
  payoutDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  netAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
  },
  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  pdfBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
});

