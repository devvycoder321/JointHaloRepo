const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { User, Role } = require('../db/models');
const auditService = require('../services/audit');
const authService = require('../services/auth');
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

// Get all users (admin only)
router.get('/', authenticate, requirePermission('user:read'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      attributes: {
        exclude: ['password_hash', 'mfa_secret'],
      },
      include: ['Role'],
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      total: count,
      page,
      limit,
      users: rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: {
        exclude: ['password_hash', 'mfa_secret'],
      },
      include: ['Role'],
    });

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single user (admin only)
router.get('/:id', authenticate, requirePermission('user:read'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: {
        exclude: ['password_hash', 'mfa_secret'],
      },
      include: ['Role'],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user (admin only)
router.post(
  '/',
  [
    body('email').isEmail().normalizeEmail(),
    body('password')
      .isLength({ min: 12 })
      .withMessage('Password must be at least 12 characters'),
    body('display_name').optional().trim(),
    body('role_id').isInt(),
  ],
  authenticate,
  requirePermission('user:create'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, display_name, role_id } = req.body;

      if (!authService.validatePassword(password)) {
        return res.status(400).json({
          error:
            'Password must include uppercase, lowercase, numbers, and special characters',
        });
      }

      const user = await authService.register(email, password, display_name, role_id);

      await auditService.log(req, 'user_created', 'users', user.id, {
        email,
        role_id,
      });

      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          display_name: user.display_name,
          role_id: user.role_id,
          status: user.status,
        },
      });
    } catch (error) {
      await auditService.logFailure(req, 'user_create_failed', error.message);
      res.status(400).json({ error: error.message });
    }
  }
);

// Update user (admin can update others, users can update themselves)
router.put(
  '/:id',
  [
    body('display_name').optional().trim(),
    body('role_id').optional().isInt(),
    body('status').optional().isIn(['active', 'inactive', 'blocked']),
  ],
  authenticate,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = parseInt(req.params.id);

      // Check permissions
      if (userId !== req.user.id) {
        // Updating another user - need admin permission
        if (!req.user.permissions.includes('user:update')) {
          await auditService.logFailure(
            req,
            'user_update_denied',
            'Insufficient permissions'
          );
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { display_name, role_id, status } = req.body;

      if (display_name) {
        user.display_name = display_name;
      }

      if (role_id && req.user.permissions.includes('user:update')) {
        user.role_id = role_id;
      }

      if (status && req.user.permissions.includes('user:update')) {
        user.status = status;
      }

      await user.save();

      await auditService.log(req, 'user_updated', 'users', userId, {
        display_name,
        role_id,
        status,
      });

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          display_name: user.display_name,
          role_id: user.role_id,
          status: user.status,
        },
      });
    } catch (error) {
      await auditService.logFailure(req, 'user_update_failed', error.message);
      res.status(400).json({ error: error.message });
    }
  }
);

// Deactivate user (admin only)
router.delete('/:id', authenticate, requirePermission('user:delete'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.status = 'inactive';
    await user.save();

    await auditService.log(req, 'user_deactivated', 'users', user.id);

    res.json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error) {
    await auditService.logFailure(req, 'user_deactivate_failed', error.message);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
