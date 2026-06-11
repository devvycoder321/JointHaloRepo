# AI Agent Must Follow Rules & Guidelines

**Last Updated:** June 11, 2026  
**Applies To:** All AI agents working on JointHaloRepo  
**Critical:** These rules prevent system breakage and ensure consistency

---

## 🚨 CARDINAL RULES (NEVER BREAK)

### Rule 1: Dual System Architecture
This repository contains **TWO distinct systems**:
1. **Standalone AI System** (`ai_connector/Github-Connector/`)
   - Autonomous AI agent framework
   - Built with its own stack and configuration
   - Purpose: AI-powered business automation
   
2. **MSP Business System** (`halo-system/`)
   - Halo IT Services 365 platform
   - Built for managed service providers
   - Purpose: Ticketing, monitoring, billing, and service management

**RULE:** Never mix these systems. Keep their files, configs, and deployments separate.

---

## 📋 REPOSITORY PURPOSE & PRIMARY GOAL

This is **NOT a generic AI project**. This is a **specialized business platform repository**.

### Primary Purpose
Build **Halo IT Services 365** - a complete MSP (Managed Service Provider) business platform with:
- Ticket management and SLA tracking
- Client and billing management
- Remote monitoring and device management
- Security operations center
- Knowledge base and learning center
- Business automation via integrated AI

### Secondary Purpose
Integrate a **standalone AI system** alongside the MSP for:
- AI-powered customer service and knowledge base
- Business process automation
- Report generation and analytics

---

## 🏗️ STRUCTURE & ORGANIZATION RULES

### Rule 2: Do Not Scatter Documentation
All documentation must be organized in `/docs/setup/`:
```
docs/setup/
├── rules/
│   ├── AI_MUST_FOLLOW_RULES.md (this file)
│   ├── PROJECT_OBJECTIVES.md
│   └── SETUP_GUIDE.md
├── reference/
│   ├── HALOIT365_MASTER_CODE_SPEC.md
│   ├── system-architecture.md
│   ├── database-schema.md
│   └── api-spec.md
└── progress/
    ├── GAP_ANALYSIS.md
    ├── PHASE1_SUMMARY.md
    ├── PHASE2_IMPLEMENTATION_PLAN.md
    └── [feature-tracker, roadmap, audit files]
```

**RULE:** New documentation goes into the appropriate subfolder. No scattered docs in the root.

### Rule 3: Never Delete Critical Files
Before deleting anything, ask: "Is this in the protected list?"

**Protected & Never Delete:**
- `/halo-system/backend/` - Core MSP backend
- `/halo-system/frontend/` - MSP frontend
- `lib/db/` - Shared database schemas
- All files in `/docs/setup/` once created
- `.git`, `.gitignore`, `.github/` - Version control
- `docker-compose.yml`, `Dockerfile`, `render.yaml` - Deployment configs
- `package.json`, `pnpm-lock.yaml` - Dependencies

---

## 💻 DEVELOPMENT RULES

### Rule 4: Stack & Technology Requirements
**MSP Backend (halo-system/backend):**
- Runtime: Node.js 18+
- Framework: Express.js 5+
- Database: PostgreSQL (production) / SQLite (dev)
- ORM: Sequelize
- Auth: Session-based + JWT + TOTP (MFA)
- Language: JavaScript/TypeScript

**MSP Frontend (halo-system/frontend):**
- Framework: React 19+ or vanilla HTML/CSS/JS
- Styling: Tailwind CSS
- State: Basic or Redux
- Build: Vite (if SPA)

**Standalone AI System (ai_connector/):**
- Follows its own stack defined in its package.json
- Deployment: Independent Docker container
- Not coupled to MSP backend

### Rule 5: Code Extension Rules (Never Rewrite)
1. **Always EXTEND existing files - never rewrite them**
   - Add routes to existing route files
   - Add tables to existing schema files
   - Append to existing configuration

2. **Database Changes:**
   - New tables go in `lib/db/src/schema/index.ts`
   - Run `pnpm run db:push` after schema changes
   - Migrations are auto-generated - never manual SQL edits

3. **New Routes:**
   - Create in appropriate `routes/` subdirectory
   - Import and register in `routes/index.ts`
   - All routes require `requireAuth` middleware
   - All routes must have `try/catch` with proper error responses

4. **Error Handling Pattern:**
   ```javascript
   try {
     // logic
   } catch (e) {
     return res.status(500).json({ error: e.message });
   }
   ```

### Rule 6: Environment Variables
All sensitive config must use environment variables:
```
DATABASE_URL=postgresql://...
SESSION_SECRET=random-string-min-32-chars
JWT_SECRET=random-string-min-32-chars
AI_INTEGRATIONS_OPENAI_API_KEY=sk-...
PORT=3000
NODE_ENV=production
```

**RULE:** Never hardcode secrets. Use `.env` for local dev, secrets manager for production.

---

## 🚀 DEPLOYMENT & INFRASTRUCTURE RULES

### Rule 7: Deployment Targets
The system supports three deployment targets:

1. **Local Development**
   - `npm run dev` or `npm start`
   - SQLite database
   - http://localhost:3000

2. **Render.com** (Cloud-hosted)
   - Uses `render.yaml` configuration
   - PostgreSQL database on Render
   - Automatic deployments on git push to `main`
   - Both MSP and AI systems deployed separately

3. **Xneelo / cPanel Hosting** (Traditional hosting)
   - Requires SSH deploy key
   - Uses deployment scripts
   - Manual or CI/CD via GitHub Actions
   - Static frontend + Node backend

**RULE:** Test locally before pushing. All changes to `render.yaml` or `docker-compose.yml` must be justified.

### Rule 8: Docker & Container Rules
- **Each system gets its own Dockerfile**
- MSP System: `halo-system/Dockerfile`
- AI System: `ai_connector/Github-Connector/artifacts/api-server/Dockerfile`
- `docker-compose.yml` orchestrates local development for both

**RULE:** Never consolidate Dockerfiles. Keep deployments independent.

### Rule 9: Commit & Push Rules
Before committing:
1. ✅ No sensitive data (API keys, passwords) committed
2. ✅ All code follows the stack rules above
3. ✅ Tests pass (if applicable)
4. ✅ Documentation updated if functionality changed
5. ✅ No breaking changes to existing APIs

**Push Strategy:**
- Use `auto_push_origin.sh` for automated commits
- Tag major releases with version numbers
- Include clear commit messages referencing what was changed

---

## 📖 DOCUMENTATION RULES

### Rule 10: When to Create New Docs
1. **New feature** → Document in feature-tracker.md
2. **Phase completion** → Create PHASE#_SUMMARY.md
3. **Architecture change** → Update system-architecture.md
4. **Gap discovery** → Update GAP_ANALYSIS.md
5. **Setup procedure** → Update SETUP_GUIDE.md

### Rule 11: Documentation Standards
- Use Markdown format
- Include date last updated
- Include version/phase number
- Link related documents
- Include code examples for technical docs
- Mark incomplete sections with `[TODO]` or `[IN PROGRESS]`

---

## 🔍 CODE REVIEW CHECKLIST FOR AI AGENTS

Before submitting code, verify:

- [ ] Does code extend (not rewrite) existing files?
- [ ] Are all new dependencies documented?
- [ ] Is database schema added to proper location with migration run?
- [ ] Are error messages non-leaking and user-friendly?
- [ ] Are new routes registered in index files?
- [ ] Is authentication checked on protected routes?
- [ ] Are RBAC permissions validated where needed?
- [ ] Is audit logging added for sensitive operations?
- [ ] Are environment variables used for configuration?
- [ ] Is the code consistent with existing patterns?
- [ ] Have I documented what I changed?
- [ ] Does this break any existing functionality?

---

## 🛠️ COMMON PITFALLS TO AVOID

1. **❌ Mixing the two systems' code paths**
   - ✅ Keep MSP and AI system deployments separate

2. **❌ Hardcoding secrets or API keys**
   - ✅ Always use environment variables

3. **❌ Rewriting large existing files**
   - ✅ Extend carefully with additions at the end

4. **❌ Skipping database migrations**
   - ✅ Always run `pnpm run db:push` after schema changes

5. **❌ Not updating documentation after changes**
   - ✅ Update relevant docs immediately

6. **❌ Deploying without testing locally first**
   - ✅ Test all changes locally in Docker before pushing

7. **❌ Breaking the RBAC or auth flow**
   - ✅ Never bypass authentication on API routes

8. **❌ Leaving incomplete features on main branch**
   - ✅ Use feature branches and PRs for incomplete work

---

## 📞 QUESTIONS & ESCALATION

If you encounter something not covered here:
1. Check PROJECT_OBJECTIVES.md for project goals
2. Check SETUP_GUIDE.md for navigation help
3. Check relevant phase docs for context
4. If still unclear, document the question and note it in a TODO

---

## History of Rule Changes

| Date | Change | Reason |
|------|--------|--------|
| 2026-06-11 | Created initial rules | Prevent AI agent mistakes and system fragmentation |

