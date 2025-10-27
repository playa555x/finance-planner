'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Building2, Plus, Edit2, Trash2, Save, X, Calendar } from 'lucide-react';

interface FixedCost {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: 'monthly' | 'yearly' | 'onetime';
  startDate: number;
  endDate?: number;
  isActive: boolean;
  description?: string;
}

interface FixedCostsManagerProps {
  userId: string;
  onFixedCostUpdate?: () => void;
}

const FIXED_COST_CATEGORIES = [
  'Miete',
  'Versicherungen',
  'Schulden',
  'Abonnements',
  'Steuern',
  'Investitionen',
  'Haustiere',
  'Visa & Dokumente',
  'Sonstiges'
];

const FREQUENCIES = [
  { value: 'monthly', label: 'Monatlich' },
  { value: 'yearly', label: 'Jährlich' },
  { value: 'onetime', label: 'Einmalig' }
];

export default function FixedCostsManager({ userId, onFixedCostUpdate }: FixedCostsManagerProps) {
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [frequency, setFrequency] = useState<'monthly' | 'yearly' | 'onetime'>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchFixedCosts();
  }, [userId]);

  const fetchFixedCosts = async () => {
    try {
      const response = await fetch(`/api/fixed-costs?userId=${userId}`);
      const data = await response.json();
      if (data.fixedCosts) {
        setFixedCosts(data.fixedCosts);
      }
    } catch (error) {
      console.error('Error fetching fixed costs:', error);
    }
  };

  const createFixedCost = async () => {
    if (!name || !amount || !category || !frequency || !startDate) return;

    setLoading(true);
    try {
      const response = await fetch('/api/fixed-costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name,
          amount: parseFloat(amount),
          category,
          frequency,
          startDate,
          endDate: endDate || null,
          description
        })
      });

      const data = await response.json();
      if (data.fixedCost) {
        await fetchFixedCosts();
        resetForm();
        setShowAddForm(false);
        onFixedCostUpdate?.();
      }
    } catch (error) {
      console.error('Error creating fixed cost:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFixedCost = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/fixed-costs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name,
          amount: parseFloat(amount),
          category,
          frequency,
          endDate: endDate || null,
          isActive,
          description
        })
      });

      const data = await response.json();
      if (data.fixedCost) {
        await fetchFixedCosts();
        setEditingId(null);
        resetForm();
        onFixedCostUpdate?.();
      }
    } catch (error) {
      console.error('Error updating fixed cost:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteFixedCost = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/fixed-costs?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchFixedCosts();
        onFixedCostUpdate?.();
      }
    } catch (error) {
      console.error('Error deleting fixed cost:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFixedCost = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const response = await fetch('/api/fixed-costs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          isActive: !currentStatus
        })
      });

      if (response.ok) {
        await fetchFixedCosts();
        onFixedCostUpdate?.();
      }
    } catch (error) {
      console.error('Error toggling fixed cost:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setAmount('');
    setCategory('');
    setFrequency('monthly');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setIsActive(true);
    setDescription('');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('de-DE');
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Miete': 'bg-blue-100 text-blue-800',
      'Versicherungen': 'bg-green-100 text-green-800',
      'Schulden': 'bg-red-100 text-red-800',
      'Abonnements': 'bg-purple-100 text-purple-800',
      'Steuern': 'bg-yellow-100 text-yellow-800',
      'Investitionen': 'bg-indigo-100 text-indigo-800',
      'Haustiere': 'bg-pink-100 text-pink-800',
      'Visa & Dokumente': 'bg-gray-100 text-gray-800',
      'Sonstiges': 'bg-slate-100 text-slate-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getFrequencyLabel = (freq: string) => {
    const labels: { [key: string]: string } = {
      'monthly': 'Monatlich',
      'yearly': 'Jährlich',
      'onetime': 'Einmalig'
    };
    return labels[freq] || freq;
  };

  const activeCosts = fixedCosts.filter(cost => cost.isActive);
  const monthlyTotal = activeCosts
    .filter(cost => cost.frequency === 'monthly')
    .reduce((sum, cost) => sum + cost.amount, 0);
  const yearlyTotal = activeCosts
    .filter(cost => cost.frequency === 'yearly')
    .reduce((sum, cost) => sum + cost.amount, 0);
  const monthlyFromYearly = yearlyTotal / 12;
  const totalMonthly = monthlyTotal + monthlyFromYearly;

  return (
    <div className="space-y-6">
      {/* Zusammenfassung */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Building2 className="h-5 w-5" />
            Fixkosten Übersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Monatlich</p>
              <p className="text-xl font-bold text-green-600">€{monthlyTotal.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Jährlich</p>
              <p className="text-xl font-bold text-blue-600">€{yearlyTotal.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total/Monat</p>
              <p className="text-xl font-bold text-emerald-600">€{totalMonthly.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fixkosten hinzufügen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Fixkosten verwalten</span>
            <Button 
              size="sm" 
              onClick={() => setShowAddForm(!showAddForm)}
              className={showAddForm ? 'bg-red-500 hover:bg-red-600' : ''}
            >
              {showAddForm ? (
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Abbrechen
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Fixkosten hinzufügen
                </div>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        
        {(showAddForm || editingId) && (
          <CardContent className="space-y-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="z.B. Miete Wohnung"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="amount">Betrag (€)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Kategorie</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {FIXED_COST_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="frequency">Häufigkeit</Label>
                <Select value={frequency} onValueChange={(value: any) => setFrequency(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map(freq => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Startdatum</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">Enddatum (optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Beschreibung (optional)</Label>
              <Textarea
                id="description"
                placeholder="Zusätzliche Informationen..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            {editingId && (
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="isActive">Aktiv</Label>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={() => editingId ? updateFixedCost(editingId) : createFixedCost()} 
                disabled={loading || !name || !amount || !category || !frequency || !startDate}
                className="flex-1"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {editingId ? 'Aktualisieren' : 'Erstellen'}
              </Button>
              <Button variant="outline" onClick={() => {
                setShowAddForm(false);
                setEditingId(null);
                resetForm();
              }}>
                Abbrechen
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Fixkostenliste */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Fixkosten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {fixedCosts.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Keine Fixkosten erfasst</p>
            ) : (
              fixedCosts.map(cost => (
                <div key={cost.id} className={`p-4 rounded-lg border ${cost.isActive ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(cost.category)}>
                        {cost.category}
                      </Badge>
                      <Badge variant="outline">
                        {getFrequencyLabel(cost.frequency)}
                      </Badge>
                      {!cost.isActive && (
                        <Badge variant="secondary">Inaktiv</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={cost.isActive}
                        onCheckedChange={() => toggleFixedCost(cost.id, cost.isActive)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingId(cost.id);
                          setName(cost.name);
                          setAmount(cost.amount.toString());
                          setCategory(cost.category);
                          setFrequency(cost.frequency);
                          setEndDate(cost.endDate ? new Date(cost.endDate).toISOString().split('T')[0] : '');
                          setIsActive(cost.isActive);
                          setDescription(cost.description || '');
                          setShowAddForm(false);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteFixedCost(cost.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">{cost.name}</h4>
                      <p className="text-2xl font-bold text-green-600">€{cost.amount.toFixed(2)}</p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Start: {formatDate(cost.startDate)}</span>
                      </div>
                      {cost.endDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Ende: {formatDate(cost.endDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {cost.description && (
                    <p className="text-sm text-gray-600 mt-2">{cost.description}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}