import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/middleware';
import { apiResponse } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);

    if (!auth) {
      return apiResponse.error('Unauthorized', 401);
    }

    const { amount, walletAddress } = await request.json();

    if (!amount || !walletAddress || amount <= 0) {
      return apiResponse.error('Invalid withdrawal details', 400);
    }

    // Check if user has sufficient balance
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
    });

    if (!user || user.balance < amount) {
      return apiResponse.error('Insufficient balance', 400);
    }

    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: auth.userId,
        amount,
        walletAddress,
        status: 'pending',
      },
    });

    return apiResponse.success(withdrawal, 201);
  } catch (error) {
    console.error('Withdrawal error:', error);
    return apiResponse.error('Internal server error', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);

    if (!auth) {
      return apiResponse.error('Unauthorized', 401);
    }

    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId: auth.userId },
      orderBy: { requestedAt: 'desc' },
    });

    return apiResponse.success(withdrawals);
  } catch (error) {
    console.error('Get withdrawals error:', error);
    return apiResponse.error('Internal server error', 500);
  }
}
