import { NextRequest, NextResponse } from 'next/server';

// Base costs per lifestyle level (monthly in EUR)
const baseCosts = {
  budget: {
    housing: 400,
    food: 250,
    transportation: 80,
    utilities: 50,
    healthcare: 40,
    entertainment: 60,
  },
  comfort: {
    housing: 700,
    food: 400,
    transportation: 150,
    utilities: 80,
    healthcare: 80,
    entertainment: 120,
  },
  premium: {
    housing: 1200,
    food: 600,
    transportation: 250,
    utilities: 120,
    healthcare: 150,
    entertainment: 200,
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lifestyleLevel = 'comfort', duration = 30, persons = 1, locationMultiplier = 1 } = body;

    // Get base costs for lifestyle
    const costs = baseCosts[lifestyleLevel as keyof typeof baseCosts] || baseCosts.comfort;

    // Apply location multiplier and persons
    const adjustedCosts = Object.entries(costs).map(([category, amount]) => ({
      category,
      subcategory: category,
      description: category,
      monthlyEUR: amount * persons * locationMultiplier,
      monthlyIDR: amount * persons * locationMultiplier * 16000,
      yearlyEUR: amount * persons * locationMultiplier * 12,
      yearlyIDR: amount * persons * locationMultiplier * 16000 * 12,
    }));

    const totalMonthlyEUR = adjustedCosts.reduce((sum, cat) => sum + cat.monthlyEUR, 0);
    const totalCostEUR = (totalMonthlyEUR / 30) * duration;

    const plan = {
      id: Date.now().toString(),
      lifestyleLevel,
      duration,
      persons,
      totalCostEUR,
      totalCostIDR: totalCostEUR * 16000,
      exchangeRate: 16000,
      categories: adjustedCosts,
    };

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Plan API error:', error);
    return NextResponse.json(
      { error: 'Failed to create financial plan', details: String(error) },
      { status: 500 }
    );
  }
}