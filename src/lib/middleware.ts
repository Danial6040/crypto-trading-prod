import { NextRequest } from 'next/server';
import { verifyToken } from './auth';

export const getAuthFromRequest = (request: NextRequest) => {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (!token) return null;
  return verifyToken(token);
};
