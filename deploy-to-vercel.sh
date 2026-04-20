#!/bin/bash
# Deploy Advanced Financial Dashboard to Vercel
# Run this script to build, test, and deploy to production

set -e

echo ""
echo "========================================="
echo "  Financial Dashboard Deployment Script"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Setup Finance Dashboard
echo -e "${YELLOW}Step 1/5: Setting up Financial Dashboard...${NC}"
if [ -f "setup-finance-dashboard.sh" ]; then
    bash setup-finance-dashboard.sh
    echo -e "${GREEN}✓ Dashboard setup complete${NC}"
else
    echo -e "${RED}✗ Setup script not found${NC}"
    exit 1
fi

# Step 2: Build project
echo ""
echo -e "${YELLOW}Step 2/5: Building project...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

# Step 3: Install Vercel CLI if not present
echo ""
echo -e "${YELLOW}Step 3/5: Checking Vercel CLI...${NC}"
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi
echo -e "${GREEN}✓ Vercel CLI ready${NC}"

# Step 4: Deploy to Vercel
echo ""
echo -e "${YELLOW}Step 4/5: Deploying to Vercel...${NC}"
vercel deploy --prod

# Step 5: Deployment complete
echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Your Financial Dashboard is now live!"
echo ""
echo "Dashboard URL: https://your-domain.com/admin/finance"
echo "Admin Dashboard: https://your-domain.com/admin/dashboard"
echo ""
echo "Features:"
echo "  • 14 advanced financial modules"
echo "  • Real-time metrics calculation"
echo "  • USD & PKR currency support"
echo "  • Comprehensive financial analytics"
echo ""
