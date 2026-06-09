# Feature Tracker

## Source of Truth
- Existing functionality: `docs/CURRENT_SYSTEM_AUDIT.md`
- Missing functionality: `docs/GAP_ANALYSIS.md`

## Status Definitions
- **Planned**: defined, not started yet.
- **In Progress**: actively being worked on.
- **Complete**: implemented in the current system.
- **Blocked**: cannot proceed until another dependency is resolved.

## Current Feature Status

| Feature | Area | Status | Notes |
|---|---|---|---|
| Health check API | Core Platform | Complete | `GET /` implemented.
| AI prompt echo | AI | Complete | `POST /ai` returns local response.
| Ticket create | Ticketing | Complete | `POST /tickets` implemented.
| Ticket list | Ticketing | Complete | `GET /tickets` implemented.
| Static frontend UI | Core Platform | Complete | Basic HTML page with fetch calls.
| Dynamic Codespaces URL support | Core Platform | Complete | Frontend resolves backend URL.
| Persistent database | Core Platform | Planned | Required for production data.
| Authentication | Security | Planned | No auth exists.
| Permissions / RBAC | Security | Planned | No permission system exists.
| Client portal | Clients | Planned | Missing client portal and contacts.
| Client management | Clients | Planned | No client entity support.
| Ticket lifecycle | Ticketing | Planned | Open/in-progress/closed states missing.
| Ticket approvals | Ticketing | Planned | No approval workflow.
| Ticket audit trail | Ticketing | Planned | No ticket audit logging.
| Quotes | Invoicing | Planned | No quote module.
| Invoices | Invoicing | Planned | No invoice module.
| Knowledge Base | Knowledge Base | Planned | No KB module.
| AI history + models | AI | Planned | External AI integration missing.
| RMM device management | RMM | Planned | No RMM module.
| Learning courses | Learning Centre | Planned | No learning module.
| Security SOC / alerts | Security | Planned | No security center.
| App builder / DevConsole | App Builder | Planned | No builder features.
| Integrations center | Integrations | Planned | No integration module.

## Blocked Items
- **Permissions / RBAC** is blocked until authentication is available.
- **Client-specific access** is blocked until client and user management are implemented.
- **AI workflows** are blocked until external AI integration and conversation persistence are added.
- **Ticket approval workflows** are blocked until user roles and permissions exist.

## Notes
- All backend and frontend features beyond the current minimal prototype are currently planned.
- The tracker is intentionally conservative: only existing starter functionality is marked complete.
- The next implementation wave should focus on authentication and permissions before expanding core business features.
