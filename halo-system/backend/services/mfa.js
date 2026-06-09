const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const bcryptjs = require('bcryptjs');
const { User, BackupCode } = require('../db/models');

const mfaService = {
  // Generate TOTP secret and QR code
  async generateSecret(email) {
    const secret = speakeasy.generateSecret({
      name: `Halo System (${email})`,
      issuer: 'Halo IT Services',
      length: 32,
    });

    // Generate QR code
    const qrCode = await qrcode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode,
      otpauth_url: secret.otpauth_url,
    };
  },

  // Verify TOTP token
  verifyToken(secret, token) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time windows (60 seconds)
    });
  },

  // Enable MFA for user
  async enableMFA(userId, secret, token) {
    // Verify the token first
    if (!this.verifyToken(secret, token)) {
      throw new Error('Invalid TOTP token');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.mfa_secret = secret;
    user.mfa_enabled = true;
    user.mfa_verified = true;
    await user.save();

    // Generate backup codes
    await this.generateBackupCodes(userId);

    return { success: true };
  },

  // Disable MFA for user
  async disableMFA(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.mfa_secret = null;
    user.mfa_enabled = false;
    user.mfa_verified = false;
    await user.save();

    // Delete backup codes
    await BackupCode.destroy({ where: { user_id: userId } });

    return { success: true };
  },

  // Generate backup codes
  async generateBackupCodes(userId) {
    // Delete existing codes
    await BackupCode.destroy({ where: { user_id: userId } });

    const codes = [];
    for (let i = 0; i < 10; i++) {
      const code = `${Math.random().toString(36).substring(2, 8)}-${Math.random()
        .toString(36)
        .substring(2, 8)}`.toUpperCase();

      const hashedCode = bcryptjs.hashSync(code, 10);
      const backupCode = new BackupCode({
        user_id: userId,
        code: hashedCode,
        used: false,
      });

      await backupCode.save();
      codes.push(code);
    }

    return codes;
  },

  // Verify backup code
  async verifyBackupCode(userId, code) {
    const backupCode = await BackupCode.findOne({
      where: { user_id: userId, used: false },
    });

    if (!backupCode) {
      throw new Error('No backup codes available');
    }

    const isValid = bcryptjs.compareSync(code, backupCode.code);
    if (!isValid) {
      throw new Error('Invalid backup code');
    }

    // Mark as used
    backupCode.used = true;
    await backupCode.save();

    return { success: true };
  },

  // Get remaining backup codes count
  async getBackupCodesCount(userId) {
    const count = await BackupCode.count({
      where: { user_id: userId, used: false },
    });

    return count;
  },
};

module.exports = mfaService;
