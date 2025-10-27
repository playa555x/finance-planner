'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Save, X } from 'lucide-react';

interface EditableBudgetCategoryProps {
  category: any;
  exchangeRate: number;
  onUpdate: (updatedCategory: any) => void;
}

export default function EditableBudgetCategory({
  category,
  exchangeRate,
  onUpdate
}: EditableBudgetCategoryProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMonthlyEUR, setEditedMonthlyEUR] = useState(category.monthlyEUR);
  const Icon = category.icon;

  const handleSave = () => {
    // Recalculate all values based on new monthly EUR
    const newMonthlyEUR = parseFloat(editedMonthlyEUR) || 0;
    const newMonthlyIDR = newMonthlyEUR * exchangeRate;
    const newYearlyEUR = newMonthlyEUR * 12;
    const newYearlyIDR = newMonthlyIDR * 12;

    const updatedCategory = {
      ...category,
      monthlyEUR: newMonthlyEUR,
      monthlyIDR: newMonthlyIDR,
      yearlyEUR: newYearlyEUR,
      yearlyIDR: newYearlyIDR
    };

    onUpdate(updatedCategory);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedMonthlyEUR(category.monthlyEUR);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50 transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${category.color} bg-opacity-20`}>
              <Icon className={`h-4 w-4 ${category.color.replace('bg-', 'text-')}`} />
            </div>
            <div>
              <h4 className="font-medium">{category.category}</h4>
              <p className="text-xs text-gray-500">{category.subcategory}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Monatlich (EUR)
            </label>
            <Input
              type="number"
              step="0.01"
              value={editedMonthlyEUR}
              onChange={(e) => setEditedMonthlyEUR(e.target.value)}
              className="h-9"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-white rounded border">
              <div className="text-gray-500">Monatlich (Lokal)</div>
              <div className="font-semibold">
                {(parseFloat(editedMonthlyEUR) * exchangeRate).toLocaleString()} IDR
              </div>
            </div>
            <div className="p-2 bg-white rounded border">
              <div className="text-gray-500">Jährlich (EUR)</div>
              <div className="font-semibold">
                €{(parseFloat(editedMonthlyEUR) * 12).toLocaleString()}
              </div>
            </div>
          </div>

          <p className="text-xs text-blue-700 italic">{category.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow hover:border-blue-300 group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${category.color} bg-opacity-20`}>
            <Icon className={`h-4 w-4 ${category.color.replace('bg-', 'text-')}`} />
          </div>
          <div>
            <h4 className="font-medium">{category.category}</h4>
            <p className="text-xs text-gray-500">{category.subcategory}</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-2">
        <div>
          <p className="text-xs text-gray-500 mb-1">Monatlich</p>
          <p className="font-semibold">€{category.monthlyEUR.toLocaleString()}</p>
          <p className="text-xs text-gray-400">
            {category.monthlyIDR.toLocaleString()} IDR
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Jährlich</p>
          <p className="font-semibold">€{category.yearlyEUR.toLocaleString()}</p>
          <p className="text-xs text-gray-400">
            {category.yearlyIDR.toLocaleString()} IDR
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-600 italic">{category.description}</p>
    </div>
  );
}
