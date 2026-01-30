#!/bin/bash

echo "========================================"
echo "TrustPaulsCrypto.net Deployment"
echo "========================================"
echo ""

# Check if .vercelignore exists
if [ ! -f .vercelignore ]; then
  cat > .vercelignore << 'EOF'
.env.local
.env.production
.env.*.local
node_modules
.git
.gitignore
README.md
DEPLOYMENT.md
setup.sh
init-db.sh
prisma/dev.db*
.next
out
dist
EOF
  echo "✓ Created .vercelignore"
fi

# Create environment file for Vercel
cat > vercel-env.txt << 'EOF'
NEXTAUTH_URL=https://trustpaulscrypto.net
NEXTAUTH_SECRET=use-your-own-secret-key
BTC_DEPOSIT_ADDRESS=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
ADMIN_BTC_WALLET=your-admin-wallet-address
EOF

echo ""
echo "MANUAL STEPS REQUIRED:"
echo "1. Go to https://vercel.com/new"
echo "2. Import your GitHub repository: Danial6040/crypto-trading-prod"
echo "3. Add these environment variables in Vercel:"
echo "   - NEXTAUTH_URL = https://trustpaulscrypto.net"
echo "   - NEXTAUTH_SECRET = (generate random: openssl rand -base64 32)"
echo "   - BTC_DEPOSIT_ADDRESS = bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
echo "   - ADMIN_BTC_WALLET = your-wallet-address"
echo "4. Click Deploy"
echo "5. After deployment, add custom domain: trustpaulscrypto.net"
echo ""
echo "Then your site will be live at: https://trustpaulscrypto.net"
echo "Admin login: admin@trading.com / admin123"
