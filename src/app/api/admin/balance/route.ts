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

    const admin = await prisma.user.findUnique({
      where: { id: auth.userId },
    });

    if (!admin || !admin.isAdmin) {
      return apiResponse.error('Unauthorized', 403);
    }

    const { userId, amount, type, notes } = await request.json();

    if (!userId || !amount || !type) {
      return apiResponse.error('Missing required fields', 400);
    }

    // Update user balance
    const newBalance = type === 'credit' 
      ? (await prisma.user.findUnique({ where: { id: userId } }))?.balance! + amount
      : (await prisma.user.findUnique({ where: { id: userId } }))?.balance! - amount;

    if (newBalance < 0) {
      return apiResponse.error('Insufficient balance', 400);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { balance: newBalance },
    });

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type: type === 'credit' ? 'deposit' : 'withdrawal',
        amount: type === 'credit' ? amount : -amount,
        notes: `Admin ${type}: ${notes || 'No notes'}`,
      },
    });

    return apiResponse.success({ user, transaction }, 201);
  } catch (error) {
    console.error('Balance adjustment error:', error);
    return apiResponse.error('Internal server error', 500);
  }
}
