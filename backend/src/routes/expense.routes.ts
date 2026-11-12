import { Router } from 'express';
import { database, ExpenseClaim, AppNotification } from '../data/db';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// GET /api/expenses (all for manager, personal for employee)
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  const user = req.user!;
  const { status, category } = req.query;

  let claims = database.expenseClaims;

  if (user.role === 'EMPLOYEE') {
    claims = claims.filter((c) => c.userId === user.id);
  }

  if (status) {
    claims = claims.filter((c) => c.status === (status as string).toUpperCase());
  }

  if (category) {
    claims = claims.filter((c) => c.category === category);
  }

  return res.json({
    success: true,
    count: claims.length,
    claims,
  });
});

// POST /api/expenses (submit claim)
router.post('/', authenticateToken, (req: AuthRequest, res) => {
  const user = req.user!;
  const { title, category, amount, merchant, receiptUrl, date } = req.body;

  const numAmount = parseFloat(amount);
  if (!title || isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Title and valid positive amount are required.' });
  }

  const validCategories = [
    'EDUCATION_EDTECH',
    'TRAVEL',
    'MEALS_ENTERTAINMENT',
    'HARDWARE_OFFICE',
    'HEALTH_WELLNESS',
  ];

  const selectedCategory = validCategories.includes(category) ? category : 'EDUCATION_EDTECH';

  const newClaim: ExpenseClaim = {
    id: `exp_${Date.now().toString().slice(-6)}`,
    userId: user.id,
    employeeName: user.name,
    title: title.trim(),
    category: selectedCategory,
    amount: numAmount,
    currency: 'USD',
    merchant: merchant ? merchant.trim() : 'Company Vendor',
    date: date || new Date().toISOString().split('T')[0],
    receiptUrl: receiptUrl || undefined,
    status: 'PENDING',
    submittedAt: new Date().toISOString(),
  };

  database.expenseClaims.unshift(newClaim);

  // Notify HR Managers
  const hrManagers = database.users.filter((u) => u.role === 'HR_MANAGER');
  hrManagers.forEach((mgr) => {
    database.notifications.unshift({
      id: `notif_${Date.now()}_${mgr.id}`,
      userId: mgr.id,
      title: 'New Expense Claim Submitted',
      message: `${user.name} submitted a $${numAmount.toFixed(2)} claim for "${title}".`,
      type: 'EXPENSE_UPDATE',
      read: false,
      timestamp: new Date().toISOString(),
    });
  });

  return res.status(201).json({
    success: true,
    message: 'Expense claim submitted successfully for manager review.',
    claim: newClaim,
  });
});

// PATCH /api/expenses/:id/review (Manager action: APPROVE or REJECT)
router.patch('/:id/review', authenticateToken, (req: AuthRequest, res) => {
  const user = req.user!;
  const { id } = req.params;
  const { decision, notes } = req.body; // 'APPROVE' or 'REJECT'

  if (user.role !== 'HR_MANAGER' && user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Only HR Managers can review expense claims.' });
  }

  const claim = database.expenseClaims.find((c) => c.id === id);
  if (!claim) {
    return res.status(404).json({ success: false, message: 'Expense claim not found.' });
  }

  if (claim.status !== 'PENDING') {
    return res.status(409).json({ success: false, message: 'Only pending claims can be reviewed.' });
  }

  if (decision === 'APPROVE') {
    claim.status = 'APPROVED';
    claim.approvalNotes = notes || 'Approved according to standard company benefits and policy.';
  } else if (decision === 'REJECT') {
    claim.status = 'REJECTED';
    claim.approvalNotes = notes || 'Claim rejected. Please provide additional tax invoice details.';
  } else {
    return res.status(400).json({ success: false, message: 'decision must be APPROVE or REJECT.' });
  }

  // Notify the employee
  const notif: AppNotification = {
    id: `notif_${Date.now()}`,
    userId: claim.userId,
    title: claim.status === 'APPROVED' ? 'Claim Approved! 🎉' : 'Claim Status Update',
    message: `Your claim "${claim.title}" ($${claim.amount.toFixed(2)}) has been ${claim.status.toLowerCase()} by ${user.name}.`,
    type: 'EXPENSE_UPDATE',
    read: false,
    timestamp: new Date().toISOString(),
  };
  database.notifications.unshift(notif);

  return res.json({
    success: true,
    message: `Expense claim #${claim.id} marked as ${claim.status}.`,
    claim,
  });
});

// GET /api/expenses/stats
router.get('/stats', authenticateToken, (req: AuthRequest, res) => {
  const user = req.user!;
  let claims = database.expenseClaims;

  if (user.role === 'EMPLOYEE') {
    claims = claims.filter((c) => c.userId === user.id);
  }

  const categoryTotals: Record<string, number> = {};
  let totalApproved = 0;
  let totalPending = 0;

  claims.forEach((c) => {
    if (!categoryTotals[c.category]) {
      categoryTotals[c.category] = 0;
    }
    categoryTotals[c.category] += c.amount;

    if (c.status === 'APPROVED' || c.status === 'DISBURSED') {
      totalApproved += c.amount;
    } else if (c.status === 'PENDING') {
      totalPending += c.amount;
    }
  });

  return res.json({
    success: true,
    stats: {
      totalClaimsCount: claims.length,
      totalApprovedAmount: Math.round(totalApproved * 100) / 100,
      totalPendingAmount: Math.round(totalPending * 100) / 100,
      categoryBreakdown: categoryTotals,
      annualEdTechBudgetLimit: 1200.0,
      edTechClaimed: Math.round((categoryTotals['EDUCATION_EDTECH'] || 0) * 100) / 100,
    },
  });
});

export default router;

