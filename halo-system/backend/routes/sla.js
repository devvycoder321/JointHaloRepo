const express = require('express');
const router = express.Router();
const auditService = require('../services/audit');
const SlaService = require('../services/sla');
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { Ticket, Client } = require('../db/models');

// SLA summary for dashboard or reporting
router.get('/summary', authenticate, requirePermission('sla:read'), async (req, res) => {
  try {
    const tickets = await Ticket.findAll({ include: [Client] });
    const summary = {
      total_tickets: tickets.length,
      breached: 0,
      on_track: 0,
      by_tier: {},
    };

    tickets.forEach((ticket) => {
      const details = SlaService.getTicketSlaStatus(ticket, ticket.Client);
      if (details.isBreached) {
        summary.breached += 1;
      } else {
        summary.on_track += 1;
      }

      const tier = details.slaTier || 'bronze';
      summary.by_tier[tier] = (summary.by_tier[tier] || 0) + 1;
    });

    res.json({ success: true, summary });
  } catch (error) {
    await auditService.logFailure(req, 'sla_summary_failed', error.message);
    res.status(500).json({ error: error.message });
  }
});

// SLA details for a single ticket
router.get('/tickets/:id', authenticate, requirePermission('sla:read'), async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const slaDetails = await SlaService.getTicketSlaDetails(ticket);
    res.json({ success: true, sla: slaDetails });
  } catch (error) {
    await auditService.logFailure(req, 'sla_detail_failed', error.message, 'tickets', req.params.id);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
