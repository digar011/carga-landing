// Google Maps Platform client scaffold
// Configure with NEXT_PUBLIC_GOOGLE_MAPS_KEY environment variable

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

interface TGeocodingResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

interface TDistanceResult {
  distanceKm: number;
  durationHours: number;
  durationText: string;
}

/**
 * Geocode a city/address to lat/lng coordinates
 */
export async function geocodeAddress(
  address: string
): Promise<TGeocodingResult | null> {
  if (!API_KEY) {
    console.warn('[GoogleMaps] No API key — geocoding disabled');
    return null;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address + ', Argentina')}&key=${API_KEY}&language=es`
    );

    const data = await response.json();

    if (data.status !== 'OK' || !data.results?.[0]) {
      return null;
    }

    const result = data.results[0];
    return {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      formattedAddress: result.formatted_address,
    };
  } catch (error) {
    console.error('[GoogleMaps] Geocoding error:', error);
    return null;
  }
}

/**
 * Calculate distance and duration between two points
 */
export async function calculateDistance(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): Promise<TDistanceResult | null> {
  if (!API_KEY) {
    console.warn('[GoogleMaps] No API key — distance calculation disabled');
    return null;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLng}&destinations=${destLat},${destLng}&key=${API_KEY}&language=es&units=metric`
    );

    const data = await response.json();

    if (data.status !== 'OK' || !data.rows?.[0]?.elements?.[0]) {
      return null;
    }

    const element = data.rows[0].elements[0];

    if (element.status !== 'OK') {
      return null;
    }

    const distanceKm = Math.round(element.distance.value / 1000);
    const durationSeconds = element.duration.value;
    const durationHours = Math.round((durationSeconds / 3600) * 10) / 10;

    return {
      distanceKm,
      durationHours,
      durationText: element.duration.text,
    };
  } catch (error) {
    console.error('[GoogleMaps] Distance calculation error:', error);
    return null;
  }
}

// Argentine province coordinates for default map centers
export const PROVINCE_CENTERS = {
  'Buenos Aires': { lat: -34.6037, lng: -58.3816 },
  'Córdoba': { lat: -31.4201, lng: -64.1888 },
  'Rosario': { lat: -32.9468, lng: -60.6393 },
  'Mendoza': { lat: -32.8895, lng: -68.8458 },
  'Tucumán': { lat: -26.8083, lng: -65.2176 },
  'Santa Fe': { lat: -31.6107, lng: -60.6973 },
  'Mar del Plata': { lat: -38.0055, lng: -57.5426 },
} as const;
