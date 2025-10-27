import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// Location-based cost data for different areas in Bali
const locationCosts = {
  'ubud': {
    name: 'Ubud',
    baseMultiplier: 1.0,
    description: 'Kulturelles Zentrum, ruhiger',
    categories: {
      housing: 0.9,
      food: 0.8,
      transportation: 1.1,
      utilities: 0.9,
      healthcare: 0.8,
      entertainment: 0.7
    }
  },
  'canggu': {
    name: 'Canggu',
    baseMultiplier: 1.3,
    description: 'Digital Nomad Hotspot, trendig',
    categories: {
      housing: 1.4,
      food: 1.3,
      transportation: 1.2,
      utilities: 1.1,
      healthcare: 1.2,
      entertainment: 1.5
    }
  },
  'seminyak': {
    name: 'Seminyak',
    baseMultiplier: 1.5,
    description: 'Luxuriöses Gebiet, High-End',
    categories: {
      housing: 1.8,
      food: 1.6,
      transportation: 1.3,
      utilities: 1.2,
      healthcare: 1.4,
      entertainment: 1.7
    }
  },
  'kuta': {
    name: 'Kuta',
    baseMultiplier: 0.9,
    description: 'Touristenbereich, lebhaft',
    categories: {
      housing: 0.8,
      food: 0.9,
      transportation: 0.8,
      utilities: 0.8,
      healthcare: 0.9,
      entertainment: 1.0
    }
  },
  'sanur': {
    name: 'Sanur',
    baseMultiplier: 0.85,
    description: 'Familienfreundlich, ruhiger',
    categories: {
      housing: 0.8,
      food: 0.8,
      transportation: 0.9,
      utilities: 0.8,
      healthcare: 0.8,
      entertainment: 0.7
    }
  },
  'nunggulan': {
    name: 'Nunggulan',
    baseMultiplier: 0.7,
    description: 'Ländlich, traditionell',
    categories: {
      housing: 0.6,
      food: 0.7,
      transportation: 1.2,
      utilities: 0.7,
      healthcare: 0.6,
      entertainment: 0.5
    }
  },
  'pererenan': {
    name: 'Pererenan',
    baseMultiplier: 1.2,
    description: 'Aufstrebendes Gebiet',
    categories: {
      housing: 1.3,
      food: 1.2,
      transportation: 1.1,
      utilities: 1.0,
      healthcare: 1.1,
      entertainment: 1.3
    }
  }
};

// GET location costs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (location && locationCosts[location.toLowerCase()]) {
      return NextResponse.json({ 
        location: locationCosts[location.toLowerCase()],
        detected: false
      });
    }

    if (lat && lng) {
      // Try to detect location based on coordinates
      const detectedLocation = await detectLocationFromCoordinates(parseFloat(lat), parseFloat(lng));
      if (detectedLocation) {
        return NextResponse.json({ 
          location: detectedLocation,
          detected: true
        });
      }
    }

    // Return default (Ubud) if no specific location found
    return NextResponse.json({ 
      location: locationCosts['ubud'],
      detected: false
    });
  } catch (error) {
    console.error('Error fetching location costs:', error);
    return NextResponse.json({ error: 'Failed to fetch location costs' }, { status: 500 });
  }
}

// POST detect location from browser geolocation
export async function POST(request: NextRequest) {
  try {
    const { latitude, longitude } = await request.json();

    if (!latitude || !longitude) {
      return NextResponse.json({ error: 'Latitude and longitude required' }, { status: 400 });
    }

    const detectedLocation = await detectLocationFromCoordinates(latitude, longitude);
    
    if (!detectedLocation) {
      return NextResponse.json({ error: 'Could not detect location' }, { status: 404 });
    }

    return NextResponse.json({ 
      location: detectedLocation,
      detected: true,
      coordinates: { latitude, longitude }
    });
  } catch (error) {
    console.error('Error detecting location:', error);
    return NextResponse.json({ error: 'Failed to detect location' }, { status: 500 });
  }
}

async function detectLocationFromCoordinates(lat: number, lng: number) {
  try {
    const zai = await ZAI.create();
    
    // Use web search to determine location based on coordinates
    const searchResult = await zai.functions.invoke("web_search", {
      query: `Bali Indonesia coordinates ${lat} ${lng} location area district`,
      num: 5
    });

    if (searchResult && searchResult.length > 0) {
      // Analyze search results to find matching location
      const locationText = searchResult[0].name + ' ' + searchResult[0].snippet;
      
      for (const [key, locationData] of Object.entries(locationCosts)) {
        if (locationText.toLowerCase().includes(key.toLowerCase())) {
          return locationData;
        }
      }
    }

    // Fallback: determine location based on coordinate ranges
    if (lat > -8.7 && lat < -8.5 && lng > 115.2 && lng < 115.3) {
      return locationCosts['ubud'];
    } else if (lat > -8.68 && lat < -8.62 && lng > 115.12 && lng < 115.15) {
      return locationCosts['canggu'];
    } else if (lat > -8.68 && lat < -8.65 && lng > 115.15 && lng < 115.18) {
      return locationCosts['seminyak'];
    } else if (lat > -8.72 && lat < -8.67 && lng > 115.16 && lng < 115.19) {
      return locationCosts['kuta'];
    } else if (lat > -8.68 && lat < -8.65 && lng > 115.25 && lng < 115.28) {
      return locationCosts['sanur'];
    }

    // Default fallback
    return locationCosts['ubud'];
  } catch (error) {
    console.error('Error in location detection:', error);
    return locationCosts['ubud'];
  }
}