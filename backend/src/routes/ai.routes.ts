import { Router } from 'express';
import { database } from '../data/db';
import { computeUserWageSummary } from './ewa.routes';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

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
  const edTechBudget = 1200.0;
  const edTechRemaining = Math.max(0, edTechBudget - edTechSpent);

  let reply = '';
  let suggestedActions: string[] = [];

  if (query.includes('advance') || query.includes('withdraw') || query.includes('wage') || query.includes('money')) {
    reply = `You currently have **$${summary?.availableToWithdraw.toFixed(2)}** available in the demo advance ledger (accrued $${summary?.grossAccruedToDate.toFixed(2)} out of $${summary?.monthlySalary.toFixed(2)} gross salary over ${summary?.currentDayOfMonth} days worked). No real funds move.`;
    suggestedActions = ['Request Instant Advance', 'View Accrual Breakdown', 'Disbursement History'];
  } else if (query.includes('edtech') || query.includes('learning') || query.includes('perk') || query.includes('course') || query.includes('allowance')) {
    reply = `Under Heftin AI's continuous professional development benefit, you have an annual allowance of **$${edTechBudget.toFixed(2)}**. You have utilized **$${edTechSpent.toFixed(2)}** so far, leaving **$${edTechRemaining.toFixed(2)}** available for eligible technical courses, certifications (e.g. Flutter/React Native/Cloud), and books.`;
    suggestedActions = ['Submit EdTech Claim', 'View Approved Courses', 'Policy Guidelines'];
  } else if (query.includes('expense') || query.includes('hardware') || query.includes('travel') || query.includes('claim')) {
    const pendingCount = visibleClaims.filter((c) => c.status === 'PENDING').length;
    reply = `${user.role === 'HR_MANAGER' || user.role === 'ADMIN' ? 'Your workspace has' : 'You have'} ${visibleClaims.length} expense claims on record (${pendingCount} pending review). Eligible categories include EdTech Learning, Travel & Mobility, Office/Ergonomic Hardware, and Client Hospitality. Attach an itemized receipt when submitting a claim.`;
    suggestedActions = ['Upload New Receipt', 'Check Pending Claims', 'Expense Policy FAQ'];
  } else if (query.includes('payslip') || query.includes('tax') || query.includes('salary') || query.includes('deduction')) {
    const payslip = database.payslips.find((slip) => slip.userId === userId);
    reply = payslip
      ? `Your monthly base salary is **$${user.monthlySalary.toFixed(2)}**. Your latest demo payslip shows net pay of $${payslip.netPay.toFixed(2)} after tax, insurance, retirement, and wage advance adjustments.`
      : `Your monthly base salary is **$${user.monthlySalary.toFixed(2)}**. Use the Profile tab to review your demo payslip breakdown.`;
    suggestedActions = ['Download October PDF Slip', 'Tax Breakdown Info', 'Direct Deposit Setup'];
  } else if (query.includes('flutter') || query.includes('react native') || query.includes('tech stack') || query.includes('architecture')) {
    reply = `Heftin PayPulse AI is engineered with a **React Native (TypeScript) + Flutter (Dart)** cross-platform architecture. It utilizes Fabric TurboModules on React Native and clean domain-driven architecture on Flutter, communicating with our Node.js/Express REST API gateway.`;
    suggestedActions = ['Explore Architecture RFC', 'Switch Demo Role', 'View Release Specs'];
  } else {
    reply = `Hello ${user.name}! I am the PayPulse benefits copilot. I can help with your **demo wage balance ($${summary?.availableToWithdraw.toFixed(2)} available)**, **EdTech Learning Allowance ($${edTechRemaining.toFixed(2)} remaining)**, expense submissions, and payslip breakdowns. No real funds move in this demo.`;
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
