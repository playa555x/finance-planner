'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  X,
  ArrowRight,
  Calculator,
  Edit,
  Save,
  TrendingUp,
  CheckCircle,
  Sparkles,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: any;
  action?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: 'Willkommen! 🎉',
    description: 'Lass uns gemeinsam deinen ersten Finanzplan erstellen. Es dauert nur 2 Minuten!',
    icon: Sparkles,
  },
  {
    id: 2,
    title: 'Schritt 1: Budget wählen',
    description: 'Wähle dein gewünschtes Lifestyle-Level (Budget, Comfort oder Premium), Dauer und Anzahl der Personen.',
    icon: Calculator,
    action: 'Wähle deine Parameter im Formular links'
  },
  {
    id: 3,
    title: 'Schritt 2: Plan erstellen',
    description: 'Klicke auf "Finanzplan erstellen" um deinen personalisierten Budget-Plan zu generieren.',
    icon: ArrowRight,
    action: 'Klicke auf den blauen "Erstellen" Button'
  },
  {
    id: 4,
    title: 'Schritt 3: Details anpassen',
    description: 'Jetzt kannst du einzelne Kategorien (Unterkunft, Essen, Transport etc.) individuell anpassen. Klicke einfach auf eine Kategorie!',
    icon: Edit,
    action: 'Klicke auf eine Budget-Kategorie zum Bearbeiten'
  },
  {
    id: 5,
    title: 'Schritt 4: Speichern',
    description: 'Vergiss nicht, deine Änderungen zu speichern! Dein Plan wird dann in der Datenbank gespeichert.',
    icon: Save,
    action: 'Klicke auf "Speichern"'
  },
  {
    id: 6,
    title: 'Schritt 5: Ausgaben tracken',
    description: 'Ab jetzt kannst du täglich deine Ausgaben eintragen - entweder pro Kategorie oder als Gesamtsumme. So behältst du immer den Überblick!',
    icon: TrendingUp,
    action: 'Wechsle zum "Ausgaben" Tab'
  },
  {
    id: 7,
    title: 'Fertig! ✅',
    description: 'Du bist startklar! Dein Budget-Plan ist aktiv und du kannst jetzt deine Finanzen verwalten.',
    icon: CheckCircle,
  }
];

interface OnboardingTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingTutorial({ onComplete, onSkip }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const CurrentIcon = ONBOARDING_STEPS[currentStep].icon;

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete();
  };

  const handleSkipAll = () => {
    setIsVisible(false);
    onSkip();
  };

  if (!isVisible) return null;

  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  // Minimized View
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-3 rounded-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
        >
          <CurrentIcon className="h-5 w-5" />
          <span className="font-semibold text-sm">Tutorial ({currentStep + 1}/{ONBOARDING_STEPS.length})</span>
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-slide-in">
      <Card className="border-2 border-blue-500 shadow-2xl">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-t-lg relative">
            <div className="absolute top-3 right-3 flex gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                title="Minimieren"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={handleSkipAll}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                title="Tutorial schließen"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/20 rounded-full">
                <CurrentIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs opacity-90">Schritt {currentStep + 1}/{ONBOARDING_STEPS.length}</div>
                <h2 className="text-lg font-bold">{ONBOARDING_STEPS[currentStep].title}</h2>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-1.5">
              <div
                className="bg-white h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <p className="text-sm text-gray-700 mb-4">
              {ONBOARDING_STEPS[currentStep].description}
            </p>

            {ONBOARDING_STEPS[currentStep].action && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <div className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold text-blue-900 mb-0.5">Jetzt:</div>
                    <div className="text-blue-800 text-xs">{ONBOARDING_STEPS[currentStep].action}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Step Indicators */}
            <div className="flex justify-center gap-1.5 mb-4">
              {ONBOARDING_STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentStep
                      ? 'bg-blue-600 w-6'
                      : index < currentStep
                      ? 'bg-green-500 w-1.5'
                      : 'bg-gray-300 w-1.5'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex-1 text-sm py-2"
                size="sm"
              >
                Zurück
              </Button>

              {currentStep < ONBOARDING_STEPS.length - 1 ? (
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-sm py-2"
                  size="sm"
                >
                  Weiter
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-sm py-2"
                  size="sm"
                >
                  Fertig! 🚀
                </Button>
              )}
            </div>

            <button
              onClick={handleSkipAll}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-700 mt-3"
            >
              Tutorial überspringen
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
