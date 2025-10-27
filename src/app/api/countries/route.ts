import { NextResponse } from 'next/server';
import { CountryDataService } from '@/services/countryDataService';

/**
 * GET /api/countries
 * Returns list of all cached countries
 */
export async function GET() {
  try {
    const countries = await CountryDataService.getAvailableCountries();

    return NextResponse.json({
      success: true,
      countries,
      count: countries.length,
    });

  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch countries' },
      { status: 500 }
    );
  }
}
