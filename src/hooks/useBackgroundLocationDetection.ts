'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

interface BaliLocation {
  name: string
  region: string
  costMultiplier: number
  description: string
}

// Bali regions with their cost multipliers
const baliRegions: BaliLocation[] = [
  {
    name: 'Kuta/Seminyak',
    region: 'South Bali',
    costMultiplier: 1.8,
    description: 'Tourist hotspot, high costs'
  },
  {
    name: 'Canggu',
    region: 'South Bali',
    costMultiplier: 1.6,
    description: 'Digital nomad hub, above average costs'
  },
  {
    name: 'Ubud',
    region: 'Central Bali',
    costMultiplier: 1.2,
    description: 'Cultural center, moderate costs'
  },
  {
    name: 'Uluwatu',
    region: 'Bukit Peninsula',
    costMultiplier: 1.7,
    description: 'Cliffside resort area, high costs'
  },
  {
    name: 'Sanur',
    region: 'Southeast Bali',
    costMultiplier: 1.3,
    description: 'Retirement area, moderate costs'
  },
  {
    name: 'Munduk/Bedugul',
    region: 'North Bali',
    costMultiplier: 0.8,
    description: 'Mountain area, lower costs'
  },
  {
    name: 'Amed/Tulamben',
    region: 'East Bali',
    costMultiplier: 0.9,
    description: 'Diving villages, budget-friendly'
  },
  {
    name: 'Nusa Islands',
    region: 'Islands',
    costMultiplier: 1.4,
    description: 'Island life, slightly higher costs'
  },
  {
    name: 'Denpasar',
    region: 'Urban Bali',
    costMultiplier: 1.1,
    description: 'City life, local costs'
  }
]

export function useBackgroundLocationDetection() {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [detectedRegion, setDetectedRegion] = useState<BaliLocation | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countryCode, setCountryCode] = useState<string>('ID')
  const [countryName, setCountryName] = useState<string>('Indonesia')
  const [currency, setCurrency] = useState<string>('IDR')
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  const [city, setCity] = useState<string>('Unknown')
  const [region, setRegion] = useState<string>('Unknown')
  const [postalCode, setPostalCode] = useState<string>('')
  const [timezone, setTimezone] = useState<string>('')
  const [isp, setIsp] = useState<string>('')
  const [org, setOrg] = useState<string>('')
  const [asn, setAsn] = useState<string>('')
  const [deviceType, setDeviceType] = useState<string>('Unknown')
  const [browser, setBrowser] = useState<string>('Unknown')
  const [os, setOs] = useState<string>('Unknown')
  const { toast } = useToast()

  // Detect device information from User Agent
  const detectDeviceInfo = () => {
    const ua = navigator.userAgent

    // Detect Device Type
    let detectedDeviceType = 'Desktop'
    if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
      if (/iPad|Tablet/i.test(ua)) {
        detectedDeviceType = 'Tablet'
      } else {
        detectedDeviceType = 'Mobile'
      }
    }
    setDeviceType(detectedDeviceType)

    // Detect Browser
    let detectedBrowser = 'Unknown'
    if (ua.indexOf('Firefox') > -1) {
      detectedBrowser = 'Firefox'
    } else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) {
      detectedBrowser = 'Opera'
    } else if (ua.indexOf('Trident') > -1) {
      detectedBrowser = 'Internet Explorer'
    } else if (ua.indexOf('Edge') > -1 || ua.indexOf('Edg') > -1) {
      detectedBrowser = 'Edge'
    } else if (ua.indexOf('Chrome') > -1) {
      detectedBrowser = 'Chrome'
    } else if (ua.indexOf('Safari') > -1) {
      detectedBrowser = 'Safari'
    }
    setBrowser(detectedBrowser)

    // Detect OS
    let detectedOS = 'Unknown'
    if (ua.indexOf('Win') > -1) {
      detectedOS = 'Windows'
    } else if (ua.indexOf('Mac') > -1) {
      detectedOS = 'macOS'
    } else if (ua.indexOf('Linux') > -1) {
      detectedOS = 'Linux'
    } else if (ua.indexOf('Android') > -1) {
      detectedOS = 'Android'
    } else if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) {
      detectedOS = 'iOS'
    }
    setOs(detectedOS)

    console.log(`📱 Detected Device:`)
    console.log(`   💻 Type: ${detectedDeviceType}`)
    console.log(`   🌐 Browser: ${detectedBrowser}`)
    console.log(`   🖥️ OS: ${detectedOS}`)
  }

  const detectLocation = async (showUserFeedback: boolean = false) => {
    if (!navigator.geolocation) {
      const errorMsg = 'Geolocation is not supported by this browser'
      setError(errorMsg)
      if (showUserFeedback) {
        toast({
          title: 'Standorterkennung nicht verfügbar',
          description: errorMsg,
          variant: 'destructive'
        })
      }
      return
    }

    setIsDetecting(true)
    setError(null)

    try {
      // High accuracy settings for precise location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000 // 5 minutes cache
          }
        )
      })

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      }

      setLocation(locationData)
      
      // Detect Bali region based on coordinates
      const region = detectBaliRegion(locationData.latitude, locationData.longitude)
      setDetectedRegion(region)

      // Save to backend
      await saveLocationToBackend(locationData, region)

      if (showUserFeedback) {
        toast({
          title: 'Standort aktualisiert',
          description: `Standort erkannt: ${region ? region.name : 'Unbekannt'}`,
        })
      }

    } catch (err) {
      let errorMessage = 'Standorterkennung fehlgeschlagen'
      
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Standortzugriff verweigert'
            break
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Standortinformationen nicht verfügbar'
            break
          case err.TIMEOUT:
            errorMessage = 'Standorterkennung timeout'
            break
        }
      }
      
      setError(errorMessage)
      
      if (showUserFeedback) {
        toast({
          title: 'Fehler bei der Standorterkennung',
          description: errorMessage,
          variant: 'destructive'
        })
      }
    } finally {
      setIsDetecting(false)
    }
  }

  const detectBaliRegion = (lat: number, lng: number): BaliLocation | null => {
    // Bali approximate coordinates
    const baliBounds = {
      north: -8.05,
      south: -8.85,
      east: 115.70,
      west: 114.40
    }

    // Check if in Bali
    if (lat < baliBounds.north && lat > baliBounds.south &&
        lng < baliBounds.east && lng > baliBounds.west) {
      
      // Simple region detection based on coordinates
      if (lat > -8.7 && lng > 115.15) {
        return baliRegions.find(r => r.name === 'Denpasar') || baliRegions[8]
      } else if (lat > -8.8 && lng > 115.1) {
        return baliRegions.find(r => r.name === 'Sanur') || baliRegions[4]
      } else if (lat > -8.65 && lng > 115.12) {
        return baliRegions.find(r => r.name === 'Kuta/Seminyak') || baliRegions[0]
      } else if (lat > -8.62 && lng > 115.08) {
        return baliRegions.find(r => r.name === 'Canggu') || baliRegions[1]
      } else if (lat > -8.5 && lng > 115.25) {
        return baliRegions.find(r => r.name === 'Ubud') || baliRegions[2]
      } else if (lat > -8.85 && lng < 114.5) {
        return baliRegions.find(r => r.name === 'Munduk/Bedugul') || baliRegions[5]
      } else if (lat > -8.3 && lng > 115.6) {
        return baliRegions.find(r => r.name === 'Amed/Tulamben') || baliRegions[6]
      } else if (lat > -8.9 && lng > 115.5) {
        return baliRegions.find(r => r.name === 'Nusa Islands') || baliRegions[7]
      } else if (lat > -8.8 && lng < 115.0) {
        return baliRegions.find(r => r.name === 'Uluwatu') || baliRegions[3]
      }
    }
    
    return null
  }

  const saveLocationToBackend = async (locationData: LocationData, region: BaliLocation | null) => {
    try {
      const response = await fetch('/api/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          accuracy: locationData.accuracy,
          region: region?.name || null,
          costMultiplier: region?.costMultiplier || 1.0,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save location')
      }
    } catch (error) {
      console.error('Error saving location:', error)
    }
  }

  // Auto-detect on hook mount - DISABLED to prevent browser popup
  // User must manually trigger location detection or we use IP-based detection
  useEffect(() => {
    // Detect device info immediately
    detectDeviceInfo()

    // Silent IP-based location detection instead of browser geolocation
    const detectLocationByIP = async () => {
      try {
        // Use IP geolocation API (no browser permission needed)
        const response = await fetch('https://ipapi.co/json/')
        const data = await response.json()

        if (data.latitude && data.longitude) {
          const locationData: LocationData = {
            latitude: data.latitude,
            longitude: data.longitude,
            accuracy: 1000, // IP-based is less accurate
            timestamp: Date.now()
          }

          // Store ALL available location information
          const detectedCountryCode = data.country_code || 'ID'
          const detectedCountryName = data.country_name || 'Indonesia'
          const detectedCurrency = data.currency || 'IDR'
          const detectedCity = data.city || 'Unknown'
          const detectedRegion = data.region || data.region_code || 'Unknown'
          const detectedPostalCode = data.postal || ''
          const detectedTimezone = data.timezone || ''
          const detectedIsp = data.org || ''
          const detectedOrg = data.org || ''
          const detectedAsn = data.asn || ''

          setCountryCode(detectedCountryCode)
          setCountryName(detectedCountryName)
          setCurrency(detectedCurrency)
          setCity(detectedCity)
          setRegion(detectedRegion)
          setPostalCode(detectedPostalCode)
          setTimezone(detectedTimezone)
          setIsp(detectedIsp)
          setOrg(detectedOrg)
          setAsn(detectedAsn)

          console.log(`🌍 Detected Location:`)
          console.log(`   📍 City: ${detectedCity}, ${detectedRegion}`)
          console.log(`   🏳️ Country: ${detectedCountryName} (${detectedCountryCode})`)
          console.log(`   💰 Currency: ${detectedCurrency}`)
          console.log(`   📮 Postal: ${detectedPostalCode}`)
          console.log(`   🕐 Timezone: ${detectedTimezone}`)
          console.log(`   🌐 ISP: ${detectedIsp}`)

          // Fetch exchange rate for detected country
          try {
            const currencyResponse = await fetch(`/api/countries/${detectedCountryCode}`)
            const currencyData = await currencyResponse.json()

            if (currencyData.success && currencyData.country) {
              setExchangeRate(currencyData.country.exchangeRateToEUR)
              console.log(`💱 Exchange Rate: 1 EUR = ${currencyData.country.exchangeRateToEUR} ${detectedCurrency}`)
            }
          } catch (currencyError) {
            console.log('Exchange rate fetch failed, using default', currencyError)
          }

          setLocation(locationData)

          const region = detectBaliRegion(data.latitude, data.longitude)
          setDetectedRegion(region)

          await saveLocationToBackend(locationData, region)
        }
      } catch (error) {
        console.log('IP-based location detection failed (silent)', error)
        // Fail silently - no user notification
      }
    }

    detectLocationByIP()
  }, [])

  return {
    location,
    detectedRegion,
    isDetecting,
    error,
    detectLocation,
    detectBaliRegion,
    countryCode,
    countryName,
    currency,
    exchangeRate,
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
  }
}