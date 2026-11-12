import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../theme/colors';
import { Api } from '../api/endpoints';
import { ExpenseClaim } from '../types';

interface ModalSubmitExpenseProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (newClaim: ExpenseClaim) => void;
}

const CATEGORIES = [
  { id: 'EDUCATION_EDTECH', label: 'EdTech & Learning', icon: 'school-outline', color: Colors.edTech },
  { id: 'TRAVEL', label: 'Travel & Mobility', icon: 'airplane-outline', color: Colors.travel },
  { id: 'HARDWARE_OFFICE', label: 'Hardware / Tech', icon: 'hardware-chip-outline', color: Colors.hardware },
  { id: 'MEALS_ENTERTAINMENT', label: 'Meals & Hospitality', icon: 'restaurant-outline', color: Colors.meals },
];

export const ModalSubmitExpense: React.FC<ModalSubmitExpenseProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('EDUCATION_EDTECH');
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(
    'https://images.unsplash.com/photo-1554415707-9e4901f46487?w=400&auto=format&fit=crop&q=80'
  );
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setReceiptImage(result.assets[0].uri);
      }
    } catch (e) {
      console.log('Error opening image picker:', e);
    }
  };

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter an expense claim title.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Required', 'Please enter a valid expense amount.');
      return;
    }

    setLoading(true);
    try {
      const claim = await Api.submitExpense({
        title: title.trim(),
        category,
        amount: numAmount,
        merchant: merchant.trim() || 'Vendor',
        receiptUrl: receiptImage || undefined,
      });

      Alert.alert('Success! 🎉', 'Expense claim submitted for HR approval.');
      onSuccess(claim);
      onClose();
      // Reset form
      setTitle('');
      setAmount('');
      setMerchant('');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to submit expense claim');
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
              <Text style={styles.title}>Submit Expense Claim</Text>
              <Text style={styles.subtitle}>HR & EdTech Allowance Reimbursement</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Category Selector */}
            <Text style={styles.label}>Select Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryCard,
                      isSelected && { borderColor: cat.color, backgroundColor: `${cat.color}15` },
                    ]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={18}
                      color={isSelected ? cat.color : Colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.categoryCardText,
                        isSelected && { color: cat.color, fontWeight: '700' },
                      ]}
                      numberOfLines={1}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Title */}
            <Text style={styles.label}>Claim Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Flutter & React Native Certification Course"
              placeholderTextColor={Colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            {/* Amount and Merchant */}
            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.label}>Amount ($ USD)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.label}>Merchant / Vendor</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Coursera / Apple"
                  placeholderTextColor={Colors.textMuted}
                  value={merchant}
                  onChangeText={setMerchant}
                />
              </View>
            </View>

            {/* Receipt Attachment */}
            <Text style={styles.label}>Proof of Purchase / Tax Receipt</Text>
            <TouchableOpacity style={styles.uploadArea} onPress={handlePickImage} activeOpacity={0.8}>
              {receiptImage ? (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: receiptImage }} style={styles.receiptPreview} />
                  <View style={styles.changeOverlay}>
                    <Ionicons name="camera-reverse" size={16} color="#FFF" />
                    <Text style={styles.changeText}>Tap to Change</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Ionicons name="cloud-upload-outline" size={28} color={Colors.primary} />
                  <Text style={styles.uploadText}>Attach Invoice / Receipt Photo</Text>
                  <Text style={styles.uploadSubtext}>Supports PNG, JPG, PDF receipt scans</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.disabledBtn]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#0B0F19" />
              ) : (
                <>
                  <Ionicons name="paper-plane" size={18} color="#0B0F19" />
                  <Text style={styles.submitBtnText}>Submit Claim for Approval</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
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
    maxHeight: '88%',
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: Colors.cardSecondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryCardText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    color: Colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },
  uploadArea: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    borderRadius: 14,
    backgroundColor: Colors.background,
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    padding: 16,
  },
  uploadText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 6,
  },
  uploadSubtext: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  previewContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  receiptPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changeOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  changeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 22,
    marginBottom: 20,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#0B0F19',
    fontSize: 15,
    fontWeight: '800',
  },
});

