import { Router } from 'express';
import { database } from '../data/db';
import { computeUserWageSummary } from './ewa.routes';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import { formatINR } from '../utils/currency';

const router = Router();

// POST /api/ai/copilot
router.post('/chat', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ success: false, message: 'Prompt query is required.' });
  }

  const query = prompt.toLowerCase().trim();
  const summary = computeUserWageSummary(userId);
  const user = req.user!;
  const userClaims = database.expenseClaims.filter((c) => c.userId === userId);
  const visibleClaims = user.role === 'HR_MANAGER' || user.role === 'ADMIN'
    ? database.expenseClaims
    : userClaims;
  const edTechSpent = userClaims
    .filter((c) => c.category === 'EDUCATION_EDTECH' && c.status === 'APPROVED')
    .reduce((sum, c) => sum + c.amount, 0);
  const edTechBudget = 50000;
  const edTechRemaining = Math.max(0, edTechBudget - edTechSpent);

  let reply = '';
  let suggestedActions: string[] = [];

  if (query.includes('advance') || query.includes('withdraw') || query.includes('wage') || query.includes('money')) {
    reply = `You currently have **${formatINR(summary?.availableToWithdraw || 0)}** available in the demo advance ledger (accrued ${formatINR(summary?.grossAccruedToDate || 0)} out of ${formatINR(summary?.monthlySalary || 0)} gross salary over ${summary?.currentDayOfMonth} days worked). No real funds move.`;
    suggestedActions = ['Request Instant Advance', 'View Accrual Breakdown', 'Disbursement History'];
  } else if (query.includes('edtech') || query.includes('learning') || query.includes('perk') || query.includes('course') || query.includes('allowance')) {
    reply = `Your annual learning allowance is **${formatINR(edTechBudget)}**. You have used **${formatINR(edTechSpent)}** so far, leaving **${formatINR(edTechRemaining)}** for eligible courses, certifications, and books.`;
    suggestedActions = ['Submit EdTech Claim', 'View Approved Courses', 'Policy Guidelines'];
  } else if (query.includes('expense') || query.includes('hardware') || query.includes('travel') || query.includes('claim')) {
    const pendingCount = visibleClaims.filter((c) => c.status === 'PENDING').length;
    reply = `${user.role === 'HR_MANAGER' || user.role === 'ADMIN' ? 'Your workspace has' : 'You have'} ${visibleClaims.length} expense claims on record (${pendingCount} pending review). Eligible categories include EdTech Learning, Travel & Mobility, Office/Ergonomic Hardware, and Client Hospitality. Attach an itemized receipt when submitting a claim.`;
    suggestedActions = ['Upload New Receipt', 'Check Pending Claims', 'Expense Policy FAQ'];
  } else if (query.includes('payslip') || query.includes('tax') || query.includes('salary') || query.includes('deduction')) {
    const payslip = database.payslips.find((slip) => slip.userId === userId);
    reply = payslip
      ? `Your monthly base salary is **${formatINR(user.monthlySalary)}**. Your latest demo payslip shows net pay of ${formatINR(payslip.netPay)} after tax, insurance, provident fund, and wage advance adjustments.`
      : `Your monthly base salary is **${formatINR(user.monthlySalary)}**. Use the Profile tab to review your demo payslip breakdown.`;
    suggestedActions = ['View payslip breakdown', 'Export payslip summary', 'Payroll deductions'];
  } else if (query.includes('flutter') || query.includes('react native') || query.includes('tech stack') || query.includes('architecture')) {
    reply = `PayPulse is a **React Native + TypeScript** app built with **Expo SDK 52**, backed by a **Node.js + Express REST API**. Its demo workflows cover authenticated role switching, earned-wage calculations, expense review, payslip summaries, and persisted browser demo state.`;
    suggestedActions = ['Explore Architecture RFC', 'Switch Demo Role', 'View Release Specs'];
  } else {
    reply = `Hello ${user.name}! I am the PayPulse benefits copilot. I can help with your **demo wage balance (${formatINR(summary?.availableToWithdraw || 0)} available)**, **learning allowance (${formatINR(edTechRemaining)} remaining)**, expense submissions, and payslip breakdowns. No real funds move in this demo.`;
    suggestedActions = ['Available Advance Balance', 'EdTech Perk Balance', 'Pending Expense Claims'];
  }

  return res.json({
    success: true,
    query: prompt,
    reply,
    suggestedActions,
    timestamp: new Date().toISOString(),
  });
});

export default router;
