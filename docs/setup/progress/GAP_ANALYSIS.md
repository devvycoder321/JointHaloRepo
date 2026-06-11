# Gap Analysis

## Current status
The project has moved from a prototype into a real platform foundation. The major core modules are now present in the backend, and the main remaining gap is the product-layer expansion on top of that foundation.

## What is now in place
- Persistent data layer via SQLite and Sequelize
- Authentication and RBAC
- Ticketing and client management
- SLA and dashboard reporting
- Monitoring and audit logging
- MFA backend support

## Main gaps to the full Halo vision
### 1. Knowledge base and content operations
Gap: no article lifecycle, search, tagging or client-scoped KB experience.
Need: content model, editor UI, permissions, search and audit.

### 2. Commercial modules
Gap: no invoicing, quoting, accounting or payment workflows.
Need: invoice templates, quote requests, commercial approval rules, accounting metadata and tax/VAT support.

### 3. RMM and backup
Gap: no device agent lifecycle, remote actions, backup agents or backup scheduling.
Need: device inventory, heartbeat, alert automation, backup policies and encrypted offsite targets.

### 4. Learning centre
Gap: no training paths, course catalog, progress tracking or sponsor workflows.
Need: course modules, exam links, KPI reporting and user progress records.

### 5. Integrations centre
Gap: no managed integrations for third-party tools or admin-consented automation.
Need: connector model, approval workflow, secrets storage and health checks.

### 6. Security centre and vault
Gap: no SOC, threat scoring, vault, policy engine or secure admin controls.
Need: security scoring, alerts, password vault model, MFA policy controls and incident workflows.

### 7. App builder and DevConsole
Gap: no build pipeline, deployment guardrails or rollback experience.
Need: project builder, artifact storage, signing, rollback and terminal access controls.

### 8. Frontend completeness
Gap: the backend is strong, but many business modules still need polished UI workflows.
Need: screen-by-screen implementation for dashboard, tickets, clients, KB, invoices, RMM, security and DevConsole.

## Priority order
1. Complete the business module UI for tickets, clients and dashboard.
2. Add knowledge base and commercial modules.
3. Build RMM and backup automation.
4. Deliver learning, integrations and security operations.
5. Add app builder and DevConsole with rollback controls.

## Recommended next implementation sprint
- Finish the current UI workflow and permission polish.
- Introduce KB and quote/invoice data models.
- Add a first RMM device register/heartbeat flow.
- Add AI provider integration and a secure chat history model.

