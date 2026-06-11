# Phase 1 API Reference

## Base URL
```
http://localhost:3000
```

Or via GitHub Codespaces:
```
https://<your-codespace>-3000.app.github.dev
```

---

## Authentication

### Headers
All authenticated requests require:
```
Authorization: Bearer <TOKEN>
Content-Type: application/json
```

### Tokens
- **Access Token**: 15-minute expiration
- **Refresh Token**: 7-day expiration
- Tokens returned in response JSON body
- Use `Bearer <token>` in Authorization header

---

## Endpoints

### Authentication

#### Register User
**POST** `/api/auth/register`

Creates a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "display_name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "display_name": "John Doe",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation:**
- Email must be valid email format
- Password must be 12+ characters with mixed case, numbers, special chars
- Email must not already exist

---

#### Login User
**POST** `/api/auth/login`

Authenticates user and returns JWT token.

**Request:**
```json
{
  "email": "admin@halo.local",
  "password": "SecureAdmin123!"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@halo.local",
    "display_name": "System Administrator",
    "role": "super_admin",
    "mfa_enabled": true,
    "mfa_verified": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "requiresMFA": true
}
```

---

#### Get Current User
**GET** `/api/auth/me`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@halo.local",
    "display_name": "System Administrator",
    "role": "super_admin",
    "permissions": ["*"],
    "mfa_enabled": true,
    "mfa_verified": true,
    "status": "active"
  }
}
```

---

#### Logout
**POST** `/api/auth/logout`

**Authentication:** Required

Logs out the user (client-side token cleanup required).

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### Refresh Token
**POST** `/api/auth/refresh`

Obtains a new access token using refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### Verify MFA
**POST** `/api/auth/verify-mfa`

**Authentication:** Required (but MFA not yet verified)

Verifies TOTP token or backup code.

**Request:**
```json
{
  "token": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "MFA verification successful"
}
```

---

### Multi-Factor Authentication

#### Setup MFA
**POST** `/api/mfa/setup`

**Authentication:** Required

Generates TOTP secret and QR code.

**Response:**
```json
{
  "success": true,
  "secret": "JBSWY3DPEBLW64TMMQ======",
  "qrCode": "data:image/png;base64,iVBORw0KGgo...",
  "otpauth_url": "otpauth://totp/Halo%20System(admin@halo.local)...",
  "message": "Scan this QR code with your authenticator app..."
}
```

---

#### Verify MFA Setup
**POST** `/api/mfa/verify-setup`

**Authentication:** Required

Verifies TOTP setup and enables MFA. Generates backup codes.

**Request:**
```json
{
  "secret": "JBSWY3DPEBLW64TMMQ======",
  "token": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "MFA enabled successfully",
  "backupCodes": [
    "XXXXXX-XXXXXX",
    "XXXXXX-XXXXXX",
    ...
  ],
  "notice": "Save these backup codes in a safe place..."
}
```

---

#### Disable MFA
**POST** `/api/mfa/disable`

**Authentication:** Required

Disables MFA for user.

**Response:**
```json
{
  "success": true,
  "message": "MFA disabled successfully"
}
```

---

#### Get Backup Codes Count
**GET** `/api/mfa/backup-codes-count`

**Authentication:** Required

Returns number of remaining unused backup codes.

**Response:**
```json
{
  "success": true,
  "count": 8
}
```

---

#### Regenerate Backup Codes
**POST** `/api/mfa/regenerate-backup-codes`

**Authentication:** Required

Generates new set of 10 backup codes, invalidating old ones.

**Response:**
```json
{
  "success": true,
  "backupCodes": [
    "XXXXXX-XXXXXX",
    ...
  ],
  "notice": "Your backup codes have been regenerated..."
}
```

---

### Users

#### List All Users
**GET** `/api/users`

**Authentication:** Required
**Permission:** `user:read`

Lists all users (admin only).

**Query Parameters:**
- `page` (int) - Page number (default: 1)
- `limit` (int) - Results per page (default: 20)

**Response:**
```json
{
  "success": true,
  "total": 5,
  "page": 1,
  "limit": 20,
  "users": [
    {
      "id": 1,
      "email": "admin@halo.local",
      "display_name": "System Administrator",
      "role": "super_admin",
      "status": "active",
      "last_login": "2026-06-09T00:57:10.821Z",
      "createdAt": "2026-06-09T00:00:00.000Z"
    }
  ]
}
```

---

#### Get User By ID
**GET** `/api/users/:id`

**Authentication:** Required
**Permission:** `user:read`

Gets specific user details.

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@halo.local",
    "display_name": "System Administrator",
    "role": "super_admin",
    "status": "active",
    "last_login": "2026-06-09T00:57:10.821Z"
  }
}
```

---

#### Create User
**POST** `/api/users`

**Authentication:** Required
**Permission:** `user:create`

Creates new user account (admin only).

**Request:**
```json
{
  "email": "technician@halo.local",
  "password": "SecurePassword123!",
  "display_name": "Tech Support",
  "role_id": 4
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 2,
    "email": "technician@halo.local",
    "display_name": "Tech Support",
    "role_id": 4,
    "status": "active"
  }
}
```

---

#### Update User
**PUT** `/api/users/:id`

**Authentication:** Required
**Permission:** `user:update` (for others' accounts)

Updates user profile.

**Request:**
```json
{
  "display_name": "New Name",
  "role_id": 3,
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@halo.local",
    "display_name": "New Name",
    "role_id": 3,
    "status": "active"
  }
}
```

---

#### Deactivate User
**DELETE** `/api/users/:id`

**Authentication:** Required
**Permission:** `user:delete`

Deactivates a user account (soft delete).

**Response:**
```json
{
  "success": true,
  "message": "User deactivated successfully"
}
```

---

### Dashboard

#### Get Dashboard Data
**GET** `/api/dashboard`

**Authentication:** Required

Returns dashboard statistics and user data.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 5,
    "totalTickets": 12,
    "openTickets": 3,
    "inProgressTickets": 2,
    "closedTickets": 7
  },
  "recentActivities": [
    {
      "id": 1,
      "action": "user_login",
      "entity_type": "users",
      "status": "success",
      "createdAt": "2026-06-09T00:57:10.821Z"
    }
  ],
  "userTickets": [
    {
      "id": 1,
      "title": "System issue",
      "status": "open",
      "created_by": 1,
      "createdAt": "2026-06-09T00:00:00.000Z"
    }
  ],
  "currentUser": {
    "id": 1,
    "email": "admin@halo.local",
    "display_name": "System Administrator",
    "role": "super_admin",
    "permissions": ["*"],
    "mfa_enabled": true,
    "mfa_verified": true,
    "status": "active"
  }
}
```

---

### Audit Logs

#### List Own Audit Logs
**GET** `/api/audit-logs/me`

**Authentication:** Required

Lists audit logs for current user.

**Query Parameters:**
- `page` (int) - Page number (default: 1)
- `limit` (int) - Results per page (default: 50)

**Response:**
```json
{
  "success": true,
  "total": 10,
  "page": 1,
  "limit": 50,
  "logs": [
    {
      "id": 1,
      "user_id": 1,
      "action": "user_login",
      "entity_type": "users",
      "entity_id": 1,
      "details": {},
      "ip_address": "::1",
      "user_agent": "Mozilla/5.0...",
      "status": "success",
      "createdAt": "2026-06-09T00:57:10.821Z"
    }
  ]
}
```

---

#### List All Audit Logs
**GET** `/api/audit-logs`

**Authentication:** Required
**Permission:** `audit:read`

Lists all audit logs (admin only).

**Query Parameters:**
- `page` (int) - Page number (default: 1)
- `limit` (int) - Results per page (default: 50)
- `action` (string) - Filter by action
- `entity_type` (string) - Filter by entity type
- `status` (string) - Filter by status (success/failure)
- `user_id` (int) - Filter by user

---

#### Get Entity Audit Logs
**GET** `/api/audit-logs/:entityType/:entityId`

**Authentication:** Required
**Permission:** `audit:read`

Gets all audit entries for specific entity.

**Example:**
```
GET /api/audit-logs/users/1
```

---

### Tickets

#### Create Ticket
**POST** `/api/tickets`

**Authentication:** Required
**Permission:** `ticket:create`

Creates new ticket.

**Request:**
```json
{
  "title": "System issue",
  "description": "Detailed description of the problem"
}
```

**Response:**
```json
{
  "status": "open",
  "id": 1,
  "title": "System issue",
  "description": "Detailed description",
  "created_by": 1,
  "createdAt": "2026-06-09T00:57:29.180Z"
}
```

---

#### List Tickets
**GET** `/api/tickets`

**Authentication:** Required
**Permission:** `ticket:read`

Lists all tickets.

**Response:**
```json
[
  {
    "id": 1,
    "title": "System issue",
    "description": "Details",
    "status": "open",
    "created_by": 1,
    "createdAt": "2026-06-09T00:57:29.180Z"
  }
]
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed"
}
```

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions",
  "required": "user:create"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

Currently unlimited. Rate limiting can be added in Phase 2.

---

## Pagination

All list endpoints support pagination:
- `page` - Current page (1-based)
- `limit` - Results per page
- Response includes `total` and `count` fields

---

## Status Codes

- `200` - OK (GET, POST successful)
- `201` - Created (POST successful)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## Demo Curl Commands

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"newuser@halo.local",
    "password":"SecurePassword123!",
    "display_name":"New User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@halo.local",
    "password":"SecureAdmin123!"
  }'
```

### Get Dashboard (with token)
```bash
TOKEN="your-token-here"
curl -X GET http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

### Create Ticket
```bash
TOKEN="your-token-here"
curl -X POST http://localhost:3000/api/tickets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"New ticket",
    "description":"Details here"
  }'
```
