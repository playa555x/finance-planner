import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET daily budgets for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    let budgets;
    if (date) {
      // Get specific date budget
      const targetDate = new Date(date).getTime();
      budgets = db.prepare(`
        SELECT * FROM daily_budgets 
        WHERE user_id = ? AND date = ?
        ORDER BY date DESC
      `).all(userId, targetDate);
    } else {
      // Get all budgets for user
      budgets = db.prepare(`
        SELECT * FROM daily_budgets 
        WHERE user_id = ? 
        ORDER BY date DESC
      `).all(userId);
    }

    return NextResponse.json({ budgets });
  } catch (error) {
    console.error('Error fetching daily budgets:', error);
    return NextResponse.json({ error: 'Failed to fetch daily budgets' }, { status: 500 });
  }
}

// POST create or update daily budget
export async function POST(request: NextRequest) {
  try {
    const { userId, date, budgetAmount, notes } = await request.json();

    if (!userId || !date || !budgetAmount) {
      return NextResponse.json({ error: 'User ID, date, and budget amount required' }, { status: 400 });
    }

    const targetDate = new Date(date).getTime();
    const remainingAmount = budgetAmount;
    const now = Date.now();

    // Check if budget already exists for this date
    const existingBudget = db.prepare(`
      SELECT * FROM daily_budgets 
      WHERE user_id = ? AND date = ?
    `).get(userId, targetDate);

    let budget;
    if (existingBudget) {
      // Update existing budget
      db.prepare(`
        UPDATE daily_budgets 
        SET budget_amount = ?, remaining_amount = ?, notes = ?, updated_at = ?
        WHERE id = ?
      `).run(budgetAmount, budgetAmount - existingBudget.spent_amount, notes, now, existingBudget.id);
      
      budget = db.prepare(`
        SELECT * FROM daily_budgets WHERE id = ?
      `).get(existingBudget.id);
    } else {
      // Create new budget
      const id = crypto.randomUUID();
      db.prepare(`
        INSERT INTO daily_budgets 
        (id, user_id, date, budget_amount, spent_amount, remaining_amount, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, userId, targetDate, budgetAmount, 0, remainingAmount, notes, now, now);
      
      budget = db.prepare(`
        SELECT * FROM daily_budgets WHERE id = ?
      `).get(id);
    }

    return NextResponse.json({ budget });
  } catch (error) {
    console.error('Error creating/updating daily budget:', error);
    return NextResponse.json({ error: 'Failed to create/update daily budget' }, { status: 500 });
  }
}

// PUT update daily budget
export async function PUT(request: NextRequest) {
  try {
    const { id, budgetAmount, notes } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Budget ID required' }, { status: 400 });
    }

    const existingBudget = db.prepare(`
      SELECT * FROM daily_budgets WHERE id = ?
    `).get(id);

    if (!existingBudget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    const newBudgetAmount = budgetAmount || existingBudget.budget_amount;
    const newRemainingAmount = newBudgetAmount - existingBudget.spent_amount;
    const now = Date.now();

    db.prepare(`
      UPDATE daily_budgets 
      SET budget_amount = ?, remaining_amount = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `).run(newBudgetAmount, newRemainingAmount, notes !== undefined ? notes : existingBudget.notes, now, id);

    const updated = db.prepare(`
      SELECT * FROM daily_budgets WHERE id = ?
    `).get(id);

    return NextResponse.json({ budget: updated });
  } catch (error) {
    console.error('Error updating daily budget:', error);
    return NextResponse.json({ error: 'Failed to update daily budget' }, { status: 500 });
  }
}