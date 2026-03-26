import { describe, test, expect } from 'vitest';
import {
  cuitSchema,
  patenteSchema,
  loginSchema,
  registerSchema,
  loadSchema,
  truckSchema,
  ratingSchema,
} from '@/utils/validations';

describe('cuitSchema', () => {
  test('accepts valid CUIT format XX-XXXXXXXX-X', () => {
    const result = cuitSchema.safeParse('20-28473691-4');
    expect(result.success).toBe(true);
  });

  test('rejects CUIT without dashes', () => {
    const result = cuitSchema.safeParse('20284736914');
    expect(result.success).toBe(false);
  });

  test('rejects CUIT with wrong format', () => {
    const result = cuitSchema.safeParse('2-028473691-4');
    expect(result.success).toBe(false);
  });

  test('rejects empty string', () => {
    const result = cuitSchema.safeParse('');
    expect(result.success).toBe(false);
  });

  test('rejects letters in CUIT', () => {
    const result = cuitSchema.safeParse('AB-CDEFGHIJ-K');
    expect(result.success).toBe(false);
  });
});

describe('patenteSchema', () => {
  test('accepts old format ABC123', () => {
    const result = patenteSchema.safeParse('ABC123');
    expect(result.success).toBe(true);
  });

  test('accepts new format AB123CD', () => {
    const result = patenteSchema.safeParse('AB123CD');
    expect(result.success).toBe(true);
  });

  test('rejects lowercase letters', () => {
    const result = patenteSchema.safeParse('abc123');
    expect(result.success).toBe(false);
  });

  test('rejects invalid format', () => {
    const result = patenteSchema.safeParse('A1B2C3');
    expect(result.success).toBe(false);
  });

  test('rejects empty string', () => {
    const result = patenteSchema.safeParse('');
    expect(result.success).toBe(false);
  });

  test('rejects too short', () => {
    const result = patenteSchema.safeParse('AB12');
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  test('accepts valid email and password', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'secret123',
    });
    expect(result.success).toBe(true);
  });

  test('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'secret123',
    });
    expect(result.success).toBe(false);
  });

  test('rejects empty password', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });

  test('rejects missing email', () => {
    const result = loginSchema.safeParse({
      password: 'secret123',
    });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const validRegister = {
    nombre: 'Juan Perez',
    email: 'juan@example.com',
    password: 'securepass123',
    role: 'transportista' as const,
  };

  test('accepts all valid fields', () => {
    const result = registerSchema.safeParse(validRegister);
    expect(result.success).toBe(true);
  });

  test('rejects short name (less than 2 chars)', () => {
    const result = registerSchema.safeParse({ ...validRegister, nombre: 'J' });
    expect(result.success).toBe(false);
  });

  test('rejects short password (less than 8 chars)', () => {
    const result = registerSchema.safeParse({ ...validRegister, password: '1234567' });
    expect(result.success).toBe(false);
  });

  test('rejects invalid role', () => {
    const result = registerSchema.safeParse({ ...validRegister, role: 'admin' });
    expect(result.success).toBe(false);
  });

  test('accepts cargador role', () => {
    const result = registerSchema.safeParse({ ...validRegister, role: 'cargador' });
    expect(result.success).toBe(true);
  });

  test('rejects invalid email', () => {
    const result = registerSchema.safeParse({ ...validRegister, email: 'not-email' });
    expect(result.success).toBe(false);
  });
});

describe('loadSchema', () => {
  const validLoad = {
    origen_ciudad: 'Rosario',
    origen_provincia: 'Santa Fe',
    destino_ciudad: 'Buenos Aires',
    destino_provincia: 'Buenos Aires',
    tipo_carga: 'cereales' as const,
    descripcion_carga: 'Soja a granel',
    peso_tn: 28,
    tipo_camion_requerido: 'semirremolque' as const,
    tarifa_ars: 350000,
    tarifa_negociable: true,
    fecha_carga: '2026-04-01',
  };

  test('accepts all valid fields', () => {
    const result = loadSchema.safeParse(validLoad);
    expect(result.success).toBe(true);
  });

  test('rejects missing required fields', () => {
    const result = loadSchema.safeParse({
      origen_ciudad: 'Rosario',
    });
    expect(result.success).toBe(false);
  });

  test('rejects negative peso_tn', () => {
    const result = loadSchema.safeParse({ ...validLoad, peso_tn: -5 });
    expect(result.success).toBe(false);
  });

  test('rejects negative tarifa_ars', () => {
    const result = loadSchema.safeParse({ ...validLoad, tarifa_ars: -1000 });
    expect(result.success).toBe(false);
  });

  test('rejects zero peso_tn', () => {
    const result = loadSchema.safeParse({ ...validLoad, peso_tn: 0 });
    expect(result.success).toBe(false);
  });

  test('rejects zero tarifa_ars', () => {
    const result = loadSchema.safeParse({ ...validLoad, tarifa_ars: 0 });
    expect(result.success).toBe(false);
  });

  test('accepts optional fields as undefined', () => {
    const result = loadSchema.safeParse({
      ...validLoad,
      fecha_entrega: undefined,
      observaciones: undefined,
    });
    expect(result.success).toBe(true);
  });

  test('rejects invalid cargo type', () => {
    const result = loadSchema.safeParse({ ...validLoad, tipo_carga: 'invalid_type' });
    expect(result.success).toBe(false);
  });

  test('rejects invalid truck type', () => {
    const result = loadSchema.safeParse({
      ...validLoad,
      tipo_camion_requerido: 'invalid_truck',
    });
    expect(result.success).toBe(false);
  });
});

describe('truckSchema', () => {
  const validTruck = {
    tipo: 'semirremolque' as const,
    patente: 'ABC123',
    capacidad_tn: 30,
    marca: 'Scania',
    modelo: 'R500',
    anio: 2022,
  };

  test('accepts valid truck data', () => {
    const result = truckSchema.safeParse(validTruck);
    expect(result.success).toBe(true);
  });

  test('accepts new patente format', () => {
    const result = truckSchema.safeParse({ ...validTruck, patente: 'AB123CD' });
    expect(result.success).toBe(true);
  });

  test('rejects invalid patente', () => {
    const result = truckSchema.safeParse({ ...validTruck, patente: '123ABC' });
    expect(result.success).toBe(false);
  });

  test('rejects year before 1990', () => {
    const result = truckSchema.safeParse({ ...validTruck, anio: 1989 });
    expect(result.success).toBe(false);
  });

  test('rejects year too far in future', () => {
    const futureYear = new Date().getFullYear() + 2;
    const result = truckSchema.safeParse({ ...validTruck, anio: futureYear });
    expect(result.success).toBe(false);
  });

  test('accepts current year + 1', () => {
    const nextYear = new Date().getFullYear() + 1;
    const result = truckSchema.safeParse({ ...validTruck, anio: nextYear });
    expect(result.success).toBe(true);
  });

  test('rejects short marca', () => {
    const result = truckSchema.safeParse({ ...validTruck, marca: 'S' });
    expect(result.success).toBe(false);
  });
});

describe('ratingSchema', () => {
  test('accepts score 1', () => {
    const result = ratingSchema.safeParse({ score: 1 });
    expect(result.success).toBe(true);
  });

  test('accepts score 5', () => {
    const result = ratingSchema.safeParse({ score: 5 });
    expect(result.success).toBe(true);
  });

  test('accepts score 3 with comment', () => {
    const result = ratingSchema.safeParse({ score: 3, comentario: 'Buen servicio' });
    expect(result.success).toBe(true);
  });

  test('rejects score 0', () => {
    const result = ratingSchema.safeParse({ score: 0 });
    expect(result.success).toBe(false);
  });

  test('rejects score 6', () => {
    const result = ratingSchema.safeParse({ score: 6 });
    expect(result.success).toBe(false);
  });

  test('rejects non-integer score', () => {
    const result = ratingSchema.safeParse({ score: 3.5 });
    expect(result.success).toBe(false);
  });

  test('rejects negative score', () => {
    const result = ratingSchema.safeParse({ score: -1 });
    expect(result.success).toBe(false);
  });
});
