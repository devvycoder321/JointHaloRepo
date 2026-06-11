# Database Schema

## Source of Truth
- Existing functionality: `docs/CURRENT_SYSTEM_AUDIT.md`
- Missing functionality: `docs/GAP_ANALYSIS.md`

## Current Database Status
- No database is currently implemented.
- The system uses in-memory storage for tickets only.

## Recommended Relational Schema

### 1. `users`
- `id` PK
- `email` unique
- `password_hash`
- `display_name`
- `role_id` FK -> `roles.id`
- `status` (active/inactive/blocked)
- `created_at`
- `updated_at`

### 2. `roles`
- `id` PK
- `name`
- `description`
- `created_at`
- `updated_at`

### 3. `permissions`
- `id` PK
- `name`
- `description`
- `created_at`
- `updated_at`

### 4. `role_permissions`
- `id` PK
- `role_id` FK -> `roles.id`
- `permission_id` FK -> `permissions.id`
- `created_at`

### 5. `clients`
- `id` PK
- `name`
- `industry`
- `status`
- `primary_contact_id` FK -> `client_contacts.id`
- `created_at`
- `updated_at`

### 6. `client_contacts`
- `id` PK
- `client_id` FK -> `clients.id`
- `name`
- `email`
- `phone`
- `role`
- `created_at`
- `updated_at`

### 7. `tickets`
- `id` PK
- `client_id` FK -> `clients.id`
- `created_by` FK -> `users.id`
- `assigned_to` FK -> `users.id`
- `title`
- `description`
- `status` (`open`, `in_progress`, `closed`, etc.)
- `priority` (`low`, `medium`, `high`)
- `category` (`support`, `request`, `change_request`)
- `sub_category`
- `sla_plan_id` FK -> `sla_plans.id`
- `created_at`
- `updated_at`
- `started_at`
- `ended_at`
- `approved_by` FK -> `users.id`
- `approval_status`

### 8. `ticket_comments`
- `id` PK
- `ticket_id` FK -> `tickets.id`
- `author_id` FK -> `users.id`
- `message`
- `created_at`

### 9. `ticket_audits`
- `id` PK
- `ticket_id` FK -> `tickets.id`
- `user_id` FK -> `users.id`
- `action`
- `details`
- `created_at`

### 10. `ticket_history`
- `id` PK
- `ticket_id` FK -> `tickets.id`
- `status`
- `changed_by` FK -> `users.id`
- `changed_at`

### 11. `sla_plans`
- `id` PK
- `name`
- `description`
- `response_time_hours`
- `resolution_time_hours`
- `created_at`
- `updated_at`

### 12. `invoices`
- `id` PK
- `client_id` FK -> `clients.id`
- `created_by` FK -> `users.id`
- `invoice_number`
- `status` (`draft`, `sent`, `paid`, `overdue`)
- `total_amount`
- `tax_amount`
- `currency`
- `issued_at`
- `due_at`
- `created_at`
- `updated_at`

### 13. `invoice_items`
- `id` PK
- `invoice_id` FK -> `invoices.id`
- `description`
- `quantity`
- `unit_price`
- `total_price`
- `created_at`

### 14. `quotes`
- `id` PK
- `client_id` FK -> `clients.id`
- `created_by` FK -> `users.id`
- `quote_number`
- `status` (`draft`, `sent`, `approved`, `rejected`)
- `total_amount`
- `currency`
- `created_at`
- `updated_at`

### 15. `quote_items`
- `id` PK
- `quote_id` FK -> `quotes.id`
- `description`
- `quantity`
- `unit_price`
- `total_price`
- `created_at`

### 16. `knowledge_articles`
- `id` PK
- `title`
- `body`
- `category`
- `client_id` FK -> `clients.id` nullable
- `author_id` FK -> `users.id`
- `visibility` (`internal`, `client`, `public`)
- `created_at`
- `updated_at`

### 17. `ai_conversations`
- `id` PK
- `user_id` FK -> `users.id`
- `client_id` FK -> `clients.id` nullable
- `model`
- `purpose`
- `created_at`
- `updated_at`

### 18. `ai_messages`
- `id` PK
- `conversation_id` FK -> `ai_conversations.id`
- `sender` (`user`, `ai`)
- `message`
- `metadata`
- `created_at`

### 19. `devices`
- `id` PK
- `client_id` FK -> `clients.id`
- `name`
- `type`
- `platform`
- `hostname`
- `serial_number`
- `status`
- `last_seen_at`
- `created_at`
- `updated_at`

### 20. `rmm_agents`
- `id` PK
- `device_id` FK -> `devices.id`
- `agent_version`
- `status`
- `installed_at`
- `last_heartbeat_at`
- `created_at`
- `updated_at`

### 21. `learning_courses`
- `id` PK
- `title`
- `description`
- `category`
- `level`
- `duration_hours`
- `created_at`
- `updated_at`

### 22. `learning_enrollments`
- `id` PK
- `course_id` FK -> `learning_courses.id`
- `user_id` FK -> `users.id`
- `progress_percent`
- `status`
- `started_at`
- `completed_at`
- `created_at`
- `updated_at`

### 23. `integrations`
- `id` PK
- `name`
- `provider`
- `client_id` FK -> `clients.id` nullable
- `status`
- `settings`
- `created_at`
- `updated_at`

### 24. `audit_logs`
- `id` PK
- `user_id` FK -> `users.id` nullable
- `entity_type`
- `entity_id`
- `action`
- `details`
- `created_at`

### 25. `attachments`
- `id` PK
- `entity_type`
- `entity_id`
- `file_name`
- `file_type`
- `url`
- `created_at`

## Notes
- The current system has no persistent storage; this schema is a proposed foundation for the full Halo System.
- A relational database such as PostgreSQL or MySQL is recommended for core entities.
- NoSQL or object storage can be added later for AI logs, attachments, and large document content.
- Tables should support soft delete for audit and compliance purposes.
