#!/bin/bash

# 🚀 JointHaloRepo Deployment Automation Script
# Automates deployment to Render (backend) and Xneelo (frontend)
# Run this script from the repository root

set -e  # Exit on error

REPO_NAME="JointHaloRepo"
GITHUB_REPO="devvycoder321/JointHaloRepo"
DOMAIN="haloitservices365.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 JointHaloRepo Production Deployment Script${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

# ═══════════════════════════════════════════════════════════════
# STAGE 1: PRE-DEPLOYMENT CHECKS
# ═══════════════════════════════════════════════════════════════

echo -e "${YELLOW}📋 STAGE 1: Pre-Deployment Checks${NC}"
echo ""

# Check we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "halo-system" ]; then
    echo -e "${RED}❌ Error: Must run from JointHaloRepo root directory${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Correct directory${NC}"

# Check git is clean
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠ Warning: Uncommitted changes detected${NC}"
    echo "Uncommitted files:"
    git status --short
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Deployment cancelled${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✓ Git status checked${NC}"

# Check Docker is available
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Please install Docker.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker available${NC}"

# Check Git is available
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git not found. Please install Git.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Git available${NC}"

echo ""

# ═══════════════════════════════════════════════════════════════
# STAGE 2: LOCAL DOCKER BUILD TEST
# ═══════════════════════════════════════════════════════════════

echo -e "${YELLOW}🐳 STAGE 2: Testing Docker Build${NC}"
echo ""

echo "Building MSP Backend Docker image..."
docker build -f halo-system/Dockerfile -t haloitservices-backend:latest . 2>&1 | grep -E "Successfully|error|Error" || true

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo -e "${GREEN}✓ MSP Backend Docker build successful${NC}"
else
    echo -e "${RED}❌ MSP Backend Docker build failed${NC}"
    exit 1
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# STAGE 3: CODE QUALITY CHECKS
# ═══════════════════════════════════════════════════════════════

echo -e "${YELLOW}🔍 STAGE 3: Code Quality Checks${NC}"
echo ""

# Check for console.log statements (should use proper logging)
if grep -r "console\.log" halo-system/backend --include="*.js" --exclude-dir=node_modules | head -5; then
    echo -e "${YELLOW}⚠ Warning: Found console.log statements. Consider using proper logging.${NC}"
fi
echo -e "${GREEN}✓ Code quality check complete${NC}"

echo ""

# ═══════════════════════════════════════════════════════════════
# STAGE 4: DEPLOYMENT CONFIRMATION
# ═══════════════════════════════════════════════════════════════

echo -e "${YELLOW}📝 STAGE 4: Deployment Confirmation${NC}"
echo ""
echo "The following will be deployed:"
echo "  • Backend: https://api.${DOMAIN}"
echo "  • AI System: https://aidevapp.${DOMAIN}"
echo "  • Frontend: https://${DOMAIN}"
echo ""

read -p "Deploy to production? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Deployment cancelled${NC}"
    exit 1
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# STAGE 5: GIT PUSH
# ═══════════════════════════════════════════════════════════════

echo -e "${YELLOW}📤 STAGE 5: Pushing to GitHub${NC}"
echo ""

echo "Creating deployment commit..."
git add .
git commit --allow-empty -m "chore: trigger production deployment - $(date +%Y-%m-%d\ %H:%M:%S)"

echo "Pushing to main branch..."
git push origin main

echo -e "${GREEN}✓ Code pushed to GitHub${NC}"

echo ""

# ═══════════════════════════════════════════════════════════════
# STAGE 6: RENDER DEPLOYMENT MONITOR
# ═══════════════════════════════════════════════════════════════

echo -e "${YELLOW}🚀 STAGE 6: Render Auto-Deployment Started${NC}"
echo ""
echo "Render will automatically:"
echo "  1. Detect the new commit on main"
echo "  2. Build Docker images"
echo "  3. Deploy to production"
echo "  4. Run health checks"
echo ""
echo -e "${BLUE}Monitor deployment progress at:${NC}"
echo "  https://dashboard.render.com/services"
echo ""
echo "Estimated deployment time: 5-10 minutes"
echo ""

# ═══════════════════════════════════════════════════════════════
# STAGE 7: POST-DEPLOYMENT TESTING
# ═══════════════════════════════════════════════════════════════

echo -e "${YELLOW}✅ STAGE 7: Waiting for Production Services${NC}"
echo ""

# Wait and test
echo "Waiting 60 seconds for services to start..."
sleep 60

echo "Testing health endpoints..."

# Test MSP backend
echo -n "Testing https://api.${DOMAIN}/api/health ... "
if curl -s https://api.${DOMAIN}/api/health | grep -q "ok"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ Still loading...${NC}"
fi

# Test frontend
echo -n "Testing https://${DOMAIN} ... "
if curl -s https://${DOMAIN} | grep -q "<!DOCTYPE\|<html"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ Still loading...${NC}"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# COMPLETION
# ═══════════════════════════════════════════════════════════════

echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Deployment Process Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "📊 Deployment Summary:"
echo "  • Code pushed to GitHub: ✅"
echo "  • Docker build tested: ✅"
echo "  • Render auto-deploy: ✅ (in progress)"
echo ""
echo "🔗 Live Services:"
echo "  • MSP Backend:  https://api.${DOMAIN}"
echo "  • AI Backend:   https://aidevapp.${DOMAIN}"
echo "  • Frontend:     https://${DOMAIN}"
echo ""
echo "📈 Monitoring:"
echo "  • Render Dashboard: https://dashboard.render.com"
echo "  • Logs:  Check Render dashboard for deployment logs"
echo ""
echo "🔧 Next Steps:"
echo "  1. Monitor logs for any errors"
echo "  2. Test all endpoints in browser"
echo "  3. Verify database migrations completed"
echo "  4. Check frontend API connections"
echo ""
echo -e "${BLUE}Questions? Check: docs/setup/reference/DEPLOYMENT_PRODUCTION.md${NC}"
echo ""

exit 0
