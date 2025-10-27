import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/adminAuth';

const prisma = new PrismaClient();

/**
 * GET /api/admin/users/[id]
 * Get detailed user information (Admin only)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        financialPlans: {
          orderBy: { createdAt: 'desc' },
        },
        expenses: {
          orderBy: { date: 'desc' },
          take: 20,
        },
        dailyBudgets: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        fixedCosts: {
          where: { isActive: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate advanced statistics
    const totalExpenses = await prisma.expense.aggregate({
      where: { userId: id },
      _sum: { amount: true },
      _count: true,
      _avg: { amount: true },
    });

    const expensesByCategory = await prisma.expense.groupBy({
      by: ['category'],
      where: { userId: id },
      _sum: { amount: true },
      _count: true,
    });

    const monthlyActivity = await prisma.expense.groupBy({
      by: ['date'],
      where: {
        userId: id,
        date: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      _count: true,
    });

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        password: undefined, // Don't send password hash
      },
      analytics: {
        expenses: {
          total: totalExpenses._sum.amount || 0,
          count: totalExpenses._count,
          average: totalExpenses._avg.amount || 0,
          byCategory: expensesByCategory,
        },
        activity: {
          last30Days: monthlyActivity.length,
          financialPlansCount: user.financialPlans.length,
          dailyBudgetsCount: user.dailyBudgets.length,
          activeFixedCosts: user.fixedCosts.length,
        },
        locations: user.financialPlans.map((plan) => ({
          location: plan.location,
          currency: plan.currency,
          budget: plan.monthlyBudget,
          createdAt: plan.createdAt,
        })),
      },
    });

  } catch (error) {
    console.error('Admin user detail error:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users/[id]
 * Update user (Admin only)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    const { isActive, role } = body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(role && { role }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user,
    });

  } catch (error) {
    console.error('Admin user update error:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
