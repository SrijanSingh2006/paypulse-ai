import { Router } from 'express';

const router = Router();

// GET /api/release/version-check
router.get('/version-check', (req, res) => {
  const clientVersion = (req.query.version as string) || '1.0.0';
  const currentProductionRelease = {
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
    serverTimestamp: new Date().toISOString(),
  };

  return res.json({
    success: true,
    clientReportedVersion: clientVersion,
    release: currentProductionRelease,
  });
});

export default router;

