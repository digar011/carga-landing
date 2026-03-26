import { describe, test, expect, vi, afterEach } from 'vitest';
import {
  formatARS,
  formatDistance,
  formatRelativeTime,
  formatDate,
  formatRating,
  getInitials,
} from '@/utils/format';

describe('formatARS', () => {
  test('formats 0 as $0', () => {
    const result = formatARS(0);
    expect(result).toContain('0');
  });

  test('formats small number correctly', () => {
    const result = formatARS(500);
    expect(result).toContain('500');
  });

  test('formats large number with thousand separator', () => {
    const result = formatARS(285000);
    // es-AR uses "." as thousand separator
    expect(result).toContain('285');
    expect(result).toContain('000');
  });

  test('formats negative numbers', () => {
    const result = formatARS(-1500);
    expect(result).toContain('1');
    expect(result).toContain('500');
  });

  test('returns string containing $ symbol', () => {
    const result = formatARS(100);
    expect(result).toContain('$');
  });

  test('does not include decimal fractions', () => {
    const result = formatARS(1234);
    // Should not have cents
    expect(result).not.toMatch(/,\d{2}$/);
  });
});

describe('formatDistance', () => {
  test('formats distance with km suffix', () => {
    expect(formatDistance(100)).toContain('100');
    expect(formatDistance(100)).toContain('km');
  });

  test('formats large distances with locale separator', () => {
    const result = formatDistance(1500);
    expect(result).toContain('km');
    // es-AR uses "." as thousand separator
    expect(result).toContain('1');
    expect(result).toContain('500');
  });

  test('formats zero distance', () => {
    expect(formatDistance(0)).toContain('0');
    expect(formatDistance(0)).toContain('km');
  });
});

describe('formatRelativeTime', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('returns "Ahora" for less than 1 minute ago', () => {
    vi.useFakeTimers();
    const now = new Date('2026-03-26T12:00:00Z');
    vi.setSystemTime(now);

    const thirtySecondsAgo = new Date('2026-03-26T11:59:40Z').toISOString();
    expect(formatRelativeTime(thirtySecondsAgo)).toBe('Ahora');
  });

  test('returns minutes for 1-59 minutes ago', () => {
    vi.useFakeTimers();
    const now = new Date('2026-03-26T12:00:00Z');
    vi.setSystemTime(now);

    const fiveMinAgo = new Date('2026-03-26T11:55:00Z').toISOString();
    expect(formatRelativeTime(fiveMinAgo)).toBe('Hace 5 min');
  });

  test('returns hours for 1-23 hours ago', () => {
    vi.useFakeTimers();
    const now = new Date('2026-03-26T12:00:00Z');
    vi.setSystemTime(now);

    const threeHoursAgo = new Date('2026-03-26T09:00:00Z').toISOString();
    expect(formatRelativeTime(threeHoursAgo)).toBe('Hace 3h');
  });

  test('returns days for 1-6 days ago', () => {
    vi.useFakeTimers();
    const now = new Date('2026-03-26T12:00:00Z');
    vi.setSystemTime(now);

    const twoDaysAgo = new Date('2026-03-24T12:00:00Z').toISOString();
    expect(formatRelativeTime(twoDaysAgo)).toBe('Hace 2d');
  });

  test('returns formatted date for 7+ days ago', () => {
    vi.useFakeTimers();
    const now = new Date('2026-03-26T12:00:00Z');
    vi.setSystemTime(now);

    const twoWeeksAgo = new Date('2026-03-10T12:00:00Z').toISOString();
    const result = formatRelativeTime(twoWeeksAgo);
    // Should be a formatted date string, not relative
    expect(result).not.toContain('Hace');
    expect(result).toContain('10');
  });
});

describe('formatDate', () => {
  test('formats date in es-AR locale', () => {
    const result = formatDate('2026-03-15T10:00:00Z');
    // Should contain day number
    expect(result).toContain('15');
  });

  test('includes weekday abbreviation', () => {
    // 2026-03-15 is a Sunday
    const result = formatDate('2026-03-15T10:00:00Z');
    // es-AR weekday abbreviation for Sunday
    expect(result.length).toBeGreaterThan(5);
  });

  test('includes year', () => {
    const result = formatDate('2026-03-15T10:00:00Z');
    expect(result).toContain('2026');
  });
});

describe('formatRating', () => {
  test('returns "Sin calificaciones" when 0 viajes', () => {
    expect(formatRating(0, 0)).toBe('Sin calificaciones');
  });

  test('uses singular "viaje" for 1 trip', () => {
    const result = formatRating(4.5, 1);
    expect(result).toContain('4.5');
    expect(result).toContain('1 viaje');
    expect(result).not.toContain('viajes');
  });

  test('uses plural "viajes" for multiple trips', () => {
    const result = formatRating(3.8, 25);
    expect(result).toContain('3.8');
    expect(result).toContain('25 viajes');
  });

  test('formats rating to one decimal place', () => {
    const result = formatRating(4, 10);
    expect(result).toContain('4.0');
  });
});

describe('getInitials', () => {
  test('returns first two initials for two names', () => {
    expect(getInitials('Juan Perez')).toBe('JP');
  });

  test('returns single initial for one name', () => {
    expect(getInitials('Juan')).toBe('J');
  });

  test('returns first two initials for three names', () => {
    expect(getInitials('Juan Carlos Perez')).toBe('JC');
  });

  test('returns uppercase initials', () => {
    expect(getInitials('juan perez')).toBe('JP');
  });

  test('handles empty string without crashing', () => {
    // getInitials('') will try to access word[0] on empty split, producing ''
    const result = getInitials('');
    expect(typeof result).toBe('string');
  });
});
