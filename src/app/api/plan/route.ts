import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { baliCostsService } from '@/services/bali-costs';

const CreatePlanSchema = z.object({
  lifestyleLevel: z.enum(['budget', 'comfort', 'premium']),
  duration: z.number().min(1).max(365),
  persons: z.number().min(1).max(10),
  pets: z.number().min(0).max(5).default(0),
  hasDog: z.boolean().default(false),
  customCategories: z.array(z.object({
    name: z.string(),
    amount: z.number(),
  })).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreatePlanSchema.parse(body);
    
    const plan = await baliCostsService.calculatePlan(validatedData);
    
    return NextResponse.json(plan);
  } catch (error) {
    console.error('Plan API error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid plan data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create financial plan' },
      { status: 500 }
    );
  }
}