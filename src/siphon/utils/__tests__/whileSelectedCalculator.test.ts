import { describe, it, expect } from 'vitest';
import { calculateWhileSelectedEffects } from '../whileSelectedCalculator';

describe('whileSelectedCalculator', () => {
  // --- No effects ---

  it('returns empty array when neither feature is selected', () => {
    const effects = calculateWhileSelectedEffects(['discharge', 'temporal-surge'], 3);
    expect(effects).toEqual([]);
  });

  // --- Supercapacitance ---

  it('returns no Supercapacitance effect when at or under PB', () => {
    // PB=3, 3 features selected (including supercapacitance) → 0 extra
    const effects = calculateWhileSelectedEffects(
      ['supercapacitance', 'discharge', 'temporal-surge'],
      3
    );
    expect(effects.find(e => e.featureId === 'supercapacitance')).toBeUndefined();
  });

  it('calculates Supercapacitance cost for 1 extra feature', () => {
    // PB=3, 4 features (1 extra) → cost=2 (1*2), focus=1
    const effects = calculateWhileSelectedEffects(
      ['supercapacitance', 'discharge', 'temporal-surge', 'subtle-luck'],
      3
    );
    const sc = effects.find(e => e.featureId === 'supercapacitance');
    expect(sc).toBeDefined();
    expect(sc!.epCost).toBe(2);
    expect(sc!.focusGain).toBe(1);
    expect(sc!.focusDice).toBeNull();
  });

  it('calculates Supercapacitance cost for 2 extra features (DESIGN.md example)', () => {
    // PB=3, 5 features (2 extra) → cost=4 (2*2), focus=2
    const effects = calculateWhileSelectedEffects(
      ['supercapacitance', 'a', 'b', 'c', 'd'],
      3
    );
    const sc = effects.find(e => e.featureId === 'supercapacitance');
    expect(sc!.epCost).toBe(4);
    expect(sc!.focusGain).toBe(2);
    expect(sc!.description).toContain('2 extra features');
  });

  // --- Siphon Greed ---

  it('returns Siphon Greed effect with dice info when selected', () => {
    const effects = calculateWhileSelectedEffects(['siphon-greed', 'discharge'], 3);
    const sg = effects.find(e => e.featureId === 'siphon-greed');
    expect(sg).toBeDefined();
    expect(sg!.epCost).toBe(0);
    expect(sg!.focusGain).toBe(0); // dice-based, caller sets actual value
    expect(sg!.focusDice).toBe('1d4');
  });

  // --- Combined ---

  it('returns both effects when both are selected, Supercapacitance first', () => {
    // PB=3, 5 features including both
    const effects = calculateWhileSelectedEffects(
      ['supercapacitance', 'siphon-greed', 'a', 'b', 'c'],
      3
    );
    expect(effects).toHaveLength(2);
    expect(effects[0].featureId).toBe('supercapacitance');
    expect(effects[1].featureId).toBe('siphon-greed');
  });

  it('singular description for 1 extra feature', () => {
    const effects = calculateWhileSelectedEffects(
      ['supercapacitance', 'a', 'b', 'c'],
      3
    );
    const sc = effects.find(e => e.featureId === 'supercapacitance');
    expect(sc!.description).toBe('1 extra feature beyond PB');
  });
});
