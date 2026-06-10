# Halo AI Assistant — Deployment Guide

> **For GitHub Copilot:** Read this file in full before making any changes. Follow every step in order. Do not skip prerequisites.

---

## Overview

Halo AI is a private, password-protected AI assistant web app for HaloIT Services 365.

| Layer | Technology | Hosting |
|-------|-----------|---------|
| Frontend | React + Vite (static SPA) | Xneelo web hosting via FTP |
| Backend | Node.js + Express + Drizzle ORM | Railway |
| Database | PostgreSQL | Railway (provisioned add-on) |
| AI | Azure OpenAI (DeepSeek v4) | Azure |

---

## Repository Structure

```
/ (repo root)
├── artifacts/
│   ├── halo-ai/          ← React/Vite frontend source
│   └── api-server/       ← Express backend source
├── lib/
│   ├── db/               ← Drizzle ORM schema & DB client
│   ├── api-spec/         ← OpenAPI spec
│   └── api-client-react/ ← Generated React Query hooks
├── halo-ai/              ← This deployment guide + env template
├── railway.toml          ← Railway build/deploy config (repo root)
└── .github/workflows/    ← GitHub Actions (auto FTP deploy on push)
```

---

## Prerequisites

- Node.js 20+
- pnpm 10+ (`npm install -g pnpm@10`)
- A Railway account at https://railway.app
- An Xneelo web hosting account with FTP access
- An Azure OpenAI resource with DeepSeek v4 deployed

---

## Step 1 — Set Up Railway (Backend)

### 1a. Create a Railway project

1. Go to https://railway.app → New Project → Deploy from GitHub repo
2. Select the `HaloIT-Platform` repository
3. Railway will detect `railway.toml` at the repo root automatically

### 1b. Add a PostgreSQL database

1. In your Railway project → **+ New** → **Database** → **PostgreSQL**
2. Click the database → **Connect** → copy the `DATABASE_URL` value

### 1c. Set environment variables in Railway

In Railway → your service → **Variables**, add these:

```
DATABASE_URL       = (paste from PostgreSQL connection above)
SESSION_SECRET     = (generate: openssl rand -hex 32)
NODE_ENV           = production
PORT               = 8080
CORS_ORIGIN        = https://yourdomain.co.za
```

> **Note:** `CORS_ORIGIN` must match the exact domain where you host the frontend on Xneelo.

### 1d. Deploy

Railway auto-deploys when you push to `main`. For the first deploy, click **Deploy** in the Railway dashboard.

After deploy, note your Railway public URL (e.g. `https://halo-ai-api.railway.app`).

Health check endpoint: `GET https://halo-ai-api.railway.app/api/healthz`

---

## Step 2 — Set Up Frontend (Xneelo FTP)

### 2a. Configure GitHub Secrets

In your GitHub repo → **Settings** → **Secrets and variables** → **Actions**, add:

| Secret name | Value |
|-------------|-------|
| `FTP_HOST` | Your Xneelo FTP hostname (e.g. `ftp.yourdomain.co.za`) |
| `FTP_USER` | Your Xneelo FTP username |
| `FTP_PASSWORD` | Your Xneelo FTP password |
| `FTP_REMOTE_DIR` | Remote directory (e.g. `/public_html/` or `/haloai/`) |
| `VITE_API_URL` | Your Railway backend URL (e.g. `https://halo-ai-api.railway.app`) |

### 2b. Auto Deploy via GitHub Actions

The workflow `.github/workflows/halo-ai-deploy-frontend.yml` runs automatically on every push to `main` that touches frontend or API client code.

To trigger a manual deploy:
1. GitHub → **Actions** → **Halo AI — Deploy Frontend to Xneelo (FTP)** → **Run workflow**

### 2c. Manual Build + FTP (without GitHub Actions)

```bash
# From repo root
pnpm install --frozen-lockfile
pnpm run typecheck:libs

# Build frontend — set BASE_PATH=/ and your Railway URL
PORT=3000 BASE_PATH=/ NODE_ENV=production VITE_API_URL=https://your-app.railway.app \
  pnpm --filter @workspace/halo-ai run build

# Output is in: artifacts/halo-ai/dist/public/
# Upload the contents of that folder to your Xneelo public_html/ via FTP client
```

---

## Step 3 — First Login

After both services are deployed:

1. Open your Xneelo frontend URL
2. Log in with the pre-created admin account:
   - **Email:** `willem.hattingh@haloitservices365.co.za`
   - **Password:** `H@l0IT_160B0684!2026`
3. A QR code will appear — scan it with Google Authenticator / Microsoft Authenticator / Authy
4. Enter the 6-digit code → you're in

> Change the admin password after first login (Settings → account management).

---

## Step 4 — GitHub Integration in the App

Inside the app, go to **GitHub** page:

- **HTTPS**: paste your GitHub Personal Access Token (PAT) with `repo` scope
- **SSH**: paste your SSH private key and add the shown public key to GitHub → Settings → SSH keys
- **Repo URL**: enter your repo URL in HTTPS (`https://github.com/...`) or SSH (`git@github.com:...`) format

---

## Environment Variables Reference

### Backend (Railway)
```
DATABASE_URL       Required. PostgreSQL connection string
SESSION_SECRET     Required. Random 32+ char string for session encryption
PORT               Required. Railway sets this automatically
NODE_ENV           Set to "production"
CORS_ORIGIN        Your Xneelo frontend domain(s), comma-separated if multiple
```

### Frontend (build-time, embedded into static files)
```
VITE_API_URL       The Railway backend URL (https://your-app.railway.app)
PORT               Any number, e.g. 3000 — only used during build, not runtime
BASE_PATH          Set to "/" for Xneelo root deployment
```

---

## Local Development

```bash
# Clone and install
git clone https://github.com/replitcompiler-Dev321/HaloIT-Platform
cd HaloIT-Platform
pnpm install

# Set up local database (PostgreSQL required)
export DATABASE_URL=postgresql://localhost:5432/halo_ai
pnpm --filter @workspace/db run push

# Start the API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start the frontend (separate terminal)
pnpm --filter @workspace/halo-ai run dev
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `CORS error` in browser | Set `CORS_ORIGIN` in Railway to match your Xneelo domain exactly |
| `DATABASE_URL not set` | Add the variable in Railway dashboard |
| FTP deploy shows no change | Check `FTP_REMOTE_DIR` ends with `/` |
| 404 on page refresh | Add `.htaccess` to Xneelo with `FallbackResource /index.html` |
| TOTP code invalid | Ensure server clock is correct; TOTP is time-based |
| Session not persisting | Ensure `SESSION_SECRET` is set and cookie domain matches |

### Xneelo `.htaccess` (required for SPA routing)

Upload this as `.htaccess` in the same directory as your `index.html`:

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

---

## Security Notes

- Change the default admin password immediately after first login
- Store all secrets in Railway environment variables — never commit them
- The `SESSION_SECRET` must be at least 32 random characters in production
- SSH private keys stored in the app are encrypted at rest by PostgreSQL
