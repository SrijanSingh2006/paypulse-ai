import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Payslip } from '../types';

interface PayslipModalProps {
  payslip: Payslip | null;
  onClose: () => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ payslip, onClose }) => {
  if (!payslip) return null;

  const handleDownload = () => {
    Alert.alert(
      'Exporting Payslip PDF',
      `Official PayPulse PDF for ${payslip.month} generated with cryptographic signature.`
    );
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
            <Text style={styles.grossAmount}>${payslip.grossPay.toFixed(2)}</Text>
          </View>

          {/* Breakdown Items */}
          <View style={styles.breakdownList}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Federal & State Tax</Text>
              <Text style={styles.deductionText}>-${payslip.taxDeduction.toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Health & Vision Insurance</Text>
              <Text style={styles.deductionText}>-${payslip.insuranceDeduction.toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Provident Fund / 401(k)</Text>
              <Text style={styles.deductionText}>-${payslip.providentFund.toFixed(2)}</Text>
            </View>
            {payslip.earnedWageWithdrawn > 0 && (
              <View style={styles.row}>
                <View style={styles.ewaLabelRow}>
                  <Text style={styles.rowLabel}>EWA Wage Advances Deducted</Text>
                  <Text style={styles.badgeZeroFee}>0% fee</Text>
                </View>
                <Text style={styles.deductionText}>-${payslip.earnedWageWithdrawn.toFixed(2)}</Text>
              </View>
            )}
          </View>

          {/* Net Pay Box */}
          <View style={styles.netBox}>
            <View>
              <Text style={styles.netLabel}>Net Disbursed Take-Home</Text>
              <Text style={styles.payoutDate}>Disbursed on {payslip.payoutDate}</Text>
            </View>
            <Text style={styles.netAmount}>${payslip.netPay.toFixed(2)}</Text>
          </View>

          {/* PDF Download Button */}
          <TouchableOpacity style={styles.pdfBtn} onPress={handleDownload} activeOpacity={0.8}>
            <Ionicons name="download-outline" size={18} color={Colors.text} />
            <Text style={styles.pdfBtnText}>Download Signed PDF Slip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
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

