import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check if database is already initialized
    const adminExists = await prisma.user.findUnique({
      where: { email: 'admin@trading.com' },
    });

    if (adminExists) {
      return NextResponse.json({ message: 'Already initialized' });
    }

    // Create default admin user
    const hashedPassword = await hashPassword('admin123');
    await prisma.user.create({
      data: {
        email: 'admin@trading.com',
        password: hashedPassword,
        username: 'admin',
        isAdmin: true,
        balance: 0,
      },
    });

    // Create default config
    await prisma.config.create({
      data: {
        depositAddress: process.env.BTC_DEPOSIT_ADDRESS || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        adminWallet: process.env.ADMIN_BTC_WALLET || 'your-admin-wallet',
        minDeposit: 0.001,
        minWithdrawal: 0.001,
        maxWithdrawal: 100,
      },
    });

    return NextResponse.json({
      message: 'Database initialized successfully',
      admin: {
        email: 'admin@trading.com',
        password: 'admin123',
      },
    });
  } catch (error) {
    console.error('Initialization error:', error);
    return NextResponse.json(
      { error: 'Initialization failed' },
      { status: 500 }
    );
  }
}
