import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateToken, comparePasswords } from '@/lib/auth';
import { apiResponse } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const { email, password, username, action } = await request.json();

    if (!email || !password || !username) {
      return apiResponse.error('Missing required fields', 400);
    }

    if (action === 'register') {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return apiResponse.error('Email already registered', 400);
      }

      const existingUsername = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUsername) {
        return apiResponse.error('Username already taken', 400);
      }

      // Create user
      const hashedPassword = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
        },
      });

      const token = generateToken(user.id, user.email);

      return apiResponse.success(
        {
          userId: user.id,
          email: user.email,
          username: user.username,
          token,
        },
        201
      );
    }

    if (action === 'login') {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return apiResponse.error('Invalid credentials', 401);
      }

      const passwordMatch = await comparePasswords(password, user.password);

      if (!passwordMatch) {
        return apiResponse.error('Invalid credentials', 401);
      }

      const token = generateToken(user.id, user.email);

      return apiResponse.success({
        userId: user.id,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin,
        token,
      });
    }

    return apiResponse.error('Invalid action', 400);
  } catch (error) {
    console.error('Auth error:', error);
    return apiResponse.error('Internal server error', 500);
  }
}
