'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  MapPin,
  Zap
} from 'lucide-react';

interface InstantBudgetPreviewProps {
  lifestyleLevel: 'budget' | 'comfort' | 'premium';
  duration: number;
  persons: number;
  countryName: string;
  currency: string;
  exchangeRate: number | null;
}

// Budget baselines in EUR per month per person
const LIFESTYLE_BUDGETS = {
  budget: {
    monthlyEUR: 800,
    description: 'Einfaches Leben mit lokalem Flair',
    icon: '🌴',
    color: 'from-green-400 to-green-600'
  },
  comfort: {
    monthlyEUR: 1500,
    description: 'Ausgewogenes Leben mit Komfort',
    icon: '🏝️',
    color: 'from-blue-400 to-blue-600'
  },
  premium: {
    monthlyEUR: 3000,
    description: 'Luxuriöses Leben',
    icon: '🌺',
    color: 'from-purple-400 to-purple-600'
  }
};

export default function InstantBudgetPreview({
  lifestyleLevel,
  duration,
  persons,
  countryName,
  currency,
  exchangeRate
}: InstantBudgetPreviewProps) {
  const lifestyle = LIFESTYLE_BUDGETS[lifestyleLevel];

  // Calculate budget
  const monthlyBudgetEUR = lifestyle.monthlyEUR * persons;
  const totalDays = duration;
  const totalBudgetEUR = (monthlyBudgetEUR / 30) * totalDays;
  const dailyBudgetEUR = totalBudgetEUR / totalDays;

  // Convert to local currency if exchange rate is available
  const monthlyBudgetLocal = exchangeRate ? monthlyBudgetEUR * exchangeRate : null;
  const totalBudgetLocal = exchangeRate ? totalBudgetEUR * exchangeRate : null;
  const dailyBudgetLocal = exchangeRate ? dailyBudgetEUR * exchangeRate : null;

  const formatCurrency = (amount: number, curr: string) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className={`border-0 shadow-xl bg-gradient-to-br ${lifestyle.color} text-white`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Sofortige Budget-Schätzung
        </CardTitle>
        <div className="flex items-center gap-2 text-sm opacity-90">
          <MapPin className="h-4 w-4" />
          {countryName}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lifestyle Badge */}
        <div className="flex items-center justify-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
          <span className="text-4xl">{lifestyle.icon}</span>
          <div>
            <div className="font-bold text-lg capitalize">{lifestyleLevel} Lifestyle</div>
            <div className="text-sm opacity-90">{lifestyle.description}</div>
          </div>
        </div>

        {/* Budget Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Daily Budget */}
          <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Pro Tag</span>
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(dailyBudgetEUR, 'EUR')}
            </div>
            {dailyBudgetLocal && (
              <div className="text-sm opacity-90 mt-1">
                ≈ {formatCurrency(dailyBudgetLocal, currency)}
              </div>
            )}
          </div>

          {/* Monthly Budget */}
          <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Pro Monat</span>
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(monthlyBudgetEUR, 'EUR')}
            </div>
            {monthlyBudgetLocal && (
              <div className="text-sm opacity-90 mt-1">
                ≈ {formatCurrency(monthlyBudgetLocal, currency)}
              </div>
            )}
          </div>

          {/* Total Budget */}
          <div className="p-4 bg-white/20 backdrop-blur-sm rounded-lg border-2 border-white/30">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">Gesamt ({duration} Tage)</span>
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBudgetEUR, 'EUR')}
            </div>
            {totalBudgetLocal && (
              <div className="text-sm opacity-90 mt-1">
                ≈ {formatCurrency(totalBudgetLocal, currency)}
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg text-sm">
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 border-white/30">
              {persons} {persons === 1 ? 'Person' : 'Personen'}
            </Badge>
            <Badge className="bg-white/20 border-white/30">
              {duration} Tage
            </Badge>
          </div>
          {exchangeRate && (
            <div className="text-xs opacity-75">
              1 EUR = {exchangeRate.toLocaleString()} {currency}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="text-xs opacity-75 text-center">
          ⚡ Dies ist eine sofortige Schätzung. Für detaillierte Planung erstellen Sie einen vollständigen Finanzplan.
        </div>
      </CardContent>
    </Card>
  );
}
