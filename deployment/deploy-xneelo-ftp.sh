#!/bin/bash

# 📤 Xneelo FTP Deployment Script
# Automates frontend deployment to Xneelo cPanel hosting

set -e  # Exit on error

# Configuration
DOMAIN="haloitservices365.com"
XNEELO_FTP_HOST="${1:-ftp.${DOMAIN}}"
XNEELO_FTP_USER="${2:-}"
XNEELO_FTP_PASS="${3:-}"
XNEELO_FTP_DIR="/public_html"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📤 Xneelo FTP Frontend Deployment${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

# ═══════════════════════════════════════════════════════════════
# VALIDATION
# ═══════════════════════════════════════════════════════════════

echo -e "${YELLOW}📋 Validating Deployment Configuration${NC}\n"

if [ -z "$XNEELO_FTP_USER" ]; then
    echo -e "${RED}❌ Error: FTP username required${NC}"
    echo "Usage: bash deployment/deploy-xneelo-ftp.sh <ftp-host> <username> <password>"
    echo "Example: bash deployment/deploy-xneelo-ftp.sh ftp.haloitservices365.com username password"
    exit 1
fi

if [ -z "$XNEELO_FTP_PASS" ]; then
    echo -e "${RED}❌ Error: FTP password required${NC}"
    exit 1
fi

if [ ! -d "halo-system/frontend" ]; then
    echo -e "${RED}❌ Error: halo-system/frontend directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Configuration validated${NC}\n"

# ═══════════════════════════════════════════════════════════════
# PREPARE DEPLOYMENT PACKAGE
# ═══════════════════════════════════════════════════════════════

echo -e "${YELLOW}📦 Preparing Deployment Package${NC}\n"

# Create temporary deployment directory
DEPLOY_TEMP="/tmp/halo-frontend-deploy-$(date +%s)"
mkdir -p "$DEPLOY_TEMP/frontend"

echo "Copying frontend files..."
cp -r halo-system/frontend/* "$DEPLOY_TEMP/frontend/"

# Update API endpoints in HTML files
echo "Updating API endpoints..."
find "$DEPLOY_TEMP/frontend" -name "*.html" -type f | while read file; do
    # Replace localhost with production API endpoints
    sed -i "s|http://localhost:3000|https://api.${DOMAIN}|g" "$file"
    sed -i "s|http://localhost:8080|https://aidevapp.${DOMAIN}|g" "$file"
    sed -i "s|localhost:3000|api.${DOMAIN}|g" "$file"
    sed -i "s|localhost:8080|aidevapp.${DOMAIN}|g" "$file"
done

# Create .htaccess for proper routing
cat > "$DEPLOY_TEMP/frontend/.htaccess" << 'EOF'
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
</IfModule>
EOF

echo -e "${GREEN}✓ Deployment package prepared: $DEPLOY_TEMP/frontend${NC}\n"

# ═══════════════════════════════════════════════════════════════
# FTP UPLOAD
# ═══════════════════════════════════════════════════════════════

echo -e "${YELLOW}📡 Uploading via FTP${NC}\n"

if ! command -v lftp >/dev/null 2>&1; then
  echo -e "${RED}❌ lftp not installed. Install it with: sudo apt-get install lftp -y${NC}"
  rm -rf "$DEPLOY_TEMP"
  exit 1
fi

echo "Connecting to $XNEELO_FTP_HOST..."
lftp -u "$XNEELO_FTP_USER","$XNEELO_FTP_PASS" "$XNEELO_FTP_HOST" <<EOF
set ftp:ssl-allow no
mirror -R --delete --verbose --no-symlinks "$DEPLOY_TEMP/frontend" "$XNEELO_FTP_DIR"
bye
EOF

echo -e "${GREEN}✓ FTP upload completed${NC}\n"

# ═══════════════════════════════════════════════════════════════
# VERIFICATION
# ═══════════════════════════════════════════════════════════════

echo -e "${YELLOW}✅ Verifying Deployment${NC}\n"

echo "Testing frontend accessibility..."
sleep 2  # Wait for files to be available

if curl -s https://${DOMAIN} | grep -q "<!DOCTYPE\|<html" 2>/dev/null; then
    echo -e "${GREEN}✓ Frontend is accessible at https://${DOMAIN}${NC}"
else
    echo -e "${YELLOW}⚠ Frontend may still be propagating...${NC}"
fi

# ═══════════════════════════════════════════════════════════════
# CLEANUP & SUMMARY
# ═══════════════════════════════════════════════════════════════

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Frontend Deployment Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}\n"

echo "📊 Deployment Summary:"
echo "  • Frontend files: ✅ Uploaded"
echo "  • .htaccess: ✅ Configured"
echo "  • API endpoints: ✅ Updated"
echo ""
echo "🔗 Live URL: https://${DOMAIN}"
echo ""
echo "📊 Files deployed:"
ls -la "$DEPLOY_TEMP/frontend" | grep -E "\.html|\.js|\.css" | head -5
echo "  ... and more files"
echo ""

# Cleanup
rm -f "$FTP_BATCH"
rm -rf "$DEPLOY_TEMP"

echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Visit https://${DOMAIN} to verify"
echo "  2. Check browser console for any errors"
echo "  3. Test login and dashboard functionality"
echo "  4. Monitor backend logs for any API errors"
echo ""
echo -e "${BLUE}Need help? Check: docs/setup/reference/DEPLOYMENT_PRODUCTION.md${NC}"

exit 0
