import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import ewaRoutes from './routes/ewa.routes';
import expenseRoutes from './routes/expense.routes';
import notificationRoutes from './routes/notification.routes';
import payslipRoutes from './routes/payslip.routes';
import releaseRoutes from './routes/release.routes';
import aiRoutes from './routes/ai.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware for debugging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Base & Health Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Heftin PayPulse API Gateway',
    version: '2.4.0',
    timestamp: new Date().toISOString(),
    supportedFeatures: [
      'JWT Authentication & RBAC',
      'Earned Wage Access (EWA / FinTech)',
      'HR Expense & EdTech Reimbursements',
      'In-App Notification Center',
      'Payslip & Payroll Ledger',
      'Store Release & Version Engine',
      'Rule-Based Benefits Copilot',
    ],
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/ewa', ewaRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payslips', payslipRoutes);
app.use('/api/release', releaseRoutes);
app.use('/api/ai', aiRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error encountered in PayPulse backend',
    error: err.message,
  });
});

// Start listening when not in Vercel serverless
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 PayPulse API Server running at http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`💼 Tailored for Heftin AI Mobile Developer Portfolio`);
    console.log(`====================================================`);
  });
}

export default app;

