import { describe, it, expect } from 'vitest';
import { resolveFocusDice, generateActivationMacro, resolveBaseCost } from '../macroGenerator';
import type { SiphonFeature } from '../../types';

const makeFeature = (overrides: Partial<SiphonFeature> = {}): SiphonFeature => ({
  id: 'test-feature',
  name: 'Test Feature',
  cost: 3,
  isSpecialCost: false,
  focusDice: '2d6',
  duration: '10 minutes',
  activation: 'Action',
  description: 'A test feature.',
  warpEffect: null,
  ...overrides,
});

describe('resolveFocusDice', () => {
  it('resolves simple dice notation "2d6"', () => {
    expect(resolveFocusDice('2d6', { pb: 3, cost: 5 })).toBe('2d6');
  });

  it('substitutes [PB] in focus dice', () => {
    expect(resolveFocusDice('[PB]d8', { pb: 4, cost: 5 })).toBe('4d8');
  });

  it('substitutes [Cost] in focus dice', () => {
    expect(resolveFocusDice('[Cost]d8', { pb: 3, cost: 6 })).toBe('6d8');
  });

  it('substitutes [Cost/2] in focus dice', () => {
    expect(resolveFocusDice('[Cost/2]d8', { pb: 3, cost: 8 })).toBe('4d8');
  });

  it('handles dice with positive modifier', () => {
    expect(resolveFocusDice('2d8+3', { pb: 3, cost: 5 })).toBe('2d8+3');
  });

  it('handles dice with negative modifier', () => {
    expect(resolveFocusDice('3d6-1', { pb: 3, cost: 5 })).toBe('3d6-1');
  });

  it('returns plain number for [Cost] without dN suffix', () => {
    // [Cost] = 5 -> parsed as count=5, sides=1 -> returns "5"
    expect(resolveFocusDice('[Cost]', { pb: 3, cost: 5 })).toBe('5');
  });
});

describe('generateActivationMacro', () => {
  it('generates FoundryVTT macro format', () => {
    const feature = makeFeature({ name: 'Echo Relocation' });
    const result = generateActivationMacro(feature, 3, '2d6');
    expect(result).toBe('/roll 2d6 # Focus for Echo Relocation (Cost: 3 EP)');
  });

  it('includes effective cost, not base cost', () => {
    const feature = makeFeature({ name: 'Subtle Luck', cost: 6 });
    // Effective cost after modifiers might differ from base
    const result = generateActivationMacro(feature, 3, '3d8');
    expect(result).toContain('Cost: 3 EP');
  });

  it('includes resolved focus dice', () => {
    const feature = makeFeature({ focusDice: '[PB]d8' });
    const result = generateActivationMacro(feature, 5, '4d8');
    expect(result).toContain('/roll 4d8');
  });
});

describe('resolveBaseCost', () => {
  it('returns numeric cost directly', () => {
    expect(resolveBaseCost(5, { pb: 3, level: 10 })).toBe(5);
  });

  it('resolves PB cost', () => {
    expect(resolveBaseCost('PB', { pb: 4, level: 10 })).toBe(4);
  });

  it('resolves Level cost', () => {
    expect(resolveBaseCost('Level', { pb: 3, level: 12 })).toBe(12);
  });

  it('resolves Level/2 cost (rounded up)', () => {
    expect(resolveBaseCost('Level/2', { pb: 3, level: 7 })).toBe(4);
  });

  it('resolves Twice PB cost', () => {
    expect(resolveBaseCost('Twice PB', { pb: 3, level: 10 })).toBe(6);
  });

  it('resolves Varies with chosen value', () => {
    expect(resolveBaseCost('Varies', { pb: 3, level: 10, chosenValue: 8 })).toBe(8);
  });

  it('resolves Varies* with chosen value', () => {
    expect(resolveBaseCost('Varies*', { pb: 3, level: 10, chosenValue: 4 })).toBe(4);
  });

  it('resolves Varies with no chosen value as 0', () => {
    expect(resolveBaseCost('Varies', { pb: 3, level: 10 })).toBe(0);
  });
});
