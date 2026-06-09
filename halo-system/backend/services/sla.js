const { Client } = require('../db/models');

const SLA_DEFAULTS = {
  bronze: {
    responseHours: 8,
    resolutionHours: 72,
  },
  silver: {
    responseHours: 4,
    resolutionHours: 48,
  },
  gold: {
    responseHours: 2,
    resolutionHours: 24,
  },
  platinum: {
    responseHours: 1,
    resolutionHours: 12,
  },
  custom: {
    responseHours: 6,
    resolutionHours: 96,
  },
};

const SlaService = {
  getSlaSettings(client) {
    const tier = client?.sla_tier || 'bronze';
    const metadata = client?.metadata || {};
    const defaults = SLA_DEFAULTS[tier] || SLA_DEFAULTS.bronze;

    return {
      responseHours: Number(metadata.response_hours || defaults.responseHours),
      resolutionHours: Number(metadata.resolution_hours || defaults.resolutionHours),
      tier,
    };
  },

  async computeTicketSlaDueDate(ticket, client) {
    const settings = this.getSlaSettings(client);
    const now = ticket.created_at ? new Date(ticket.created_at) : new Date();
    return new Date(now.getTime() + settings.resolutionHours * 60 * 60 * 1000);
  },

  getTicketSlaStatus(ticket, client) {
    if (!ticket || !ticket.sla_due_at) {
      return {
        status: 'unknown',
        isBreached: false,
        dueInHours: null,
      };
    }

    const now = new Date();
    const dueAt = new Date(ticket.sla_due_at);
    const diffMs = dueAt - now;
    const diffHours = Math.round(diffMs / (60 * 60 * 1000));
    const isBreached = diffMs < 0 && !['resolved', 'closed'].includes(ticket.status);

    return {
      status: isBreached ? 'breached' : 'on_track',
      isBreached,
      dueInHours: diffHours,
      dueAt: dueAt.toISOString(),
      slaTier: client?.sla_tier || 'bronze',
      clientName: client?.name || null,
    };
  },

  async getTicketSlaDetails(ticket) {
    const client = ticket.client_id ? await Client.findByPk(ticket.client_id) : null;
    const slaStatus = this.getTicketSlaStatus(ticket, client);
    const settings = this.getSlaSettings(client);

    return {
      ticket_id: ticket.id,
      title: ticket.title,
      status: ticket.status,
      ticket_type: ticket.type,
      client_id: ticket.client_id,
      client_name: client?.name || null,
      sla_tier: settings.tier,
      sla_due_at: ticket.sla_due_at,
      first_response_at: ticket.first_response_at,
      resolved_at: ticket.resolved_at,
      sla_status: slaStatus.status,
      is_breached: slaStatus.isBreached,
      due_in_hours: slaStatus.dueInHours,
    };
  },
};

module.exports = SlaService;
