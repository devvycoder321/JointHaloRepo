# MSP System - Production Deployment Guide

**Status:** Production Deployment Ready  
**Last Updated:** June 11, 2026

---

## 🚀 Deployment Overview

The Halo IT Services 365 MSP system is deployed across TWO separate infrastructure components:

1. **Backend Services (Render.com)**
   - MSP Backend API (Port 3000)
   - AI Backend Service (Port 8080)
   - PostgreSQL Database (shared)

2. **Frontend (Xneelo FTP)**
   - Static HTML/CSS/JS files
   - Served via traditional web hosting
   - Communicates with Render backend

---

## 📋 Pre-Deployment Checklist

- [ ] GitHub repository is up-to-date
- [ ] All environment variables configured
- [ ] Database backups created
- [ ] SSL certificates ready (auto-renewed)
- [ ] DNS records pointing to Render
- [ ] Xneelo FTP credentials working
- [ ] Domain SSL configured on Xneelo

---

## 🔧 Part 1: Render Backend Deployment

### 1A. Connect Render to GitHub

1. Go to [render.com/dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Select "Connect a GitHub repository"
4. Choose: `devvycoder321/JointHaloRepo`
5. Select branch: `main`

### 1B. Configure MSP Backend Service

**Service Name:** `haloit-msp-backend`

**Settings:**
```
Build Command:      npm install
Start Command:      npm start
Environment:        Docker
Dockerfile Path:    halo-system/Dockerfile
Region:            US (or closest to clients)
Plan:              Free (or Starter)
Auto-deploy:       Yes
```

**Environment Variables:**
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host/haloit_prod
SESSION_SECRET=[generate 32+ char random string]
JWT_SECRET=[generate 32+ char random string]
AI_INTEGRATIONS_OPENAI_API_KEY=[your API key]
CORS_ORIGIN=https://haloitservices365.com
```

**Database:** 
- Use Render PostgreSQL
- Name: `haloit-postgres-prod`
- Plan: Free (or Starter)
- Auto-backup: Enabled

### 1C. Configure AI Backend Service

**Service Name:** `haloit-ai-backend`

**Settings:**
```
Build Command:      npm install
Start Command:      npm start
Environment:        Docker
Dockerfile Path:    ai_connector/Github-Connector/artifacts/api-server/Dockerfile
Region:            US
Plan:              Free
Auto-deploy:       Yes
```

**Environment Variables:**
```
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://user:password@host/haloit_ai_prod
SESSION_SECRET=[generate 32+ char random string]
AI_INTEGRATIONS_OPENAI_API_KEY=[your API key]
```

**Database:**
- Use separate Render PostgreSQL instance
- Name: `haloit-ai-postgres-prod`
- Plan: Free
- Auto-backup: Enabled

### 1D. Connect Custom Domain

1. In Render dashboard, go to your service
2. Settings → "Custom Domain"
3. Add: `api.haloitservices365.com`
4. Point DNS CNAME to: `[render-service-url]`

For AI subdomain:
- Add: `api-ai.haloitservices365.com` or `aidevapp.haloitservices365.com`

---

## 📤 Part 2: Xneelo Frontend Deployment

### 2A. Prepare Frontend for FTP

From your local machine:

```bash
cd /workspaces/JointHaloRepo

# Create deployment package
mkdir -p deployment-package/frontend
cp -r halo-system/frontend/* deployment-package/frontend/

# Update API endpoint in HTML files
find deployment-package/frontend -name "*.html" -type f | while read file; do
  sed -i 's|http://localhost:3000|https://api.haloitservices365.com|g' "$file"
  sed -i 's|http://localhost:8080|https://aidevapp.haloitservices365.com|g' "$file"
done

# Verify replacements
grep -r "api.haloitservices365.com" deployment-package/frontend/
```

### 2B. Connect to Xneelo via FTP

**Using FileZilla (Recommended):**

1. File → Site Manager → New Site
2. **Host:** ftp.haloitservices365.com (from Xneelo cPanel)
3. **Port:** 21 (or 990 for SFTP)
4. **Username:** [Xneelo cPanel FTP username]
5. **Password:** [Xneelo cPanel FTP password]
6. Connect

**Using Command Line:**

```bash
# Connect via FTP
ftp ftp.haloitservices365.com
# Enter username and password when prompted

# Upload files
cd public_html
put -r deployment-package/frontend/* .
bye
```

**Using SFTP (More Secure):**

```bash
# If you have SSH access configured on Xneelo
sftp [username]@haloitservices365.com

# Or use scp
scp -r deployment-package/frontend/* username@haloitservices365.com:/public_html/
```

### 2C. Configure Xneelo Domain & SSL

1. Log in to cPanel at: `https://cpanel.xneelo.co.za`
2. Navigate to "Addon Domains" or "Main Domain Settings"
3. Ensure domain points to `/public_html`
4. Go to "AutoSSL" → Enable automatic SSL renewal
5. Test: `https://haloitservices365.com`

### 2D. Update Xneelo .htaccess for SPA Routing

Create `.htaccess` in `/public_html`:

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
</IfModule>
```

---

## 🔐 Part 3: Environment & Security

### 3A. Generate Secure Secrets

```bash
# Generate SESSION_SECRET and JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Run twice and save both outputs
```

### 3B. Database Connection Strings

**PostgreSQL on Render:**

```
postgresql://render_user:render_password@pg-xxxx.render.ondigitalocean.com:5432/haloit_db
```

### 3C. SSL/TLS Configuration

- **Frontend:** Handled by Xneelo AutoSSL
- **Backend:** Handled by Render (automatic)
- **Custom Domain:** Configure DNS CNAME in Render dashboard

---

## 🧪 Part 4: Testing Deployment

### 4A. Test MSP Backend

```bash
# Test health endpoint
curl https://api.haloitservices365.com/api/health

# Expected response:
{
  "status": "ok",
  "message": "Halo Backend Running - Phase 1 Core Platform",
  "timestamp": "2026-06-11T12:00:00.000Z"
}
```

### 4B. Test AI Backend

```bash
# Test health endpoint
curl https://aidevapp.haloitservices365.com/api/health
```

### 4C. Test Frontend

```bash
# Open in browser
https://haloitservices365.com

# Check browser console for any API errors
# All requests should go to https://api.haloitservices365.com
```

### 4D. Test Database Connection

```bash
# From Render dashboard, check service logs for DB connection messages
# Should see: "✅ Database synchronized" or similar
```

---

## 📊 Part 5: Monitoring & Maintenance

### 5A. Enable Render Monitoring

1. Dashboard → Service Settings → Monitoring
2. Set up alerts for:
   - High CPU usage (>80%)
   - High memory usage (>80%)
   - High error rate (>5%)
   - Deployment failures

### 5B. Database Backups

**Render PostgreSQL:**
1. Dashboard → PostgreSQL Service
2. Settings → Backups → Enable automatic backups
3. Retention period: 7 days minimum

**Export Data Locally:**

```bash
# Download database backup
pg_dump postgresql://render_user:pass@host/db > backup.sql
```

### 5C. Log Monitoring

**View Logs:**
- Render: Dashboard → Service → Logs (real-time streaming)
- Check for errors, warnings, and performance issues

### 5D. Scheduled Tasks

```bash
# Cron job to backup database daily
0 2 * * * pg_dump postgresql://user:pass@host/db > /backups/haloit_$(date +\%Y\%m\%d).sql

# Cron job to backup Xneelo FTP files weekly
0 3 * * 0 tar -czf /backups/frontend_$(date +\%Y\%m\%d).tar.gz ~/public_html
```

---

## 🔄 Part 6: Continuous Deployment

### 6A. GitHub Actions Auto-Deploy

When you push to `main`:

```bash
git add .
git commit -m "chore: update production configs"
git push origin main
```

**Render automatically:**
1. Detects new commit
2. Pulls latest code
3. Rebuilds Docker image
4. Deploys to production
5. Runs health checks

### 6B. Manual Deployment Trigger

If you need to redeploy without code changes:

1. Go to Render Dashboard
2. Select service
3. Click "Manual Deploy" → "Deploy latest commit"

---

## 🚨 Troubleshooting

### Application won't start
1. Check Render Logs for error messages
2. Verify all environment variables are set
3. Test locally: `docker-compose up`
4. Check database connection string

### Database connection failed
1. Verify DATABASE_URL is correct
2. Check Render PostgreSQL service is running
3. Verify IP whitelist allows connections
4. Check username/password credentials

### Frontend not loading
1. Verify .htaccess is correct on Xneelo
2. Check frontend files uploaded to /public_html
3. Test API endpoint URLs in browser console
4. Verify SSL certificate is valid

### CORS errors in browser
1. Check CORS_ORIGIN environment variable matches frontend URL
2. Update CORS_ORIGIN to: `https://haloitservices365.com`
3. Restart services after changing env vars

### API calls getting 404
1. Verify API endpoint URLs in frontend HTML files
2. Check routes are registered in backend
3. Test endpoint directly: `curl https://api.haloitservices365.com/api/auth/register`

---

## 📱 Deployment Summary

| Component | Hosting | URL | Status |
|-----------|---------|-----|--------|
| MSP Frontend | Xneelo | https://haloitservices365.com | ✅ |
| MSP API | Render | https://api.haloitservices365.com | ✅ |
| AI System | Render | https://aidevapp.haloitservices365.com | ✅ |
| Database | Render PostgreSQL | Internal | ✅ |
| SSL | Auto-renewed | Both | ✅ |

---

## 📞 Quick Reference

**Render Dashboard:** https://dashboard.render.com/  
**Xneelo cPanel:** https://cpanel.xneelo.co.za  
**Domain DNS:** https://manage.xneelo.co.za  

**Emergency Rollback:**
```bash
git revert HEAD
git push origin main
# Render auto-redeploys previous version
```

---

**Last Updated:** June 11, 2026  
**Next Review:** August 11, 2026  

