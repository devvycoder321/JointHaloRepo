const jwt = require('jsonwebtoken');
const { User, Role, Permission } = require('../db/models');

const JWT_SECRET = process.env.JWT_SECRET || 'halo-dev-secret-key-change-in-production';
const JWT_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

const authService = {
  // Generate JWT token
  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.Role?.name,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
  },

  // Generate refresh token
  generateRefreshToken(user) {
    return jwt.sign(
      {
        id: user.id,
        type: 'refresh',
      },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
  },

  // Verify token
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  },

  // Register new user
  async register(email, password, displayName, roleId = 5) {
    // Validate password strength
    if (!this.validatePassword(password)) {
      throw new Error(
        'Password must be at least 12 characters and include uppercase, lowercase, numbers, and special characters'
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Create user
    const user = new User({
      email,
      display_name: displayName || email.split('@')[0],
      role_id: roleId,
      status: 'active',
    });

    user.setPassword(password);
    await user.save();

    // Load role for response
    await user.reload({ include: Role });

    return user;
  },

  // Login user
  async login(email, password) {
    const user = await User.findOne({
      where: { email },
      include: Role,
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.status !== 'active') {
      throw new Error('Account is inactive');
    }

    if (!user.validatePassword(password)) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    return user;
  },

  // Get user with permissions
  async getUserWithPermissions(userId) {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Role,
          include: [Permission],
        },
      ],
    });

    if (!user) {
      return null;
    }

    // Extract permission names
    const permissions = user.Role?.Permissions?.map((p) => p.name) || [];

    return {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      role: user.Role?.name,
      permissions,
      mfa_enabled: user.mfa_enabled,
      mfa_verified: user.mfa_verified,
      status: user.status,
    };
  },

  // Validate password strength
  validatePassword(password) {
    const minLength = 12;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    return (
      password.length >= minLength &&
      hasUppercase &&
      hasLowercase &&
      hasNumbers &&
      hasSpecialChar
    );
  },

  // Check if user has permission
  hasPermission(userPermissions, requiredPermission) {
    return userPermissions.includes(requiredPermission) ||
           userPermissions.includes('admin:*') ||
           userPermissions.includes('*');
  },
};

module.exports = authService;
