const authService = require('../services/auth');
const { User, Role, Permission } = require('../db/models');

// Extract token from request
function extractToken(req) {
  // Try to get token from Authorization header
  const authHeader = req.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try to get token from cookies
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return null;
}

// Authenticate middleware - verifies JWT token
const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = authService.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Load user with permissions
    const user = await authService.getUserWithPermissions(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (token) {
      const decoded = authService.verifyToken(token);
      if (decoded) {
        const user = await authService.getUserWithPermissions(decoded.id);
        if (user) {
          req.user = user;
        }
      }
    }

    next();
  } catch (error) {
    // Silently continue without user
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth,
};
