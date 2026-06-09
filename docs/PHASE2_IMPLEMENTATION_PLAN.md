# Halo IT 365 — Phase 2 Implementation Plan

## Phase 2 Objective

Transform the existing Phase 1 secure core platform into a minimal viable, API-first MSP/ITSM operational layer while preserving and extending:
- existing RBAC
- audit logging
- database persistence
- auth and MFA
- API-first design
- extensible architecture for Phase 3+ expansion

## Current Repository State (Actual Phase 1)

The current backend is already beyond the old starter skeleton:
- Node.js + Express API server
- Sequelize + SQLite persistence
- JWT auth and refresh tokens
- MFA (TOTP + backup codes)
- RBAC via Roles, Permissions, and a `requirePermission()` middleware
- Audit logging for successes and failures
- API route structure with `/api/auth`, `/api/mfa`, `/api/users`, `/api/audit-logs`, `/api/dashboard`, `/api/ai`
- Existing `Ticket` model and ticket API endpoints
- AI provider abstraction via `ai/aiService`

> Note: `docs/CURRENT_SYSTEM_AUDIT.md` is outdated relative to the actual backend code. The plan below uses the real `halo-system/backend` implementation.

## Phase 2 Core Expansion Architecture

Phase 2 adds the new operational layer in the following systems:

1. Advanced Ticketing Engine
2. Client Management System
3. SLA Engine
4. Notification Engine
5. Knowledge Base System
6. Invoice MVP
7. Quote MVP
8. AI Assistant v2 (restricted)
9. RMM Event Foundation
10. Client Portal Expansion

Each module must integrate with RBAC, audit, and the database.

---

## Phase 2 Implementation Order

### Step 1 — Advanced Ticketing Upgrade

Minimum viable ticketing expansion:
- Data model upgrade
  - `Ticket.type` enum: `support`, `request`, `change_request`, `maintenance`, `system_generated`
  - `Ticket.priority`: `low`, `medium`, `high`, `critical`
  - `Ticket.status`: `open`, `in_progress`, `pending`, `resolved`, `closed`
  - `Ticket.assigned_agent_id`
  - `Ticket.client_id`
  - `Ticket.approval_required`
  - `Ticket.approval_status`: `pending`, `approved`, `rejected`
  - `Ticket.category`, `Ticket.subcategory`
  - `Ticket.time_tracked_minutes`
  - `Ticket.requires_closure_justification`
  - `Ticket.created_by`, `Ticket.updated_by`
- Related models
  - `TicketTimeEntry` for start/stop logs
  - `TicketApproval` for approval chain and peer review
  - `TicketAudit` may reuse global audit logs
- API endpoints
  - POST `/api/tickets` create
  - GET `/api/tickets` list scoped by role/client
  - GET `/api/tickets/:id` read
  - PUT `/api/tickets/:id` update
  - POST `/api/tickets/:id/assign`
  - POST `/api/tickets/:id/approve`
  - POST `/api/tickets/:id/close`
  - POST `/api/tickets/:id/time-entry`
- Business rules
  - enforce approval chain for `change_request`
  - prevent closing unless time tracked or justification present
  - require manager or peer review where configured
  - auto-log audit entries on every ticket action

### Step 2 — Client System + RBAC Integration

Minimum viable client management:
- Models
  - `Client`
  - `ClientUser` membership linking user to client
  - `ClientRole` or scoped permissions for client-side user roles
- Features
  - multiple users per client
  - client-scoped ticket visibility
  - ticket scoping by `client_id`
  - protected client portal API routes
- API
  - CRUD `/api/clients`
  - `/api/clients/:id/users`
  - scoped ticket access by client membership
- Security
  - enforce cross-client isolation
  - ensure internal staff can only access client data per permission rules

### Step 3 — SLA Engine

Minimum viable SLA system:
- Models
  - `SlaTier` (`bronze`, `silver`, `gold`, `platinum`, `custom`)
  - `SlaAgreement`
  - `SlaEvent` for response and resolution tracking
- Ticket integration
  - assign SLA tier at client or ticket level
  - compute response / resolution deadlines
  - store `first_response_at` and `resolved_at`
- Automation
  - auto-escalation when SLA threshold is near
  - breach detection alerts
  - notify assigned agent, manager, client contact

### Step 4 — Notification System

Minimum viable notifications:
- Models
  - `Notification`
  - `NotificationType`
  - `NotificationTarget`
- Events
  - ticket created
  - ticket assigned
  - SLA warning
  - approval required
  - system alert
- Channels
  - in-app notification list
  - email-ready payloads for future delivery
- API
  - GET `/api/notifications`
  - POST `/api/notifications/mark-read`

### Step 5 — Knowledge Base System

Minimum viable KB:
- Models
  - `KbCategory`
  - `KbArticle`
  - `KbArticleTag`
- Features
  - searchable KB articles
  - internal vs client-specific `is_private` or `client_id`
  - AI-assisted suggestions and summarization
- API
  - GET `/api/kb/articles`
  - GET `/api/kb/articles/:id`
  - POST `/api/kb/articles`
  - POST `/api/ai/kb-suggest`
- Security
  - client articles visible only to that client
  - internal KB visible to internal staff only

### Step 6 — Invoice MVP

Minimum viable invoicing:
- Models
  - `Invoice`
  - `InvoiceLineItem`
  - `InvoiceTemplate`
- Features
  - link invoice to client and ticket(s)
  - manual invoice creation
  - support/project/time-based invoice types
  - tax-ready fields and branding metadata
  - draft / issued / paid workflow
- API
  - POST `/api/invoices`
  - GET `/api/invoices`
  - PUT `/api/invoices/:id`
  - POST `/api/invoices/:id/issue`
- Audit
  - log invoice creation, update, approval

### Step 7 — Quote MVP

Minimum viable quoting:
- Models
  - `Quote`
  - `QuoteLineItem`
  - `QuoteRequest`
- Features
  - client/public quote request intake
  - quote drafting and approval
  - convert quote → invoice
- API
  - POST `/api/quotes`
  - GET `/api/quotes`
  - PUT `/api/quotes/:id`
  - POST `/api/quotes/:id/convert`

### Step 8 — AI Assistant v2 (Restricted)

Minimum viable AI expansion:
- Keep existing `ai/aiService` provider abstraction
- Add safe read-only AI channels:
  - `/api/ai/kb-search`
  - `/api/ai/ticket-summary`
  - `/api/ai/sla-summary`
- Enforce role restrictions
- Use Azure DeepSeek as primary provider if configured, fallback to stub provider
- Preserve chat history and retention policy in the future

### Step 9 — RMM Event Foundation

Minimum viable RMM foundation:
- Models
  - `Device`
  - `DeviceEvent`
  - `HealthEvent`
- Features
  - device registration record
  - health event logging model
  - alert trigger scaffolding
- API
  - POST `/api/rmm/devices`
  - GET `/api/rmm/devices`
  - POST `/api/rmm/devices/:id/events`

### Step 10 — Client Portal Expansion

Minimum viable portal expansion:
- Expose client-safe views for:
  - tickets
  - invoices
  - SLA status
  - KB access
  - profile management
- Ensure data isolation and audit for all portal actions
- Keep portal endpoints API-first and frontend-compatible

---

## Permission & Audit Integration Plan

### New permission categories

- `ticket:create`, `ticket:read`, `ticket:update`, `ticket:delete`
- `ticket:assign`, `ticket:approve`, `ticket:close`, `ticket:time-entry`
- `client:create`, `client:read`, `client:update`, `client:delete`
- `sla:read`, `sla:update`, `sla:manage`
- `notification:read`, `notification:write`
- `kb:read`, `kb:create`, `kb:update`, `kb:delete`
- `invoice:create`, `invoice:read`, `invoice:update`, `invoice:issue`
- `quote:create`, `quote:read`, `quote:update`, `quote:convert`
- `rmm:device:create`, `rmm:device:read`, `rmm:event:create`
- `portal:client:read`, `portal:client:update`

### Audit logging expectations

Every create/update/delete endpoint must call `auditService.log()` or `auditService.logFailure()`:
- ticket workflow changes
- client membership updates
- SLA assignment and breach events
- notification creation/mark-read actions
- KB article changes
- invoice/quote lifecycle changes
- RMM device/event registration
- AI assistant actions and safe-mode access

---

## Minimum Viable Scope for Phase 2

The first release should focus on operational integration rather than complete feature parity:
- full ticket workflow with approval gating and client isolation
- client entity and client-scoped access
- SLA assignment plus breach detection triggers
- notifications for ticket and SLA events
- searchable KB with internal and client scopes
- invoice and quote CRUD plus conversion flow
- RMM event model with device registration
- AI read-only assistance routes
- client portal APIs to surface these features

Everything can be built as an extensible API layer, leaving richer UI and automation for Phase 3.

---

## Recommended Next Development Steps

1. Create the Phase 2 model layer in `halo-system/backend/db/models.js`:
   - `Client`, `ClientUser`, `TicketTimeEntry`, `TicketApproval`, `SlaTier`, `SlaAgreement`, `Notification`, `KbArticle`, `Invoice`, `Quote`, `Device`, `HealthEvent`
2. Add route modules for each new domain:
   - `routes/tickets.js`, `routes/clients.js`, `routes/sla.js`, `routes/notifications.js`, `routes/kb.js`, `routes/invoices.js`, `routes/quotes.js`, `routes/rmm.js`
3. Seed permissions and roles for Phase 2 features in `db/setup.js`.
4. Add API-first dashboard and portal endpoints extending `routes/dashboard.js`.
5. Keep all actions audited and role-gated using existing middleware.

---

## Delivery Commitment

This plan preserves the exact requested implementation order and ensures Phase 2 remains a minimal viable operational platform with a strong foundation for Phase 3:
- preserve Phase 1 security and RBAC
- implement each new module only once it depends on the prior system
- avoid building non-critical features until the core module is operational
- keep all endpoints API-first and database-backed

Once you confirm, I can begin by scaffolding the Phase 2 models and route modules for Step 1 and Step 2.
