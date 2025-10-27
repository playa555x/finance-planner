import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET expenses for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const dailyBudgetId = searchParams.get('dailyBudgetId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    let expenses;
    if (dailyBudgetId) {
      expenses = db.prepare(`
        SELECT * FROM expenses 
        WHERE user_id = ? AND daily_budget_id = ?
        ORDER BY date DESC
        LIMIT ?
      `).all(userId, dailyBudgetId, limit);
    } else {
      expenses = db.prepare(`
        SELECT * FROM expenses 
        WHERE user_id = ?
        ORDER BY date DESC
        LIMIT ?
      `).all(userId, limit);
    }

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

// POST create new expense
export async function POST(request: NextRequest) {
  try {
    const { userId, dailyBudgetId, amount, category, description, location, date, isFixedCost } = await request.json();

    if (!userId || !amount || !category || !description) {
      return NextResponse.json({ error: 'User ID, amount, category, and description required' }, { status: 400 });
    }

    const expenseDate = date ? new Date(date).getTime() : Date.now();
    const now = Date.now();

    // Create expense
    const id = crypto.randomUUID();
    db.prepare(`
      INSERT INTO expenses 
      (id, user_id, daily_budget_id, amount, category, description, location, date, is_fixed_cost, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, dailyBudgetId, parseFloat(amount), category, description, location, expenseDate, Boolean(isFixedCost), now, now);

    const expense = db.prepare(`
      SELECT * FROM expenses WHERE id = ?
    `).get(id);

    // Update daily budget if linked
    if (dailyBudgetId) {
      const dailyBudget = db.prepare(`
        SELECT * FROM daily_budgets WHERE id = ?
      `).get(dailyBudgetId);

      if (dailyBudget) {
        const newSpentAmount = dailyBudget.spent_amount + parseFloat(amount);
        db.prepare(`
          UPDATE daily_budgets 
          SET spent_amount = ?, remaining_amount = ?, updated_at = ?
          WHERE id = ?
        `).run(newSpentAmount, dailyBudget.budget_amount - newSpentAmount, now, dailyBudgetId);
      }
    }

    return NextResponse.json({ expense });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}

// PUT update expense
export async function PUT(request: NextRequest) {
  try {
    const { id, amount, category, description, location } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Expense ID required' }, { status: 400 });
    }

    const existingExpense = db.prepare(`
      SELECT * FROM expenses WHERE id = ?
    `).get(id);

    if (!existingExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    const now = Date.now();
    db.prepare(`
      UPDATE expenses 
      SET amount = ?, category = ?, description = ?, location = ?, updated_at = ?
      WHERE id = ?
    `).run(amount || existingExpense.amount, category || existingExpense.category, description || existingExpense.description, location !== undefined ? location : existingExpense.location, now, id);

    const updated = db.prepare(`
      SELECT * FROM expenses WHERE id = ?
    `).get(id);

    return NextResponse.json({ expense: updated });
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
  }
}

// DELETE expense
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Expense ID required' }, { status: 400 });
    }

    const existingExpense = db.prepare(`
      SELECT * FROM expenses WHERE id = ?
    `).get(id);

    if (!existingExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Update daily budget if linked
    if (existingExpense.daily_budget_id) {
      const dailyBudget = db.prepare(`
        SELECT * FROM daily_budgets WHERE id = ?
      `).get(existingExpense.daily_budget_id);

      if (dailyBudget) {
        const newSpentAmount = dailyBudget.spent_amount - existingExpense.amount;
        const now = Date.now();
        db.prepare(`
          UPDATE daily_budgets 
          SET spent_amount = ?, remaining_amount = ?, updated_at = ?
          WHERE id = ?
        `).run(newSpentAmount, dailyBudget.budget_amount - newSpentAmount, now, existingExpense.daily_budget_id);
      }
    }

    db.prepare(`
      DELETE FROM expenses WHERE id = ?
    `).run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}