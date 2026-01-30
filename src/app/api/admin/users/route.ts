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

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
    });

    if (!user || !user.isAdmin) {
      return apiResponse.error('Unauthorized', 403);
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        balance: true,
        createdAt: true,
        isAdmin: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiResponse.success(users);
  } catch (error) {
    console.error('Get users error:', error);
    return apiResponse.error('Internal server error', 500);
  }
}
