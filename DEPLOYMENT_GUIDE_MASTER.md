# 🚀 JointHaloRepo - Complete Deployment Guide

**Version:** 2.0 Production  
**Last Updated:** June 11, 2026  
**Status:** Ready for Live Deployment

---

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Deployment Architecture](#deployment-architecture)
3. [Render Backend Setup](#render-backend-setup)
4. [Xneelo Frontend Setup](#xneelo-frontend-setup)
5. [Docker Local Testing](#docker-local-testing)
6. [Continuous Deployment](#continuous-deployment)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Quick Start

### For Automated Production Deployment

```bash
# From repository root
cd /workspaces/JointHaloRepo

# Run automated deployment
bash deployment/deploy-production.sh

# Renders automatically deploys when code is pushed to main
```

### For Frontend-Only Deployment (Xneelo)

```bash
# Requires FTP credentials
bash deployment/deploy-xneelo-ftp.sh <ftp-host> <username> <password>

# Example:
bash deployment/deploy-xneelo-ftp.sh ftp.haloitservices365.com user pass
```

---

## 🏗️ Deployment Architecture

### System Overview

```
┌─────────────────────────────────────────────────┐
│ GitHub: devvycoder321/JointHaloRepo (main)     │
└──────────────────┬──────────────────────────────┘
                   │
                   │ git push origin main
                   ▼
┌──────────────────────────────────────────────────────┐
│ Render.com (CI/CD + Hosting)                         │
├──────────────────────────────────────────────────────┤
│ • MSP Backend (3000) - halo-system/Dockerfile       │
│ • AI Backend (8080)  - ai_connector/Dockerfile      │
│ • PostgreSQL DB      - Auto-managed                 │
│ • Auto-deploy on push                               │
└──────────────────────────────────────────────────────┘
         │ API Port 3000        │ API Port 8080
         │                      │
         ├──────────┬───────────┤
         │          │           │
         ▼          ▼           ▼
    ┌────────────────────────────────┐
    │ Xneelo cPanel (Traditional Web) │
    ├────────────────────────────────┤
    │ Frontend HTML/CSS/JS           │
    │ https://haloitservices365.com  │
    │ (FTP Upload + AutoSSL)         │
    └────────────────────────────────┘

Data Flow:
• Frontend (Xneelo) → Renders API (backend) via HTTPS
• All traffic encrypted with SSL/TLS
```

### Key Differences Between Environments

| Aspect | Development | Staging | Production |
|--------|-------------|---------|-----------|
| Database | SQLite (local) | PostgreSQL (Render) | PostgreSQL (Render) |
| Frontend | localhost:3000 | Xneelo staging | haloitservices365.com |
| Backend | localhost:3000 | api-staging.* | api.haloitservices365.com |
| AI System | localhost:8080 | aidevapp-staging.* | aidevapp.haloitservices365.com |
| Deployment | `docker-compose up` | Git push | Git push |

---

## 🚀 Render Backend Setup

### Prerequisites

1. **GitHub Account:** devvycoder321 (already configured)
2. **Render Account:** https://render.com (free tier available)
3. **Domain:** haloitservices365.com (DNS configured)

### Step 1: Connect Render to GitHub

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Select **"Connect a GitHub repository"**
4. Authorize Render to access your GitHub account
5. Choose repository: **`devvycoder321/JointHaloRepo`**

### Step 2: Configure MSP Backend Service

**Create new service:**
- Service name: `haloit-msp-backend`
- Repository: devvycoder321/JointHaloRepo
- Branch: `main`

**Build & Deploy settings:**
```
Runtime:           Docker
Dockerfile path:   halo-system/Dockerfile
Build command:     npm install
Start command:     npm start
Region:            US (recommended)
Plan:              Free tier (starting)
Auto-deploy:       ON
```

**Environment variables:**
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...  # From PostgreSQL service below
SESSION_SECRET=[generate-32-char-string]
JWT_SECRET=[generate-32-char-string]
AI_INTEGRATIONS_OPENAI_API_KEY=[your-api-key-or-empty]
CORS_ORIGIN=https://haloitservices365.com
```

**Generate secure secrets:**
```bash
# In terminal, run twice
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Create PostgreSQL Database (Render)

1. In Render dashboard, click **"New +"** → **"PostgreSQL"**
2. Database name: `haloit-postgres-prod`
3. Plan: **Free tier**
4. Region: Same as backend (US)
5. Copy connection string for use above

### Step 4: Configure AI Backend Service

**Create new service:**
- Service name: `haloit-ai-backend`
- Repository: devvycoder321/JointHaloRepo
- Branch: `main`

**Build & Deploy settings:**
```
Runtime:           Docker
Dockerfile path:   ai_connector/Github-Connector/artifacts/api-server/Dockerfile
Build command:     npm install
Start command:     npm start
Region:            US
Plan:              Free tier
Auto-deploy:       ON
```

**Environment variables:**
```
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://...  # Separate DB or same
AI_INTEGRATIONS_OPENAI_API_KEY=[your-api-key]
SESSION_SECRET=[generate-32-char-string]
```

### Step 5: Connect Custom Domains

**For MSP Backend:**
1. Go to MSP Backend service settings
2. Click **"Custom Domain"**
3. Add domain: `api.haloitservices365.com`
4. Render provides CNAME: `[service-url]`
5. Update DNS in Xneelo: Add CNAME pointing to Render URL

**For AI Backend:**
1. Add domain: `aidevapp.haloitservices365.com` (or `ai.haloitservices365.com`)
2. Configure DNS CNAME

**For Frontend (optional):**
1. Add domain: `haloitservices365.com` (if using Render for frontend)
2. Otherwise, use Xneelo only

---

## 📤 Xneelo Frontend Setup

### Prerequisites

1. **Xneelo Account:** https://www.xneelo.co.za
2. **cPanel Access:** https://cpanel.xneelo.co.za
3. **FTP Credentials:** From cPanel account

### Step 1: Access cPanel

```
URL: https://cpanel.xneelo.co.za
Username: Your Xneelo username
Password: Your Xneelo password
```

### Step 2: Configure Domain

1. Go to **"Addon Domains"** or **"Manage Domains"**
2. Ensure `haloitservices365.com` points to `/public_html`
3. Verify DNS records:
   - A record: Points to Xneelo server IP
   - MX records: (optional) For email

### Step 3: Enable AutoSSL

1. In cPanel, go to **"AutoSSL"**
2. Click **"Manage"** next to your domain
3. Ensure AutoSSL is **enabled**
4. SSL certificate renews automatically every 90 days

### Step 4: Create .htaccess

Create `/public_html/.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Skip rewrites for real files and directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Rewrite to index.html for SPA routing
  RewriteRule ^ index.html [QSA,L]
  
  # Force HTTPS
  RewriteCond %{HTTPS} !=on
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  
  # Set proper MIME types
  AddType application/javascript .js
  AddType text/css .css
  AddType image/svg+xml .svg
  AddType application/json .json
  AddEncoding gzip .js.gz
  AddEncoding gzip .css.gz
</IfModule>

# Browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### Step 5: Upload Frontend Files via FTP

**Using Script (Recommended):**
```bash
bash deployment/deploy-xneelo-ftp.sh \
  ftp.haloitservices365.com \
  your-ftp-username \
  your-ftp-password
```

**Manual with FileZilla:**
1. Open FileZilla
2. File → Site Manager → New Site
3. Host: `ftp.haloitservices365.com`
4. Port: `21` (or `990` for SFTP)
5. Username/Password from Xneelo cPanel
6. Connect
7. Navigate to `/public_html`
8. Upload all files from `halo-system/frontend/`

**Manual with Command Line:**
```bash
# Via FTP
ftp ftp.haloitservices365.com
# Login when prompted
cd public_html
mput halo-system/frontend/*
quit

# Or via SFTP (more secure)
sftp username@ftp.haloitservices365.com << EOF
cd public_html
put -r halo-system/frontend/* .
quit
EOF
```

---

## 🐳 Docker Local Testing

### Build MSP Backend Locally

```bash
cd /workspaces/JointHaloRepo

# Build image
docker build -f halo-system/Dockerfile -t haloitservices-backend:latest .

# Run container
docker run -p 3000:3000 \
  -e NODE_ENV=development \
  -e DATABASE_URL=sqlite://./dev.db \
  haloitservices-backend:latest

# Test
curl http://localhost:3000/api/health
```

### Start Complete Local Environment

```bash
# Start all services
docker-compose up

# Or rebuild images
docker-compose up --build

# Services started:
# • MSP Backend:  http://localhost:3000
# • AI Backend:   http://localhost:8080
# • Network:      haloit-network (shared)

# Stop all services
docker-compose down

# Remove volumes (reset database)
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f msp-backend
docker-compose logs -f ai-backend

# With timestamps
docker-compose logs -f --timestamps
```

---

## 🔄 Continuous Deployment

### Automated Deployment (on git push to main)

**How it works:**
1. You commit and push code: `git push origin main`
2. GitHub webhook notifies Render
3. Render detects new commit
4. Docker image is built
5. Old container stops, new one starts
6. Health checks verify deployment

**To deploy:**

```bash
# Make your changes
nano halo-system/backend/server.js

# Commit
git add .
git commit -m "feature: add new dashboard widget"

# Push (auto-deploys)
git push origin main

# Monitor deployment
# Open: https://dashboard.render.com/services
```

### Manual Deployment (without code changes)

```bash
# Option 1: Use Render dashboard
# 1. Go to service
# 2. Click "Manual Deploy" → "Deploy latest commit"

# Option 2: Force push from terminal
git commit --allow-empty -m "chore: trigger manual deploy"
git push origin main
```

### Rollback to Previous Version

```bash
# Revert last commit
git revert HEAD

# Push (auto-deploys old version)
git push origin main

# Or specific commit
git revert abc123
git push origin main
```

---

## 📊 Monitoring & Maintenance

### Monitor Render Services

1. **Go to:** https://dashboard.render.com/services
2. **For each service:**
   - View logs: `Logs` tab
   - Monitor metrics: `Metrics` tab
   - Check deployments: `Deployments` tab

### Set Up Alerts

1. Service settings → **Notifications**
2. Enable alerts for:
   - Deployment failure
   - High CPU usage (>80%)
   - High memory usage (>80%)
   - Service restart

### Database Backups

**Automatic backups (Render PostgreSQL):**
- Retention: 7 days (free tier)
- Download from Render dashboard

**Manual backup:**
```bash
# Export database
pg_dump postgresql://user:pass@host/db > backup.sql

# Import backup
psql postgresql://user:pass@host/db < backup.sql
```

### Monitor Frontend (Xneelo)

1. **File Manager:** Check file permissions (644 for files, 755 for directories)
2. **Error Logs:** `/public_html/logs/` (if configured)
3. **Access Logs:** cPanel → Raw Access Logs
4. **SSL:** Verify certificate validity in cPanel

### Database Monitoring

```bash
# Check database size
SELECT pg_size_pretty(pg_database_size('haloit_prod'));

# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Monitor active connections
SELECT count(*) FROM pg_stat_activity;
```

---

## 🧪 Testing After Deployment

### Health Checks

```bash
# MSP Backend
curl https://api.haloitservices365.com/api/health

# Expected response:
# {"status":"ok","message":"Halo Backend Running...","timestamp":"..."}

# AI Backend
curl https://aidevapp.haloitservices365.com/api/health
```

### API Testing

```bash
# Test authentication endpoint
curl -X POST https://api.haloitservices365.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"Test@123",
    "firstName":"Test",
    "lastName":"User"
  }'

# Test dashboard endpoint (requires auth token)
curl https://api.haloitservices365.com/api/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend Testing

1. **Open:** https://haloitservices365.com
2. **Check browser console** (F12):
   - No CORS errors
   - No 404s for static files
   - No failed API calls
3. **Test functionality:**
   - Login page loads
   - Dashboard accessible
   - API calls successful

### Database Testing

```bash
# Connect to production database (from Render dashboard)
# Check recent records

SELECT * FROM users ORDER BY created_at DESC LIMIT 5;
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 5;
```

---

## 🚨 Troubleshooting

### Backend won't start

**Symptoms:**
- Service crashes immediately
- Render shows "failed to start"

**Solutions:**
```bash
# 1. Check logs
# Render Dashboard → Service → Logs

# 2. Common causes:
# - Missing environment variable
# - Database connection failed
# - Port in use

# 3. Fix and redeploy
git push origin main
```

### Frontend not loading

**Symptoms:**
- Blank page
- 404 errors in console

**Solutions:**
```bash
# 1. Verify files uploaded to Xneelo
# Use FileZilla to check /public_html

# 2. Check .htaccess configuration
# Should exist at /public_html/.htaccess

# 3. Test directly
curl https://haloitservices365.com/index.html

# 4. Check API endpoints in HTML files
grep "localhost\|3000\|8080" halo-system/frontend/*.html
```

### CORS errors in browser

**Solutions:**
1. Check `CORS_ORIGIN` env var in Render
2. Should be: `https://haloitservices365.com` (with https!)
3. Update if needed
4. Redeploy: `git commit --allow-empty -m "chore: redeploy" && git push`

### Database connection failed

**Solutions:**
```bash
# 1. Verify DATABASE_URL format
# postgresql://username:password@host:5432/dbname

# 2. Test connection from local machine
psql postgresql://...

# 3. Check IP whitelist in Render PostgreSQL
# May need to allow Render service IPs

# 4. Verify credentials are correct
```

### Slow API responses

**Solutions:**
1. **Check database:** Might have too many connections
2. **Increase Render plan:** Free tier has limited resources
3. **Monitor metrics:** Render dashboard → Metrics
4. **Optimize queries:** Review slow query logs

---

## 📞 Support & Resources

| Resource | URL |
|----------|-----|
| Render Dashboard | https://dashboard.render.com |
| Render Docs | https://render.com/docs |
| Xneelo cPanel | https://cpanel.xneelo.co.za |
| GitHub Repo | https://github.com/devvycoder321/JointHaloRepo |
| Project Docs | docs/setup/reference/DEPLOYMENT_PRODUCTION.md |

---

## ✅ Deployment Checklist

- [ ] GitHub repository up-to-date
- [ ] Docker builds locally without errors
- [ ] Environment variables configured in Render
- [ ] PostgreSQL database created on Render
- [ ] Custom domains configured (DNS CNAME)
- [ ] Xneelo FTP credentials working
- [ ] .htaccess uploaded to /public_html
- [ ] Frontend files uploaded via FTP
- [ ] SSL certificate active on Xneelo
- [ ] Health endpoints responding
- [ ] API calls working from frontend
- [ ] Database migrations completed
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured
- [ ] Emergency rollback plan ready

---

**Last Updated:** June 11, 2026  
**Maintained By:** Development Team  
**Next Review:** August 11, 2026

