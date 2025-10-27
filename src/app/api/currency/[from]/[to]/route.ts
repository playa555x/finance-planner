import { NextRequest, NextResponse } from 'next/server';
import { currencyService } from '@/services/currency';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ from: string; to: string }> }
) {
  try {
    const { from, to } = await params;
    const rate = await currencyService.getExchangeRate(from.toUpperCase(), to.toUpperCase());
    
    return NextResponse.json({
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      rate,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Currency API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exchange rate' },
      { status: 500 }
    );
  }
}