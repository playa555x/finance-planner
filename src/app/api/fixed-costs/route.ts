import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

// GET fixed costs for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const active = searchParams.get('active');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    let whereConditions = [eq(schema.fixedCosts.userId, userId)];
    
    if (active !== null) {
      whereConditions.push(eq(schema.fixedCosts.isActive, active === 'true'));
    }

    const fixedCosts = await db.select()
      .from(schema.fixedCosts)
      .where(and(...whereConditions))
      .orderBy(schema.fixedCosts.startDate);

    return NextResponse.json({ fixedCosts });
  } catch (error) {
    console.error('Error fetching fixed costs:', error);
    return NextResponse.json({ error: 'Failed to fetch fixed costs' }, { status: 500 });
  }
}

// POST create new fixed cost
export async function POST(request: NextRequest) {
  try {
    const { userId, name, amount, category, frequency, startDate, endDate, description } = await request.json();

    if (!userId || !name || !amount || !category || !frequency || !startDate) {
      return NextResponse.json({ error: 'User ID, name, amount, category, frequency, and start date required' }, { status: 400 });
    }

    const created = await db.insert(schema.fixedCosts)
      .values({
        id: crypto.randomUUID(),
        userId,
        name,
        amount: parseFloat(amount),
        category,
        frequency,
        startDate: new Date(startDate).getTime(),
        endDate: endDate ? new Date(endDate).getTime() : null,
        isActive: true,
        description,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return NextResponse.json({ fixedCost: created[0] });
  } catch (error) {
    console.error('Error creating fixed cost:', error);
    return NextResponse.json({ error: 'Failed to create fixed cost' }, { status: 500 });
  }
}

// PUT update fixed cost
export async function PUT(request: NextRequest) {
  try {
    const { id, name, amount, category, frequency, endDate, isActive, description } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Fixed cost ID required' }, { status: 400 });
    }

    const updated = await db.update(schema.fixedCosts)
      .set({
        name: name || undefined,
        amount: amount ? parseFloat(amount) : undefined,
        category: category || undefined,
        frequency: frequency || undefined,
        endDate: endDate ? new Date(endDate).getTime() : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        description: description !== undefined ? description : undefined,
        updatedAt: new Date()
      })
      .where(eq(schema.fixedCosts.id, id))
      .returning();

    return NextResponse.json({ fixedCost: updated[0] });
  } catch (error) {
    console.error('Error updating fixed cost:', error);
    return NextResponse.json({ error: 'Failed to update fixed cost' }, { status: 500 });
  }
}

// DELETE fixed cost
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Fixed cost ID required' }, { status: 400 });
    }

    await db.delete(schema.fixedCosts)
      .where(eq(schema.fixedCosts.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting fixed cost:', error);
    return NextResponse.json({ error: 'Failed to delete fixed cost' }, { status: 500 });
  }
}