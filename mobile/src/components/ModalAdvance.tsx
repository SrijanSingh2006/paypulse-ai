import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';
import { Api } from '../api/endpoints';
import { EwaSummary } from '../types';

interface ModalAdvanceProps {
  visible: boolean;
  onClose: () => void;
  summary: EwaSummary | null;
  onSuccess: (updated: EwaSummary) => void;
}

export const ModalAdvance: React.FC<ModalAdvanceProps> = ({
  visible,
  onClose,
  summary,
  onSuccess,
}) => {
  const maxAvailable = summary?.availableToWithdraw ?? 790;
  const [amount, setAmount] = useState<string>('200');
  const [transferType, setTransferType] = useState<'INSTANT_ACH' | 'SAME_DAY_PAYPULSE'>('INSTANT_ACH');
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const numAmount = parseFloat(amount) || 0;

  const handleSelectPreset = (val: number) => {
    const clamped = Math.min(val, maxAvailable);
    setAmount(clamped.toString());
    Haptics.selectionAsync();
  };

  const handleDisburse = async () => {
    if (numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please specify a positive advance amount.');
      return;
    }
    if (numAmount > maxAvailable) {
      Alert.alert('Exceeds Limit', `Maximum available is $${maxAvailable.toFixed(2)}.`);
      return;
    }

    setLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const res = await Api.requestAdvance(numAmount, transferType, note);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Demo advance recorded ⚡',
        `A simulated $${numAmount.toFixed(2)} advance was added to the demo ledger. No funds were moved.`
      );
      onSuccess(res.updatedSummary);
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || e.message || 'Could not process advance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Simulate Wage Advance</Text>
              <Text style={styles.subtitle}>
                Available to withdraw: <Text style={styles.highlight}>${maxAvailable.toFixed(2)}</Text>
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.currencyPrefix}>$</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          {/* Quick Presets */}
          <View style={styles.presetsRow}>
            {[100, 200, 400].map((val) => (
              <TouchableOpacity
                key={val}
                style={[styles.presetBtn, numAmount === val && styles.activePreset]}
                onPress={() => handleSelectPreset(val)}
              >
                <Text style={[styles.presetText, numAmount === val && styles.activePresetText]}>
                  ${val}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.presetBtn, numAmount === maxAvailable && styles.activePreset]}
              onPress={() => handleSelectPreset(maxAvailable)}
            >
              <Text style={[styles.presetText, numAmount === maxAvailable && styles.activePresetText]}>
                Max
              </Text>
            </TouchableOpacity>
          </View>

          {/* Transfer Speed Selector */}
          <Text style={styles.sectionLabel}>Transfer Speed & Route</Text>
          <View style={styles.transferOptions}>
            <TouchableOpacity
              style={[
                styles.optionCard,
                transferType === 'INSTANT_ACH' && styles.optionCardActive,
              ]}
              onPress={() => setTransferType('INSTANT_ACH')}
            >
              <Ionicons
                name="flash"
                size={20}
                color={transferType === 'INSTANT_ACH' ? Colors.primary : Colors.textMuted}
              />
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Instant RTP / ACH</Text>
                <Text style={styles.optionDesc}>Under 2 minutes • 0% Fee</Text>
              </View>
              {transferType === 'INSTANT_ACH' && (
                <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionCard,
                transferType === 'SAME_DAY_PAYPULSE' && styles.optionCardActive,
              ]}
              onPress={() => setTransferType('SAME_DAY_PAYPULSE')}
            >
              <Ionicons
                name="time-outline"
                size={20}
                color={transferType === 'SAME_DAY_PAYPULSE' ? Colors.primary : Colors.textMuted}
              />
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Same-Day Standard</Text>
                <Text style={styles.optionDesc}>By 5:00 PM EST • 0% Fee</Text>
              </View>
              {transferType === 'SAME_DAY_PAYPULSE' && (
                <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Note Input */}
          <TextInput
            style={styles.noteInput}
            placeholder="Add an optional reason (e.g. car maintenance, course)"
            placeholderTextColor={Colors.textMuted}
            value={note}
            onChangeText={setNote}
          />

          {/* Confirm Button */}
          <TouchableOpacity
            style={[styles.disburseBtn, loading && styles.btnDisabled]}
            onPress={handleDisburse}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#0B0F19" />
            ) : (
              <>
                <Ionicons name="arrow-forward-circle" size={20} color="#0B0F19" />
                <Text style={styles.disburseText}>
                  Disburse ${numAmount > 0 ? numAmount.toFixed(2) : '0.00'} Now
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  highlight: {
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderRadius: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currencyPrefix: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
    marginRight: 4,
  },
  amountInput: {
    fontSize: 40,
    fontWeight: '800',
    color: Colors.text,
    minWidth: 120,
    textAlign: 'center',
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    gap: 8,
  },
  presetBtn: {
    flex: 1,
    backgroundColor: Colors.cardSecondary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activePreset: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: Colors.primary,
  },
  presetText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  activePresetText: {
    color: Colors.primary,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  transferOptions: {
    gap: 8,
    marginBottom: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.cardSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionCardActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  optionContent: {
    flex: 1,
    marginLeft: 12,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  optionDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  noteInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    color: Colors.text,
    fontSize: 13,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 18,
  },
  disburseBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  disburseText: {
    color: '#0B0F19',
    fontSize: 16,
    fontWeight: '800',
  },
});

