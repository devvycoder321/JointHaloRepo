const {
  sequelize,
  User,
  Role,
  Permission,
  RolePermission,
  AuditLog,
  BackupCode,
  Ticket,
} = require('./models');
const bcryptjs = require('bcryptjs');

const initializeDatabase = async () => {
  try {
    // Sync database
    await sequelize.sync({ alter: false, force: false });
    console.log('✅ Database synchronized');

    // Seed roles
    const roles = [
      { name: 'super_admin', description: 'Super Administrator - Full system access' },
      { name: 'admin', description: 'Administrator - Most features' },
      { name: 'manager', description: 'Manager - Team management' },
      { name: 'technician', description: 'Technician - Technical operations' },
      { name: 'user', description: 'User - Basic access' },
    ];

    for (const roleData of roles) {
      await Role.findOrCreate({
        where: { name: roleData.name },
        defaults: roleData,
      });
    }
    console.log('✅ Roles seeded');

    // Seed permissions
    const permissions = [
      // User permissions
      { name: 'user:create', resource: 'users', action: 'create' },
      { name: 'user:read', resource: 'users', action: 'read' },
      { name: 'user:update', resource: 'users', action: 'update' },
      { name: 'user:delete', resource: 'users', action: 'delete' },

      // Role permissions
      { name: 'role:create', resource: 'roles', action: 'create' },
      { name: 'role:read', resource: 'roles', action: 'read' },
      { name: 'role:update', resource: 'roles', action: 'update' },
      { name: 'role:delete', resource: 'roles', action: 'delete' },

      // Ticket permissions
      { name: 'ticket:create', resource: 'tickets', action: 'create' },
      { name: 'ticket:read', resource: 'tickets', action: 'read' },
      { name: 'ticket:update', resource: 'tickets', action: 'update' },
      { name: 'ticket:delete', resource: 'tickets', action: 'delete' },
      { name: 'ticket:assign', resource: 'tickets', action: 'assign' },
      { name: 'ticket:approve', resource: 'tickets', action: 'approve' },
      { name: 'ticket:time-entry', resource: 'tickets', action: 'time_entry' },

      // Client permissions
      { name: 'client:create', resource: 'clients', action: 'create' },
      { name: 'client:read', resource: 'clients', action: 'read' },
      { name: 'client:update', resource: 'clients', action: 'update' },
      { name: 'client:delete', resource: 'clients', action: 'delete' },

      // Audit permissions
      { name: 'audit:read', resource: 'audit', action: 'read' },

      // Admin permissions
      { name: 'admin:settings', resource: 'admin', action: 'settings' },
      { name: 'admin:users', resource: 'admin', action: 'users' },
      { name: 'admin:roles', resource: 'admin', action: 'roles' },
    ];

    for (const permData of permissions) {
      await Permission.findOrCreate({
        where: { name: permData.name },
        defaults: permData,
      });
    }
    console.log('✅ Permissions seeded');

    // Assign permissions to roles
    const superAdminRole = await Role.findOne({ where: { name: 'super_admin' } });
    const adminRole = await Role.findOne({ where: { name: 'admin' } });
    const allPermissions = await Permission.findAll();

    if (superAdminRole) {
      await superAdminRole.setPermissions(allPermissions);
    }

    if (adminRole) {
      const adminPermissions = await Permission.findAll({
        where: {
          name: [
            'user:read',
            'user:create',
            'user:update',
            'ticket:create',
            'ticket:read',
            'ticket:update',
            'ticket:assign',
            'ticket:approve',
            'ticket:time-entry',
            'client:create',
            'client:read',
            'client:update',
            'audit:read',
          ],
        },
      });
      await adminRole.setPermissions(adminPermissions);
    }
    console.log('✅ Role-Permission associations seeded');

    // Create demo super admin user if not exists, or repair missing role assignment
    const existingAdmin = await User.findOne({ where: { email: 'admin@halo.local' } });
    if (!existingAdmin) {
      const adminUser = new User({
        email: 'admin@halo.local',
        display_name: 'System Administrator',
        role_id: superAdminRole.id,
        status: 'active',
      });
      adminUser.setPassword('SecureAdmin123!');
      await adminUser.save();
      console.log('✅ Demo admin user created: admin@halo.local / SecureAdmin123!');
    } else {
      if (!existingAdmin.role_id) {
        existingAdmin.role_id = superAdminRole.id;
        await existingAdmin.save();
        console.log('✅ Demo admin user repaired with super_admin role assignment');
      } else {
        console.log('✅ Demo admin user already exists');
      }
    }

    console.log('\n✨ Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
