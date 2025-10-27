import { NextRequest, NextResponse } from 'next/server';
import { baliCostsService } from '@/services/bali-costs';

export async function GET() {
  try {
    const costs = await baliCostsService.getAllCosts();
    return NextResponse.json(costs);
  } catch (error) {
    console.error('Bali costs API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Bali costs' },
      { status: 500 }
    );
  }
}