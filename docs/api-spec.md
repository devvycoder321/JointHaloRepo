# API Specification

## Source of Truth
- Existing functionality: `docs/CURRENT_SYSTEM_AUDIT.md`
- Missing functionality: `docs/GAP_ANALYSIS.md`

## Current API Endpoints

### Health
- `GET /`
- Response: `200 OK`
- Body: `{ status: 'ok', message: 'Halo Backend Running' }`

### AI
- `POST /ai`
- Request: `{ prompt: string }`
- Response: `{ reply: string }`
- Current behavior: local echo response.

### Tickets
- `POST /tickets`
- Request: `{ title: string }`
- Response: created ticket object
- `GET /tickets`
- Response: array of tickets

## Planned API Endpoints

### Authentication
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `POST /auth/password-reset`
- `POST /auth/mfa/verify`

### Users & Permissions
- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`
- `GET /roles`
- `POST /roles`
- `PUT /roles/:id`
- `DELETE /roles/:id`
- `GET /permissions`
- `POST /permissions`
- `PUT /permissions/:id`
- `DELETE /permissions/:id`
- `POST /roles/:id/permissions`

### Clients
- `GET /clients`
- `GET /clients/:id`
- `POST /clients`
- `PUT /clients/:id`
- `DELETE /clients/:id`
- `GET /clients/:id/contacts`
- `POST /clients/:id/contacts`
- `PUT /clients/:id/contacts/:contactId`
- `DELETE /clients/:id/contacts/:contactId`
- `GET /clients/:id/devices`
- `POST /clients/:id/devices`

### Tickets
- `GET /tickets` (list)
- `GET /tickets/:id` (detail)
- `POST /tickets`
- `PUT /tickets/:id`
- `PATCH /tickets/:id/status`
- `PATCH /tickets/:id/assign`
- `POST /tickets/:id/comments`
- `GET /tickets/:id/comments`
- `GET /tickets/:id/audit`
- `POST /tickets/:id/approve`
- `GET /ticket-reports`

### Quotes
- `GET /quotes`
- `GET /quotes/:id`
- `POST /quotes`
- `PUT /quotes/:id`
- `PATCH /quotes/:id/status`
- `GET /clients/:id/quotes`

### Invoices
- `GET /invoices`
- `GET /invoices/:id`
- `POST /invoices`
- `PUT /invoices/:id`
- `PATCH /invoices/:id/status`
- `GET /clients/:id/invoices`
- `GET /invoices/:id/items`
- `POST /invoices/:id/items`

### Knowledge Base
- `GET /kb/articles`
- `GET /kb/articles/:id`
- `POST /kb/articles`
- `PUT /kb/articles/:id`
- `DELETE /kb/articles/:id`
- `GET /kb/search`
- `GET /clients/:id/kb`

### AI
- `POST /ai/chat`
- `GET /ai/conversations`
- `GET /ai/conversations/:id`
- `POST /ai/conversations/:id/messages`
- `POST /ai/models/select`
- `POST /ai/feedback`

### RMM
- `GET /devices`
- `GET /devices/:id`
- `POST /devices`
- `PUT /devices/:id`
- `GET /devices/:id/agents`
- `POST /devices/:id/agents`
- `POST /devices/:id/commands`
- `GET /rmm/alerts`
- `GET /rmm/reports`

### Learning Centre
- `GET /learning/courses`
- `GET /learning/courses/:id`
- `POST /learning/courses`
- `PUT /learning/courses/:id`
- `GET /learning/enrollments`
- `POST /learning/enrollments`
- `PATCH /learning/enrollments/:id/progress`
- `GET /learning/reports`

### Integrations
- `GET /integrations`
- `GET /integrations/:id`
- `POST /integrations`
- `PUT /integrations/:id`
- `DELETE /integrations/:id`
- `POST /integrations/:id/test`

### Security
- `GET /security/alerts`
- `GET /security/metrics`
- `GET /security/audit-logs`
- `POST /security/scan`
- `GET /security/mfa-policies`
- `PUT /security/mfa-policies/:id`

### App Builder
- `GET /app-builder/projects`
- `POST /app-builder/projects`
- `GET /app-builder/projects/:id`
- `POST /app-builder/projects/:id/build`
- `GET /app-builder/projects/:id/builds`
- `POST /app-builder/projects/:id/source`

## Request/Response Contract Examples

### Create Ticket
- Request:
  ```json
  {
    "title": "Example ticket",
    "description": "Description of the issue",
    "clientId": 1,
    "priority": "medium",
    "category": "support"
  }
  ```
- Response:
  ```json
  {
    "id": 1,
    "clientId": 1,
    "title": "Example ticket",
    "description": "Description of the issue",
    "status": "open",
    "priority": "medium",
    "category": "support",
    "createdBy": 1,
    "assignedTo": null,
    "createdAt": "2026-06-09T00:00:00Z"
  }
  ```

### AI Chat
- Request:
  ```json
  {
    "prompt": "Help me write an invoice template",
    "context": "invoice",
    "model": "default"
  }
  ```
- Response:
  ```json
  {
    "conversationId": 5,
    "reply": "Here is a draft invoice template..."
  }
  ```

## Notes
- The current API is minimal and focused on a proof-of-concept backend.
- The planned API spec reflects the missing functionality defined in `docs/GAP_ANALYSIS.md`.
- Authentication, validation, permission checks, and error handling should be added before production use.
