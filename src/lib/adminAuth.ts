/**
 * Admin Authentication Middleware
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function isAdmin(): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return false;
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, isActive: true },
    });

    return user?.role === 'admin' && user?.isActive === true;

  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
}

export async function requireAdmin() {
  const admin = await isAdmin();

  if (!admin) {
    throw new Error('Unauthorized: Admin access required');
  }

  return true;
}

export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    return user;

  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}
