import { Router } from 'express';

const router = Router();

// GET /api/release/version-check
router.get('/version-check', (req, res) => {
  const clientVersion = (req.query.version as string) || '1.0.0';
  const currentProductionRelease = {
    latestVersion: '2.6.0',
    buildNumber: 106,
    minimumRequiredVersion: '2.0.0',
    forceUpdate: false,
    updateRecommended: false,
    releaseDate: new Date().toISOString(),
    whatsNew: [
      'A new paper-and-ink visual system across the workspace',
      'Role-specific employee and HR manager dashboards',
      'INR wage, reimbursement, and allowance summaries',
      'Claim review, search, filters, and payslip export',
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

