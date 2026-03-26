import { describe, test, expect } from 'vitest';
import {
  PROVINCIAS,
  TRUCK_TYPE_LABELS,
  CARGO_TYPE_LABELS,
  LOAD_STATUS_LABELS,
} from '@/utils/constants';

describe('PROVINCIAS', () => {
  test('has exactly 24 entries (23 provinces + CABA)', () => {
    expect(PROVINCIAS).toHaveLength(24);
  });

  test('includes Buenos Aires', () => {
    expect(PROVINCIAS).toContain('Buenos Aires');
  });

  test('includes CABA', () => {
    expect(PROVINCIAS).toContain('CABA');
  });

  test('includes Cordoba', () => {
    expect(PROVINCIAS).toContain('Córdoba');
  });

  test('includes Santa Fe', () => {
    expect(PROVINCIAS).toContain('Santa Fe');
  });

  test('includes Tierra del Fuego', () => {
    expect(PROVINCIAS).toContain('Tierra del Fuego');
  });

  test('includes Mendoza', () => {
    expect(PROVINCIAS).toContain('Mendoza');
  });

  test('all entries are non-empty strings', () => {
    for (const prov of PROVINCIAS) {
      expect(typeof prov).toBe('string');
      expect(prov.length).toBeGreaterThan(0);
    }
  });
});

describe('TRUCK_TYPE_LABELS', () => {
  const expectedKeys = [
    'semirremolque',
    'volcador',
    'frigorifico',
    'chasis',
    'carrozado',
    'tanque',
    'portacontenedor',
    'batea',
  ];

  test('has labels for all truck types', () => {
    for (const key of expectedKeys) {
      expect(TRUCK_TYPE_LABELS[key]).toBeDefined();
    }
  });

  test('all values are Spanish labels (non-empty strings)', () => {
    for (const key of expectedKeys) {
      const label = TRUCK_TYPE_LABELS[key] ?? '';
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    }
  });

  test('frigorifico has accent in label', () => {
    expect(TRUCK_TYPE_LABELS['frigorifico']).toBe('Frigorífico');
  });
});

describe('CARGO_TYPE_LABELS', () => {
  const expectedKeys = [
    'cereales',
    'alimentos',
    'maquinaria',
    'materiales_construccion',
    'productos_quimicos',
    'vehiculos',
    'ganado',
    'general',
    'refrigerados',
    'peligrosos',
  ];

  test('has labels for all cargo types', () => {
    for (const key of expectedKeys) {
      expect(CARGO_TYPE_LABELS[key]).toBeDefined();
    }
  });

  test('all values are Spanish labels (non-empty strings)', () => {
    for (const key of expectedKeys) {
      const label = CARGO_TYPE_LABELS[key] ?? '';
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    }
  });

  test('general is labeled as "Carga general"', () => {
    expect(CARGO_TYPE_LABELS['general']).toBe('Carga general');
  });

  test('peligrosos is labeled as "Carga peligrosa"', () => {
    expect(CARGO_TYPE_LABELS['peligrosos']).toBe('Carga peligrosa');
  });
});

describe('LOAD_STATUS_LABELS', () => {
  const expectedStatuses = [
    'publicada',
    'aplicada',
    'asignada',
    'en_camino',
    'entregada',
    'calificada',
    'cancelada',
  ];

  test('has labels for all load statuses', () => {
    for (const status of expectedStatuses) {
      expect(LOAD_STATUS_LABELS[status]).toBeDefined();
    }
  });

  test('all values are Spanish labels (non-empty strings)', () => {
    for (const status of expectedStatuses) {
      const label = LOAD_STATUS_LABELS[status] ?? '';
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    }
  });

  test('publicada is "Publicada"', () => {
    expect(LOAD_STATUS_LABELS['publicada']).toBe('Publicada');
  });

  test('cancelada is "Cancelada"', () => {
    expect(LOAD_STATUS_LABELS['cancelada']).toBe('Cancelada');
  });

  test('aplicada shows "Con postulantes"', () => {
    expect(LOAD_STATUS_LABELS['aplicada']).toBe('Con postulantes');
  });
});
