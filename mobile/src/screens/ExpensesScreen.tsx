import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { ExpenseItem } from '../components/ExpenseItem';
import { ModalSubmitExpense } from '../components/ModalSubmitExpense';
import { Api } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { ExpenseClaim } from '../types';

const CATEGORY_FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'EDUCATION_EDTECH', label: 'EdTech Perks' },
  { id: 'TRAVEL', label: 'Travel' },
  { id: 'HARDWARE_OFFICE', label: 'Hardware' },
];

export const ExpensesScreen: React.FC = () => {
  const { user } = useAuth();
  const { refreshKey, triggerRefresh, isExpenseModalOpen, setIsExpenseModalOpen } = useApp();

  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const isManager = user?.role === 'HR_MANAGER';

  const loadClaims = async () => {
    try {
      const data = await Api.getExpenses(selectedCategory === 'ALL' ? undefined : selectedCategory);
      setClaims(data);
    } catch (e) {
      console.warn('Error loading expenses:', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, [refreshKey, selectedCategory, user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadClaims();
  };

  const handleApprove = async (id: string) => {
    await Api.reviewExpense(id, 'APPROVE');
    triggerRefresh();
  };

  const handleReject = async (id: string) => {
    await Api.reviewExpense(id, 'REJECT');
    triggerRefresh();
  };

  // EdTech Allowance Calculations
  const edTechClaims = claims.filter((c) => c.category === 'EDUCATION_EDTECH' && c.status === 'APPROVED');
  const edTechSpent = edTechClaims.reduce((sum, c) => sum + c.amount, 0);
  const edTechBudget = 1200.0;
  const edTechRemaining = Math.max(0, edTechBudget - edTechSpent);
  const edTechProgress = Math.min(100, Math.round((edTechSpent / edTechBudget) * 100));

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        <Text style={styles.headerTitle}>
          {isManager ? 'HR Expense Management' : 'Expense & Reimbursements'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {isManager
            ? 'Review and authorize team expense claims, conference travel, and learning stipends.'
            : 'Submit and track corporate claims with instant receipt audit and policy compliance.'}
        </Text>

        {/* Corporate EdTech Allowance Tracker */}
        <View style={styles.stipendCard}>
          <View style={styles.stipendTopRow}>
            <View style={styles.stipendBadge}>
              <Ionicons name="school" size={14} color={Colors.edTech} />
              <Text style={styles.stipendBadgeText}>ANNUAL EDTECH LEARNING PERK</Text>
            </View>
            <Text style={styles.stipendBalanceText}>${edTechRemaining.toFixed(2)} Left</Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View style={[styles.progressFill, { width: `${edTechProgress}%` }]} />
            </View>
          </View>

          <View style={styles.stipendMeta}>
            <Text style={styles.stipendMetaText}>Used: ${edTechSpent.toFixed(2)}</Text>
            <Text style={styles.stipendMetaText}>Annual Stipend: ${edTechBudget.toFixed(2)}</Text>
          </View>
        </View>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {CATEGORY_FILTERS.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.filterChip, active && styles.activeFilterChip]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={[styles.filterChipText, active && styles.activeFilterChipText]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Claims List */}
        <View style={styles.listSection}>
          {claims.length > 0 ? (
            claims.map((claim) => (
              <ExpenseItem
                key={claim.id}
                claim={claim}
                isManager={isManager}
                onApprove={handleApprove}
                onReject={handleReject}
                onViewReceipt={(url) => setPreviewImage(url || null)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="file-tray-outline" size={32} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No claims found in this category.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsExpenseModalOpen(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={26} color="#0B0F19" />
      </TouchableOpacity>

      {/* Submit Claim Modal */}
      <ModalSubmitExpense
        visible={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={() => triggerRefresh()}
      />

      {/* Receipt Image Lightbox Preview Modal */}
      <Modal visible={!!previewImage} transparent animationType="fade">
        <View style={styles.lightboxOverlay}>
          <View style={styles.lightboxContainer}>
            <View style={styles.lightboxHeader}>
              <Text style={styles.lightboxTitle}>Tax Receipt Invoice</Text>
              <TouchableOpacity onPress={() => setPreviewImage(null)}>
                <Ionicons name="close-circle" size={26} color={Colors.text} />
              </TouchableOpacity>
            </View>
            {previewImage && (
              <Image source={{ uri: previewImage }} style={styles.lightboxImage} />
            )}
          </View>
        </View>
      </Modal>
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
    paddingBottom: 80,
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
    marginBottom: 12,
    lineHeight: 18,
  },
  stipendCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  stipendTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stipendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stipendBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.edTech,
  },
  stipendBalanceText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  progressContainer: {
    marginVertical: 4,
  },
  progressBackground: {
    height: 8,
    backgroundColor: Colors.cardSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.edTech,
    borderRadius: 4,
  },
  stipendMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  stipendMetaText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: Colors.cardSecondary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeFilterChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeFilterChipText: {
    color: '#0B0F19',
    fontWeight: '700',
  },
  listSection: {
    gap: 2,
  },
  emptyContainer: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  lightboxOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lightboxContainer: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  lightboxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lightboxTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  lightboxImage: {
    width: '100%',
    height: 320,
    resizeMode: 'contain',
    backgroundColor: '#000',
  },
});

