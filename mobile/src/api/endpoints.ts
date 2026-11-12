import {
  apiClient,
  fallbackStore,
  hydrateDemoStore,
  isWebProduction,
  persistDemoStore,
  setDemoRole,
} from './client';
import { User, EwaSummary, ExpenseClaim, AppNotification, Payslip, ReleaseInfo } from '../types';

const shouldUseOfflineFallback = (error: any) => !error?.response || error.response.status >= 500;

const ensureDemoPayslip = () => {
  if (fallbackStore.user.role !== 'HR_MANAGER' || fallbackStore.payslips.some((slip) => slip.userId === fallbackStore.user.id)) {
    return;
  }
  fallbackStore.payslips.unshift({
    id: 'ps_2026_10_mgr',
    userId: fallbackStore.user.id,
    month: 'October 2026',
    payPeriod: 'Oct 01, 2026 - Oct 31, 2026',
    grossPay: fallbackStore.user.monthlySalary,
    earnedWageWithdrawn: 0,
    taxDeduction: 1900,
    insuranceDeduction: 280,
    providentFund: 570,
    netPay: 6750,
    payoutDate: '2026-10-31',
    status: 'PROCESSED',
  });
};

export const Api = {
  // Auth
  async login(email: string, password?: string): Promise<{ token: string; user: User }> {
    if (isWebProduction) {
      const role = email.toLowerCase().includes('manager') ? 'HR_MANAGER' : 'EMPLOYEE';
      const mockUser = await setDemoRole(role);
      return {
        token: 'mock_jwt_token_demo_mode',
        user: mockUser,
      };
    }

    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const role = email.toLowerCase().includes('manager') ? 'HR_MANAGER' : 'EMPLOYEE';
      await setDemoRole(role);
      return res.data;
    } catch (e) {
      if (!shouldUseOfflineFallback(e)) throw e;
      console.log('[API Offline Fallback] login fallback activated');
      const role = email.toLowerCase().includes('manager') ? 'HR_MANAGER' : 'EMPLOYEE';
      const mockUser = await setDemoRole(role);

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
      await setDemoRole(role);
      return res.data;
    } catch (e) {
      if (!shouldUseOfflineFallback(e)) throw e;
      const email = role === 'HR_MANAGER' ? 'manager@heftin.ai' : 'employee@heftin.ai';
      return Api.login(email);
    }
  },

  // EWA / FinTech
  async getEwaSummary(): Promise<EwaSummary> {
    if (isWebProduction) {
      await hydrateDemoStore();
      return fallbackStore.summary;
    }
    try {
      const res = await apiClient.get('/ewa/summary');
      return res.data.data;
    } catch (e) {
      if (!shouldUseOfflineFallback(e)) throw e;
      console.log('[API Offline Fallback] EWA summary fallback activated');
      return fallbackStore.summary;
    }
  },

  async requestAdvance(amount: number, transferType: string, note?: string): Promise<{ success: boolean; message: string; updatedSummary: EwaSummary }> {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Enter an advance amount greater than zero.');
    }
    if (isWebProduction) await hydrateDemoStore();
    if (amount > fallbackStore.summary.availableToWithdraw) {
      throw new Error(`Maximum available is $${fallbackStore.summary.availableToWithdraw.toFixed(2)}.`);
    }

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
        destinationAccount: fallbackStore.user.bankAccount.accountMasked,
        note: note || 'On-demand wage transfer',
      });
      fallbackStore.notifications.unshift({
        id: `notif_ewa_${Date.now()}`,
        userId: fallbackStore.user.id,
        title: 'Demo advance recorded',
        message: `A simulated $${amount.toFixed(2)} advance was added to your ledger. No funds moved.`,
        type: 'EWA_ADVANCE',
        read: false,
        timestamp: new Date().toISOString(),
      });
      await persistDemoStore();
      return {
        success: true,
        message: `Simulated $${amount.toFixed(2)} disbursement recorded via ${transferType}.`,
        updatedSummary: { ...fallbackStore.summary },
      };
    }
    try {
      const res = await apiClient.post('/ewa/request-advance', { amount, transferType, note });
      return res.data;
    } catch (e) {
      if (!shouldUseOfflineFallback(e)) throw e;
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
        destinationAccount: fallbackStore.user.bankAccount.accountMasked,
        note: note || 'On-demand wage transfer',
      });
      fallbackStore.notifications.unshift({
        id: `notif_ewa_${Date.now()}`,
        userId: fallbackStore.user.id,
        title: 'Demo advance recorded',
        message: `A simulated $${amount.toFixed(2)} advance was added to your ledger. No funds moved.`,
        type: 'EWA_ADVANCE',
        read: false,
        timestamp: new Date().toISOString(),
      });
      await persistDemoStore();
      return {
        success: true,
        message: `Simulated $${amount.toFixed(2)} disbursement recorded via ${transferType}.`,
        updatedSummary: { ...fallbackStore.summary },
      };
    }
  },

  // HR Expenses
  async getExpenses(status?: string, category?: string): Promise<ExpenseClaim[]> {
    if (isWebProduction) {
      await hydrateDemoStore();
      return fallbackStore.claims.filter((claim) => {
        const belongsToUser = fallbackStore.user.role === 'HR_MANAGER' || claim.userId === fallbackStore.user.id;
        return belongsToUser && (!status || claim.status === status) && (!category || claim.category === category);
      });
    }
    try {
      const res = await apiClient.get('/expenses', { params: { status, category } });
      return res.data.claims;
    } catch (e) {
      if (!shouldUseOfflineFallback(e)) throw e;
      return fallbackStore.claims.filter((claim) => {
        const belongsToUser = fallbackStore.user.role === 'HR_MANAGER' || claim.userId === fallbackStore.user.id;
        return belongsToUser && (!status || claim.status === status) && (!category || claim.category === category);
      });
    }
  },

  async submitExpense(data: {
    title: string;
    category: string;
    amount: number;
    merchant: string;
    receiptUrl?: string;
  }): Promise<ExpenseClaim> {
    if (!data.title?.trim()) throw new Error('Expense title is required.');
    if (!Number.isFinite(data.amount) || data.amount <= 0) throw new Error('Enter a valid positive expense amount.');
    if (isWebProduction) {
      await hydrateDemoStore();
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
      if (fallbackStore.user.role !== 'HR_MANAGER') {
        fallbackStore.notifications.unshift({
          id: `notif_claim_${Date.now()}`,
          userId: 'usr_heftin_002',
          title: 'New expense claim',
          message: `${newClaim.employeeName} submitted a $${newClaim.amount.toFixed(2)} claim for review.`,
          type: 'EXPENSE_UPDATE',
          read: false,
          timestamp: new Date().toISOString(),
        });
      }
      await persistDemoStore();
      return newClaim;
    }
    try {
      const res = await apiClient.post('/expenses', data);
      return res.data.claim;
    } catch (e) {
      if (!shouldUseOfflineFallback(e)) throw e;
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
      if (fallbackStore.user.role !== 'HR_MANAGER') {
        fallbackStore.notifications.unshift({
          id: `notif_claim_${Date.now()}`,
          userId: 'usr_heftin_002',
          title: 'New expense claim',
          message: `${newClaim.employeeName} submitted a $${newClaim.amount.toFixed(2)} claim for review.`,
          type: 'EXPENSE_UPDATE',
          read: false,
          timestamp: new Date().toISOString(),
        });
      }
      await persistDemoStore();
      return newClaim;
    }
  },

  async reviewExpense(id: string, decision: 'APPROVE' | 'REJECT', notes?: string): Promise<ExpenseClaim> {
    if (isWebProduction) await hydrateDemoStore();
    if (fallbackStore.user.role !== 'HR_MANAGER' && fallbackStore.user.role !== 'ADMIN') {
      throw new Error('Only an HR manager can review expense claims.');
    }
    if (isWebProduction) {
      const item = fallbackStore.claims.find((c) => c.id === id);
      if (item?.status === 'PENDING') {
        item.status = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
        item.approvalNotes = notes;
        fallbackStore.notifications.unshift({
          id: `notif_review_${Date.now()}`,
          userId: item.userId,
          title: decision === 'APPROVE' ? 'Expense claim approved' : 'Expense claim needs an update',
          message: `${fallbackStore.user.name} ${decision === 'APPROVE' ? 'approved' : 'rejected'} “${item.title}”.`,
          type: 'EXPENSE_UPDATE',
          read: false,
          timestamp: new Date().toISOString(),
        });
        await persistDemoStore();
      }
      return item || ({} as ExpenseClaim);
    }
    try {
      const res = await apiClient.patch(`/expenses/${id}/review`, { decision, notes });
      return res.data.claim;
    } catch (e) {
      if (!shouldUseOfflineFallback(e)) throw e;
      const item = fallbackStore.claims.find((c) => c.id === id);
      if (item?.status === 'PENDING') {
        item.status = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
        item.approvalNotes = notes;
        fallbackStore.notifications.unshift({
          id: `notif_review_${Date.now()}`,
          userId: item.userId,
          title: decision === 'APPROVE' ? 'Expense claim approved' : 'Expense claim needs an update',
          message: `${fallbackStore.user.name} ${decision === 'APPROVE' ? 'approved' : 'rejected'} “${item.title}”.`,
          type: 'EXPENSE_UPDATE',
          read: false,
          timestamp: new Date().toISOString(),
        });
      }
      await persistDemoStore();
      return item || ({} as ExpenseClaim);
    }
  },

  // Notifications
  async getNotifications(): Promise<AppNotification[]> {
    if (isWebProduction) {
      await hydrateDemoStore();
      return fallbackStore.notifications.filter((notification) => notification.userId === fallbackStore.user.id);
    }
    try {
      const res = await apiClient.get('/notifications');
      return res.data.notifications;
    } catch (e) {
      if (!shouldUseOfflineFallback(e)) throw e;
      return fallbackStore.notifications.filter((notification) => notification.userId === fallbackStore.user.id);
    }
  },

  async markNotificationRead(id: string): Promise<void> {
    if (isWebProduction) {
      await hydrateDemoStore();
      const n = fallbackStore.notifications.find((notif) => notif.id === id && notif.userId === fallbackStore.user.id);
      if (n) n.read = true;
      await persistDemoStore();
      return;
    }
    try {
      await apiClient.patch(`/notifications/${id}/read`);
    } catch (e) {
      if (!shouldUseOfflineFallback(e)) throw e;
      const n = fallbackStore.notifications.find((notif) => notif.id === id && notif.userId === fallbackStore.user.id);
      if (n) n.read = true;
    }
  },

  // Payslips
  async getPayslips(): Promise<Payslip[]> {
    if (isWebProduction) await hydrateDemoStore();
    ensureDemoPayslip();
    if (isWebProduction) {
      await persistDemoStore();
      return fallbackStore.payslips.filter((slip) => slip.userId === fallbackStore.user.id);
    }
    try {
      const res = await apiClient.get('/payslips');
      return res.data.payslips.length > 0
        ? res.data.payslips
        : fallbackStore.payslips.filter((slip) => slip.userId === fallbackStore.user.id);
    } catch (e) {
      if (!shouldUseOfflineFallback(e)) throw e;
      return fallbackStore.payslips.filter((slip) => slip.userId === fallbackStore.user.id);
    }
  },

  // AI Copilot
  async askCopilot(prompt: string): Promise<{ reply: string; suggestedActions: string[] }> {
    if (isWebProduction) await hydrateDemoStore();
    const query = prompt.toLowerCase();
    const summary = fallbackStore.summary;
    const edTechSpent = fallbackStore.claims
      .filter((claim) => claim.userId === fallbackStore.user.id && claim.category === 'EDUCATION_EDTECH' && claim.status !== 'REJECTED')
      .reduce((total, claim) => total + claim.amount, 0);
    const edTechRemaining = Math.max(0, 1200 - edTechSpent);
    const visibleClaims = fallbackStore.user.role === 'HR_MANAGER'
      ? fallbackStore.claims
      : fallbackStore.claims.filter((claim) => claim.userId === fallbackStore.user.id);
    const pendingClaims = visibleClaims.filter((claim) => claim.status === 'PENDING').length;

    if (isWebProduction) {
      if (query.includes('advance') || query.includes('withdraw') || query.includes('wage')) {
        return {
          reply: `You have **$${summary.availableToWithdraw.toFixed(2)}** available in the demo wage ledger ($${summary.grossAccruedToDate.toFixed(2)} accrued out of $${summary.monthlySalary.toFixed(2)}). No real funds move.`,
          suggestedActions: ['Request Instant Advance', 'View Accrual Breakdown'],
        };
      }
      if (query.includes('edtech') || query.includes('perk') || query.includes('learning')) {
        return {
          reply: `Heftin AI provides an annual $1,200.00 EdTech perk. You have used $${edTechSpent.toFixed(2)}, leaving $${edTechRemaining.toFixed(2)} for eligible courses, certifications, and books.`,
          suggestedActions: ['Submit EdTech Claim', 'Expense Policy FAQ'],
        };
      }
      if (query.includes('tax') || query.includes('payslip') || query.includes('salary')) {
        return {
          reply: `Your monthly base salary is $${fallbackStore.user.monthlySalary.toFixed(2)}. Open your Profile tab to review the latest demo payslip breakdown.`,
          suggestedActions: ['Open Payslip', 'Available Advance Balance'],
        };
      }
      return {
        reply: `Hello ${fallbackStore.user.name}! I'm your Heftin PayPulse AI Copilot. You can ask about your available wage advance ($${summary.availableToWithdraw.toFixed(2)}), EdTech balance ($${edTechRemaining.toFixed(2)}), or expense reimbursement policy. You have ${pendingClaims} pending expense claim${pendingClaims === 1 ? '' : 's'}.`,
        suggestedActions: ['Available Advance Balance', 'EdTech Perk Balance', 'Pending Expense Claims'],
      };
    }

    try {
      const res = await apiClient.post('/ai/chat', { prompt });
      return res.data;
    } catch (e: any) {
      // Older local API processes may not yet have the Copilot route; use the demo guide in that case.
      if (!shouldUseOfflineFallback(e) && e.response?.status !== 404) throw e;
      if (query.includes('edtech') || query.includes('perk') || query.includes('learning') || query.includes('course') || query.includes('allowance')) {
        return {
          reply: `Heftin AI provides an annual $1,200.00 EdTech perk. You have used $${edTechSpent.toFixed(2)}, leaving $${edTechRemaining.toFixed(2)} for eligible courses, certifications, and books.`,
          suggestedActions: ['Submit EdTech Claim', 'Expense Policy FAQ'],
        };
      }
      if (query.includes('expense') || query.includes('claim') || query.includes('receipt')) {
        return {
          reply: `There are ${visibleClaims.length} expense claims in your workspace, with ${pendingClaims} pending review. Submit an itemized receipt with a new claim when available.`,
          suggestedActions: ['Submit New Claim', 'Review Pending Claims', 'Expense Policy FAQ'],
        };
      }
      if (query.includes('payslip') || query.includes('tax') || query.includes('salary') || query.includes('deduction')) {
        return {
          reply: `Your monthly base salary is $${fallbackStore.user.monthlySalary.toFixed(2)}. The latest demo payslip is available in the Profile tab.`,
          suggestedActions: ['Open Payslip', 'Available Advance Balance'],
        };
      }
      return {
        reply: `You have $${summary.availableToWithdraw.toFixed(2)} available in the demo advance ledger. No real funds move. Your EdTech balance is $${edTechRemaining.toFixed(2)}.`,
        suggestedActions: ['Request Instant Advance', 'EdTech Perk Balance', 'Pending Expense Claims'],
      };
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
        updateRecommended: false,
        releaseDate: new Date().toISOString(),
        whatsNew: [
          '⚡ Wage accrual with an interactive demo advance ledger',
          '📸 Expense claims with optional receipt attachment and HR review',
          '✨ Benefits Copilot for wage, payslip, and policy questions',
          '🔁 Employee and manager demo roles with separate wage balances',
        ],
        storeUrl: '',
        environment: 'portfolio-demo',
      };
    }
    try {
      const res = await apiClient.get('/release/version-check');
      return res.data.release;
    } catch (e) {
      if (!shouldUseOfflineFallback(e)) throw e;
      return {
        latestVersion: '2.4.0',
        buildNumber: 104,
        minimumRequiredVersion: '2.0.0',
        forceUpdate: false,
        updateRecommended: false,
        releaseDate: new Date().toISOString(),
        whatsNew: [
          '⚡ Wage accrual with an interactive demo advance ledger',
          '📸 Expense claims with optional receipt attachment and HR review',
          '✨ Benefits Copilot for wage, payslip, and policy questions',
          '🔁 Employee and manager demo roles with separate wage balances',
        ],
        storeUrl: '',
        environment: 'portfolio-demo',
      };
    }
  },
};

