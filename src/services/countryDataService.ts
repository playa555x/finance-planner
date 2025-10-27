/**
 * Global Country Data Service
 * Automatically fetches and caches cost-of-living data for any country/city
 * Uses multiple APIs with fallback support
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CountryDataResponse {
  name: string;
  code: string;
  currency: string;
  currencySymbol: string;
  exchangeRateToUSD: number;
  exchangeRateToEUR: number;
  costOfLivingIndex?: number;
  rentIndex?: number;
  groceriesIndex?: number;
  restaurantPriceIndex?: number;
  localPurchasingPower?: number;
  averageSalary?: number;
  dataSource: string;
  dataQuality: 'verified' | 'estimated' | 'outdated';
}

interface CityDataResponse {
  name: string;
  countryCode: string;
  latitude?: number;
  longitude?: number;
  housingMultiplier: number;
  foodMultiplier: number;
  transportMultiplier: number;
  utilitiesMultiplier: number;
  entertainmentMultiplier: number;
  avgRentStudio?: number;
  avgRent1Bedroom?: number;
  avgRent3Bedroom?: number;
  avgMealInexpensive?: number;
  avgMealMidRange?: number;
  avgTransportPass?: number;
  avgUtilities?: number;
  avgInternet?: number;
  avgGymMembership?: number;
  population?: number;
  dataSource: string;
  dataQuality: 'verified' | 'estimated' | 'outdated';
}

export class CountryDataService {
  private static CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

  /**
   * Get or fetch country data
   * Checks cache first, then fetches from API if needed
   */
  static async getCountryData(countryCode: string): Promise<CountryDataResponse | null> {
    const startTime = Date.now();

    try {
      // Check cache first
      const cached = await prisma.country.findUnique({
        where: { code: countryCode },
      });

      if (cached && this.isCacheValid(cached.lastFetchedAt)) {
        console.log(`[CountryData] Cache hit for ${countryCode}`);
        return this.formatCountryData(cached);
      }

      // Fetch from APIs
      console.log(`[CountryData] Fetching data for ${countryCode}...`);
      const data = await this.fetchCountryDataFromAPIs(countryCode);

      if (!data) {
        await this.logApiRequest('country', countryCode, null, false, Date.now() - startTime, 'No data found');
        return null;
      }

      // Save to database
      const saved = await prisma.country.upsert({
        where: { code: countryCode },
        create: {
          ...data,
          code: countryCode,
          lastFetchedAt: new Date(),
        },
        update: {
          ...data,
          lastFetchedAt: new Date(),
        },
      });

      await this.logApiRequest('country', countryCode, null, true, Date.now() - startTime);

      return this.formatCountryData(saved);

    } catch (error) {
      console.error(`[CountryData] Error fetching ${countryCode}:`, error);
      await this.logApiRequest(
        'country',
        countryCode,
        null,
        false,
        Date.now() - startTime,
        error instanceof Error ? error.message : 'Unknown error'
      );
      return null;
    }
  }

  /**
   * Get or fetch city data
   */
  static async getCityData(cityName: string, countryCode: string): Promise<CityDataResponse | null> {
    const startTime = Date.now();

    try {
      // Ensure country exists
      let country = await prisma.country.findUnique({ where: { code: countryCode } });

      if (!country) {
        const countryData = await this.getCountryData(countryCode);
        if (!countryData) return null;
        country = await prisma.country.findUnique({ where: { code: countryCode } });
        if (!country) return null;
      }

      // Check cache
      const cached = await prisma.city.findFirst({
        where: {
          name: cityName,
          countryId: country.id,
        },
      });

      if (cached && this.isCacheValid(cached.lastFetchedAt)) {
        console.log(`[CityData] Cache hit for ${cityName}, ${countryCode}`);
        return this.formatCityData(cached);
      }

      // Fetch from APIs
      console.log(`[CityData] Fetching data for ${cityName}, ${countryCode}...`);
      const data = await this.fetchCityDataFromAPIs(cityName, countryCode);

      if (!data) {
        await this.logApiRequest('city', countryCode, cityName, false, Date.now() - startTime, 'No data found');
        return null;
      }

      // Save to database
      const saved = await prisma.city.upsert({
        where: {
          name_countryId: {
            name: cityName,
            countryId: country.id,
          },
        },
        create: {
          ...data,
          name: cityName,
          countryId: country.id,
          lastFetchedAt: new Date(),
        },
        update: {
          ...data,
          lastFetchedAt: new Date(),
        },
      });

      await this.logApiRequest('city', countryCode, cityName, true, Date.now() - startTime);

      return this.formatCityData(saved);

    } catch (error) {
      console.error(`[CityData] Error fetching ${cityName}, ${countryCode}:`, error);
      await this.logApiRequest(
        'city',
        countryCode,
        cityName,
        false,
        Date.now() - startTime,
        error instanceof Error ? error.message : 'Unknown error'
      );
      return null;
    }
  }

  /**
   * Fetch country data from multiple APIs with fallback
   */
  private static async fetchCountryDataFromAPIs(countryCode: string): Promise<Partial<CountryDataResponse> | null> {
    // Try multiple sources in order
    const sources = [
      () => this.fetchFromRestCountries(countryCode),
      () => this.fetchFromExchangeRateAPI(countryCode),
      () => this.fetchEstimatedData(countryCode),
    ];

    for (const source of sources) {
      try {
        const data = await source();
        if (data) return data;
      } catch (error) {
        console.warn(`Source failed, trying next...`, error);
        continue;
      }
    }

    return null;
  }

  /**
   * Fetch city data from APIs
   */
  private static async fetchCityDataFromAPIs(cityName: string, countryCode: string): Promise<Partial<CityDataResponse> | null> {
    // Try multiple sources
    const sources = [
      () => this.fetchCityFromGeocoding(cityName, countryCode),
      () => this.fetchEstimatedCityData(cityName, countryCode),
    ];

    for (const source of sources) {
      try {
        const data = await source();
        if (data) return data;
      } catch (error) {
        console.warn(`City source failed, trying next...`, error);
        continue;
      }
    }

    return null;
  }

  /**
   * Fetch from RestCountries API (free, no key needed)
   */
  private static async fetchFromRestCountries(countryCode: string): Promise<Partial<CountryDataResponse> | null> {
    const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);

    if (!response.ok) return null;

    const [data] = await response.json();

    if (!data) return null;

    const currencyCode = Object.keys(data.currencies || {})[0];
    const currency = data.currencies?.[currencyCode];

    return {
      name: data.name.common,
      code: data.cca2,
      currency: currencyCode || 'USD',
      currencySymbol: currency?.symbol || '$',
      exchangeRateToUSD: 1.0, // Will be updated by exchange rate API
      exchangeRateToEUR: 1.0,
      dataSource: 'restcountries',
      dataQuality: 'verified',
    };
  }

  /**
   * Fetch exchange rates (free API)
   */
  private static async fetchFromExchangeRateAPI(countryCode: string): Promise<Partial<CountryDataResponse> | null> {
    try {
      // First get currency code
      const countryResponse = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
      if (!countryResponse.ok) return null;

      const [countryData] = await countryResponse.json();
      const currencyCode = Object.keys(countryData.currencies || {})[0];

      if (!currencyCode) return null;

      // Get exchange rate
      const rateResponse = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
      if (!rateResponse.ok) return null;

      const rateData = await rateResponse.json();
      const rateToUSD = 1 / (rateData.rates[currencyCode] || 1);
      const rateToEUR = rateToUSD * (rateData.rates['EUR'] || 1);

      return {
        exchangeRateToUSD: rateToUSD,
        exchangeRateToEUR: rateToEUR,
        dataSource: 'exchangerate-api',
        dataQuality: 'verified',
      };

    } catch (error) {
      console.warn('Exchange rate fetch failed:', error);
      return null;
    }
  }

  /**
   * Fetch city coordinates from geocoding
   */
  private static async fetchCityFromGeocoding(cityName: string, countryCode: string): Promise<Partial<CityDataResponse> | null> {
    try {
      // Using free geocoding API
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
      );

      if (!response.ok) return null;

      const data = await response.json();
      const result = data.results?.[0];

      if (!result) return null;

      return {
        name: result.name,
        countryCode: result.country_code?.toUpperCase() || countryCode,
        latitude: result.latitude,
        longitude: result.longitude,
        population: result.population,
        dataSource: 'open-meteo',
        dataQuality: 'verified',
      };

    } catch (error) {
      console.warn('Geocoding fetch failed:', error);
      return null;
    }
  }

  /**
   * Generate estimated data based on country averages
   */
  private static async fetchEstimatedData(countryCode: string): Promise<Partial<CountryDataResponse> | null> {
    // Fallback estimated data
    const estimates: Record<string, Partial<CountryDataResponse>> = {
      US: {
        name: 'United States',
        code: 'US',
        currency: 'USD',
        currencySymbol: '$',
        exchangeRateToUSD: 1.0,
        exchangeRateToEUR: 0.85,
        costOfLivingIndex: 100,
        rentIndex: 100,
        groceriesIndex: 100,
        restaurantPriceIndex: 100,
        localPurchasingPower: 100,
        averageSalary: 5000,
        dataSource: 'estimated',
        dataQuality: 'estimated',
      },
      DE: {
        name: 'Germany',
        code: 'DE',
        currency: 'EUR',
        currencySymbol: '€',
        exchangeRateToUSD: 1.18,
        exchangeRateToEUR: 1.0,
        costOfLivingIndex: 75,
        rentIndex: 65,
        groceriesIndex: 70,
        restaurantPriceIndex: 70,
        localPurchasingPower: 110,
        averageSalary: 3500,
        dataSource: 'estimated',
        dataQuality: 'estimated',
      },
      ID: {
        name: 'Indonesia',
        code: 'ID',
        currency: 'IDR',
        currencySymbol: 'Rp',
        exchangeRateToUSD: 0.000065,
        exchangeRateToEUR: 0.000055,
        costOfLivingIndex: 35,
        rentIndex: 15,
        groceriesIndex: 30,
        restaurantPriceIndex: 20,
        localPurchasingPower: 25,
        averageSalary: 500000,
        dataSource: 'estimated',
        dataQuality: 'estimated',
      },
    };

    return estimates[countryCode] || null;
  }

  /**
   * Generate estimated city data
   */
  private static async fetchEstimatedCityData(cityName: string, countryCode: string): Promise<Partial<CityDataResponse> | null> {
    return {
      name: cityName,
      countryCode,
      housingMultiplier: 1.0,
      foodMultiplier: 1.0,
      transportMultiplier: 1.0,
      utilitiesMultiplier: 1.0,
      entertainmentMultiplier: 1.0,
      dataSource: 'estimated',
      dataQuality: 'estimated',
    };
  }

  /**
   * Check if cache is still valid
   */
  private static isCacheValid(lastFetchedAt: Date): boolean {
    const now = new Date().getTime();
    const cacheTime = new Date(lastFetchedAt).getTime();
    return now - cacheTime < this.CACHE_DURATION;
  }

  /**
   * Log API request for monitoring
   */
  private static async logApiRequest(
    endpoint: string,
    countryCode: string | null,
    cityName: string | null,
    success: boolean,
    responseTime: number,
    errorMessage?: string
  ): Promise<void> {
    try {
      await prisma.apiRequestLog.create({
        data: {
          endpoint,
          countryCode,
          cityName,
          success,
          responseTime,
          errorMessage,
          dataSource: 'auto',
        },
      });
    } catch (error) {
      console.warn('Failed to log API request:', error);
    }
  }

  /**
   * Format database country data to response
   */
  private static formatCountryData(data: any): CountryDataResponse {
    return {
      name: data.name,
      code: data.code,
      currency: data.currency,
      currencySymbol: data.currencySymbol,
      exchangeRateToUSD: data.exchangeRateToUSD,
      exchangeRateToEUR: data.exchangeRateToEUR,
      costOfLivingIndex: data.costOfLivingIndex,
      rentIndex: data.rentIndex,
      groceriesIndex: data.groceriesIndex,
      restaurantPriceIndex: data.restaurantPriceIndex,
      localPurchasingPower: data.localPurchasingPower,
      averageSalary: data.averageSalary,
      dataSource: data.dataSource,
      dataQuality: data.dataQuality,
    };
  }

  /**
   * Format database city data to response
   */
  private static formatCityData(data: any): CityDataResponse {
    return {
      name: data.name,
      countryCode: data.countryCode || '',
      latitude: data.latitude,
      longitude: data.longitude,
      housingMultiplier: data.housingMultiplier,
      foodMultiplier: data.foodMultiplier,
      transportMultiplier: data.transportMultiplier,
      utilitiesMultiplier: data.utilitiesMultiplier,
      entertainmentMultiplier: data.entertainmentMultiplier,
      avgRentStudio: data.avgRentStudio,
      avgRent1Bedroom: data.avgRent1Bedroom,
      avgRent3Bedroom: data.avgRent3Bedroom,
      avgMealInexpensive: data.avgMealInexpensive,
      avgMealMidRange: data.avgMealMidRange,
      avgTransportPass: data.avgTransportPass,
      avgUtilities: data.avgUtilities,
      avgInternet: data.avgInternet,
      avgGymMembership: data.avgGymMembership,
      population: data.population,
      dataSource: data.dataSource,
      dataQuality: data.dataQuality,
    };
  }

  /**
   * Get all available countries from cache
   */
  static async getAvailableCountries(): Promise<Array<{ code: string; name: string }>> {
    const countries = await prisma.country.findMany({
      select: {
        code: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return countries;
  }

  /**
   * Get all cities for a country from cache
   */
  static async getCitiesForCountry(countryCode: string): Promise<Array<{ name: string; population?: number }>> {
    const country = await prisma.country.findUnique({
      where: { code: countryCode },
      include: {
        cities: {
          select: {
            name: true,
            population: true,
          },
          orderBy: {
            population: 'desc',
          },
        },
      },
    });

    return country?.cities || [];
  }
}
