const express = require('express');
const router = express.Router();
const { AuditLog } = require('../db/models');
const auditService = require('../services/audit');
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

// Get own audit logs
router.get('/me', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const { count, rows } = await auditService.getByUser(
      req.user.id,
      limit,
      offset
    );

    res.json({
      success: true,
      total: count,
      page,
      limit,
      logs: rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all audit logs (admin only)
router.get('/', authenticate, requirePermission('audit:read'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const filters = {};
    if (req.query.action) filters.action = req.query.action;
    if (req.query.entity_type) filters.entity_type = req.query.entity_type;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.user_id) filters.user_id = parseInt(req.query.user_id);

    const { count, rows } = await auditService.getAll(limit, offset, filters);

    res.json({
      success: true,
      total: count,
      page,
      limit,
      logs: rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get audit logs for specific entity
router.get('/:entityType/:entityId', authenticate, requirePermission('audit:read'), async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    const logs = await auditService.getByEntity(entityType, parseInt(entityId));

    res.json({
      success: true,
      logs,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
