'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Calendar,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExpenseEntry {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  currency: string;
}

interface ExpenseTrackerProps {
  userId?: string;
  onExpenseUpdate?: (expense: any) => void;
  categories?: Array<{
    category: string;
    subcategory: string;
    monthlyEUR: number;
    monthlyIDR: number;
  }>;
  currency?: string;
  exchangeRate?: number;
  totalMonthlyBudget?: number;
}

export default function ExpenseTracker({
  userId = 'demo-user',
  onExpenseUpdate,
  categories = [],
  currency = 'EUR',
  exchangeRate = 1,
  totalMonthlyBudget = 0
}: ExpenseTrackerProps) {
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [trackingMode, setTrackingMode] = useState<'category' | 'total'>('category');
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [customCategories, setCustomCategories] = useState<Array<{
    category: string;
    subcategory: string;
    monthlyEUR: number;
    monthlyIDR: number;
  }>>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Form state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Custom category form state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySubname, setNewCategorySubname] = useState('');
  const [newCategoryBudget, setNewCategoryBudget] = useState('');

  const { toast } = useToast();

  // Combine default and custom categories
  const allCategories = [...categories, ...customCategories];

  // Calculate totals
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const dailyBudget = totalMonthlyBudget / 30;
  const todayExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date).toDateString();
    const today = new Date().toDateString();
    return expDate === today;
  });
  const todaySpent = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingToday = dailyBudget - todaySpent;

  // Calculate category spending (using allCategories instead of categories)
  const categorySpending = allCategories.map(cat => {
    const spent = expenses
      .filter(exp => exp.category === cat.category)
      .reduce((sum, exp) => sum + exp.amount, 0);

    const budget = currency === 'EUR' ? cat.monthlyEUR : cat.monthlyIDR;
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;

    return {
      ...cat,
      spent,
      budget,
      remaining: budget - spent,
      percentage
    };
  });

  const handleAddExpense = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Ungültiger Betrag',
        description: 'Bitte gib einen gültigen Betrag ein',
        variant: 'destructive'
      });
      return;
    }

    if (trackingMode === 'category' && !selectedCategory) {
      toast({
        title: 'Kategorie erforderlich',
        description: 'Bitte wähle eine Kategorie aus',
        variant: 'destructive'
      });
      return;
    }

    const newExpense: ExpenseEntry = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      category: trackingMode === 'category' ? selectedCategory : 'Gesamt',
      description: description || '-',
      date: new Date(selectedDate),
      currency
    };

    // TODO: Save to database via API
    try {
      // API call would go here
      setExpenses([...expenses, newExpense]);

      toast({
        title: 'Ausgabe hinzugefügt',
        description: `${newExpense.amount.toLocaleString()} ${currency} für ${newExpense.category}`,
      });

      // Reset form
      setAmount('');
      setDescription('');
      setSelectedCategory('');
      setIsAddingExpense(false);
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Ausgabe konnte nicht gespeichert werden',
        variant: 'destructive'
      });
    }
  };

  const handleCancel = () => {
    setAmount('');
    setDescription('');
    setSelectedCategory('');
    setIsAddingExpense(false);
  };

  const handleAddCustomCategory = () => {
    if (!newCategoryName || !newCategoryBudget || parseFloat(newCategoryBudget) <= 0) {
      toast({
        title: 'Ungültige Eingabe',
        description: 'Bitte gib einen Namen und ein Budget ein',
        variant: 'destructive'
      });
      return;
    }

    const budgetEUR = parseFloat(newCategoryBudget);
    const budgetIDR = budgetEUR * exchangeRate;

    const newCategory = {
      category: newCategoryName,
      subcategory: newCategorySubname || 'Custom',
      monthlyEUR: budgetEUR,
      monthlyIDR: budgetIDR
    };

    setCustomCategories([...customCategories, newCategory]);

    toast({
      title: 'Kategorie hinzugefügt',
      description: `${newCategoryName} mit Budget ${budgetEUR} ${currency === 'EUR' ? 'EUR' : 'IDR'}`,
    });

    // Reset form
    setNewCategoryName('');
    setNewCategorySubname('');
    setNewCategoryBudget('');
    setIsAddingCategory(false);
  };

  const handleDeleteCustomCategory = (categoryName: string) => {
    setCustomCategories(customCategories.filter(cat => cat.category !== categoryName));
    toast({
      title: 'Kategorie gelöscht',
      description: `${categoryName} wurde entfernt`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Daily Overview Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Tagesübersicht - {new Date().toLocaleDateString('de-DE')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="text-sm text-gray-600 mb-1">Tagesbudget</div>
              <div className="text-2xl font-bold text-gray-900">
                {dailyBudget.toLocaleString()} {currency}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="text-sm text-gray-600 mb-1">Heute ausgegeben</div>
              <div className="text-2xl font-bold text-orange-600">
                {todaySpent.toLocaleString()} {currency}
              </div>
            </div>
            <div className={`bg-white rounded-lg p-4 border ${remainingToday >= 0 ? 'border-green-200' : 'border-red-200'}`}>
              <div className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                {remainingToday >= 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Noch verfügbar
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    Überzogen
                  </>
                )}
              </div>
              <div className={`text-2xl font-bold ${remainingToday >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(remainingToday).toLocaleString()} {currency}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Expense Section */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Ausgabe eintragen
            </div>
            {!isAddingExpense && (
              <Button onClick={() => setIsAddingExpense(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Neue Ausgabe
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isAddingExpense ? (
            <div className="space-y-4">
              {/* Tracking Mode Selection */}
              <div>
                <Label>Erfassungsmodus</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={trackingMode === 'category' ? 'default' : 'outline'}
                    onClick={() => setTrackingMode('category')}
                    className="flex-1"
                  >
                    Pro Kategorie
                  </Button>
                  <Button
                    variant={trackingMode === 'total' ? 'default' : 'outline'}
                    onClick={() => setTrackingMode('total')}
                    className="flex-1"
                  >
                    Gesamtsumme
                  </Button>
                </div>
              </div>

              {/* Category Selection (only in category mode) */}
              {trackingMode === 'category' && (
                <div>
                  <Label htmlFor="category">Kategorie</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wähle eine Kategorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories.map((cat, index) => (
                        <SelectItem key={index} value={cat.category}>
                          {cat.category} - {cat.subcategory}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Amount */}
              <div>
                <Label htmlFor="amount">Betrag ({currency})</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              {/* Date */}
              <div>
                <Label htmlFor="date">Datum</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Beschreibung (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="z.B. Einkauf bei Supermarkt"
                  rows={2}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={handleAddExpense} className="flex-1 bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  Speichern
                </Button>
                <Button onClick={handleCancel} variant="outline" className="flex-1">
                  <X className="h-4 w-4 mr-2" />
                  Abbrechen
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Klicke auf "Neue Ausgabe" um eine Ausgabe einzutragen
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Categories Management */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-purple-600" />
              Eigene Kategorien
            </div>
            {!isAddingCategory && (
              <Button onClick={() => setIsAddingCategory(true)} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Neue Kategorie
              </Button>
            )}
          </CardTitle>
          <CardDescription>Füge eigene Ausgabenkategorien hinzu</CardDescription>
        </CardHeader>
        <CardContent>
          {isAddingCategory ? (
            <div className="space-y-4 border-2 border-purple-500 rounded-lg p-4 bg-purple-50">
              <div>
                <Label htmlFor="newCategoryName">Kategorie-Name</Label>
                <Input
                  id="newCategoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="z.B. Hobbies"
                />
              </div>
              <div>
                <Label htmlFor="newCategorySubname">Unterkategorie (optional)</Label>
                <Input
                  id="newCategorySubname"
                  value={newCategorySubname}
                  onChange={(e) => setNewCategorySubname(e.target.value)}
                  placeholder="z.B. Fotografie"
                />
              </div>
              <div>
                <Label htmlFor="newCategoryBudget">Monatliches Budget ({currency === 'EUR' ? 'EUR' : 'IDR'})</Label>
                <Input
                  id="newCategoryBudget"
                  type="number"
                  step="0.01"
                  value={newCategoryBudget}
                  onChange={(e) => setNewCategoryBudget(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddCustomCategory} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  <Save className="h-4 w-4 mr-2" />
                  Speichern
                </Button>
                <Button onClick={() => setIsAddingCategory(false)} variant="outline" className="flex-1">
                  <X className="h-4 w-4 mr-2" />
                  Abbrechen
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {customCategories.length > 0 ? (
                <div className="space-y-2">
                  {customCategories.map((cat, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div>
                        <div className="font-medium">{cat.category}</div>
                        <div className="text-xs text-gray-500">{cat.subcategory}</div>
                        <div className="text-sm text-gray-600">
                          Budget: {cat.monthlyEUR.toLocaleString()} EUR / {cat.monthlyIDR.toLocaleString()} IDR
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDeleteCustomCategory(cat.category)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Noch keine eigenen Kategorien erstellt
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Spending Overview */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Ausgaben nach Kategorie</CardTitle>
          <CardDescription>Monatsübersicht deiner Ausgaben</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categorySpending.map((cat, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{cat.category}</h4>
                    <p className="text-xs text-gray-500">{cat.subcategory}</p>
                  </div>
                  <Badge
                    variant={cat.percentage > 100 ? 'destructive' : cat.percentage > 80 ? 'default' : 'outline'}
                  >
                    {cat.percentage.toFixed(0)}%
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      cat.percentage > 100 ? 'bg-red-600' :
                      cat.percentage > 80 ? 'bg-orange-500' :
                      'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-sm">
                  <div>
                    <span className="text-gray-600">Ausgegeben: </span>
                    <span className="font-semibold">{cat.spent.toLocaleString()} {currency}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Budget: </span>
                    <span className="font-semibold">{cat.budget.toLocaleString()} {currency}</span>
                  </div>
                </div>

                {cat.percentage > 100 && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    Budget überschritten um {(cat.spent - cat.budget).toLocaleString()} {currency}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      {expenses.length > 0 && (
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Letzte Ausgaben</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expenses.slice().reverse().slice(0, 10).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{expense.category}</div>
                    <div className="text-xs text-gray-500">{expense.description}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(expense.date).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-orange-600">
                      -{expense.amount.toLocaleString()} {expense.currency}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
