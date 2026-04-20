#!/bin/bash
# Financial Dashboard Setup Script
# Run this after checking out the code

echo "🚀 Setting up Advanced Financial Dashboard..."

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p app/admin/finance

# Move the finance page to proper location
if [ -f app/admin/finance.tsx ]; then
    echo "Moving finance.tsx to app/admin/finance/page.tsx..."
    mv app/admin/finance.tsx app/admin/finance/page.tsx
fi

# Run Prisma migrations
echo "🗄️  Running database migrations..."
npx prisma db push --accept-data-loss

# Seed financial data
echo "🌱 Seeding financial data..."
npx prisma db seed

# Install Recharts (charting library)
echo "📦 Installing Recharts..."
npm install recharts

# Build the project
echo "🔨 Building project..."
npm run build

echo ""
echo "✅ Financial Dashboard setup complete!"
echo ""
echo "📍 Dashboard available at: http://localhost:3000/admin/finance"
echo "🔐 Admin only - login required"
echo ""
echo "Next steps:"
echo "1. Run: npm run dev"
echo "2. Navigate to: http://localhost:3000/admin/dashboard"
echo "3. Login with admin credentials"
echo "4. Click 'Finance' in the sidebar"
echo ""
