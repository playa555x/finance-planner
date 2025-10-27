'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Calculator, 
  Download, 
  TrendingUp, 
  Home, 
  Utensils, 
  Car, 
  Zap, 
  Heart, 
  Gamepad2, 
  FileText,
  DollarSign,
  Users,
  Calendar,
  MapPin,
  Dog,
  Plane,
  Umbrella,
  Sun,
  Waves,
  Trees,
  Camera,
  ShoppingBag,
  Phone,
  Wifi,
  Dumbbell,
  Coffee,
  Beer,
  Pizza,
  Fish,
  Baby,
  GraduationCap,
  Briefcase,
  PiggyBank,
  CreditCard,
  Banknote,
  AlertCircle,
  CheckCircle,
  Info,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  X,
  Receipt,
  Building2,
  Locate
} from 'lucide-react';

// Import new components
import DailyBudgetManager from '@/components/DailyBudgetManager';
import ExpenseTracker from '@/components/ExpenseTracker';
import FixedCostsManager from '@/components/FixedCostsManager';
import InstantBudgetPreview from '@/components/InstantBudgetPreview';
import DetailedLocationInfo from '@/components/DetailedLocationInfo';
import OnboardingTutorial from '@/components/OnboardingTutorial';
import EditableBudgetCategory from '@/components/EditableBudgetCategory';
import { useBackgroundLocationDetection } from '@/hooks/useBackgroundLocationDetection';

interface FinancialPlan {
  id: string;
  lifestyleLevel: string;
  duration: number;
  persons: number;
  pets: number;
  totalCostIDR: number;
  totalCostEUR: number;
  exchangeRate: number;
  categories: Array<{
    category: string;
    subcategory: string;
    description: string;
    monthlyIDR: number;
    monthlyEUR: number;
    yearlyIDR: number;
    yearlyEUR: number;
    icon: string;
    color: string;
  }>;
  breakdown: {
    housing: { idr: number; eur: number; percentage: number; icon: string; color: string };
    food: { idr: number; eur: number; percentage: number; icon: string; color: string };
    transportation: { idr: number; eur: number; percentage: number; icon: string; color: string };
    utilities: { idr: number; eur: number; percentage: number; icon: string; color: string };
    healthcare: { idr: number; eur: number; percentage: number; icon: string; color: string };
    entertainment: { idr: number; eur: number; percentage: number; icon: string; color: string };
    visa: { idr: number; eur: number; percentage: number; icon: string; color: string };
    pets: { idr: number; eur: number; percentage: number; icon: string; color: string };
    other: { idr: number; eur: number; percentage: number; icon: string; color: string };
  };
  seasonalVariations: {
    rainySeason: number;
    drySeason: number;
    peakSeason: number;
    lowSeason: number;
  };
}

const categoryIcons: Record<string, any> = {
  housing: Home,
  food: Utensils,
  transportation: Car,
  utilities: Zap,
  healthcare: Heart,
  entertainment: Gamepad2,
  visa: FileText,
  pets: Dog,
  other: DollarSign,
};

const categoryColors: Record<string, string> = {
  housing: 'bg-blue-500',
  food: 'bg-green-500',
  transportation: 'bg-yellow-500',
  utilities: 'bg-purple-500',
  healthcare: 'bg-red-500',
  entertainment: 'bg-pink-500',
  visa: 'bg-indigo-500',
  pets: 'bg-orange-500',
  other: 'bg-gray-500',
};

const lifestyleDescriptions = {
  budget: {
    title: 'Budget Lifestyle',
    description: 'Einfaches Leben mit lokalem Flair',
    icon: '🌴',
    color: 'from-green-400 to-green-600',
    features: ['Lokale Warungs', 'Scooter', 'Simple Wohnung', 'Gemeinschaftsaktivitäten']
  },
  comfort: {
    title: 'Comfort Lifestyle',
    description: 'Ausgewogenes Leben mit Komfort',
    icon: '🏝️',
    color: 'from-blue-400 to-blue-600',
    features: ['Mixed Dining', 'Modernes Apartment', 'Ausgewogen', 'Fitness & Wellness']
  },
  premium: {
    title: 'Premium Lifestyle',
    description: 'Luxuriöses Leben in Bali',
    icon: '🌺',
    color: 'from-purple-400 to-purple-600',
    features: ['Fine Dining', 'Villa mit Pool', 'Car+Driver', 'Exclusive Clubs']
  }
};

export default function BaliFinancePlanner() {
  const [plan, setPlan] = useState<FinancialPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('planner');
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const [customCategories, setCustomCategories] = useState<Array<{name: string, amount: number, description: string}>>([]);
  const [newCustomCategory, setNewCustomCategory] = useState({name: '', amount: 0, description: ''});
  
  // New state for advanced features
  const [currentUserId] = useState('demo-user'); // In real app, this would come from auth
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [locationMultiplier, setLocationMultiplier] = useState(1.0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Background location detection - runs automatically on app start
  const {
    detectedRegion,
    location: backgroundLocation,
    isDetecting: backgroundDetecting,
    countryCode,
    countryName,
    currency,
    exchangeRate: detectedExchangeRate,
    city,
    region,
    postalCode,
    timezone,
    isp,
    org,
    asn,
    deviceType,
    browser,
    os
  } = useBackgroundLocationDetection();

  // Update location multiplier when background detection completes
  useEffect(() => {
    if (detectedRegion) {
      setLocationMultiplier(detectedRegion.costMultiplier);
      console.log(`Background location detected: ${detectedRegion.name} (${detectedRegion.costMultiplier}x multiplier)`);
    }
  }, [detectedRegion]);

  // Check if user has seen onboarding tutorial
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };
  
  const [formData, setFormData] = useState({
    lifestyleLevel: 'comfort',
    duration: 30,
    persons: 1,
    pets: 0,
    hasDog: false,
    season: 'dry',
    includeComparison: false,
    homeCountry: 'Germany',
    monthlyIncome: 2500, // New field for monthly income in EUR
    totalBudget: 0, // New field for total budget in EUR
    manualBudget: 0, // Manual budget input
    budgetPeriod: 'daily', // daily, weekly, monthly
  });

  // Calculate automatic daily budget based on income
  const calculateAutoDailyBudget = () => {
    const monthlyIncomeEUR = formData.monthlyIncome;
    const monthlyIncomeIDR = monthlyIncomeEUR * (detectedExchangeRate || 19255);

    // Apply location multiplier
    const adjustedMonthlyIncomeIDR = monthlyIncomeIDR / locationMultiplier;

    // Calculate daily budget (70% of income for daily expenses, 30% for savings/fixed costs)
    const dailyBudgetIDR = (adjustedMonthlyIncomeIDR * 0.7) / 30;
    const dailyBudgetEUR = dailyBudgetIDR / (detectedExchangeRate || 19255);

    return {
      dailyIDR: Math.round(dailyBudgetIDR),
      dailyEUR: Math.round(dailyBudgetEUR * 100) / 100,
      monthlyIDR: Math.round(adjustedMonthlyIncomeIDR * 0.7),
      monthlyEUR: Math.round((monthlyIncomeEUR * 0.7) * 100) / 100
    };
  };

  // Calculate budget analysis
  const calculateBudgetAnalysis = (totalCostEUR: number) => {
    if (!formData.totalBudget || formData.totalBudget === 0) {
      return {
        status: 'none',
        message: 'Kein Budget gesetzt',
        difference: 0,
        dailyAvailable: 0
      };
    }

    const difference = formData.totalBudget - totalCostEUR;
    const dailyDifference = difference / formData.duration;

    if (Math.abs(difference) < 10) {
      return {
        status: 'exact',
        message: 'Perfekt im Budget!',
        difference: difference,
        dailyAvailable: dailyDifference
      };
    } else if (difference > 0) {
      return {
        status: 'under',
        message: 'Unter Budget - gut gemacht!',
        difference: difference,
        dailyAvailable: dailyDifference
      };
    } else {
      return {
        status: 'over',
        message: 'Über Budget - Anpassung nötig',
        difference: difference,
        dailyAvailable: dailyDifference
      };
    }
  };

  const calculatePlan = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          customCategories: customCategories.map(cat => ({
            name: cat.name,
            amount: cat.amount
          })),
          locationMultiplier // Apply location-based cost adjustment
        }),
      });
      const data = await response.json();
      
      // Enhanced plan with pet costs, budget details and more
      const autoBudget = calculateAutoDailyBudget();
      const budgetAnalysis = calculateBudgetAnalysis(data.totalCostEUR);
      const enhancedPlan = {
        ...data,
        pets: formData.pets,
        monthlyIncome: formData.monthlyIncome,
        totalBudget: formData.totalBudget,
        autoDailyBudget: autoBudget,
        budgetAnalysis: budgetAnalysis,
        categories: data.categories.map((cat: any) => ({
          ...cat,
          icon: categoryIcons[cat.category.toLowerCase()] || DollarSign,
          color: categoryColors[cat.category.toLowerCase()] || 'bg-gray-500'
        })),
        breakdown: {
          ...data.breakdown,
          pets: {
            idr: formData.pets * 500000, // 500k IDR per pet monthly
            eur: (formData.pets * 500000) / data.exchangeRate,
            percentage: ((formData.pets * 500000) / (data.totalCostIDR / (data.duration / 30))) * 100,
            icon: Dog,
            color: 'bg-orange-500'
          }
        },
        seasonalVariations: {
          rainySeason: data.totalCostEUR * 1.1,
          drySeason: data.totalCostEUR,
          peakSeason: data.totalCostEUR * 1.3,
          lowSeason: data.totalCostEUR * 0.9
        }
      };
      
      setPlan(enhancedPlan);
      setActiveTab('results');
    } catch (error) {
      console.error('Failed to calculate plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportPlan = async (format: 'excel' | 'pdf') => {
    if (!plan) return;
    
    try {
      const response = await fetch(`/api/export/${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bali-financial-plan-${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'IDR') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const addCustomCategory = () => {
    if (newCustomCategory.name && newCustomCategory.amount > 0) {
      setCustomCategories([...customCategories, newCustomCategory]);
      setNewCustomCategory({name: '', amount: 0, description: ''});
    }
  };

  const removeCustomCategory = (index: number) => {
    setCustomCategories(customCategories.filter((_, i) => i !== index));
  };

  const toggleDetails = (category: string) => {
    setShowDetails(prev => ({...prev, [category]: !prev[category]}));
  };

  const handleUpdateCategory = (index: number, updatedCategory: any) => {
    if (!plan) return;

    // Update the category in the plan
    const newCategories = [...plan.categories];
    newCategories[index] = updatedCategory;

    // Recalculate total costs
    const newTotalMonthlyEUR = newCategories.reduce((sum, cat) => sum + cat.monthlyEUR, 0);
    const newTotalMonthlyIDR = newTotalMonthlyEUR * plan.exchangeRate;
    const newTotalYearlyEUR = newTotalMonthlyEUR * 12;
    const newTotalYearlyIDR = newTotalMonthlyIDR * 12;
    const newTotalCostEUR = (newTotalMonthlyEUR / 30) * plan.duration;
    const newTotalCostIDR = newTotalCostEUR * plan.exchangeRate;

    // Update the plan with new values
    setPlan({
      ...plan,
      categories: newCategories,
      totalCostEUR: newTotalCostEUR,
      totalCostIDR: newTotalCostIDR
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50">
      {/* Onboarding Tutorial */}
      {showOnboarding && (
        <OnboardingTutorial
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

      {/* Bali Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 to-blue-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                <MapPin className="h-8 w-8" />
              </div>
              <h1 className="text-5xl font-bold">Global Finance Planner</h1>
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                <Sun className="h-8 w-8" />
              </div>
            </div>
            <p className="text-xl mb-4 text-blue-100">
              Ihre umfassende Finanzplanung für {countryName}
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <Badge className="bg-white/20 backdrop-blur-sm border-white/30">
                <DollarSign className="h-3 w-3 mr-1" />
                {currency === 'EUR'
                  ? '1 EUR = 1 EUR'
                  : `1 EUR = ${detectedExchangeRate ? detectedExchangeRate.toLocaleString() : '...'} ${currency}`
                }
              </Badge>
              <Badge className="bg-white/20 backdrop-blur-sm border-white/30">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date().toLocaleDateString('de-DE')}
              </Badge>
              <Badge className="bg-white/20 backdrop-blur-sm border-white/30">
                <Dog className="h-3 w-3 mr-1" />
                Haustier-freundlich
              </Badge>
              <Badge className="bg-green-500/30 backdrop-blur-sm border-green-300/50">
                <Locate className="h-3 w-3 mr-1" />
                {countryName}
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Bali Decorations */}
        <div className="absolute top-4 left-4 text-6xl opacity-20">🌴</div>
        <div className="absolute top-8 right-8 text-5xl opacity-20">🏝️</div>
        <div className="absolute bottom-4 left-12 text-4xl opacity-20">🌺</div>
        <div className="absolute bottom-6 right-16 text-5xl opacity-20">🌊</div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="planner" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Planer
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Ergebnisse
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              Vergleich
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Budget
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Ausgaben
            </TabsTrigger>
          </TabsList>

          <TabsContent value="planner" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Planning Panel */}
              <Card className="lg:col-span-2 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Ihre Bali-Planung
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Gestalten Sie Ihren Traum auf Bali
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Lifestyle Selection */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">Lifestyle Level</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(lifestyleDescriptions).map(([level, desc]) => (
                        <Card 
                          key={level}
                          className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                            formData.lifestyleLevel === level 
                              ? 'ring-2 ring-teal-500 shadow-lg' 
                              : 'hover:scale-105'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, lifestyleLevel: level }))}
                        >
                          <CardContent className="p-4 text-center">
                            <div className="text-3xl mb-2">{desc.icon}</div>
                            <h3 className="font-semibold text-sm">{desc.title}</h3>
                            <p className="text-xs text-gray-600 mt-1">{desc.description}</p>
                            <div className="mt-2 space-y-1">
                              {desc.features.map((feature, i) => (
                                <div key={i} className="text-xs text-gray-500">• {feature}</div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Basic Parameters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="income">Monatliche Einnahmen (EUR)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="income"
                          type="number"
                          min="0"
                          step="100"
                          value={formData.monthlyIncome}
                          onChange={(e) => setFormData(prev => ({ ...prev, monthlyIncome: parseInt(e.target.value) || 0 }))}
                          className="flex-1"
                        />
                        <span className="text-sm text-gray-500">EUR/Monat</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Automatisches Tagesbudget: {calculateAutoDailyBudget().dailyEUR} EUR ({calculateAutoDailyBudget().dailyIDR.toLocaleString()} IDR)
                      </p>
                    </div>

                    {/* Total Budget Field */}
                    <div className="space-y-2">
                      <Label htmlFor="totalBudget">Gesamtbudget (Optional)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="totalBudget"
                          type="number"
                          min="0"
                          step="100"
                          placeholder="z.B. 5000"
                          value={formData.totalBudget || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, totalBudget: parseInt(e.target.value) || 0 }))}
                          className="flex-1"
                        />
                        <span className="text-sm text-gray-500">EUR gesamt</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Gesamtbudget für {formData.duration} Tage - zeigt Budget-Status an
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Aufenthaltsdauer</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="duration"
                          type="number"
                          min="1"
                          max="365"
                          value={formData.duration}
                          onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                          className="flex-1"
                        />
                        <span className="text-sm text-gray-500">Tage</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="persons">Personen</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, persons: Math.max(1, prev.persons - 1) }))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          id="persons"
                          type="number"
                          min="1"
                          max="10"
                          value={formData.persons}
                          onChange={(e) => setFormData(prev => ({ ...prev, persons: parseInt(e.target.value) || 1 }))}
                          className="flex-1 text-center"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, persons: Math.min(10, prev.persons + 1) }))}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Manual Budget Control */}
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <PiggyBank className="h-5 w-5 text-blue-600" />
                      <Label className="text-lg font-semibold">Manuelles Budget</Label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Budget Amount */}
                      <div className="space-y-2">
                        <Label htmlFor="manualBudget">Budget-Betrag</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="manualBudget"
                            type="number"
                            min="0"
                            step="10"
                            placeholder="z.B. 50"
                            value={formData.manualBudget || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, manualBudget: parseInt(e.target.value) || 0 }))}
                            className="flex-1"
                          />
                          <span className="text-sm text-gray-500">EUR</span>
                        </div>
                      </div>

                      {/* Budget Period Selector */}
                      <div className="space-y-2">
                        <Label htmlFor="budgetPeriod">Zeitraum</Label>
                        <Select
                          value={formData.budgetPeriod}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, budgetPeriod: value }))}
                        >
                          <SelectTrigger id="budgetPeriod">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Pro Tag</SelectItem>
                            <SelectItem value="weekly">Pro Woche</SelectItem>
                            <SelectItem value="monthly">Pro Monat</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Budget Preview */}
                    {formData.manualBudget > 0 && (
                      <div className="mt-3 p-3 bg-blue-100 border border-blue-300 rounded-lg">
                        <div className="text-sm font-medium text-blue-800 mb-2">Dein Budget:</div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <div className="text-blue-600">Pro Tag:</div>
                            <div className="font-semibold">
                              {formData.budgetPeriod === 'daily'
                                ? formData.manualBudget
                                : formData.budgetPeriod === 'weekly'
                                ? Math.round(formData.manualBudget / 7)
                                : Math.round(formData.manualBudget / 30)} EUR
                            </div>
                          </div>
                          <div>
                            <div className="text-blue-600">Pro Woche:</div>
                            <div className="font-semibold">
                              {formData.budgetPeriod === 'daily'
                                ? formData.manualBudget * 7
                                : formData.budgetPeriod === 'weekly'
                                ? formData.manualBudget
                                : Math.round(formData.manualBudget / 4.3)} EUR
                            </div>
                          </div>
                          <div>
                            <div className="text-blue-600">Pro Monat:</div>
                            <div className="font-semibold">
                              {formData.budgetPeriod === 'daily'
                                ? formData.manualBudget * 30
                                : formData.budgetPeriod === 'weekly'
                                ? Math.round(formData.manualBudget * 4.3)
                                : formData.manualBudget} EUR
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pet Section */}
                  <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Dog className="h-5 w-5 text-orange-600" />
                        <Label className="text-lg font-semibold">Haustiere</Label>
                      </div>
                      <Switch
                        checked={formData.pets > 0}
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          pets: checked ? 1 : 0,
                          hasDog: checked
                        }))}
                      />
                    </div>
                    
                    {formData.pets > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="pets">Anzahl Haustiere:</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setFormData(prev => ({ ...prev, pets: Math.max(0, prev.pets - 1) }))}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              id="pets"
                              type="number"
                              min="0"
                              max="5"
                              value={formData.pets}
                              onChange={(e) => setFormData(prev => ({ ...prev, pets: parseInt(e.target.value) || 0 }))}
                              className="w-16 text-center"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setFormData(prev => ({ ...prev, pets: Math.min(5, prev.pets + 1) }))}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="hasDog"
                            checked={formData.hasDog}
                            onChange={(e) => setFormData(prev => ({ ...prev, hasDog: e.target.checked }))}
                            className="rounded"
                          />
                          <Label htmlFor="hasDog">Hund (benötigt zusätzliche Impfungen & Pflege)</Label>
                        </div>
                        
                        <div className="text-sm text-orange-700 bg-orange-100 p-3 rounded">
                          <Info className="h-4 w-4 inline mr-1" />
                          Monatliche Kosten für Haustiere: ca. {formatCurrency(500000, 'IDR')} pro Tier
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Season Selection */}
                  <div className="space-y-2">
                    <Label>Reisezeit</Label>
                    <Select
                      value={formData.season}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, season: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dry">
                          <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            Trockenzeit (April-Oktober)
                          </div>
                        </SelectItem>
                        <SelectItem value="rainy">
                          <div className="flex items-center gap-2">
                            <Umbrella className="h-4 w-4" />
                            Regenzeit (November-März)
                          </div>
                        </SelectItem>
                        <SelectItem value="peak">
                          <div className="flex items-center gap-2">
                            <Waves className="h-4 w-4" />
                            Hauptsaison (Juli-August, Dezember)
                          </div>
                        </SelectItem>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <Trees className="h-4 w-4" />
                            Nebensaison (Februar-März, Oktober)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Custom Categories */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-semibold">Zusätzliche Kosten</Label>
                      <Button variant="outline" size="sm" onClick={() => setShowDetails(prev => ({...prev, custom: !prev.custom}))}>
                        {showDetails.custom ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    {showDetails.custom && (
                      <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Input
                            placeholder="Kategorie"
                            value={newCustomCategory.name}
                            onChange={(e) => setNewCustomCategory(prev => ({...prev, name: e.target.value}))}
                          />
                          <Input
                            type="number"
                            placeholder="Betrag in IDR"
                            value={newCustomCategory.amount}
                            onChange={(e) => setNewCustomCategory(prev => ({...prev, amount: parseInt(e.target.value) || 0}))}
                          />
                          <Button onClick={addCustomCategory} disabled={!newCustomCategory.name || newCustomCategory.amount <= 0}>
                            <Plus className="h-4 w-4 mr-2" />
                            Hinzufügen
                          </Button>
                        </div>
                        
                        {customCategories.map((cat, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                            <div>
                              <div className="font-medium">{cat.name}</div>
                              <div className="text-sm text-gray-500">{formatCurrency(cat.amount, 'IDR')}</div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removeCustomCategory(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={calculatePlan} 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-semibold py-3"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                        Berechne Ihren Bali-Traum...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Finanzplan erstellen
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Info Panel */}
              <div className="space-y-6">
                {/* Instant Budget Preview */}
                <InstantBudgetPreview
                  lifestyleLevel={formData.lifestyleLevel as 'budget' | 'comfort' | 'premium'}
                  duration={formData.duration}
                  persons={formData.persons}
                  countryName={countryName}
                  currency={currency}
                  exchangeRate={detectedExchangeRate}
                />

                {/* Detailed Location Information */}
                <DetailedLocationInfo
                  city={city}
                  region={region}
                  countryName={countryName}
                  countryCode={countryCode}
                  currency={currency}
                  exchangeRate={detectedExchangeRate}
                  timezone={timezone}
                  postalCode={postalCode}
                  isp={isp}
                  latitude={backgroundLocation?.latitude}
                  longitude={backgroundLocation?.longitude}
                  deviceType={deviceType}
                  browser={browser}
                  os={os}
                />

                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      Bali-Infos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">Klima</span>
                      </div>
                      <p className="text-xs text-gray-600">Tropisch mit zwei Jahreszeiten. 26-30°C ganzjährig.</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Dog className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">Haustiere</span>
                      </div>
                      <p className="text-xs text-gray-600">Bali ist haustierfreundlich! Hunde benötigen Impfungen und können in vielen Villas mitgebracht werden.</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Zahlungsmittel</span>
                      </div>
                      <p className="text-xs text-gray-600">Kreditkarten werden akzeptiert, aber Bargeld (IDR) ist oft bevorzugt.</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Internet</span>
                      </div>
                      <p className="text-xs text-gray-600">Gutes 4G/5G Netz in Touristengebieten. Fiber verfügbar.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-green-400 to-teal-400 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <PiggyBank className="h-5 w-5" />
                      Spartipps
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <p className="text-xs">Lokale Warungs sind günstiger als Touristenrestaurants</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <p className="text-xs">Scooter mieten statt Taxi nutzen</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <p className="text-xs">Auf lokalen Märkten einkaufen</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <p className="text-xs">Langfristige Miete verhandeln</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {plan ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="h-5 w-5" />
                        <span className="font-medium">Gesamtkosten</span>
                      </div>
                      <div className="text-3xl font-bold mb-1">
                        {formatCurrency(plan.totalCostEUR, 'EUR')}
                      </div>
                      <div className="text-sm opacity-90">
                        {formatCurrency(plan.totalCostIDR, 'IDR')}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <PiggyBank className="h-5 w-5" />
                        <span className="font-medium">Tagesbudget</span>
                      </div>
                      <div className="text-3xl font-bold mb-1">
                        {formatCurrency(plan.autoDailyBudget.dailyEUR, 'EUR')}
                      </div>
                      <div className="text-sm opacity-90">
                        {formatCurrency(plan.autoDailyBudget.dailyIDR, 'IDR')}
                      </div>
                      <div className="text-xs opacity-75 mt-2">
                        70% von {plan.monthlyIncome}€/Monat
                      </div>
                    </CardContent>
                  </Card>

                  {/* Budget Status Card */}
                  {plan.totalBudget > 0 && (
                    <Card className={`border-0 shadow-xl text-white ${
                      plan.budgetAnalysis.status === 'exact' 
                        ? 'bg-gradient-to-br from-green-500 to-green-600'
                        : plan.budgetAnalysis.status === 'under'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                        : plan.budgetAnalysis.status === 'over'
                        ? 'bg-gradient-to-br from-red-500 to-red-600'
                        : 'bg-gradient-to-br from-gray-500 to-gray-600'
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          {plan.budgetAnalysis.status === 'exact' ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : plan.budgetAnalysis.status === 'under' ? (
                            <TrendingUp className="h-5 w-5" />
                          ) : plan.budgetAnalysis.status === 'over' ? (
                            <AlertCircle className="h-5 w-5" />
                          ) : (
                            <DollarSign className="h-5 w-5" />
                          )}
                          <span className="font-medium">Budget-Status</span>
                        </div>
                        <div className="text-2xl font-bold mb-1">
                          {formatCurrency(plan.totalBudget, 'EUR')}
                        </div>
                        <div className="text-sm opacity-90 mb-2">
                          {plan.budgetAnalysis.message}
                        </div>
                        <div className="text-xs opacity-75">
                          {plan.budgetAnalysis.status !== 'none' && (
                            <>
                              Unterschied: {formatCurrency(Math.abs(plan.budgetAnalysis.difference), 'EUR')}
                              {plan.budgetAnalysis.dailyAvailable !== 0 && (
                                <> ({formatCurrency(Math.abs(plan.budgetAnalysis.dailyAvailable), 'EUR')}/Tag)</>
                              )}
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="h-5 w-5" />
                        <span className="font-medium">Monatlich</span>
                      </div>
                      <div className="text-3xl font-bold mb-1">
                        {formatCurrency(plan.totalCostEUR / (plan.duration / 30), 'EUR')}
                      </div>
                      <div className="text-sm opacity-90">
                        {plan.duration} Tage
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-5 w-5" />
                        <span className="font-medium">Lifestyle</span>
                      </div>
                      <div className="text-3xl font-bold mb-1 capitalize">
                        {plan.lifestyleLevel}
                      </div>
                      <div className="text-sm opacity-90">
                        {plan.persons} Person(en)
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Dog className="h-5 w-5" />
                        <span className="font-medium">Haustiere</span>
                      </div>
                      <div className="text-3xl font-bold mb-1">
                        {plan.pets}
                      </div>
                      <div className="text-sm opacity-90">
                        {plan.pets > 0 ? formatCurrency(plan.breakdown.pets.eur * 12, 'EUR')/Jahr : 'Keine'}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Export Options */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">Exportieren</h3>
                        <p className="text-gray-600">Laden Sie Ihren kompletten Finanzplan herunter</p>
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          onClick={() => exportPlan('excel')}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Excel
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => exportPlan('pdf')}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cost Breakdown */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Kostenverteilung
                    </CardTitle>
                    <CardDescription>
                      Monatliche Ausgaben nach Kategorien
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(plan.breakdown).map(([key, value]) => {
                      const Icon = value.icon;
                      return (
                        <div key={key} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${value.color} bg-opacity-20`}>
                                <Icon className={`h-4 w-4 ${value.color.replace('bg-', 'text-')}`} />
                              </div>
                              <div>
                                <span className="font-medium capitalize">{key}</span>
                                {value.percentage > 0 && (
                                  <div className="text-sm text-gray-500">{value.percentage.toFixed(1)}%</div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {formatCurrency(value.eur, 'EUR')}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatCurrency(value.idr, 'IDR')}
                              </div>
                            </div>
                          </div>
                          {value.percentage > 0 && (
                            <div className="relative">
                              <Progress value={value.percentage} className="h-2" />
                              <div 
                                className={`absolute top-0 left-0 h-2 rounded-full ${value.color} transition-all duration-500`}
                                style={{width: `${value.percentage}%`}}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Calculator className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Noch kein Finanzplan
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Erstellen Sie zuerst Ihren persönlichen Bali-Finanzplan
                    </p>
                    <Button onClick={() => setActiveTab('planner')}>
                      Zum Planer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            {plan ? (
              <div>
                {/* Budget Adjustment Section */}
                <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-indigo-50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PiggyBank className="h-5 w-5 text-blue-600" />
                      Tagesbudget anpassen
                    </CardTitle>
                    <CardDescription>
                      Basierend auf Ihren Einnahmen: {plan.monthlyIncome} EUR/Monat
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-white rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Automatisch berechnet</span>
                          <Badge variant="secondary">70% vom Einkommen</Badge>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {plan.autoDailyBudget.dailyEUR} €
                        </div>
                        <div className="text-sm text-gray-500">
                          {plan.autoDailyBudget.dailyIDR.toLocaleString()} IDR/Tag
                        </div>
                      </div>
                      
                      <div className="p-4 bg-white rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Tatsächliche Kosten</span>
                          <Badge variant={plan.totalCostEUR / (plan.duration / 30) > plan.autoDailyBudget.dailyEUR ? "destructive" : "default"}>
                            {plan.totalCostEUR / (plan.duration / 30) > plan.autoDailyBudget.dailyEUR ? "Über Budget" : "Im Budget"}
                          </Badge>
                        </div>
                        <div className="text-2xl font-bold text-gray-700">
                          {Math.round((plan.totalCostEUR / (plan.duration / 30)) * 100) / 100} €
                        </div>
                        <div className="text-sm text-gray-500">
                          {Math.round(plan.totalCostIDR / (plan.duration / 30)).toLocaleString()} IDR/Tag
                        </div>
                      </div>
                      
                      <div className="p-4 bg-white rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Monatliche Differenz</span>
                          <Badge variant={plan.autoDailyBudget.monthlyEUR > (plan.totalCostEUR / (plan.duration / 30)) * 30 ? "default" : "destructive"}>
                            {plan.autoDailyBudget.monthlyEUR > (plan.totalCostEUR / (plan.duration / 30)) * 30 ? "Sparen" : "Mehr ausgeben"}
                          </Badge>
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round((plan.autoDailyBudget.monthlyEUR - (plan.totalCostEUR / (plan.duration / 30)) * 30) * 100) / 100} €
                        </div>
                        <div className="text-sm text-gray-500">
                          {Math.round((plan.autoDailyBudget.monthlyIDR - (plan.totalCostIDR / (plan.duration / 30)) * 30)).toLocaleString()} IDR/Monat
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-amber-600 mt-0.5" />
                        <div className="text-sm text-amber-800">
                          <p className="font-medium mb-1">Budget-Tipp</p>
                          <p className="text-xs">
                            Das automatische Budget basiert auf 70% Ihrer Einnahmen für tägliche Ausgaben. 
                            Die restlichen 30% stehen für Ersparnisse, Fixkosten und unerwartete Ausgaben zur Verfügung.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Original Details */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Detaillierte Kostenstellen
                  </CardTitle>
                  <CardDescription>
                    Alle monatlichen und jährlichen Kosten im Detail
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {plan.categories.map((category, index) => (
                      <EditableBudgetCategory
                        key={index}
                        category={category}
                        exchangeRate={plan.exchangeRate}
                        onUpdate={(updated) => handleUpdateCategory(index, updated)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
              </div>
            ) : (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Keine Details verfügbar
                    </h3>
                    <p className="text-gray-600">
                      Erstellen Sie zuerst einen Finanzplan um Details zu sehen
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            {plan ? (
              <div>
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plane className="h-5 w-5" />
                      Bali vs Heimatland Vergleich
                    </CardTitle>
                    <CardDescription>
                      Kostenvergleich zwischen Bali und Deutschland
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="text-center p-6 bg-blue-50 rounded-lg">
                          <h3 className="font-semibold text-lg mb-2">🇩🇪 Deutschland</h3>
                          <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(plan.totalCostEUR * 2.5, 'EUR')}
                          </div>
                          <p className="text-sm text-gray-600">Äquivalente Lebenshaltung</p>
                        </div>
                        <div className="text-center p-6 bg-green-50 rounded-lg">
                          <h3 className="font-semibold text-lg mb-2">🇮🇩 Bali</h3>
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(plan.totalCostEUR, 'EUR')}
                          </div>
                          <p className="text-sm text-gray-600">Ihre gewählte Lebenshaltung</p>
                        </div>
                      </div>
                      
                      <div className="text-center p-4 bg-green-100 rounded-lg">
                        <p className="text-green-800 font-medium">
                          💰 Sie sparen {(plan.totalCostEUR * 2.5 - plan.totalCostEUR).toFixed(0)} EUR pro Monat!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Saisonale Variationen
                    </CardTitle>
                    <CardDescription>
                      Wie sich die Kosten je nach Reisezeit ändern
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Sun className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">Trockenzeit</span>
                        </div>
                        <div className="text-lg font-semibold">
                          {formatCurrency(plan.seasonalVariations.drySeason, 'EUR')}
                        </div>
                        <div className="text-sm text-gray-500">Normale Preise</div>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Umbrella className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">Regenzeit</span>
                        </div>
                        <div className="text-lg font-semibold">
                          {formatCurrency(plan.seasonalVariations.rainySeason, 'EUR')}
                        </div>
                        <div className="text-sm text-gray-500">+10% teurer</div>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Waves className="h-4 w-4 text-purple-500" />
                          <span className="font-medium">Hauptsaison</span>
                        </div>
                        <div className="text-lg font-semibold">
                          {formatCurrency(plan.seasonalVariations.peakSeason, 'EUR')}
                        </div>
                        <div className="text-sm text-gray-500">+30% teurer</div>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Trees className="h-4 w-4 text-green-500" />
                          <span className="font-medium">Nebensaison</span>
                        </div>
                        <div className="text-lg font-semibold">
                          {formatCurrency(plan.seasonalVariations.lowSeason, 'EUR')}
                        </div>
                        <div className="text-sm text-gray-500">-10% günstiger</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Plane className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Kein Vergleich verfügbar
                    </h3>
                    <p className="text-gray-600">
                      Erstellen Sie zuerst einen Finanzplan um Vergleiche zu sehen
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DailyBudgetManager
                userId={currentUserId}
                onBudgetUpdate={() => {}}
              />
              <ExpenseTracker
                userId={currentUserId}
                onExpenseUpdate={() => {}}
              />
            </div>
            <FixedCostsManager
              userId={currentUserId}
              onFixedCostUpdate={() => {}}
            />
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            {plan ? (
              <ExpenseTracker
                categories={plan.categories}
                currency={currency}
                exchangeRate={plan.exchangeRate}
                totalMonthlyBudget={currency === 'EUR' ?
                  plan.categories.reduce((sum, cat) => sum + cat.monthlyEUR, 0) :
                  plan.categories.reduce((sum, cat) => sum + cat.monthlyIDR, 0)
                }
              />
            ) : (
              <Card className="border-0 shadow-xl">
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Kein Plan verfügbar
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Erstelle zuerst einen Finanzplan, um Ausgaben zu tracken
                    </p>
                    <Button onClick={() => setActiveTab('planner')}>
                      Zum Planer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}