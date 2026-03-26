import { describe, test, expect } from 'vitest';
import {
  checkPlanLimit,
  getPlansForRole,
  formatPlanPrice,
  PLANS,
} from '@/lib/subscriptions/plans';

describe('checkPlanLimit', () => {
  test('free tier (basico) blocks searches over limit', () => {
    const result = checkPlanLimit('basico', 'search', 3);
    expect(result.allowed).toBe(false);
    expect(result.message).toContain('límite');
  });

  test('free tier (basico) allows searches under limit', () => {
    const result = checkPlanLimit('basico', 'search', 2);
    expect(result.allowed).toBe(true);
  });

  test('paid tier (profesional) allows unlimited searches', () => {
    const result = checkPlanLimit('profesional', 'search', 999);
    expect(result.allowed).toBe(true);
    expect(result.message).toContain('Sin límite');
  });

  test('free cargador (starter) blocks posts over limit', () => {
    const result = checkPlanLimit('starter', 'post', 3);
    expect(result.allowed).toBe(false);
  });

  test('free cargador (starter) allows posts under limit', () => {
    const result = checkPlanLimit('starter', 'post', 1);
    expect(result.allowed).toBe(true);
  });

  test('premium cargador allows unlimited posts', () => {
    const result = checkPlanLimit('premium', 'post', 1000);
    expect(result.allowed).toBe(true);
  });

  test('flota plan allows adding trucks', () => {
    const result = checkPlanLimit('flota', 'add_truck', 5);
    expect(result.allowed).toBe(true);
  });

  test('flota plan blocks trucks over limit', () => {
    const result = checkPlanLimit('flota', 'add_truck', 10);
    expect(result.allowed).toBe(false);
  });

  test('returns not found for unknown plan', () => {
    const result = checkPlanLimit('unknown_plan' as never, 'search', 0);
    expect(result.allowed).toBe(false);
    expect(result.message).toContain('Plan no encontrado');
  });

  test('returns not allowed when action not available for plan', () => {
    // basico has no posts_per_month limit defined
    const result = checkPlanLimit('basico', 'post', 0);
    expect(result.allowed).toBe(false);
    expect(result.message).toContain('no incluye');
  });
});

describe('getPlansForRole', () => {
  test('returns transportista plans', () => {
    const plans = getPlansForRole('transportista');
    expect(plans.length).toBe(3);
    expect(plans.every((p) => p.role === 'transportista')).toBe(true);
  });

  test('returns cargador plans', () => {
    const plans = getPlansForRole('cargador');
    expect(plans.length).toBe(3);
    expect(plans.every((p) => p.role === 'cargador')).toBe(true);
  });

  test('transportista plans include basico, profesional, flota', () => {
    const plans = getPlansForRole('transportista');
    const ids = plans.map((p) => p.id);
    expect(ids).toContain('basico');
    expect(ids).toContain('profesional');
    expect(ids).toContain('flota');
  });

  test('cargador plans include starter, estandar, premium', () => {
    const plans = getPlansForRole('cargador');
    const ids = plans.map((p) => p.id);
    expect(ids).toContain('starter');
    expect(ids).toContain('estandar');
    expect(ids).toContain('premium');
  });
});

describe('formatPlanPrice', () => {
  test('returns "Gratis" for price 0', () => {
    expect(formatPlanPrice(0)).toBe('Gratis');
  });

  test('formats paid price with /mes suffix', () => {
    const result = formatPlanPrice(13500);
    expect(result).toContain('/mes');
    expect(result).toContain('$');
  });

  test('formats large price with thousand separator', () => {
    const result = formatPlanPrice(47250);
    expect(result).toContain('/mes');
    expect(result).toContain('$');
  });

  test('all plan prices in PLANS format correctly', () => {
    for (const plan of Object.values(PLANS)) {
      const formatted = formatPlanPrice(plan.price);
      expect(typeof formatted).toBe('string');
      if (plan.price === 0) {
        expect(formatted).toBe('Gratis');
      } else {
        expect(formatted).toContain('/mes');
      }
    }
  });
});
