'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Locate, RefreshCw, Info } from 'lucide-react';
import { useBackgroundLocationDetection } from '@/hooks/useBackgroundLocationDetection';

interface LocationData {
  name: string;
  baseMultiplier: number;
  description: string;
  categories: {
    housing: number;
    food: number;
    transportation: number;
    utilities: number;
    healthcare: number;
    entertainment: number;
  };
}

interface LocationDetectorProps {
  onLocationChange?: (location: LocationData) => void;
  initialLocation?: string;
}

const BALI_LOCATIONS = [
  { value: 'ubud', label: 'Ubud - Kulturelles Zentrum' },
  { value: 'canggu', label: 'Canggu - Digital Nomad Hotspot' },
  { value: 'seminyak', label: 'Seminyak - Luxuriös' },
  { value: 'kuta', label: 'Kuta - Touristenbereich' },
  { value: 'sanur', label: 'Sanur - Familienfreundlich' },
  { value: 'nunggulan', label: 'Nunggulan - Ländlich' },
  { value: 'pererenan', label: 'Pererenan - Aufstrebend' }
];

export default function LocationDetector({ onLocationChange, initialLocation }: LocationDetectorProps) {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || 'ubud');
  const [loading, setLoading] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Background location detection hook
  const { 
    location: backgroundLocation, 
    detectedRegion, 
    isDetecting: backgroundDetecting
  } = useBackgroundLocationDetection();

  useEffect(() => {
    fetchLocationData(selectedLocation);
  }, [selectedLocation]);

  // Update UI when background detection completes
  useEffect(() => {
    if (backgroundLocation && detectedRegion) {
      setCoordinates({ lat: backgroundLocation.latitude, lng: backgroundLocation.longitude });
      setDetectedLocation(true);
      
      // Try to match detected region with available locations
      const matchedLocation = findMatchingLocation(detectedRegion.name);
      if (matchedLocation) {
        setSelectedLocation(matchedLocation);
        fetchLocationData(matchedLocation);
      }
    }
  }, [backgroundLocation, detectedRegion]);

  const findMatchingLocation = (regionName: string): string | null => {
    const regionLower = regionName.toLowerCase();
    if (regionLower.includes('ubud')) return 'ubud';
    if (regionLower.includes('canggu')) return 'canggu';
    if (regionLower.includes('seminyak')) return 'seminyak';
    if (regionLower.includes('kuta')) return 'kuta';
    if (regionLower.includes('sanur')) return 'sanur';
    if (regionLower.includes('nunggulan')) return 'nunggulan';
    if (regionLower.includes('pererenan')) return 'pererenan';
    return null;
  };

  const fetchLocationData = async (location: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/location?location=${location}`);
      const data = await response.json();
      
      if (data.location) {
        setCurrentLocation(data.location);
        setDetectedLocation(data.detected || false);
        onLocationChange?.(data.location);
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
      setError('Standortdaten konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      housing: '🏠',
      food: '🍽️',
      transportation: '🛵',
      utilities: '💡',
      healthcare: '🏥',
      entertainment: '🎉'
    };
    return icons[category] || '📊';
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      housing: 'Wohnen',
      food: 'Essen',
      transportation: 'Transport',
      utilities: 'Dienstleistungen',
      healthcare: 'Gesundheit',
      entertainment: 'Unterhaltung'
    };
    return labels[category] || category;
  };

  return (
    <div className="space-y-6">
      {/* Standorterkennung */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <MapPin className="h-5 w-5" />
            Standortbasierte Kosten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status der automatischen Erkennung - SILENT MODE */}
          {detectedRegion && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <Locate className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-800">
                Erkannte Region: <span className="font-medium">{detectedRegion?.name}</span>
              </p>
            </div>
          )}

          {/* Manuelle Auswahl */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Standort manuell wählen:</label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Standort wählen" />
              </SelectTrigger>
              <SelectContent>
                {BALI_LOCATIONS.map(location => (
                  <SelectItem key={location.value} value={location.value}>
                    {location.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <Info className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {coordinates && (
            <div className="text-xs text-gray-500">
              Koordinaten: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              {detectedRegion && (
                <span className="ml-2 text-green-600">
                  • Region: {detectedRegion.name} ({detectedRegion.costMultiplier.toFixed(1)}x)
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Aktuelle Standortinformationen */}
      {currentLocation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {currentLocation.name}
              {detectedLocation && (
                <Badge variant="secondary" className="text-xs">
                  Automatisch erkannt
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-gray-600">{currentLocation.description}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Basis-Multiplikator */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Basis-Kostenmultiplikator</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {currentLocation.baseMultiplier.toFixed(1)}x
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {currentLocation.baseMultiplier < 1 
                    ? 'Günstiger als Durchschnitt' 
                    : currentLocation.baseMultiplier > 1 
                    ? 'Teurer als Durchschnitt' 
                    : 'Durchschnittliche Kosten'
                  }
                </p>
              </div>

              {/* Kategorie-Details */}
              <div className="space-y-3">
                <h4 className="font-medium">Kosten nach Kategorien:</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(currentLocation.categories).map(([category, multiplier]) => (
                    <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCategoryIcon(category)}</span>
                        <span className="text-sm font-medium">{getCategoryLabel(category)}</span>
                      </div>
                      <Badge 
                        variant={multiplier < 1 ? 'secondary' : multiplier > 1.2 ? 'destructive' : 'default'}
                        className="text-xs"
                      >
                        {multiplier.toFixed(1)}x
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Erklärung */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Wie funktioniert das?</p>
                    <p className="text-xs">
                      Die Multiplikatoren zeigen, wie viel teurer oder günstiger die Lebenshaltungskosten 
                      in diesem Bereich im Vergleich zum bali-weiten Durchschnitt sind. 
                      Diese Werte werden automatisch in Ihre Budgetberechnungen einbezogen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}