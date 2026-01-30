import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/middleware';
import { apiResponse } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);

    if (!auth) {
      return apiResponse.error('Unauthorized', 401);
    }

    const admin = await prisma.user.findUnique({
      where: { id: auth.userId },
    });

    if (!admin || !admin.isAdmin) {
      return apiResponse.error('Unauthorized', 403);
    }

    const config = await prisma.config.findFirst();

    if (!config) {
      return apiResponse.success({
        depositAddress: process.env.BTC_DEPOSIT_ADDRESS || '',
        adminWallet: process.env.ADMIN_BTC_WALLET || '',
        minDeposit: 0.001,
        minWithdrawal: 0.001,
        maxWithdrawal: 100,
      });
    }

    return apiResponse.success(config);
  } catch (error) {
    console.error('Get config error:', error);
    return apiResponse.error('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);

    if (!auth) {
      return apiResponse.error('Unauthorized', 401);
    }

    const admin = await prisma.user.findUnique({
      where: { id: auth.userId },
    });

    if (!admin || !admin.isAdmin) {
      return apiResponse.error('Unauthorized', 403);
    }

    const { depositAddress, adminWallet, minDeposit, minWithdrawal, maxWithdrawal } = await request.json();

    let config = await prisma.config.findFirst();

    if (!config) {
      config = await prisma.config.create({
        data: {
          depositAddress: depositAddress || process.env.BTC_DEPOSIT_ADDRESS || '',
          adminWallet: adminWallet || process.env.ADMIN_BTC_WALLET || '',
          minDeposit: minDeposit || 0.001,
          minWithdrawal: minWithdrawal || 0.001,
          maxWithdrawal: maxWithdrawal || 100,
        },
      });
    } else {
      config = await prisma.config.update({
        where: { id: config.id },
        data: {
          ...(depositAddress && { depositAddress }),
          ...(adminWallet && { adminWallet }),
          ...(minDeposit && { minDeposit }),
          ...(minWithdrawal && { minWithdrawal }),
          ...(maxWithdrawal && { maxWithdrawal }),
        },
      });
    }

    return apiResponse.success(config);
  } catch (error) {
    console.error('Update config error:', error);
    return apiResponse.error('Internal server error', 500);
  }
}
