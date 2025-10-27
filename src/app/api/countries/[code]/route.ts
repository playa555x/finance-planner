import { NextResponse } from 'next/server';
import { CountryDataService } from '@/services/countryDataService';

/**
 * GET /api/countries/[code]
 * Returns data for a specific country (auto-fetches if not cached)
 *
 * Example: /api/countries/US
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const countryCode = code.toUpperCase();

    if (!/^[A-Z]{2}$/.test(countryCode)) {
      return NextResponse.json(
        { success: false, error: 'Invalid country code format. Use ISO 3166-1 alpha-2 (e.g., US, DE, ID)' },
        { status: 400 }
      );
    }

    // This will auto-fetch if not in cache
    const countryData = await CountryDataService.getCountryData(countryCode);

    if (!countryData) {
      return NextResponse.json(
        { success: false, error: `Country data not found for ${countryCode}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      country: countryData,
    });

  } catch (error) {
    const { code } = await params;
    console.error(`Error fetching country ${code}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch country data' },
      { status: 500 }
    );
  }
}
