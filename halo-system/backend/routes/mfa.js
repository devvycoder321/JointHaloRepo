const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const mfaService = require('../services/mfa');
const auditService = require('../services/audit');
const { authenticate } = require('../middleware/auth');

// Setup MFA - generate secret and QR code
router.post('/setup', authenticate, async (req, res) => {
  try {
    const { secret, qrCode, otpauth_url } = await mfaService.generateSecret(
      req.user.email
    );

    res.json({
      success: true,
      secret,
      qrCode,
      otpauth_url,
      message:
        'Scan this QR code with your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify and enable MFA
router.post(
  '/verify-setup',
  [body('secret').notEmpty(), body('token').isLength({ min: 6, max: 6 }).isNumeric()],
  authenticate,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { secret, token } = req.body;

      await mfaService.enableMFA(req.user.id, secret, token);

      await auditService.log(req, 'mfa_enabled', 'users', req.user.id);

      // Generate backup codes
      const backupCodes = await mfaService.generateBackupCodes(req.user.id);

      res.json({
        success: true,
        message: 'MFA enabled successfully',
        backupCodes,
        notice:
          'Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.',
      });
    } catch (error) {
      await auditService.logFailure(
        req,
        'mfa_setup_failed',
        error.message
      );
      res.status(400).json({ error: error.message });
    }
  }
);

// Disable MFA
router.post('/disable', authenticate, async (req, res) => {
  try {
    await mfaService.disableMFA(req.user.id);

    await auditService.log(req, 'mfa_disabled', 'users', req.user.id);

    res.json({
      success: true,
      message: 'MFA disabled successfully',
    });
  } catch (error) {
    await auditService.logFailure(req, 'mfa_disable_failed', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Get backup codes count
router.get('/backup-codes-count', authenticate, async (req, res) => {
  try {
    const count = await mfaService.getBackupCodesCount(req.user.id);

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Regenerate backup codes
router.post('/regenerate-backup-codes', authenticate, async (req, res) => {
  try {
    const backupCodes = await mfaService.generateBackupCodes(req.user.id);

    await auditService.log(req, 'backup_codes_regenerated', 'users', req.user.id);

    res.json({
      success: true,
      backupCodes,
      notice:
        'Your backup codes have been regenerated. Save them in a safe place.',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
