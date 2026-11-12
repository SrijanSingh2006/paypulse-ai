import { Router } from 'express';

const router = Router();

// GET /api/release/version-check
router.get('/version-check', (req, res) => {
  const clientVersion = (req.query.version as string) || '1.0.0';
  const currentProductionRelease = {
    latestVersion: '2.5.0',
    buildNumber: 105,
    minimumRequiredVersion: '2.0.0',
    forceUpdate: false,
    updateRecommended: false,
    releaseDate: new Date().toISOString(),
    whatsNew: [
      '☀️ Responsive light workspace with employee and HR manager sign-in',
      '₹ Indian rupee wage, reimbursement, and allowance ledger',
      '🔎 Claim search and status filters with receipt review',
      '📅 Payday outlook and downloadable payslip summary',
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

