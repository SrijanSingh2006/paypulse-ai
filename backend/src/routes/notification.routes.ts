import { Router } from 'express';
import { database } from '../data/db';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// GET /api/notifications
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const userNotifs = database.notifications.filter((n) => n.userId === userId);

  return res.json({
    success: true,
    unreadCount: userNotifs.filter((n) => !n.read).length,
    notifications: userNotifs,
  });
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const notif = database.notifications.find((n) => n.id === id && n.userId === userId);
  if (!notif) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  notif.read = true;
  return res.json({ success: true, notification: notif });
});

// POST /api/notifications/mark-all-read
router.post('/mark-all-read', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  database.notifications
    .filter((n) => n.userId === userId)
    .forEach((n) => (n.read = true));

  return res.json({ success: true, message: 'All notifications marked as read' });
});

export default router;

