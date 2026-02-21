import { describe, it, expect } from 'vitest';
import { resolveCost, formatCost, isVariableCost } from '../costCalculator';

describe('resolveCost', () => {
  const ctx = { pb: 3, level: 5 };

  it('resolves a fixed number', () => {
    expect(resolveCost(5, ctx)).toBe(5);
  });

  it('resolves 0', () => {
    expect(resolveCost(0, ctx)).toBe(0);
  });

  it('resolves PB', () => {
    expect(resolveCost('PB', ctx)).toBe(3);
  });

  it('resolves Twice PB', () => {
    expect(resolveCost('Twice PB', ctx)).toBe(6);
  });

  it('resolves Level', () => {
    expect(resolveCost('Level', ctx)).toBe(5);
  });

  it('resolves Level/2 (rounds up)', () => {
    expect(resolveCost('Level/2', ctx)).toBe(3); // ceil(5/2) = 3
  });

  it('resolves Varies with chosenValue', () => {
    expect(resolveCost('Varies', { ...ctx, chosenValue: 7 })).toBe(7);
  });

  it('resolves Varies without chosenValue to 0', () => {
    expect(resolveCost('Varies', ctx)).toBe(0);
  });

  it('resolves Varies* (special cost marker)', () => {
    expect(resolveCost('Varies*', { ...ctx, chosenValue: 4 })).toBe(4);
  });

  it('resolves Varies* without chosenValue to 0', () => {
    expect(resolveCost('Varies*', ctx)).toBe(0);
  });
});

describe('formatCost', () => {
  it('formats a fixed number', () => {
    expect(formatCost(5)).toBe('5');
  });

  it('formats PB with context', () => {
    expect(formatCost('PB', { pb: 3, level: 5 })).toBe('PB (3)');
  });

  it('formats Varies* with context showing special marker', () => {
    expect(formatCost('Varies*', { pb: 3, level: 5 })).toBe('Varies (0)*');
  });
});

describe('isVariableCost', () => {
  it('returns true for Varies', () => {
    expect(isVariableCost('Varies')).toBe(true);
  });

  it('returns true for Varies*', () => {
    expect(isVariableCost('Varies*')).toBe(true);
  });

  it('returns false for fixed numbers', () => {
    expect(isVariableCost(5)).toBe(false);
  });

  it('returns false for PB', () => {
    expect(isVariableCost('PB')).toBe(false);
  });
});
