import { db } from '../lib/db';
import { exchangeRates } from '../lib/schema';
import { eq, and, gte } from 'drizzle-orm';
import ZAI from 'z-ai-web-dev-sdk';

interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  timestamp: Date;
}

export class CurrencyService {
  private cache = new Map<string, { rate: number; timestamp: Date }>();
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  async getExchangeRate(from: string, to: string): Promise<number> {
    const cacheKey = `${from}-${to}`;
    
    // Check memory cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp.getTime() < this.CACHE_DURATION) {
      return cached.rate;
    }

    // Check database cache
    const dbRate = await this.getFromDatabase(from, to);
    if (dbRate) {
      this.cache.set(cacheKey, { rate: dbRate, timestamp: new Date() });
      return dbRate;
    }

    // Fetch from API
    const liveRate = await this.fetchFromAPI(from, to);
    
    // Save to cache and database
    this.cache.set(cacheKey, { rate: liveRate, timestamp: new Date() });
    await this.saveToDatabase(from, to, liveRate);
    
    return liveRate;
  }

  private async getFromDatabase(from: string, to: string): Promise<number | null> {
    try {
      const oneHourAgo = new Date(Date.now() - this.CACHE_DURATION);
      const record = db
        .select()
        .from(exchangeRates)
        .where(
          and(
            eq(exchangeRates.fromCurrency, from),
            eq(exchangeRates.toCurrency, to),
            gte(exchangeRates.timestamp, oneHourAgo)
          )
        )
        .limit(1)
        .get();

      return record?.rate || null;
    } catch (error) {
      console.error('Database fetch error:', error);
      return null;
    }
  }

  private async saveToDatabase(from: string, to: string, rate: number): Promise<void> {
    try {
      const insert = db.insert(exchangeRates).values({
        id: `${from}-${to}-${Date.now()}`,
        fromCurrency: from,
        toCurrency: to,
        rate,
        timestamp: new Date(),
      });
      insert.run();
    } catch (error) {
      console.error('Database save error:', error);
    }
  }

  private async fetchFromAPI(from: string, to: string): Promise<number> {
    try {
      const zai = await ZAI.create();
      
      // Use web search to get current exchange rates
      const searchResult = await zai.functions.invoke("web_search", {
        query: `current exchange rate ${from} to ${to} today`,
        num: 5
      });

      // Extract rate from search results
      const rate = this.extractRateFromSearchResults(searchResult, from, to);
      
      if (!rate) {
        throw new Error(`Could not find exchange rate for ${from} to ${to}`);
      }

      return rate;
    } catch (error) {
      console.error('API fetch error:', error);
      // Fallback to default rates for common pairs
      return this.getFallbackRate(from, to);
    }
  }

  private extractRateFromSearchResults(results: any[], from: string, to: string): number | null {
    // Try to extract rate from search results
    for (const result of results) {
      const text = result.snippet || '';
      const rateMatch = text.match(/(\d+\.?\d*)\s*${from}\s*[=]\s*(\d+\.?\d*)\s*${to}/i);
      if (rateMatch) {
        return parseFloat(rateMatch[2]);
      }
    }
    
    // Fallback: try to find any number in the results
    for (const result of results) {
      const text = result.snippet || '';
      const numberMatch = text.match(/(\d+\.?\d*)/);
      if (numberMatch) {
        const rate = parseFloat(numberMatch[1]);
        if (rate > 0.1 && rate < 100000) { // Reasonable range
          return rate;
        }
      }
    }
    
    return null;
  }

  private getFallbackRate(from: string, to: string): number {
    // Default fallback rates (as of October 2025)
    const fallbackRates: Record<string, Record<string, number>> = {
      EUR: {
        IDR: 19255, // 1 EUR = 19,255 IDR
        USD: 1.05,
        GBP: 0.83,
      },
      USD: {
        IDR: 18338,
        EUR: 0.95,
        GBP: 0.79,
      },
      IDR: {
        EUR: 0.000052,
        USD: 0.000055,
        GBP: 0.000043,
      },
    };

    return fallbackRates[from]?.[to] || 1;
  }

  async convertAmount(amount: number, from: string, to: string): Promise<number> {
    if (from === to) return amount;
    
    const rate = await this.getExchangeRate(from, to);
    return amount * rate;
  }
}

export const currencyService = new CurrencyService();