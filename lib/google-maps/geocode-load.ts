import {
  geocodeAddress,
  calculateDistance,
  PROVINCE_CENTERS,
} from '@/lib/google-maps/client';

interface TGeocodeLoadResult {
  origen_lat: number;
  origen_lng: number;
  destino_lat: number;
  destino_lng: number;
  distancia_km: number | null;
}

/**
 * Geocode origin and destination cities for a load.
 * Falls back to province center coordinates if geocoding fails.
 * Calculates road distance between origin and destination.
 */
export async function geocodeLoadCities(
  origenCiudad: string,
  origenProvincia: string,
  destinoCiudad: string,
  destinoProvincia: string,
): Promise<TGeocodeLoadResult> {
  // Geocode origin
  const origenResult = await geocodeAddress(`${origenCiudad}, ${origenProvincia}`);
  const origenFallback = getProvinceFallback(origenProvincia);

  const origen_lat = origenResult?.lat ?? origenFallback.lat;
  const origen_lng = origenResult?.lng ?? origenFallback.lng;

  // Geocode destination
  const destinoResult = await geocodeAddress(`${destinoCiudad}, ${destinoProvincia}`);
  const destinoFallback = getProvinceFallback(destinoProvincia);

  const destino_lat = destinoResult?.lat ?? destinoFallback.lat;
  const destino_lng = destinoResult?.lng ?? destinoFallback.lng;

  // Calculate distance
  let distancia_km: number | null = null;

  const distanceResult = await calculateDistance(
    origen_lat,
    origen_lng,
    destino_lat,
    destino_lng,
  );

  if (distanceResult) {
    distancia_km = distanceResult.distanceKm;
  }

  return {
    origen_lat,
    origen_lng,
    destino_lat,
    destino_lng,
    distancia_km,
  };
}

/**
 * Get fallback coordinates from PROVINCE_CENTERS.
 * Defaults to Buenos Aires if province not found.
 */
function getProvinceFallback(provincia: string): { lat: number; lng: number } {
  const centers = PROVINCE_CENTERS as Record<string, { lat: number; lng: number }>;
  return centers[provincia] ?? { lat: -34.6037, lng: -58.3816 };
}
