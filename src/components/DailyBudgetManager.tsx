'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, DollarSign, Edit2, Save, X, Plus } from 'lucide-react';

interface DailyBudget {
  id: string;
  date: number;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  notes?: string;
}

interface DailyBudgetManagerProps {
  userId: string;
  onBudgetUpdate?: (budget: DailyBudget) => void;
}

export default function DailyBudgetManager({ userId, onBudgetUpdate }: DailyBudgetManagerProps) {
  const [budgets, setBudgets] = useState<DailyBudget[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBudgets();
  }, [userId]);

  const fetchBudgets = async () => {
    try {
      const response = await fetch(`/api/daily-budget?userId=${userId}`);
      const data = await response.json();
      if (data.budgets) {
        setBudgets(data.budgets);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  const createOrUpdateBudget = async () => {
    if (!budgetAmount) return;

    setLoading(true);
    try {
      const response = await fetch('/api/daily-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          date: selectedDate,
          budgetAmount: parseFloat(budgetAmount),
          notes
        })
      });

      const data = await response.json();
      if (data.budget) {
        await fetchBudgets();
        setBudgetAmount('');
        setNotes('');
        onBudgetUpdate?.(data.budget);
      }
    } catch (error) {
      console.error('Error creating/updating budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBudget = async (id: string, amount: number, notes?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/daily-budget', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, budgetAmount: amount, notes })
      });

      const data = await response.json();
      if (data.budget) {
        await fetchBudgets();
        setEditingId(null);
        onBudgetUpdate?.(data.budget);
      }
    } catch (error) {
      console.error('Error updating budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('de-DE');
  };

  const getTodayBudget = () => {
    const today = new Date().toDateString();
    return budgets.find(b => new Date(b.date).toDateString() === today);
  };

  const getWeekBudgets = () => {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    
    return budgets.filter(b => {
      const budgetDate = new Date(b.date);
      return budgetDate >= weekStart && budgetDate <= weekEnd;
    });
  };

  const todayBudget = getTodayBudget();
  const weekBudgets = getWeekBudgets();
  const weekTotal = weekBudgets.reduce((sum, b) => sum + b.budgetAmount, 0);
  const weekSpent = weekBudgets.reduce((sum, b) => sum + b.spentAmount, 0);

  return (
    <div className="space-y-6">
      {/* Heute's Budget */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <CalendarDays className="h-5 w-5" />
            Heute's Budget
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayBudget ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Budget</p>
                  <p className="text-lg font-semibold text-blue-600">
                    €{todayBudget.budgetAmount.toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Ausgegeben</p>
                  <p className="text-lg font-semibold text-red-600">
                    €{todayBudget.spentAmount.toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Verbleibend</p>
                  <p className={`text-lg font-semibold ${todayBudget.remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    €{todayBudget.remainingAmount.toFixed(2)}
                  </p>
                </div>
              </div>
              {todayBudget.notes && (
                <p className="text-sm text-gray-600 italic">{todayBudget.notes}</p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingId(todayBudget.id)}
                className="w-full"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Bearbeiten
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-4">Kein Budget für heute festgelegt</p>
              <Button onClick={() => setEditingId('new')} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Budget erstellen
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wochenübersicht */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Wochenübersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Wochenbudget</p>
              <p className="text-xl font-bold text-gray-800">€{weekTotal.toFixed(2)}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Ausgegeben</p>
              <p className="text-xl font-bold text-red-600">€{weekSpent.toFixed(2)}</p>
            </div>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {weekBudgets.map(budget => (
              <div key={budget.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">{formatDate(budget.date)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">€{budget.budgetAmount.toFixed(2)}</span>
                  <Badge variant={budget.remainingAmount >= 0 ? 'default' : 'destructive'}>
                    {budget.remainingAmount >= 0 ? 'OK' : 'Überzogen'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Budget erstellen/bearbeiten */}
      {(editingId === 'new' || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingId === 'new' ? 'Budget erstellen' : 'Budget bearbeiten'}
              <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="date">Datum</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="amount">Betrag (€)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notizen</Label>
              <Textarea
                id="notes"
                placeholder="Optionale Notizen..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={createOrUpdateBudget} 
                disabled={loading || !budgetAmount}
                className="flex-1"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {editingId === 'new' ? 'Erstellen' : 'Speichern'}
              </Button>
              <Button variant="outline" onClick={() => setEditingId(null)}>
                Abbrechen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}