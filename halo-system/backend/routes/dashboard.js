const express = require('express');
const router = express.Router();
const { User, Ticket, AuditLog, Role } = require('../db/models');
const { authenticate } = require('../middleware/auth');

// Get dashboard data
router.get('/', authenticate, async (req, res) => {
  try {
    // Get stats
    const totalUsers = await User.count();
    const totalTickets = await Ticket.count();
    const openTickets = await Ticket.count({ where: { status: 'open' } });
    const inProgressTickets = await Ticket.count({ where: { status: 'in_progress' } });
    const closedTickets = await Ticket.count({ where: { status: 'closed' } });

    // Get recent activities
    const recentLogs = await AuditLog.findAll({
      order: [['created_at', 'DESC']],
      limit: 10,
      include: ['User'],
    });

    // Get user's recent tickets
    const userTickets = await Ticket.findAll({
      where: { created_by: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 5,
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalTickets,
        openTickets,
        inProgressTickets,
        closedTickets,
      },
      recentActivities: recentLogs,
      userTickets,
      currentUser: req.user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
