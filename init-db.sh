#!/bin/bash
cd /workspaces/crypto-trading-prod
export DATABASE_URL="file:./dev.db"
export NEXTAUTH_SECRET="your-secret-key-generate-one"
export NEXTAUTH_URL="http://localhost:3000"

# Create the database with admin user
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function init() {
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@trading.com' }
    });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          email: 'admin@trading.com',
          password: hashedPassword,
          username: 'admin',
          isAdmin: true,
          balance: 0
        }
      });
      console.log('✓ Admin user created: admin@trading.com / admin123');
    }
    
    const existingConfig = await prisma.config.findFirst();
    if (!existingConfig) {
      await prisma.config.create({
        data: {
          depositAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          adminWallet: 'your-admin-wallet',
          minDeposit: 0.001,
          minWithdrawal: 0.001,
          maxWithdrawal: 100
        }
      });
      console.log('✓ Default config created');
    }
  } catch (e) {
    console.error('Initialization error:', e);
  } finally {
    await prisma.\$disconnect();
  }
}

init();
"
