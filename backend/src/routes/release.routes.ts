import { Router } from 'express';

const router = Router();

// GET /api/release/version-check
router.get('/version-check', (req, res) => {
  const clientVersion = (req.query.version as string) || '1.0.0';
  const platform = (req.query.platform as string) || 'android';

  const currentProductionRelease = {
    latestVersion: '2.4.0',
    buildNumber: 104,
    minimumRequiredVersion: '2.0.0',
    forceUpdate: false,
    updateRecommended: true,
    releaseDate: '2026-11-10T12:00:00Z',
    whatsNew: [
      '⚡ Earned Wage Access: Instant ACH transfer status indicator',
      '📸 HR Expense: Multi-receipt photo upload with automatic merchant auto-fill',
      '🔒 Biometric security: Android BiometricPrompt & iOS FaceID enhancements',
      '📊 EdTech continuous learning stipend balance breakdown on dashboard',
    ],
    storeUrl:
      platform === 'ios'
        ? 'https://apps.apple.com/app/heftin-paypulse/id1689234812'
        : 'https://play.google.com/store/apps/details?id=ai.heftin.paypulse',
    environment: 'production',
    serverTimestamp: new Date().toISOString(),
  };

  return res.json({
    success: true,
    clientReportedVersion: clientVersion,
    release: currentProductionRelease,
  });
});

export default router;

