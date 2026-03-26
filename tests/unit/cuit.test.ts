import { describe, test, expect } from 'vitest';
import { isValidCuitFormat, formatCuit } from '@/lib/afip/cuit';

describe('isValidCuitFormat', () => {
  test('accepts valid 11-digit CUIT with dashes', () => {
    expect(isValidCuitFormat('20-28473691-4')).toBe(true);
  });

  test('accepts valid 11-digit CUIT without dashes', () => {
    expect(isValidCuitFormat('20284736914')).toBe(true);
  });

  test('rejects CUIT with less than 11 digits', () => {
    expect(isValidCuitFormat('2028473691')).toBe(false);
  });

  test('rejects CUIT with more than 11 digits', () => {
    expect(isValidCuitFormat('202847369140')).toBe(false);
  });

  test('rejects non-numeric characters', () => {
    expect(isValidCuitFormat('AB-CDEFGHIJ-K')).toBe(false);
  });

  test('rejects empty string', () => {
    expect(isValidCuitFormat('')).toBe(false);
  });

  test('rejects string with spaces', () => {
    expect(isValidCuitFormat('20 28473691 4')).toBe(false);
  });
});

describe('formatCuit', () => {
  test('formats 11 raw digits to XX-XXXXXXXX-X', () => {
    expect(formatCuit('20284736914')).toBe('20-28473691-4');
  });

  test('formats already-dashed CUIT correctly (strips non-digits first)', () => {
    expect(formatCuit('20-28473691-4')).toBe('20-28473691-4');
  });

  test('returns original string if not 11 digits after cleaning', () => {
    expect(formatCuit('12345')).toBe('12345');
  });

  test('returns original string for empty input', () => {
    expect(formatCuit('')).toBe('');
  });

  test('strips non-digit characters before formatting', () => {
    expect(formatCuit('20.28473691.4')).toBe('20-28473691-4');
  });

  test('returns original if too many digits', () => {
    expect(formatCuit('202847369140')).toBe('202847369140');
  });
});
