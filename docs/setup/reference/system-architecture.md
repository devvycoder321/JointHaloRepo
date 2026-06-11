# System Architecture

## Source of Truth
- Existing functionality: `docs/CURRENT_SYSTEM_AUDIT.md`
- Missing functionality: `docs/GAP_ANALYSIS.md`

## Current Architecture

### Frontend
- Single static HTML page: `halo-system/frontend/index.html`
- Provides basic AI prompt input, ticket creation, and ticket listing.
- Uses client-side JavaScript to call backend API endpoints.
- Determines backend URL dynamically for Codespaces and localhost environments.

### Backend
- Node.js with Express server: `halo-system/backend/server.js`
- Global CORS support.
- JSON request parsing with `express.json()`.
- In-memory ticket store implemented as a JavaScript array.
- Runs on port `3000`.

### API
- `GET /` health check
- `POST /ai` echo prompt response
- `POST /tickets` create ticket
- `GET /tickets` list tickets

### Data
- No persistent database is implemented.
- Ticket state is stored only in memory and is lost on restart.

### Deployment
- Designed for local development and GitHub Codespaces.
- Frontend can be served via a simple static server on port `5500`.
- Backend is a standalone Express app on port `3000`.

## Recommended Architecture for Halo System

The full system should evolve into a modular platform with the following layers:

### 1. Presentation Layer
- Web frontend with a multi-page or SPA shell.
- Dashboard, ticketing, clients, invoices, knowledge base, AI chat, RMM, learning, security, and app builder views.
- Role-aware navigation and page-level permission gating.

### 2. API Layer
- RESTful backend API with domain-specific routes.
- Route groups: authentication, users, roles, clients, tickets, invoices, quotes, knowledge base, AI, RMM, learning, security, integrations, and app builder.
- Consistent request/response schema and error handling.

### 3. Business Logic Layer
- Services for ticket workflows, SLA evaluation, audit logging, invoice generation, AI orchestration, RMM alerts, learning progress, and system integrations.
- Permission enforcement at service boundaries.
- Validation and security checks for every write operation.

### 4. Data Layer
- Persistent relational database for core entities.
- Tables for users, roles, permissions, clients, contacts, tickets, invoices, quotes, devices, agents, knowledge articles, learning content, AI sessions, audit logs, and settings.
- Optional document store for AI history, attachments, or logs.

### 5. Security Layer
- Authentication service with JWT, sessions, or OAuth.
- Role-based access control (RBAC) plus resource-level permissions.
- MFA/TOTP and conditional access support.
- Audit log capture for all user and system actions.

### 6. AI Layer
- AI orchestration service to integrate with external providers.
- Support for fallback models and selectively restricted internal vs client prompts.
- Chat history storage and retention policies.
- AI workflow endpoints for invoices, quotes, knowledge search, troubleshooting, and system automation.

### 7. Integration Layer
- Connector service for third-party systems.
- Integration metadata, token management, and admin approval flows.
- Plugins for Slack, GitHub, Clockify, Xero, Microsoft, WordPress, VoIP, payments, backup partners, and other services.

### 8. Extension Layer
- App Builder and DevConsole.
- Build management, artifact storage, and deployment workflows.
- Secure developer access and rollback support.

## High-Level Diagram (Text)

Frontend (Browser)
  ↕
API Gateway / Express Backend
  ↕
Business Services
  ↕
Database   ↔  Audit Store
  ↕
External Systems: AI providers, payment gateways, RMM agents, integrations

## Architectural Principles
- Keep the current codebase as a prototype starter; do not modify application code for planning.
- Prioritize authentication, permissions, clients, ticketing, quotes, invoices, knowledge base, AI, RMM, learning, security, and app builder.
- Design the system for modular expansion so future phases can be implemented incrementally.
- Separate concerns: API routing, business logic, persistence, and external integrations.
- Provide an audit trail and strong permission enforcement from the first production-ready iteration.
