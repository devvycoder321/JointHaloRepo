const { AuditLog } = require('../db/models');

const auditService = {
  // Log an action
  async log(req, action, entityType = null, entityId = null, details = null) {
    try {
      const userId = req.user?.id || null;
      const ipAddress = req.ip || req.connection.remoteAddress || null;
      const userAgent = req.get('user-agent') || null;

      await AuditLog.create({
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details: details || {},
        ip_address: ipAddress,
        user_agent: userAgent,
        status: 'success',
      });
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  },

  // Log a failed action
  async logFailure(req, action, reason, entityType = null, entityId = null) {
    try {
      const userId = req.user?.id || null;
      const ipAddress = req.ip || req.connection.remoteAddress || null;
      const userAgent = req.get('user-agent') || null;

      await AuditLog.create({
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details: { reason },
        ip_address: ipAddress,
        user_agent: userAgent,
        status: 'failure',
      });
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  },

  // Get audit logs for user
  async getByUser(userId, limit = 100, offset = 0) {
    return AuditLog.findAndCountAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });
  },

  // Get all audit logs (admin only)
  async getAll(limit = 100, offset = 0, filters = {}) {
    const where = {};

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.entity_type) {
      where.entity_type = filters.entity_type;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.user_id) {
      where.user_id = filters.user_id;
    }

    return AuditLog.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset,
      include: ['User'],
    });
  },

  // Get audit logs for an entity
  async getByEntity(entityType, entityId) {
    return AuditLog.findAll({
      where: { entity_type: entityType, entity_id: entityId },
      order: [['created_at', 'DESC']],
      include: ['User'],
    });
  },
};

module.exports = auditService;
