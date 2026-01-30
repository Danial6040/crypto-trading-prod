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

    const { amount, txHash } = await request.json();

    if (!amount || !txHash || amount <= 0) {
      return apiResponse.error('Invalid deposit details', 400);
    }

    const deposit = await prisma.deposit.create({
      data: {
        userId: auth.userId,
        amount,
        txHash,
        status: 'pending',
      },
    });

    return apiResponse.success(deposit, 201);
  } catch (error) {
    console.error('Deposit error:', error);
    return apiResponse.error('Internal server error', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);

    if (!auth) {
      return apiResponse.error('Unauthorized', 401);
    }

    const deposits = await prisma.deposit.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
    });

    return apiResponse.success(deposits);
  } catch (error) {
    console.error('Get deposits error:', error);
    return apiResponse.error('Internal server error', 500);
  }
}
