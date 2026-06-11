# Halo IT 365 — Phase 3 Implementation Plan

## Phase 3 Objective

Build the client-facing operational layer for the Halo IT Services 365 platform. Phase 3 turns the system into a true MSP client portal and client management solution by adding secure client access, scoped visibility, and client lifecycle workflows.

## Phase 3 Scope

- Client portal API and frontend
- Client-facing ticket access and creation
- Client user membership and role assignment
- Client onboarding/offboarding support
- Client-specific data isolation and permissions
- Client dashboard and client profile management
- SLA package awareness in client portal views

## Current Repository State

The repository currently includes:
- secure backend auth, RBAC, and audit logging
- client entity model and client CRUD endpoints
- ticket model with client assignment and approval support
- SLA fields on tickets and SLA summary endpoints
- a new client portal API route (`/api/portal`)
- a new client portal frontend shell: `halo-system/frontend/client-portal.html`

## Phase 3 Implementation Architecture

### 1. Client Portal API

Provide API endpoints scoped to users with client membership:
- `GET /api/portal/profile`
- `GET /api/portal/tickets`
- `GET /api/portal/tickets/:id`
- `POST /api/portal/tickets`

These endpoints must enforce:
- client membership verification
- cross-client isolation
- client ownership of ticket data
- audit logging for portal actions

### 2. Client Portal Frontend

Deliver a minimal client portal page that:
- shows client profile and membership details
- lists the client's tickets
- allows portal users to submit new tickets
- uses the same auth token flow as the rest of the platform

### 3. Client Management Enhancements

Extend the existing client management system to support:
- client user membership management
- role-based access for client portal users
- client contacts and client_scoped access
- client metadata, SLA tier, and onboarding status

### 4. Client User Workflows

Add support for:
- registering a client user and assigning them to a client
- promoting/demoting client portal roles
- client-specific ticket creation and status visibility
- portal user safe access without exposing internal staff data

## Phase 3 Deliverables

- `docs/PHASE3_IMPLEMENTATION_PLAN.md`
- `docs/PHASE3_SUMMARY.md`
- new `halo-system/backend/routes/clientPortal.js`
- client portal frontend page `halo-system/frontend/client-portal.html`
- updated backend route registration for `/api/portal`
- documented Phase 3 status in the project README and tracker

## Next Steps

1. Validate and test the client portal endpoints.
2. Add client portal UI navigation and user flows.
3. Extend client membership management to support client contacts.
4. Add client dashboard widgets and SLA package display.
5. Build client onboarding/offboarding workflow.
