import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/adminAuth';

const prisma = new PrismaClient();

/**
 * GET /api/admin/users
 * Get all users with statistics (Admin only)
 */
export async function GET(request: Request) {
  try {
    // Check admin permission
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    // Build where clause
    const where = search
      ? {
          OR: [
            { email: { contains: search } },
            { name: { contains: search } },
          ],
        }
      : {};

    // Get total count
    const totalUsers = await prisma.user.count({ where });

    // Get users with related data
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        lastLoginIp: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            financialPlans: true,
            expenses: true,
            dailyBudgets: true,
            fixedCosts: true,
          },
        },
        financialPlans: {
          select: {
            location: true,
            currency: true,
            monthlyBudget: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Calculate statistics for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        // Get total expenses
        const totalExpenses = await prisma.expense.aggregate({
          where: { userId: user.id },
          _sum: { amount: true },
        });

        // Get last active location (from IP or financial plan)
        const lastLocation = user.financialPlans[0]?.location || 'Unknown';

        return {
          ...user,
          statistics: {
            totalFinancialPlans: user._count.financialPlans,
            totalExpenses: user._count.expenses,
            totalDailyBudgets: user._count.dailyBudgets,
            totalFixedCosts: user._count.fixedCosts,
            totalSpent: totalExpenses._sum.amount || 0,
            lastLocation,
            currentBudget: user.financialPlans[0]?.monthlyBudget || 0,
            currency: user.financialPlans[0]?.currency || 'EUR',
          },
        };
      })
    );

    // Get global statistics
    const globalStats = {
      totalUsers,
      activeUsers: users.filter((u) => u.isActive).length,
      adminUsers: users.filter((u) => u.role === 'admin').length,
      regularUsers: users.filter((u) => u.role === 'user').length,
    };

    return NextResponse.json({
      success: true,
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
      },
      statistics: globalStats,
    });

  } catch (error) {
    console.error('Admin users fetch error:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
