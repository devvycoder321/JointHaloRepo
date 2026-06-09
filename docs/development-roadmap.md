# Development Roadmap

## Source of Truth
- Existing functionality: `docs/CURRENT_SYSTEM_AUDIT.md`
- Missing functionality: `docs/GAP_ANALYSIS.md`

## Roadmap Principles
- Prioritize authentication and permission foundations first.
- Build clients and ticketing next as core business capability.
- Add quotes, invoices, knowledge base, and AI in sequenced phases.
- Reserve RMM, learning, security, and app builder for later phases.
- Keep the roadmap aligned with the user-specified priority order.

## Phase 1: Core Platform
Goals:
- Establish persistent storage and user management.
- Enable secure access and role-based controls.
- Create the application shell and dashboard foundation.

Deliverables:
- Database integration.
- Authentication endpoints and login/registration.
- Roles and permissions model.
- User management API.
- Basic dashboard and navigation.
- Audit logging and error tracking.

## Phase 2: Ticketing
Goals:
- Implement a complete service desk workflow.
- Add ticket categories, priorities, status flows, and approvals.

Deliverables:
- Full ticket CRUD.
- Ticket states: open, in progress, closed.
- Categories: support, request, change request.
- Priority levels and SLA mapping.
- Ticket comments and audit trail.
- Ticket assignment and approval workflows.
- Ticket reporting and exports.

## Phase 3: Clients
Goals:
- Introduce clients, contacts, and client-specific access.
- Support onboarding, offboarding, and client portals.

Status:
- In progress: client portal API and membership support are under development.

Deliverables:
- Client profile management.
- Client contacts and roles.
- Client device/customer asset records.
- Client-specific dashboards.
- Client login and secure client portal.
- Identity verification workflows.

## Phase 4: Quotes & Invoices
Goals:
- Add commercial billing and quote generation.
- Support draft workflows, templates, and permissions.

Deliverables:
- Quote creation and approval.
- Invoice generation, editing, and payment status.
- Invoice items and templating.
- Accounting metadata (tax, currency, totals).
- Invoice draft automation from ticket closure.
- Permissions for billing and accounting roles.

## Phase 5: Knowledge Base
Goals:
- Build a searchable knowledge base for agents and clients.
- Allow internal and client-scoped documentation.

Deliverables:
- Knowledge article CRUD.
- Search and categorization.
- Article visibility rules.
- Client-specific KB sections.
- Audit logging for knowledge edits.

## Phase 6: AI
Goals:
- Integrate real AI capabilities beyond the current echo stub.
- Create a safe internal/external AI workflow.

Deliverables:
- AI chat endpoints with provider integration.
- Conversation persistence and retention policies.
- Model selection and fallback option.
- AI-driven workflows for invoices, quotes, troubleshooting, and KB search.
- AI usage limits for clients/guests.

## Phase 7: RMM
Goals:
- Add remote monitoring and management concepts.
- Track devices, agents, and alerts.

Deliverables:
- Device and agent inventory.
- RMM onboarding and heartbeat tracking.
- Remote command execution endpoints.
- Patch and update management metadata.
- Alert generation linked to tickets.

## Phase 8: Learning Centre
Goals:
- Provide training course and progress tracking.
- Support exam paths and sponsorship workflows.

Deliverables:
- Course catalog management.
- User enrollments and progress tracking.
- Learning reports and KPIs.
- Exam booking/resource links.
- Sponsorship request workflow.

## Phase 9: Security Centre
Goals:
- Establish security monitoring and policy controls.
- Add MFA and audit capabilities.

Deliverables:
- Security alerts dashboard.
- Audit logs and threat metrics.
- MFA/TOTP policy management.
- Security scan and incident reporting endpoints.
- Vault/password-style secure storage conceptual support.

## Phase 10: App Builder
Goals:
- Add internal app creation and DevConsole capabilities.
- Enable secure build management and deployment.

Deliverables:
- App Builder project management.
- Source upload and build trigger endpoints.
- Build history and artifact tracking.
- Rollback support.
- Secure developer access and workspace isolation.

## Timeline Notes
- Start with Phase 1 and Phase 2 in tandem where possible.
- Phase 3 (Clients) should follow ticketing because clients are a dependency for ticket workflows.
- Quotes and invoices should be built after core ticket and client entities exist.
- AI can be implemented after basic business entities exist, but an initial stub can remain until later.
- RMM, learning, security, and app builder can be built as discrete subsystems once core platform stability is established.
