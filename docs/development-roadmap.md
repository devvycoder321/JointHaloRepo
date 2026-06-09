# Development Roadmap

## Current phase assessment
The system is now in a strong Phase 1/2/3 foundation state. The next wave should focus on completing the business modules and then expanding into the operational platforms.

## Phase 1 — Core platform
Status: Complete / operational
Deliverables now in place:
- Backend runtime, Express and Node.js
- SQLite / Sequelize persistence
- Auth, JWT and RBAC
- User and role management
- Audit logging
- Dashboard and monitoring foundation

## Phase 2 — Ticketing
Status: Partial / strong foundation
What is done:
- Ticket CRUD, assignment, status, priorities and approvals
- SLA awareness and time tracking
What remains:
- richer approval routing, client-facing portal polish, reporting exports and automation triggers

## Phase 3 — Clients
Status: Partial / strong foundation
What is done:
- Client records and client-user membership support
- Client access controls and portal-ready API shape
What remains:
- richer client portal UX, onboarding/offboarding flows and client-specific service views

## Phase 4 — Quotes and invoices
Status: Planned
Planned work:
- quote forms and approvals
- invoice templates and draft generation
- accounting metadata and tax/VAT handling
- billing permissions and automated invoice draft rules

## Phase 5 — Knowledge base and AI enablement
Status: Partial / foundation only
Planned work:
- KB article lifecycle
- search, tagging and client-scoped KB content
- real AI provider integration and chat history retention
- usage limits and safe agent behaviour

## Phase 6 — RMM and backup
Status: Planned
Planned work:
- device registration and heartbeat monitoring
- patch and alert management
- remote scripting endpoints and backup policy flow
- client-specific RMM service tiers

## Phase 7 — Learning centre
Status: Planned
Planned work:
- course catalog and user progress
- exam booking links and sponsorship workflow
- KPI and performance reporting

## Phase 8 — Integrations centre
Status: Planned
Planned work:
- connector framework for GitHub, Slack, Microsoft, Xero, Clockify, WordPress and more
- consent-driven integrations and secret handling
- health checks and admin approval workflows

## Phase 9 — Security and vault
Status: Planned
Planned work:
- security scoring and incident workflows
- vault model and secure secrets storage
- MFA policy controls and tenant-aware conditional access

## Phase 10 — App builder and DevConsole
Status: Planned
Planned work:
- app project builder, build history and rollback controls
- developer terminal access and deployment guardrails
- artifact signing and secure release flows

## Immediate next sprint
1. Finish UI and permission polish for dashboard, tickets and clients.
2. Add KB data model and article CRUD.
3. Introduce invoice/quote foundation.
4. Add first RMM device registration and alert flow.
5. Hook the AI settings into a real provider with safe history storage.
