import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { database, User } from '../data/db';

export const JWT_SECRET = process.env.JWT_SECRET || 'heftin_ai_secret_super_secure_key_2026';

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Check if demo query param or demo header is passed for development convenience
    const demoEmail = req.headers['x-demo-user'] as string;
    if (demoEmail) {
      const foundUser = database.users.find((u) => u.email === demoEmail);
      if (foundUser) {
        req.user = foundUser;
        return next();
      }
    }
    return res.status(401).json({ success: false, message: 'Authentication required. Missing token.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }
    const found = database.users.find((u) => u.id === decoded.userId);
    if (!found) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    req.user = found;
    next();
  });
};

