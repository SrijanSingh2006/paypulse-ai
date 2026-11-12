import { apiClient, fallbackStore, isWebProduction } from './client';
import { User, EwaSummary, ExpenseClaim, AppNotification, Payslip, ReleaseInfo } from '../types';

export const Api = {
  // Auth
  async login(email: string, password?: string): Promise<{ token: string; user: User }> {
    if (isWebProduction) {
      const isManager = email.toLowerCase().includes('manager');
      const mockUser: User = isManager
        ? {
            id: 'usr_heftin_002',
            name: 'Sarah Chen',
            email: 'manager@heftin.ai',
            role: 'HR_MANAGER',
            designation: 'VP of People & Culture',
            department: 'Human Resources & Operations',
            monthlySalary: 9500,
            availableWageLimitRatio: 0.5,
            bankAccount: {
              bankName: 'JPMorgan Chase',
              accountMasked: '•••• 9012',
              routingNumber: '021000021',
            },
            avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
          }
        : fallbackStore.user;

      return {
        token: 'mock_jwt_token_demo_mode',
        user: mockUser,
      };
    }

    try {
      const res = await apiClient.post('/auth/login', { email, password });
      return res.data;
    } catch (e) {
      console.log('[API Offline Fallback] login fallback activated');
      const isManager = email.toLowerCase().includes('manager');
      const mockUser: User = isManager
        ? {
            id: 'usr_heftin_002',
            name: 'Sarah Chen',
            email: 'manager@heftin.ai',
            role: 'HR_MANAGER',
            designation: 'VP of People & Culture',
            department: 'Human Resources & Operations',
            monthlySalary: 9500,
            availableWageLimitRatio: 0.5,
            bankAccount: {
              bankName: 'JPMorgan Chase',
              accountMasked: '•••• 9012',
              routingNumber: '021000021',
            },
            avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
          }
        : fallbackStore.user;

      return {
        token: 'mock_jwt_token_demo_mode',
        user: mockUser,
      };
    }
  },

  async switchRole(role: 'EMPLOYEE' | 'HR_MANAGER'): Promise<{ token: string; user: User }> {
    if (isWebProduction) {
      const email = role === 'HR_MANAGER' ? 'manager@heftin.ai' : 'employee@heftin.ai';
      return Api.login(email);
    }
    try {
      const res = await apiClient.post('/auth/demo-switch', { role });
      return res.data;
    } catch (e) {
      const email = role === 'HR_MANAGER' ? 'manager@heftin.ai' : 'employee@heftin.ai';
      return Api.login(email);
    }
  },

  // EWA / FinTech
  async getEwaSummary(): Promise<EwaSummary> {
    if (isWebProduction) {
      return fallbackStore.summary;
    }
    try {
      const res = await apiClient.get('/ewa/summary');
      return res.data.data;
    } catch (e) {
      console.log('[API Offline Fallback] EWA summary fallback activated');
      return fallbackStore.summary;
    }
  },

  async requestAdvance(amount: number, transferType: string, note?: string): Promise<{ success: boolean; message: string; updatedSummary: EwaSummary }> {
    if (isWebProduction) {
      fallbackStore.summary.withdrawnToDate += amount;
      fallbackStore.summary.availableToWithdraw = Math.max(0, fallbackStore.summary.availableToWithdraw - amount);
      fallbackStore.summary.transactions.unshift({
        id: `tx_ewa_${Date.now().toString().slice(-5)}`,
        userId: fallbackStore.user.id,
        amount,
        fee: 0,
        status: 'COMPLETED',
        disbursedAt: new Date().toISOString(),
        transferType: transferType as any,
        destinationAccount: '•••• 4829',
        note: note || 'On-demand wage transfer',
      });
      return {
        success: true,
        message: `$${amount.toFixed(2)} disbursed instantly via ${transferType}.`,
        updatedSummary: { ...fallbackStore.summary },
      };
    }
    try {
      const res = await apiClient.post('/ewa/request-advance', { amount, transferType, note });
      return res.data;
    } catch (e) {
      console.log('[API Offline Fallback] Advance simulated');
      fallbackStore.summary.withdrawnToDate += amount;
      fallbackStore.summary.availableToWithdraw = Math.max(0, fallbackStore.summary.availableToWithdraw - amount);
      fallbackStore.summary.transactions.unshift({
        id: `tx_ewa_${Date.now().toString().slice(-5)}`,
        userId: fallbackStore.user.id,
        amount,
        fee: 0,
        status: 'COMPLETED',
        disbursedAt: new Date().toISOString(),
        transferType: transferType as any,
        destinationAccount: '•••• 4829',
        note: note || 'On-demand wage transfer',
      });
      return {
        success: true,
        message: `$${amount.toFixed(2)} disbursed instantly via ${transferType}.`,
        updatedSummary: { ...fallbackStore.summary },
      };
    }
  },

  // HR Expenses
  async getExpenses(status?: string): Promise<ExpenseClaim[]> {
    if (isWebProduction) {
      return fallbackStore.claims;
    }
    try {
      const res = await apiClient.get('/expenses', { params: { status } });
      return res.data.claims;
    } catch (e) {
      return fallbackStore.claims;
    }
  },

  async submitExpense(data: {
    title: string;
    category: string;
    amount: number;
    merchant: string;
    receiptUrl?: string;
  }): Promise<ExpenseClaim> {
    if (isWebProduction) {
      const newClaim: ExpenseClaim = {
        id: `exp_${Date.now().toString().slice(-5)}`,
        userId: fallbackStore.user.id,
        employeeName: fallbackStore.user.name,
        title: data.title,
        category: data.category as any,
        amount: data.amount,
        currency: 'USD',
        merchant: data.merchant,
        date: new Date().toISOString().split('T')[0],
        receiptUrl: data.receiptUrl,
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
      };
      fallbackStore.claims.unshift(newClaim);
      return newClaim;
    }
    try {
      const res = await apiClient.post('/expenses', data);
      return res.data.claim;
    } catch (e) {
      const newClaim: ExpenseClaim = {
        id: `exp_${Date.now().toString().slice(-5)}`,
        userId: fallbackStore.user.id,
        employeeName: fallbackStore.user.name,
        title: data.title,
        category: data.category as any,
        amount: data.amount,
        currency: 'USD',
        merchant: data.merchant,
        date: new Date().toISOString().split('T')[0],
        receiptUrl: data.receiptUrl,
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
      };
      fallbackStore.claims.unshift(newClaim);
      return newClaim;
    }
  },

  async reviewExpense(id: string, decision: 'APPROVE' | 'REJECT', notes?: string): Promise<ExpenseClaim> {
    if (isWebProduction) {
      const item = fallbackStore.claims.find((c) => c.id === id);
      if (item) {
        item.status = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
        item.approvalNotes = notes;
      }
      return item || ({} as ExpenseClaim);
    }
    try {
      const res = await apiClient.patch(`/expenses/${id}/review`, { decision, notes });
      return res.data.claim;
    } catch (e) {
      const item = fallbackStore.claims.find((c) => c.id === id);
      if (item) {
        item.status = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
        item.approvalNotes = notes;
      }
      return item || ({} as ExpenseClaim);
    }
  },

  // Notifications
  async getNotifications(): Promise<AppNotification[]> {
    if (isWebProduction) {
      return fallbackStore.notifications;
    }
    try {
      const res = await apiClient.get('/notifications');
      return res.data.notifications;
    } catch (e) {
      return fallbackStore.notifications;
    }
  },

  async markNotificationRead(id: string): Promise<void> {
    if (isWebProduction) {
      const n = fallbackStore.notifications.find((notif) => notif.id === id);
      if (n) n.read = true;
      return;
    }
    try {
      await apiClient.patch(`/notifications/${id}/read`);
    } catch (e) {
      const n = fallbackStore.notifications.find((notif) => notif.id === id);
      if (n) n.read = true;
    }
  },

  // Payslips
  async getPayslips(): Promise<Payslip[]> {
    if (isWebProduction) {
      return fallbackStore.payslips;
    }
    try {
      const res = await apiClient.get('/payslips');
      return res.data.payslips;
    } catch (e) {
      return fallbackStore.payslips;
    }
  },

  // Release Check
  async checkVersion(): Promise<ReleaseInfo> {
    if (isWebProduction) {
      return {
        latestVersion: '2.4.0',
        buildNumber: 104,
        minimumRequiredVersion: '2.0.0',
        forceUpdate: false,
        updateRecommended: true,
        releaseDate: '2026-11-10T12:00:00Z',
        whatsNew: [
          '⚡ Earned Wage Access: Instant ACH transfer status indicator',
          '📸 HR Expense: Multi-receipt photo upload with automatic merchant auto-fill',
          '🔒 Biometric security: Android BiometricPrompt & iOS FaceID enhancements',
          '📊 EdTech continuous learning stipend balance breakdown on dashboard',
        ],
        storeUrl: 'https://play.google.com/store/apps/details?id=ai.heftin.paypulse',
        environment: 'production',
      };
    }
    try {
      const res = await apiClient.get('/release/version-check');
      return res.data.release;
    } catch (e) {
      return {
        latestVersion: '2.4.0',
        buildNumber: 104,
        minimumRequiredVersion: '2.0.0',
        forceUpdate: false,
        updateRecommended: true,
        releaseDate: '2026-11-10T12:00:00Z',
        whatsNew: [
          '⚡ Earned Wage Access: Instant ACH transfer status indicator',
          '📸 HR Expense: Multi-receipt photo upload with automatic merchant auto-fill',
          '🔒 Biometric security: Android BiometricPrompt & iOS FaceID enhancements',
          '📊 EdTech continuous learning stipend balance breakdown on dashboard',
        ],
        storeUrl: 'https://play.google.com/store/apps/details?id=ai.heftin.paypulse',
        environment: 'production',
      };
    }
  },
};

