const auditService = require('../services/audit');

// Check if user has required permission
const requirePermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        await auditService.logFailure(
          req,
          'permission_check',
          'Not authenticated',
          null,
          null
        );
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const hasPermission =
        req.user.permissions.includes(requiredPermission) ||
        req.user.permissions.includes('*');

      if (!hasPermission) {
        await auditService.logFailure(
          req,
          'permission_denied',
          `Missing permission: ${requiredPermission}`,
          null,
          null
        );
        return res.status(403).json({
          error: 'Insufficient permissions',
          required: requiredPermission,
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

// Check if user has specific role
const requireRole = (roles) => {
  const roleList = Array.isArray(roles) ? roles : [roles];

  return async (req, res, next) => {
    try {
      if (!req.user) {
        await auditService.logFailure(req, 'role_check', 'Not authenticated');
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (!roleList.includes(req.user.role)) {
        await auditService.logFailure(
          req,
          'role_denied',
          `User role '${req.user.role}' not in required roles: ${roleList.join(', ')}`
        );
        return res.status(403).json({
          error: 'Insufficient role',
          required: roleList,
          current: req.user.role,
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

module.exports = {
  requirePermission,
  requireRole,
};
