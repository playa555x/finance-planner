import { NextResponse } from 'next/server';
import { CountryDataService } from '@/services/countryDataService';

/**
 * GET /api/cities/[country]/[city]
 * Returns data for a specific city (auto-fetches if not cached)
 *
 * Example: /api/cities/US/New%20York
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ country: string; city: string }> }
) {
  try {
    const { country, city } = await params;
    const countryCode = country.toUpperCase();
    const cityName = decodeURIComponent(city);

    if (!/^[A-Z]{2}$/.test(countryCode)) {
      return NextResponse.json(
        { success: false, error: 'Invalid country code format' },
        { status: 400 }
      );
    }

    // This will auto-fetch if not in cache
    const cityData = await CountryDataService.getCityData(cityName, countryCode);

    if (!cityData) {
      return NextResponse.json(
        { success: false, error: `City data not found for ${cityName}, ${countryCode}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      city: cityData,
    });

  } catch (error) {
    const { country, city } = await params;
    console.error(`Error fetching city ${city}, ${country}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch city data' },
      { status: 500 }
    );
  }
}
