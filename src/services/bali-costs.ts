import { db } from '../lib/db';
import { baliCosts } from '../lib/schema';
import { eq } from 'drizzle-orm';
import { currencyService } from './currency';
import ZAI from 'z-ai-web-dev-sdk';

interface BaliCost {
  id: string;
  category: string;
  subcategory: string;
  description: string;
  monthlyCostIDR: number;
  lifestyleLevel: 'budget' | 'comfort' | 'premium';
  lastUpdated: Date;
}

interface FinancialPlan {
  id: string;
  lifestyleLevel: string;
  duration: number;
  persons: number;
  pets: number;
  hasDog: boolean;
  totalCostIDR: number;
  totalCostEUR: number;
  exchangeRate: number;
  categories: Array<{
    category: string;
    subcategory: string;
    description: string;
    monthlyIDR: number;
    monthlyEUR: number;
    yearlyIDR: number;
    yearlyEUR: number;
    icon: string;
    color: string;
  }>;
  breakdown: {
    housing: { idr: number; eur: number; percentage: number; icon: string; color: string };
    food: { idr: number; eur: number; percentage: number; icon: string; color: string };
    transportation: { idr: number; eur: number; percentage: number; icon: string; color: string };
    utilities: { idr: number; eur: number; percentage: number; icon: string; color: string };
    healthcare: { idr: number; eur: number; percentage: number; icon: string; color: string };
    entertainment: { idr: number; eur: number; percentage: number; icon: string; color: string };
    visa: { idr: number; eur: number; percentage: number; icon: string; color: string };
    pets: { idr: number; eur: number; percentage: number; icon: string; color: string };
    other: { idr: number; eur: number; percentage: number; icon: string; color: string };
  };
  seasonalVariations: {
    rainySeason: number;
    drySeason: number;
    peakSeason: number;
    lowSeason: number;
  };
  petDetails: {
    food: { idr: number; eur: number };
    vet: { idr: number; eur: number };
    grooming: { idr: number; eur: number };
    insurance: { idr: number; eur: number };
    import: { idr: number; eur: number };
  };
}

export class BaliCostsService {
  async getAllCosts(): Promise<BaliCost[]> {
    try {
      return db.select().from(baliCosts).all();
    } catch (error) {
      console.error('Failed to fetch Bali costs:', error);
      return [];
    }
  }

  async getCostsByLifestyle(lifestyleLevel: string): Promise<BaliCost[]> {
    try {
      return db.select().from(baliCosts).where(eq(baliCosts.lifestyleLevel, lifestyleLevel)).all();
    } catch (error) {
      console.error('Failed to fetch costs by lifestyle:', error);
      return [];
    }
  }

  calculatePetCosts(pets: number, hasDog: boolean, exchangeRate: number): FinancialPlan['petDetails'] {
    const baseCosts = {
      food: pets * 300000, // 300k IDR per pet for food
      vet: pets * 150000,  // 150k IDR per pet for regular vet visits
      grooming: pets * 100000, // 100k IDR per pet for grooming
      insurance: pets * 200000, // 200k IDR per pet for insurance
    };

    // Additional costs for dogs
    if (hasDog) {
      baseCosts.food += 200000; // Dogs eat more
      baseCosts.vet += 100000;  // Dogs need more vet care
      baseCosts.grooming += 150000; // Dogs need regular grooming
    }

    // One-time import costs (amortized over 12 months)
    const importCosts = hasDog ? 5000000 : 3000000; // Higher for dogs due to stricter requirements

    return {
      food: { idr: baseCosts.food, eur: baseCosts.food / exchangeRate },
      vet: { idr: baseCosts.vet, eur: baseCosts.vet / exchangeRate },
      grooming: { idr: baseCosts.grooming, eur: baseCosts.grooming / exchangeRate },
      insurance: { idr: baseCosts.insurance, eur: baseCosts.insurance / exchangeRate },
      import: { idr: importCosts / 12, eur: (importCosts / 12) / exchangeRate },
    };
  }

  async calculatePlan(planData: {
    lifestyleLevel: string;
    duration: number;
    persons: number;
    pets: number;
    hasDog: boolean;
    customCategories?: Array<{ name: string; amount: number }>;
  }): Promise<FinancialPlan> {
    const { lifestyleLevel, duration, persons, pets, hasDog, customCategories } = planData;
    
    // Get current exchange rate
    const exchangeRate = await currencyService.getExchangeRate('EUR', 'IDR');
    
    // Get costs for lifestyle level
    const costs = await this.getCostsByLifestyle(lifestyleLevel);
    
    // Calculate totals
    let totalMonthlyIDR = 0;
    const categories: FinancialPlan['categories'] = [];
    
    // Add regular costs
    for (const cost of costs) {
      const monthlyIDR = cost.monthlyCostIDR * persons;
      const monthlyEUR = monthlyIDR / exchangeRate;
      const yearlyIDR = monthlyIDR * 12;
      const yearlyEUR = monthlyEUR * 12;
      
      totalMonthlyIDR += monthlyIDR;
      
      categories.push({
        category: cost.category,
        subcategory: cost.subcategory,
        description: cost.description,
        monthlyIDR,
        monthlyEUR,
        yearlyIDR,
        yearlyEUR,
        icon: this.getCategoryIcon(cost.category),
        color: this.getCategoryColor(cost.category),
      });
    }
    
    // Add pet costs if any
    let petCostsIDR = 0;
    let petCostsEUR = 0;
    const petDetails = this.calculatePetCosts(pets, hasDog, exchangeRate);
    
    if (pets > 0) {
      // Add pet food category
      const petFoodMonthly = petDetails.food.idr;
      const petFoodEUR = petDetails.food.eur;
      categories.push({
        category: 'Pet Food',
        subcategory: 'Pet Supplies',
        description: `Monthly food and supplies for ${pets} pet(s)`,
        monthlyIDR: petFoodMonthly,
        monthlyEUR: petFoodEUR,
        yearlyIDR: petFoodMonthly * 12,
        yearlyEUR: petFoodEUR * 12,
        icon: 'Utensils',
        color: 'bg-orange-500',
      });
      
      // Add pet healthcare category
      const petHealthMonthly = petDetails.vet.idr + petDetails.insurance.idr;
      const petHealthEUR = petDetails.vet.eur + petDetails.insurance.eur;
      categories.push({
        category: 'Pet Healthcare',
        subcategory: 'Veterinary Care',
        description: `Vet visits and insurance for ${pets} pet(s)`,
        monthlyIDR: petHealthMonthly,
        monthlyEUR: petHealthEUR,
        yearlyIDR: petHealthMonthly * 12,
        yearlyEUR: petHealthEUR * 12,
        icon: 'Heart',
        color: 'bg-red-500',
      });
      
      // Add pet services category
      const petServicesMonthly = petDetails.grooming.idr + petDetails.import.idr;
      const petServicesEUR = petDetails.grooming.eur + petDetails.import.eur;
      categories.push({
        category: 'Pet Services',
        subcategory: 'Grooming & Care',
        description: `Grooming and additional services for ${pets} pet(s)`,
        monthlyIDR: petServicesMonthly,
        monthlyEUR: petServicesEUR,
        yearlyIDR: petServicesMonthly * 12,
        yearlyEUR: petServicesEUR * 12,
        icon: 'Star',
        color: 'bg-purple-500',
      });
      
      petCostsIDR = petFoodMonthly + petHealthMonthly + petServicesMonthly;
      petCostsEUR = petFoodEUR + petHealthEUR + petServicesEUR;
      totalMonthlyIDR += petCostsIDR;
    }
    
    // Add custom categories
    if (customCategories) {
      for (const custom of customCategories) {
        const monthlyIDR = custom.amount;
        const monthlyEUR = monthlyIDR / exchangeRate;
        const yearlyIDR = monthlyIDR * 12;
        const yearlyEUR = monthlyEUR * 12;
        
        totalMonthlyIDR += monthlyIDR;
        
        categories.push({
          category: 'Custom',
          subcategory: custom.name,
          description: 'Custom expense',
          monthlyIDR,
          monthlyEUR,
          yearlyIDR,
          yearlyEUR,
          icon: 'DollarSign',
          color: 'bg-gray-500',
        });
      }
    }
    
    const totalMonthlyEUR = totalMonthlyIDR / exchangeRate;
    const totalCostIDR = totalMonthlyIDR * duration;
    const totalCostEUR = totalMonthlyEUR * duration;
    
    // Calculate breakdown
    const breakdown = this.calculateBreakdown(categories, totalMonthlyIDR, exchangeRate, pets, petCostsIDR, petCostsEUR);
    
    // Calculate seasonal variations
    const seasonalVariations = {
      rainySeason: totalCostEUR * 1.1,    // 10% more during rainy season
      drySeason: totalCostEUR,            // Base cost
      peakSeason: totalCostEUR * 1.3,     // 30% more during peak season
      lowSeason: totalCostEUR * 0.9,      // 10% less during low season
    };
    
    return {
      id: `plan-${Date.now()}`,
      lifestyleLevel,
      duration,
      persons,
      pets,
      hasDog,
      totalCostIDR,
      totalCostEUR,
      exchangeRate,
      categories,
      breakdown,
      seasonalVariations,
      petDetails,
    };
  }

  private getCategoryIcon(category: string): string {
    const iconMap: Record<string, string> = {
      'Housing': 'Home',
      'Food': 'Utensils',
      'Transportation': 'Car',
      'Utilities': 'Zap',
      'Healthcare': 'Heart',
      'Entertainment': 'Gamepad2',
      'Visa': 'FileText',
      'Pet Food': 'Utensils',
      'Pet Healthcare': 'Heart',
      'Pet Services': 'Star',
    };
    return iconMap[category] || 'DollarSign';
  }

  private getCategoryColor(category: string): string {
    const colorMap: Record<string, string> = {
      'Housing': 'bg-blue-500',
      'Food': 'bg-green-500',
      'Transportation': 'bg-yellow-500',
      'Utilities': 'bg-purple-500',
      'Healthcare': 'bg-red-500',
      'Entertainment': 'bg-pink-500',
      'Visa': 'bg-indigo-500',
      'Pet Food': 'bg-orange-500',
      'Pet Healthcare': 'bg-red-500',
      'Pet Services': 'bg-purple-500',
    };
    return colorMap[category] || 'bg-gray-500';
  }

  private calculateBreakdown(
    categories: FinancialPlan['categories'],
    totalMonthlyIDR: number,
    exchangeRate: number,
    pets: number,
    petCostsIDR: number,
    petCostsEUR: number
  ): FinancialPlan['breakdown'] {
    const breakdown: FinancialPlan['breakdown'] = {
      housing: { idr: 0, eur: 0, percentage: 0, icon: 'Home', color: 'bg-blue-500' },
      food: { idr: 0, eur: 0, percentage: 0, icon: 'Utensils', color: 'bg-green-500' },
      transportation: { idr: 0, eur: 0, percentage: 0, icon: 'Car', color: 'bg-yellow-500' },
      utilities: { idr: 0, eur: 0, percentage: 0, icon: 'Zap', color: 'bg-purple-500' },
      healthcare: { idr: 0, eur: 0, percentage: 0, icon: 'Heart', color: 'bg-red-500' },
      entertainment: { idr: 0, eur: 0, percentage: 0, icon: 'Gamepad2', color: 'bg-pink-500' },
      visa: { idr: 0, eur: 0, percentage: 0, icon: 'FileText', color: 'bg-indigo-500' },
      pets: { idr: petCostsIDR, eur: petCostsEUR, percentage: 0, icon: 'Dog', color: 'bg-orange-500' },
      other: { idr: 0, eur: 0, percentage: 0, icon: 'DollarSign', color: 'bg-gray-500' },
    };
    
    for (const category of categories) {
      const key = category.category.toLowerCase().replace(' ', '') as keyof typeof breakdown;
      if (key in breakdown) {
        breakdown[key].idr += category.monthlyIDR;
        breakdown[key].eur += category.monthlyEUR;
      } else {
        breakdown.other.idr += category.monthlyIDR;
        breakdown.other.eur += category.monthlyEUR;
      }
    }
    
    // Calculate percentages
    for (const key in breakdown) {
      const category = breakdown[key as keyof typeof breakdown];
      category.percentage = (category.idr / totalMonthlyIDR) * 100;
    }
    
    return breakdown;
  }

  async updateCostsFromWeb(): Promise<void> {
    try {
      const zai = await ZAI.create();
      
      // Search for current Bali living costs including pet costs
      const searchResult = await zai.functions.invoke("web_search", {
        query: "Bali cost of living 2025 pet care veterinary dog cat monthly expenses",
        num: 10
      });
      
      // Process and update costs based on search results
      console.log('📊 Updating costs from web data...');
      // Implementation for parsing search results and updating costs
      
    } catch (error) {
      console.error('Failed to update costs from web:', error);
    }
  }
}

export const baliCostsService = new BaliCostsService();