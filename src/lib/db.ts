import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

// SQLite database setup
const sqlite = new Database('./dev.db');
export const db = drizzle(sqlite);

// Initialize database with default data
export async function initDb() {
  try {
    console.log('🔧 Initializing database...');
    
    // Create tables using raw SQL
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
    
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS financial_plans (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        monthly_budget REAL NOT NULL,
        location TEXT NOT NULL,
        currency TEXT NOT NULL DEFAULT 'IDR',
        exchange_rate REAL NOT NULL DEFAULT 0.000059,
        season TEXT NOT NULL DEFAULT 'normal',
        lifestyle TEXT NOT NULL DEFAULT 'bali-standard',
        duration INTEGER NOT NULL DEFAULT 1,
        has_dog INTEGER NOT NULL DEFAULT 0,
        pet_count INTEGER NOT NULL DEFAULT 0,
        pet_costs REAL NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS daily_budgets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date INTEGER NOT NULL,
        budget_amount REAL NOT NULL,
        spent_amount REAL NOT NULL DEFAULT 0,
        remaining_amount REAL NOT NULL,
        notes TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        daily_budget_id TEXT,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        location TEXT,
        date INTEGER NOT NULL,
        is_fixed_cost INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (daily_budget_id) REFERENCES daily_budgets(id) ON DELETE SET NULL
      )
    `);
    
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS fixed_costs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        frequency TEXT NOT NULL,
        start_date INTEGER NOT NULL,
        end_date INTEGER,
        is_active INTEGER NOT NULL DEFAULT 1,
        description TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS bali_costs (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        subcategory TEXT NOT NULL,
        description TEXT NOT NULL,
        monthly_cost_idr INTEGER NOT NULL,
        lifestyle_level TEXT NOT NULL,
        last_updated INTEGER NOT NULL
      )
    `);
    
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS exchange_rates (
        id TEXT PRIMARY KEY,
        from_currency TEXT NOT NULL,
        to_currency TEXT NOT NULL,
        rate REAL NOT NULL,
        timestamp INTEGER NOT NULL
      )
    `);
    
    console.log('✅ Database tables created successfully');
    
    // Check if we need to insert default Bali costs
    const existingCosts = sqlite.prepare('SELECT COUNT(*) as count FROM bali_costs').get() as { count: number };
    
    if (existingCosts.count === 0) {
      console.log('📊 Inserting default Bali costs...');
      
      const insertCost = sqlite.prepare(`
        INSERT INTO bali_costs (id, category, subcategory, description, monthly_cost_idr, lifestyle_level, last_updated)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const defaultCosts = [
        // HOUSING
        ['housing-budget-1', 'Housing', 'Apartment/Villa', 'Monthly rent for 1-2 bedroom', 3500000, 'budget', Date.now()],
        ['housing-comfort-1', 'Housing', 'Apartment/Villa', 'Monthly rent for 1-2 bedroom', 8000000, 'comfort', Date.now()],
        ['housing-premium-1', 'Housing', 'Apartment/Villa', 'Monthly rent for 2-3 bedroom with pool', 20000000, 'premium', Date.now()],
        
        // FOOD
        ['food-groceries-budget', 'Food', 'Groceries', 'Monthly groceries for 1 person', 1500000, 'budget', Date.now()],
        ['food-groceries-comfort', 'Food', 'Groceries', 'Monthly groceries for 1 person', 3000000, 'comfort', Date.now()],
        ['food-groceries-premium', 'Food', 'Groceries', 'Monthly groceries with imported items', 6000000, 'premium', Date.now()],
        ['food-restaurants-budget', 'Food', 'Restaurants', 'Eating out per month', 800000, 'budget', Date.now()],
        ['food-restaurants-comfort', 'Food', 'Restaurants', 'Mixed local and western restaurants', 2000000, 'comfort', Date.now()],
        ['food-restaurants-premium', 'Food', 'Restaurants', 'Fine dining and cafes', 5000000, 'premium', Date.now()],
        
        // TRANSPORTATION
        ['transport-scooter-budget', 'Transportation', 'Scooter Rental', 'Monthly scooter rental', 500000, 'budget', Date.now()],
        ['transport-scooter-comfort', 'Transportation', 'Scooter Rental', 'Monthly scooter rental + fuel', 800000, 'comfort', Date.now()],
        ['transport-car-premium', 'Transportation', 'Car Rental', 'Monthly car rental + driver', 5000000, 'premium', Date.now()],
        
        // UTILITIES
        ['utilities-budget', 'Utilities', 'Electricity & Water', 'Monthly utilities', 800000, 'budget', Date.now()],
        ['utilities-comfort', 'Utilities', 'Electricity & Water', 'Monthly utilities with AC', 1500000, 'comfort', Date.now()],
        ['utilities-premium', 'Utilities', 'Electricity & Water', 'High usage with pool pump', 3000000, 'premium', Date.now()],
        ['internet-budget', 'Utilities', 'Internet', 'High-speed internet', 500000, 'budget', Date.now()],
        ['internet-comfort', 'Utilities', 'Internet', 'High-speed internet', 800000, 'comfort', Date.now()],
        ['internet-premium', 'Utilities', 'Internet', 'Fiber optic + backup', 1500000, 'premium', Date.now()],
        
        // HEALTHCARE
        ['healthcare-budget', 'Healthcare', 'Insurance', 'International health insurance', 1500000, 'budget', Date.now()],
        ['healthcare-comfort', 'Healthcare', 'Insurance', 'Comprehensive international insurance', 3000000, 'comfort', Date.now()],
        ['healthcare-premium', 'Healthcare', 'Insurance', 'Premium international coverage', 6000000, 'premium', Date.now()],
        
        // ENTERTAINMENT
        ['entertainment-budget', 'Entertainment', 'Activities', 'Monthly entertainment budget', 1000000, 'budget', Date.now()],
        ['entertainment-comfort', 'Entertainment', 'Activities', 'Gym, yoga, activities', 2000000, 'comfort', Date.now()],
        ['entertainment-premium', 'Entertainment', 'Activities', 'Club memberships, surfing, diving', 5000000, 'premium', Date.now()],
        
        // VISA
        ['visa-budget', 'Visa', 'Visa Extension', 'Monthly visa costs average', 1000000, 'budget', Date.now()],
        ['visa-comfort', 'Visa', 'Visa Extension', 'Business visa + agent fees', 2000000, 'comfort', Date.now()],
        ['visa-premium', 'Visa', 'Visa Extension', 'KITAS + sponsorship', 4000000, 'premium', Date.now()],
      ];
      
      const transaction = sqlite.transaction(() => {
        for (const cost of defaultCosts) {
          insertCost.run(cost);
        }
      });
      
      transaction();
      
      console.log('✅ Default Bali costs inserted successfully');
    }
    
    console.log('🎉 Database initialization completed!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}