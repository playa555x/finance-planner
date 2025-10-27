import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const financialPlans = sqliteTable('financial_plans', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  monthlyBudget: real('monthly_budget').notNull(),
  location: text('location').notNull(),
  currency: text('currency').notNull().default('IDR'),
  exchangeRate: real('exchange_rate').notNull().default(0.000059),
  season: text('season').notNull().default('normal'),
  lifestyle: text('lifestyle').notNull().default('bali-standard'),
  duration: integer('duration').notNull().default(1),
  hasDog: integer('has_dog', { mode: 'boolean' }).notNull().default(false),
  petCount: integer('pet_count').notNull().default(0),
  petCosts: real('pet_costs').notNull().default(0),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const dailyBudgets = sqliteTable('daily_budgets', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: integer('date').notNull(),
  budgetAmount: real('budget_amount').notNull(),
  spentAmount: real('spent_amount').notNull().default(0),
  remainingAmount: real('remaining_amount').notNull(),
  notes: text('notes'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const expenses = sqliteTable('expenses', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  dailyBudgetId: text('daily_budget_id').references(() => dailyBudgets.id, { onDelete: 'set null' }),
  amount: real('amount').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  location: text('location'),
  date: integer('date').notNull(),
  isFixedCost: integer('is_fixed_cost', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const fixedCosts = sqliteTable('fixed_costs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  amount: real('amount').notNull(),
  category: text('category').notNull(),
  frequency: text('frequency').notNull(),
  startDate: integer('start_date').notNull(),
  endDate: integer('end_date'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  description: text('description'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const baliCosts = sqliteTable('bali_costs', {
  id: text('id').primaryKey(),
  category: text('category').notNull(),
  subcategory: text('subcategory').notNull(),
  description: text('description').notNull(),
  monthlyCostIDR: integer('monthly_cost_idr').notNull(),
  lifestyleLevel: text('lifestyle_level').notNull(),
  lastUpdated: integer('last_updated').notNull(),
});

export const exchangeRates = sqliteTable('exchange_rates', {
  id: text('id').primaryKey(),
  fromCurrency: text('from_currency').notNull(),
  toCurrency: text('to_currency').notNull(),
  rate: real('rate').notNull(),
  timestamp: integer('timestamp').notNull(),
});