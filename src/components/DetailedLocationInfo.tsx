'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Globe,
  DollarSign,
  Clock,
  Wifi,
  Building2,
  Navigation,
  Mail,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';

interface DetailedLocationInfoProps {
  city: string;
  region: string;
  countryName: string;
  countryCode: string;
  currency: string;
  exchangeRate: number | null;
  timezone: string;
  postalCode: string;
  isp: string;
  latitude?: number;
  longitude?: number;
  deviceType?: string;
  browser?: string;
  os?: string;
}

export default function DetailedLocationInfo({
  city,
  region,
  countryName,
  countryCode,
  currency,
  exchangeRate,
  timezone,
  postalCode,
  isp,
  latitude,
  longitude,
  deviceType,
  browser,
  os
}: DetailedLocationInfoProps) {
  // Get icon for device type
  const getDeviceIcon = () => {
    if (deviceType === 'Mobile') return Smartphone
    if (deviceType === 'Tablet') return Tablet
    return Monitor
  }
  const DeviceIcon = getDeviceIcon()
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-blue-600" />
          Ihr erkannter Standort
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* City & Region */}
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-medium text-slate-500">Stadt & Region</span>
            </div>
            <div className="text-base font-semibold text-slate-900">
              {city}, {region}
            </div>
          </div>

          {/* Country */}
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-medium text-slate-500">Land</span>
            </div>
            <div className="text-base font-semibold text-slate-900 flex items-center gap-2">
              {countryName}
              <Badge variant="outline" className="text-xs">
                {countryCode}
              </Badge>
            </div>
          </div>

          {/* Currency */}
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-medium text-slate-500">Währung</span>
            </div>
            <div className="text-base font-semibold text-slate-900">
              {currency}
            </div>
            {exchangeRate && currency !== 'EUR' && (
              <div className="text-xs text-slate-500 mt-1">
                1 EUR = {exchangeRate.toLocaleString()} {currency}
              </div>
            )}
            {currency === 'EUR' && (
              <div className="text-xs text-slate-500 mt-1">
                1 EUR = 1 EUR
              </div>
            )}
          </div>

          {/* Timezone */}
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-medium text-slate-500">Zeitzone</span>
            </div>
            <div className="text-base font-semibold text-slate-900">
              {timezone || 'Nicht verfügbar'}
            </div>
            {timezone && (
              <div className="text-xs text-slate-500 mt-1">
                {new Date().toLocaleTimeString('de-DE', { timeZone: timezone })}
              </div>
            )}
          </div>

          {/* Postal Code */}
          {postalCode && (
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="h-4 w-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-500">Postleitzahl</span>
              </div>
              <div className="text-base font-semibold text-slate-900">
                {postalCode}
              </div>
            </div>
          )}

          {/* Coordinates */}
          {latitude && longitude && (
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <Navigation className="h-4 w-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-500">Koordinaten</span>
              </div>
              <div className="text-xs font-mono text-slate-900">
                {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
              </div>
            </div>
          )}

          {/* ISP */}
          {isp && (
            <div className="p-3 bg-white rounded-lg border border-slate-200 md:col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <Wifi className="h-4 w-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-500">Internetanbieter</span>
              </div>
              <div className="text-sm text-slate-900">
                {isp}
              </div>
            </div>
          )}
        </div>

        {/* Device Information Section */}
        {(deviceType || browser || os) && (
          <div className="mt-4">
            <div className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-2">
              <DeviceIcon className="h-4 w-4" />
              Geräteinformationen
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Device Type */}
              {deviceType && (
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 mb-1">
                    <DeviceIcon className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-medium text-slate-500">Gerätetyp</span>
                  </div>
                  <div className="text-base font-semibold text-slate-900">
                    {deviceType}
                  </div>
                </div>
              )}

              {/* Browser */}
              {browser && (
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-medium text-slate-500">Browser</span>
                  </div>
                  <div className="text-base font-semibold text-slate-900">
                    {browser}
                  </div>
                </div>
              )}

              {/* Operating System */}
              {os && (
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Monitor className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-medium text-slate-500">Betriebssystem</span>
                  </div>
                  <div className="text-base font-semibold text-slate-900">
                    {os}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detection Method Notice */}
        <div className="text-xs text-slate-500 text-center p-2 bg-blue-50 rounded-lg border border-blue-100 mt-4">
          🌐 Standort wurde automatisch über IP-Geolokalisierung erkannt (keine GPS-Berechtigung erforderlich)
        </div>
      </CardContent>
    </Card>
  );
}
