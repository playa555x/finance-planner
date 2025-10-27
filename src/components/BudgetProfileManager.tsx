'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Home,
  Utensils,
  Car,
  Zap,
  Heart,
  Gamepad2,
  Dog,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

interface BudgetProfile {
  id: string;
  name: string;
  lifestyleLevel: string;
  duration: number;
  persons: number;
  totalBudget: number;
  dailyBudget: number;
  weeklyBudget: number;
  monthlyBudget: number;
  currency: string;
  categories: Array<{
    category: string;
    subcategory: string;
    dailyBudget: number;
    weeklyBudget: number;
    monthlyBudget: number;
    icon: string;
    color: string;
    spent: number;
  }>;
  createdAt: string;
}

const categoryIcons: Record<string, any> = {
  housing: Home,
  food: Utensils,
  transportation: Car,
  utilities: Zap,
  healthcare: Heart,
  entertainment: Gamepad2,
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
  pets: 'bg-orange-500',
  other: 'bg-gray-500',
};

interface BudgetProfileManagerProps {
  onProfileSelect?: (profile: BudgetProfile) => void;
}

export default function BudgetProfileManager({ onProfileSelect }: BudgetProfileManagerProps) {
  const [profiles, setProfiles] = useState<BudgetProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<BudgetProfile | null>(null);
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    // Load profiles from localStorage
    const savedProfiles = localStorage.getItem('budgetProfiles');
    if (savedProfiles) {
      setProfiles(JSON.parse(savedProfiles));
    }
  }, []);

  const handleProfileClick = (profile: BudgetProfile) => {
    setSelectedProfile(profile);
    setShowCategories(true);
    onProfileSelect?.(profile);
  };

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const calculateSpentPercentage = (spent: number, budget: number) => {
    if (budget === 0) return 0;
    return Math.min((spent / budget) * 100, 100);
  };

  if (profiles.length === 0) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-10 w-10 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Noch kein Budget-Profil
              </h3>
              <p className="text-gray-600 max-w-md">
                Erstelle zuerst einen Finanzplan im "Planer" Tab.
                Die Daten werden automatisch hier als Budget-Profil übernommen!
              </p>
            </div>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800 text-left">
                  <p className="font-medium mb-1">So geht's:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Gehe zum "Planer" Tab</li>
                    <li>Wähle deine Parameter</li>
                    <li>Klicke "Finanzplan erstellen"</li>
                    <li>Daten werden automatisch ins Budget übernommen</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Profile List View
  if (!selectedProfile || !showCategories) {
    return (
      <div className="space-y-4">
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-6 w-6" />
              Deine Budget-Profile
            </CardTitle>
            <CardDescription className="text-blue-100">
              Klicke auf ein Profil um Details zu sehen
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profiles.map((profile) => (
            <Card
              key={profile.id}
              className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105"
              onClick={() => handleProfileClick(profile)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{profile.name}</h3>
                    <Badge className="mt-1" variant="secondary">
                      {profile.lifestyleLevel}
                    </Badge>
                  </div>
                  <ChevronRight className="h-6 w-6 text-gray-400" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tagesbudget:</span>
                    <span className="font-semibold text-lg">
                      {formatCurrency(profile.dailyBudget, profile.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Wochenbudget:</span>
                    <span className="font-medium">
                      {formatCurrency(profile.weeklyBudget, profile.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Monatsbudget:</span>
                    <span className="font-medium">
                      {formatCurrency(profile.monthlyBudget, profile.currency)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {profile.duration} Tage
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {profile.persons} Person(en)
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Category Detail View
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{selectedProfile.name}</CardTitle>
              <CardDescription className="text-blue-100 flex items-center gap-4">
                <Badge className="bg-white/20 backdrop-blur-sm border-white/30">
                  {selectedProfile.lifestyleLevel}
                </Badge>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {selectedProfile.duration} Tage
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {selectedProfile.persons} Person(en)
                </span>
              </CardDescription>
            </div>
            <Button
              variant="outline"
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
              onClick={() => {
                setShowCategories(false);
                setSelectedProfile(null);
              }}
            >
              ← Zurück zu Profilen
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="text-sm opacity-90 mb-1">Tagesbudget</div>
            <div className="text-3xl font-bold">
              {formatCurrency(selectedProfile.dailyBudget, selectedProfile.currency)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="text-sm opacity-90 mb-1">Wochenbudget</div>
            <div className="text-3xl font-bold">
              {formatCurrency(selectedProfile.weeklyBudget, selectedProfile.currency)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="text-sm opacity-90 mb-1">Monatsbudget</div>
            <div className="text-3xl font-bold">
              {formatCurrency(selectedProfile.monthlyBudget, selectedProfile.currency)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Budget nach Kategorien
          </CardTitle>
          <CardDescription>
            Übersicht deiner Budget-Kategorien mit aktuellen Ausgaben
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {selectedProfile.categories.map((cat, index) => {
              const Icon = categoryIcons[cat.category.toLowerCase()] || DollarSign;
              const spentPercentage = calculateSpentPercentage(cat.spent, cat.dailyBudget);
              const isOverBudget = cat.spent > cat.dailyBudget;

              return (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${cat.color} bg-opacity-20`}>
                        <Icon className={`h-5 w-5 ${cat.color.replace('bg-', 'text-')}`} />
                      </div>
                      <div>
                        <div className="font-semibold capitalize">{cat.category}</div>
                        <div className="text-sm text-gray-500">{cat.subcategory}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(cat.spent, selectedProfile.currency)} / {formatCurrency(cat.dailyBudget, selectedProfile.currency)}
                      </div>
                      <div className="text-xs text-gray-500">pro Tag</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Progress value={spentPercentage} className="h-2" />
                    <div className="flex items-center justify-between text-xs">
                      <span className={isOverBudget ? 'text-red-600 font-medium' : 'text-gray-600'}>
                        {spentPercentage.toFixed(0)}% ausgegeben
                      </span>
                      {isOverBudget ? (
                        <span className="text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Über Budget
                        </span>
                      ) : (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Im Budget
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Budget per period */}
                  <div className="grid grid-cols-3 gap-2 text-xs bg-gray-50 p-2 rounded">
                    <div>
                      <div className="text-gray-600">Tag</div>
                      <div className="font-medium">{formatCurrency(cat.dailyBudget, selectedProfile.currency)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Woche</div>
                      <div className="font-medium">{formatCurrency(cat.weeklyBudget, selectedProfile.currency)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Monat</div>
                      <div className="font-medium">{formatCurrency(cat.monthlyBudget, selectedProfile.currency)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
