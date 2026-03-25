/**
 * Minimal Google Maps JavaScript API type declarations.
 * Only covers the subset used by the CarGA map components.
 * If @types/google.maps is installed later, this file can be removed.
 */

/* eslint-disable @typescript-eslint/no-namespace */

declare namespace google.maps {
  class Map {
    constructor(mapDiv: HTMLElement, opts?: MapOptions);
    setCenter(latlng: LatLngLiteral): void;
    setZoom(zoom: number): void;
  }

  class Marker {
    constructor(opts?: MarkerOptions);
    setMap(map: Map | null): void;
    addListener(eventName: string, handler: () => void): MapsEventListener;
  }

  class InfoWindow {
    constructor(opts?: InfoWindowOptions);
    setContent(content: string | HTMLElement): void;
    open(map?: Map, anchor?: Marker): void;
    close(): void;
  }

  interface MapOptions {
    center?: LatLngLiteral;
    zoom?: number;
    mapTypeControl?: boolean;
    streetViewControl?: boolean;
    fullscreenControl?: boolean;
    zoomControl?: boolean;
    styles?: MapTypeStyle[];
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  interface MarkerOptions {
    position?: LatLngLiteral;
    map?: Map;
    title?: string;
    icon?: string | Symbol;
  }

  interface Symbol {
    path: SymbolPath;
    scale?: number;
    fillColor?: string;
    fillOpacity?: number;
    strokeColor?: string;
    strokeWeight?: number;
  }

  interface InfoWindowOptions {
    content?: string | HTMLElement;
    position?: LatLngLiteral;
  }

  interface MapTypeStyle {
    featureType?: string;
    elementType?: string;
    stylers?: Record<string, string>[];
  }

  interface MapsEventListener {
    remove(): void;
  }

  enum SymbolPath {
    CIRCLE = 0,
    FORWARD_CLOSED_ARROW = 1,
    FORWARD_OPEN_ARROW = 2,
    BACKWARD_CLOSED_ARROW = 3,
    BACKWARD_OPEN_ARROW = 4,
  }
}

interface Window {
  google?: {
    maps: typeof google.maps;
  };
}
