import { Router } from 'express';
import { database, EwaTransaction, AppNotification } from '../data/db';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Calculate Wage Metrics
export function computeUserWageSummary(userId: string) {
  const user = database.users.find((u) => u.id === userId);
  if (!user) return null;

  const now = new Date();
  const currentDay = Math.min(now.getDate(), 28); // e.g. day 12
  const daysInMonth = 30; // standard payroll benchmark

  const dailyEarnings = user.monthlySalary / daysInMonth;
  const grossAccruedToDate = Math.round(dailyEarnings * currentDay * 100) / 100;

  // Filter completed EWA withdrawals
  const userWithdrawals = database.ewaTransactions.filter(
    (tx) => tx.userId === userId && tx.status === 'COMPLETED'
  );

  const withdrawnToDate = userWithdrawals.reduce((sum, tx) => sum + tx.amount, 0);

  // Maximum allowed is limit ratio (e.g. 50%) of gross accrued
  const maxEligibleAccrual = Math.round(grossAccruedToDate * user.availableWageLimitRatio * 100) / 100;
  const availableToWithdraw = Math.max(0, Math.round((maxEligibleAccrual - withdrawnToDate) * 100) / 100);

  return {
    userId: user.id,
    monthlySalary: user.monthlySalary,
    dailyEarnings: Math.round(dailyEarnings * 100) / 100,
    currentDayOfMonth: currentDay,
    daysInMonth,
    grossAccruedToDate,
    maxEligibleAccrual,
    withdrawnToDate,
    availableToWithdraw,
    limitRatioPercentage: user.availableWageLimitRatio * 100,
    bankAccount: user.bankAccount,
    transactions: userWithdrawals,
  };
}

// GET /api/ewa/summary
router.get('/summary', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const summary = computeUserWageSummary(userId);

  if (!summary) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  return res.json({
    success: true,
    data: summary,
  });
});

// POST /api/ewa/request-advance
router.post('/request-advance', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { amount, transferType, note } = req.body;

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Valid positive amount required.' });
  }

  const summary = computeUserWageSummary(userId);
  if (!summary) {
    return res.status(404).json({ success: false, message: 'User wage account not found.' });
  }

  if (numAmount > summary.availableToWithdraw) {
    return res.status(400).json({
      success: false,
      message: `Requested amount ($${numAmount.toFixed(2)}) exceeds available limit of $${summary.availableToWithdraw.toFixed(2)}.`,
    });
  }

  const user = database.users.find((u) => u.id === userId)!;

  const newTx: EwaTransaction = {
    id: `tx_ewa_${Date.now().toString().slice(-6)}`,
    userId,
    amount: numAmount,
    fee: 0.0, // Zero interest/fee employee benefit policy
    status: 'COMPLETED',
    disbursedAt: new Date().toISOString(),
    transferType: transferType === 'INSTANT_ACH' ? 'INSTANT_ACH' : 'SAME_DAY_PAYPULSE',
    destinationAccount: user.bankAccount.accountMasked,
    note: note || 'On-demand wage transfer',
  };

  database.ewaTransactions.unshift(newTx);

  // Dispatch real-time push/in-app notification
  const notif: AppNotification = {
    id: `notif_${Date.now()}`,
    userId,
    title: 'Demo wage advance recorded',
    message: `A simulated $${numAmount.toFixed(2)} advance was added to the demo ledger. No funds moved.`,
    type: 'EWA_ADVANCE',
    read: false,
    timestamp: new Date().toISOString(),
  };
  database.notifications.unshift(notif);

  return res.status(201).json({
    success: true,
    message: `Demo advance of $${numAmount.toFixed(2)} recorded. No funds moved.`,
    transaction: newTx,
    updatedSummary: computeUserWageSummary(userId),
  });
});

// GET /api/ewa/transactions
router.get('/transactions', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const list = database.ewaTransactions.filter((tx) => tx.userId === userId);

  return res.json({
    success: true,
    count: list.length,
    transactions: list,
  });
});

export default router;

