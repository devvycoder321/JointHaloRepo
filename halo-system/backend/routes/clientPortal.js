const express = require('express');
const router = express.Router();
const { Ticket, Client, ClientUser, User } = require('../db/models');
const auditService = require('../services/audit');
const SlaService = require('../services/sla');
const { authenticate } = require('../middleware/auth');

const getClientIdsForUser = async (userId) => {
  const memberships = await ClientUser.findAll({ where: { user_id: userId } });
  return memberships.map((membership) => membership.client_id);
};

const verifyClientMembership = async (userId, clientId) => {
  if (!clientId) return false;
  const clientIds = await getClientIdsForUser(userId);
  return clientIds.includes(clientId);
};

// Client portal profile and membership details
router.get('/profile', authenticate, async (req, res) => {
  try {
    const clientIds = await getClientIdsForUser(req.user.id);
    if (clientIds.length === 0) {
      return res.status(403).json({ error: 'No client membership found' });
    }

    const clients = await Client.findAll({ where: { id: clientIds } });
    const memberships = await ClientUser.findAll({ where: { user_id: req.user.id } });

    res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        display_name: req.user.display_name,
        role: req.user.role,
      },
      clients: clients.map((client) => ({
        id: client.id,
        name: client.name,
        reference_code: client.reference_code,
        sla_tier: client.sla_tier,
        metadata: client.metadata,
      })),
      memberships: memberships.map((membership) => ({
        client_id: membership.client_id,
        role: membership.role,
      })),
    });
  } catch (error) {
    await auditService.logFailure(req, 'portal_profile_failed', error.message);
    res.status(500).json({ error: error.message });
  }
});

// List tickets for the current client's portal user
router.get('/tickets', authenticate, async (req, res) => {
  try {
    const clientIds = await getClientIdsForUser(req.user.id);
    if (clientIds.length === 0) {
      return res.status(403).json({ error: 'No client membership found' });
    }

    const tickets = await Ticket.findAll({
      where: { client_id: clientIds },
      include: [
        { model: Client, attributes: ['id', 'name', 'reference_code'] },
        { model: User, as: 'assigned_agent', attributes: ['id', 'email', 'display_name'] },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, tickets });
  } catch (error) {
    await auditService.logFailure(req, 'portal_tickets_failed', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get a single ticket for the portal user
router.get('/tickets/:id', authenticate, async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [
        { model: Client, attributes: ['id', 'name', 'reference_code'] },
        { model: User, as: 'assigned_agent', attributes: ['id', 'email', 'display_name'] },
      ],
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (!(await verifyClientMembership(req.user.id, ticket.client_id))) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ success: true, ticket });
  } catch (error) {
    await auditService.logFailure(req, 'portal_ticket_read_failed', error.message, 'tickets', req.params.id);
    res.status(500).json({ error: error.message });
  }
});

// Create a ticket from the client portal
router.post('/tickets', authenticate, async (req, res) => {
  try {
    const { title, description, type, priority, category, subcategory, client_id } = req.body;

    if (!title || !client_id) {
      return res.status(400).json({ error: 'Title and client_id are required' });
    }

    if (!(await verifyClientMembership(req.user.id, client_id))) {
      return res.status(403).json({ error: 'Access denied for this client' });
    }

    const client = await Client.findByPk(client_id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const sla_due_at = await SlaService.computeTicketSlaDueDate({ created_at: new Date() }, client);

    const ticket = await Ticket.create({
      title,
      description: description || null,
      type: type || 'support',
      priority: priority || 'medium',
      status: 'open',
      client_id,
      approval_required: type === 'change_request',
      approval_status: type === 'change_request' ? 'pending' : 'approved',
      category: category || null,
      subcategory: subcategory || null,
      sla_due_at,
      created_by: req.user.id,
      updated_by: req.user.id,
    });

    await auditService.log(req, 'portal_ticket_created', 'tickets', ticket.id, {
      client_id,
      title,
      type,
    });

    res.status(201).json({ success: true, ticket });
  } catch (error) {
    await auditService.logFailure(req, 'portal_ticket_create_failed', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
