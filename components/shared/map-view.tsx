'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { TLoad } from '@/types/database';
import { useGoogleMaps } from '@/hooks/use-google-maps';
import { Spinner } from '@/components/ui/spinner';
import { formatARS } from '@/utils/format';
import { CARGO_TYPE_LABELS } from '@/utils/constants';

interface TMapViewProps {
  loads: TLoad[];
  onLoadSelect?: (load: TLoad) => void;
}

const ARGENTINA_CENTER = { lat: -34.6, lng: -64.3 };
const ARGENTINA_ZOOM = 5;

/**
 * Google Maps wrapper component for displaying loads on a map.
 * Loads the Google Maps JS API via dynamic script tag.
 * Places markers at each load's origin coordinates with InfoWindows.
 */
export function MapView({ loads, onLoadSelect }: TMapViewProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Initialize the map once Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || mapInstanceRef.current) return;

    mapInstanceRef.current = new google.maps.Map(mapContainerRef.current, {
      center: ARGENTINA_CENTER,
      zoom: ARGENTINA_ZOOM,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    infoWindowRef.current = new google.maps.InfoWindow();
  }, [isLoaded]);

  // Place/update markers when loads change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    loads.forEach((load) => {
      if (!load.origen_lat || !load.origen_lng) return;

      const marker = new google.maps.Marker({
        position: { lat: load.origen_lat, lng: load.origen_lng },
        map,
        title: `${load.origen_ciudad} → ${load.destino_ciudad}`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#C9922A',
          fillOpacity: 0.9,
          strokeColor: '#1A3C5E',
          strokeWeight: 2,
        },
      });

      marker.addListener('click', () => {
        const cargoLabel = CARGO_TYPE_LABELS[load.tipo_carga] ?? load.tipo_carga;

        const content = `
          <div style="font-family: Inter, system-ui, sans-serif; min-width: 200px; padding: 4px;">
            <h3 style="margin: 0 0 6px; font-size: 14px; font-weight: 700; color: #1A3C5E;">
              ${load.origen_ciudad} → ${load.destino_ciudad}
            </h3>
            <p style="margin: 0 0 4px; font-size: 12px; color: #6B7280;">
              ${cargoLabel} · ${load.peso_tn} tn
            </p>
            <p style="margin: 0 0 8px; font-size: 15px; font-weight: 700; color: #16A34A;">
              ${formatARS(load.tarifa_ars)}
            </p>
            <a href="/t-cargas/${load.id}"
               style="display: inline-block; font-size: 12px; font-weight: 600; color: #C9922A; text-decoration: none;">
              Ver detalle →
            </a>
          </div>
        `;

        infoWindowRef.current?.setContent(content);
        infoWindowRef.current?.open(map, marker);

        onLoadSelect?.(load);
      });

      markersRef.current.push(marker);
    });
  }, [loads, isLoaded, onLoadSelect]);

  const handleMyLocation = useCallback(() => {
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError('Tu navegador no soporta geolocalización.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        mapInstanceRef.current?.setCenter({ lat: latitude, lng: longitude });
        mapInstanceRef.current?.setZoom(10);
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeoError('Permiso de ubicación denegado.');
            break;
          case err.POSITION_UNAVAILABLE:
            setGeoError('No se pudo obtener tu ubicación.');
            break;
          case err.TIMEOUT:
            setGeoError('La solicitud de ubicación expiró.');
            break;
          default:
            setGeoError('Error al obtener ubicación.');
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  // No API key fallback
  if (loadError) {
    return (
      <div className="flex min-h-[500px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
        <div className="text-center px-4">
          <span className="text-4xl">🗺️</span>
          <p className="mt-3 text-sm text-gray-600">
            {loadError.includes('NEXT_PUBLIC_GOOGLE_MAPS_KEY')
              ? 'Configurá NEXT_PUBLIC_GOOGLE_MAPS_KEY para ver el mapa'
              : loadError}
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex min-h-[500px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-gray-500">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[500px] w-full">
      <div ref={mapContainerRef} className="h-full w-full rounded-lg" />

      {/* Mi ubicación button */}
      <button
        type="button"
        onClick={handleMyLocation}
        className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-navy/90 active:bg-navy/80"
        aria-label="Centrar en mi ubicación"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
        Mi ubicación
      </button>

      {/* Geolocation error toast */}
      {geoError && (
        <div className="absolute bottom-16 right-4 z-10 max-w-xs rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 shadow-md">
          {geoError}
        </div>
      )}
    </div>
  );
}
