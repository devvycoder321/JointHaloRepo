# Repository Setup & Navigation Guide

**Last Updated:** June 11, 2026  
**For:** All team members and AI agents working on JointHaloRepo  

---

## 🗺️ Complete Repository Structure

```
JointHaloRepo/
│
├── 📁 docs/setup/                    ← START HERE FOR GUIDANCE
│   ├── rules/
│   │   ├── AI_MUST_FOLLOW_RULES.md       (Read this first!)
│   │   ├── PROJECT_OBJECTIVES.md         (Understand project goals)
│   │   └── SETUP_GUIDE.md                (This file)
│   ├── reference/                        (Reference material - read as needed)
│   │   ├── HALOIT365_MASTER_CODE_SPEC.md
│   │   ├── system-architecture.md
│   │   ├── database-schema.md
│   │   ├── api-spec.md
│   │   └── xneelo-cpanel-hosting.md
│   └── progress/                         (Track implementation progress)
│       ├── GAP_ANALYSIS.md
│       ├── PHASE1_SUMMARY.md
│       ├── PHASE2_IMPLEMENTATION_PLAN.md
│       ├── PHASE3_IMPLEMENTATION_PLAN.md
│       ├── PHASE4_IMPLEMENTATION_PLAN.md
│       ├── PHASE5_IMPLEMENTATION_PLAN.md
│       ├── CURRENT_SYSTEM_AUDIT.md
│       ├── feature-tracker.md
│       └── development-roadmap.md
│
├── 📁 halo-system/                   ← MSP BUSINESS PLATFORM
│   ├── backend/
│   │   ├── server.js                     (Express entry point)
│   │   ├── package.json
│   │   ├── ai/                           (AI integration services)
│   │   ├── db/                           (Database service layer)
│   │   ├── middleware/                   (Auth, validation, logging)
│   │   ├── routes/                       (API endpoints)
│   │   ├── services/                     (Business logic)
│   │   └── tests/
│   ├── frontend/                         (React/Vite frontend)
│   └── Dockerfile
│
├── 📁 ai_connector/                  ← STANDALONE AI SYSTEM
│   └── Github-Connector/
│       ├── package.json
│       ├── artifacts/
│       │   ├── api-server/               (AI backend)
│       │   └── halo-ai/                  (AI frontend)
│       └── lib/                          (Shared utilities)
│
├── 📁 lib/                           ← SHARED LIBRARIES
│   ├── db/                               (Database schema & migrations)
│   ├── api-client-react/
│   ├── api-spec/
│   └── api-zod/
│
├── 📁 artifacts/                     ← DEPLOYABLE ARTIFACTS
│   ├── api-server/                       (Built API)
│   └── mockup-sandbox/
│
├── 📁 deployment/                    ← DEPLOYMENT SCRIPTS
│   ├── build-package.sh
│   ├── start.sh
│   └── README.md
│
├── 📁 scripts/                       ← UTILITY SCRIPTS
│   ├── post-merge.sh
│   └── package.json
│
├── 📄 docker-compose.yml             ← LOCAL DEV ORCHESTRATION
├── 📄 Dockerfile                     ← Halo MSP system Docker
├── 📄 render.yaml                    ← Render.com deployment config
├── 📄 package.json                   ← Root monorepo config
├── 📄 pnpm-workspace.yaml            ← Workspace definition
│
└── 🔐 Configuration Files
    ├── deploy_ssh_key.enc            (Encrypted SSH for CI/CD)
    ├── encrypt_ssh_key.sh            (Key encryption utility)
    ├── auto_push_origin.sh           (Auto-commit script)
    ├── auto_update_all.sh            (Auto-update script)
    └── .env.example                  (Template for env vars)
```

---

## 🚀 QUICK START

### For First-Time Setup

1. **Read the mandatory documents:**
   ```
   1. docs/setup/rules/AI_MUST_FOLLOW_RULES.md     (20 min)
   2. docs/setup/rules/PROJECT_OBJECTIVES.md       (15 min)
   3. docs/setup/reference/system-architecture.md  (10 min)
   ```

2. **Set up local development:**
   ```bash
   # Clone the repo
   git clone git@github.com:devvycoder321/JointHaloRepo.git
   cd JointHaloRepo
   
   # Install dependencies
   pnpm install
   
   # Create environment file
   cp .env.example .env
   
   # Start local development (both systems)
   docker-compose up
   
   # Access:
   # - MSP Backend:  http://localhost:3000
   # - AI System:    http://localhost:8080
   # - Frontend:     http://localhost:3000
   ```

3. **Verify setup:**
   ```bash
   # Test MSP backend health
   curl http://localhost:3000
   
   # Test AI system health
   curl http://localhost:8080
   ```

---

## 📖 DOCUMENT NAVIGATION BY ROLE

### For Project Managers / Business Stakeholders
Start here:
1. `PROJECT_OBJECTIVES.md` - Understand what we're building
2. `docs/setup/progress/PHASE1_SUMMARY.md` - See what's done
3. `docs/setup/progress/GAP_ANALYSIS.md` - Understand remaining work
4. `docs/setup/progress/feature-tracker.md` - Track progress

### For Backend Engineers
Start here:
1. `HALOIT365_MASTER_CODE_SPEC.md` - Stack and patterns
2. `docs/setup/reference/database-schema.md` - Database model
3. `docs/setup/reference/api-spec.md` - API endpoints
4. `halo-system/backend/` - Implementation

### For Frontend Engineers
Start here:
1. `docs/setup/reference/system-architecture.md` - System design
2. `HALOIT365_MASTER_CODE_SPEC.md` - Frontend stack
3. `halo-system/frontend/` - React implementation
4. `docs/setup/progress/PHASE2_IMPLEMENTATION_PLAN.md` - Next builds

### For DevOps / Infrastructure
Start here:
1. `docker-compose.yml` - Local orchestration
2. `render.yaml` - Cloud deployment
3. `deployment/README.md` - Deployment procedures
4. `docs/setup/reference/xneelo-cpanel-hosting.md` - Hosting setup

### For AI Agents
Start here:
1. `AI_MUST_FOLLOW_RULES.md` - **CRITICAL: Read first**
2. `PROJECT_OBJECTIVES.md` - Understand the business
3. `SETUP_GUIDE.md` - This file
4. Then read role-specific docs above

---

## 🔧 COMMON TASKS

### Adding a New API Endpoint

**Where:** `halo-system/backend/routes/`  
**How:**
1. Create new route file: `routes/myfeature.js`
2. Define route with auth and error handling (see MASTER_CODE_SPEC)
3. Register in `routes/index.ts`
4. Test with local docker-compose
5. Update `api-spec.md` with new endpoint

**Example:**
```javascript
// routes/myfeature.js
const Router = require('express').Router;
const router = new Router();

router.get('/myfeature/:id', async (req, res) => {
  try {
    const result = await db.myFeatureTable.findOne({ id: req.params.id });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
```

### Adding a Database Table

**Where:** `lib/db/src/schema/index.ts`  
**How:**
1. Add new table definition to schema file
2. Run `pnpm run db:push`
3. Update `database-schema.md` documentation
4. Create corresponding API routes

### Deploying to Production

**Steps:**
1. Test locally: `docker-compose up`
2. Commit changes: `bash auto_push_origin.sh`
3. Push to main: Changes auto-deploy via GitHub Actions to Render
4. Monitor: Check Render dashboard for deployment status

### Updating Documentation

**When to update:**
- New feature implemented → Update `feature-tracker.md`
- Bug fixed → Note in relevant phase doc
- Architecture change → Update `system-architecture.md`
- Database schema change → Update `database-schema.md`

**How:**
1. Edit the relevant doc in `docs/setup/progress/` or `docs/setup/reference/`
2. Update "Last Updated" date at top of file
3. Include change in commit message
4. Push with code changes

---

## 🐳 Docker & Deployment Quick Reference

### Local Development
```bash
# Start both systems
docker-compose up

# Rebuild containers
docker-compose up --build

# Stop everything
docker-compose down

# View logs for specific service
docker-compose logs -f api
docker-compose logs -f frontend
```

### Production Deployment
```bash
# Deploy to Render (automatic on git push to main)
git push origin main

# Deploy to Xneelo cPanel
bash deploy_commit_push_xneelo.sh

# Check deployment status
# Render dashboard: https://dashboard.render.com
# Xneelo cPanel: https://cpanel.xneelo.co.za
```

### Environment Variables

**Development (.env):**
```
NODE_ENV=development
PORT=3000
DATABASE_URL=sqlite://./dev.db
SESSION_SECRET=dev-secret-min-32-chars
JWT_SECRET=dev-jwt-min-32-chars
```

**Production (Render environment):**
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host/db
SESSION_SECRET=[from secrets manager]
JWT_SECRET=[from secrets manager]
AI_INTEGRATIONS_OPENAI_API_KEY=[from secrets manager]
```

---

## 🔐 Security & Secrets Management

### Encrypted SSH Key
```bash
# To encrypt a new SSH key for CI/CD
bash encrypt_ssh_key.sh ~/.ssh/id_ed25519 ./deploy_ssh_key.enc

# The system will prompt for a passphrase
# Add passphrase to GitHub Secrets: DEPLOY_KEY_PASSPHRASE
```

### Secrets Storage
- **Local Development:** `.env` file (NOT committed)
- **Staging:** Render environment variables
- **Production:** GitHub Secrets + Render environment

**RULE:** Never commit secrets to git. Use environment variables only.

---

## 🐛 Troubleshooting

### Backend Not Starting
```bash
# Check logs
docker-compose logs api

# Issues:
# - PORT already in use → Kill process or change PORT env var
# - Database connection → Check DATABASE_URL
# - Missing dependencies → Run `pnpm install`
```

### Frontend Not Loading
```bash
# Check logs
docker-compose logs frontend

# Issues:
# - CORS blocked → Check API origin in frontend code
# - Build failed → Check Dockerfile and dependencies
# - Port 3000 in use → Kill other processes
```

### Database Issues
```bash
# Reset database (loses data!)
rm dev.db

# Run migrations
pnpm run db:push

# Check schema
pnpm run db:studio
```

### Git SSH Key Issues
```bash
# Test SSH connection
ssh -T git@github.com

# If failing, check:
# - Private key exists at ~/.ssh/id_rsa
# - Public key added to GitHub
# - SSH agent running: eval "$(ssh-agent -s)"
```

---

## 📞 Getting Help

1. **Check this guide first** - Most common tasks are documented
2. **Read AI_MUST_FOLLOW_RULES.md** - Prevents common mistakes
3. **Search in docs/setup/progress/** - Look for related docs
4. **Check error logs** - `docker-compose logs`
5. **Review code examples** - MASTER_CODE_SPEC.md has patterns

---

## 🗂️ File Organization Guidelines

All new files follow this structure:

```
Type: File/Folder
├── Implementation Code: /halo-system/backend/ or /ai_connector/
├── Shared Libraries: /lib/
├── Deployables: /artifacts/
├── Documentation: /docs/setup/{rules|reference|progress}/
├── Scripts: /scripts/ or /deployment/
└── Config: Root level (docker-compose.yml, render.yaml, etc.)
```

**New documentation ALWAYS goes in `/docs/setup/` - never create it elsewhere.**

---

## ✅ Pre-Commit Checklist

Before running `git push`:

- [ ] All code changes follow AI_MUST_FOLLOW_RULES.md
- [ ] No secrets committed (check .env, API keys, etc.)
- [ ] Documentation updated for changes made
- [ ] Code tested locally with `docker-compose up`
- [ ] No breaking changes to existing APIs
- [ ] Related phase docs updated with progress
- [ ] Commit message is clear and descriptive

---

## 📅 Phase Timeline

| Phase | Status | Target | Focus |
|-------|--------|--------|-------|
| Phase 1 | ✅ Complete | June 9, 2026 | Core backend foundation |
| Phase 2 | 🔄 Next | Q3 2026 | Frontend UI & workflows |
| Phase 3 | 📋 Planned | Q4 2026 | KB & billing |
| Phase 4 | 📋 Planned | Q1 2027 | RMM & monitoring |
| Phase 5 | 📋 Planned | Q2 2027 | Security & integrations |

---

**Last Updated:** June 11, 2026  
**Maintained By:** Development Team  
**Next Review:** August 11, 2026  

