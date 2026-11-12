import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { database } from '../data/db';
import { JWT_SECRET, authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const user = database.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!user || (password && user.password !== password)) {
    return res.status(401).json({ success: false, message: 'Invalid email or credentials' });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    success: true,
    message: 'Authentication successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      designation: user.designation,
      department: user.department,
      monthlySalary: user.monthlySalary,
      availableWageLimitRatio: user.availableWageLimitRatio,
      bankAccount: user.bankAccount,
      avatarUrl: user.avatarUrl,
    },
  });
});

// Demo Fast Switch (Employee <-> HR Manager)
router.post('/demo-switch', (req, res) => {
  const { role } = req.body; // 'EMPLOYEE' or 'HR_MANAGER'
  const user = database.users.find((u) => u.role === (role || 'EMPLOYEE'));

  if (!user) {
    return res.status(404).json({ success: false, message: 'Demo user not found' });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      designation: user.designation,
      department: user.department,
      monthlySalary: user.monthlySalary,
      availableWageLimitRatio: user.availableWageLimitRatio,
      bankAccount: user.bankAccount,
      avatarUrl: user.avatarUrl,
    },
  });
});

// Get Current User Profile
router.get('/profile', authenticateToken, (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { password, ...safeUser } = req.user;
  return res.json({
    success: true,
    user: safeUser,
  });
});

export default router;

