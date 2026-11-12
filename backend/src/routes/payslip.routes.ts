import { Router } from 'express';
import { database } from '../data/db';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// GET /api/payslips
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const list = database.payslips.filter((p) => p.userId === userId);

  return res.json({
    success: true,
    count: list.length,
    payslips: list,
  });
});

// GET /api/payslips/:id
router.get('/:id', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const slip = database.payslips.find((p) => p.id === id && p.userId === userId);
  if (!slip) {
    return res.status(404).json({ success: false, message: 'Payslip record not found' });
  }

  return res.json({
    success: true,
    payslip: slip,
  });
});

export default router;

