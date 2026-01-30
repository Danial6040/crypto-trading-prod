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

    const deposits = await prisma.deposit.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiResponse.success(deposits);
  } catch (error) {
    console.error('Get deposits error:', error);
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

    const { depositId, action } = await request.json();

    if (!depositId || !action) {
      return apiResponse.error('Missing required fields', 400);
    }

    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
    });

    if (!deposit) {
      return apiResponse.error('Deposit not found', 404);
    }

    if (action === 'confirm') {
      // Update deposit status
      const updated = await prisma.deposit.update({
        where: { id: depositId },
        data: {
          status: 'confirmed',
          confirmedAt: new Date(),
        },
      });

      // Credit user balance
      const user = await prisma.user.findUnique({
        where: { id: deposit.userId },
      });

      if (user) {
        const newBalance = user.balance + deposit.amount;
        await prisma.user.update({
          where: { id: deposit.userId },
          data: { balance: newBalance },
        });

        // Create transaction record
        await prisma.transaction.create({
          data: {
            userId: deposit.userId,
            type: 'deposit',
            amount: deposit.amount,
            notes: `Deposit confirmed: ${deposit.txHash}`,
          },
        });
      }

      return apiResponse.success(updated);
    }

    if (action === 'cancel') {
      const updated = await prisma.deposit.update({
        where: { id: depositId },
        data: {
          status: 'cancelled',
        },
      });
      return apiResponse.success(updated);
    }

    return apiResponse.error('Invalid action', 400);
  } catch (error) {
    console.error('Update deposit error:', error);
    return apiResponse.error('Internal server error', 500);
  }
}
