'use client';

import { useEffect, useRef, useState } from 'react';

interface TUseGoogleMapsReturn {
  isLoaded: boolean;
  loadError: string | null;
}

const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-script';

/**
 * Hook to load the Google Maps JavaScript API via dynamic script tag.
 * Uses NEXT_PUBLIC_GOOGLE_MAPS_KEY environment variable.
 * Ensures the script is only appended once across multiple component instances.
 */
export function useGoogleMaps(): TUseGoogleMapsReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const attemptedRef = useRef(false);

  useEffect(() => {
    // Already loaded globally
    if (typeof window !== 'undefined' && window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!apiKey) {
      setLoadError('NEXT_PUBLIC_GOOGLE_MAPS_KEY no configurada');
      return;
    }

    // Script already in DOM (another instance added it)
    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
    if (existingScript) {
      const checkLoaded = () => {
        if (window.google?.maps) {
          setIsLoaded(true);
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    // Prevent duplicate script additions from StrictMode double-mount
    if (attemptedRef.current) return;
    attemptedRef.current = true;

    const script = document.createElement('script');
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&language=es&region=AR`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoaded(true);
    };

    script.onerror = () => {
      setLoadError('Error al cargar Google Maps. Verificá tu conexion a internet.');
    };

    document.head.appendChild(script);
  }, []);

  return { isLoaded, loadError };
}
