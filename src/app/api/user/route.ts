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
      select: {
        id: true,
        email: true,
        username: true,
        balance: true,
        isAdmin: true,
        createdAt: true,
      },
    });

    if (!user) {
      return apiResponse.error('User not found', 404);
    }

    return apiResponse.success(user);
  } catch (error) {
    console.error('Get user error:', error);
    return apiResponse.error('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);

    if (!auth) {
      return apiResponse.error('Unauthorized', 401);
    }

    const { username } = await request.json();

    const user = await prisma.user.update({
      where: { id: auth.userId },
      data: { username },
      select: {
        id: true,
        email: true,
        username: true,
        balance: true,
      },
    });

    return apiResponse.success(user);
  } catch (error) {
    console.error('Update user error:', error);
    return apiResponse.error('Internal server error', 500);
  }
}
