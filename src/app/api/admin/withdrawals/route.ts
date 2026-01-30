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

    const withdrawals = await prisma.withdrawal.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
      orderBy: { requestedAt: 'desc' },
    });

    return apiResponse.success(withdrawals);
  } catch (error) {
    console.error('Get withdrawals error:', error);
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

    const { withdrawalId, action, txHash } = await request.json();

    if (!withdrawalId || !action) {
      return apiResponse.error('Missing required fields', 400);
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      return apiResponse.error('Withdrawal not found', 404);
    }

    if (action === 'approve') {
      const updated = await prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: 'approved',
          approvedBy: auth.userId,
          approvedAt: new Date(),
        },
      });
      return apiResponse.success(updated);
    }

    if (action === 'sent') {
      if (!txHash) {
        return apiResponse.error('Transaction hash required', 400);
      }
      const updated = await prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: 'sent',
          txHash,
          sentAt: new Date(),
        },
      });
      return apiResponse.success(updated);
    }

    if (action === 'reject') {
      const updated = await prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: 'cancelled',
        },
      });
      return apiResponse.success(updated);
    }

    return apiResponse.error('Invalid action', 400);
  } catch (error) {
    console.error('Update withdrawal error:', error);
    return apiResponse.error('Internal server error', 500);
  }
}
