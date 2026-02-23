import { describe, it, expect, vi } from 'vitest';
import { parseDiceExpression, rollDice, rollFromNotation } from '../diceRoller';

describe('parseDiceExpression', () => {
  it('parses simple notation "2d8"', () => {
    const expr = parseDiceExpression('2d8');
    expect(expr).toEqual({ count: 2, sides: 8, modifier: 0 });
  });

  it('parses notation with positive modifier "1d6+3"', () => {
    const expr = parseDiceExpression('1d6+3');
    expect(expr).toEqual({ count: 1, sides: 6, modifier: 3 });
  });

  it('parses notation with negative modifier "2d10-1"', () => {
    const expr = parseDiceExpression('2d10-1');
    expect(expr).toEqual({ count: 2, sides: 10, modifier: -1 });
  });

  it('substitutes [PB] with pb value', () => {
    const expr = parseDiceExpression('[PB]d8', { pb: 3 });
    expect(expr).toEqual({ count: 3, sides: 8, modifier: 0 });
  });

  it('substitutes [Cost] with cost value', () => {
    const expr = parseDiceExpression('[Cost]d8', { cost: 5 });
    expect(expr).toEqual({ count: 5, sides: 8, modifier: 0 });
  });

  it('substitutes [Cost/2] with halved cost', () => {
    const expr = parseDiceExpression('[Cost/2]d8', { cost: 6 });
    expect(expr).toEqual({ count: 3, sides: 8, modifier: 0 });
  });

  it('handles direct value "[Cost]" as count with sides=1', () => {
    const expr = parseDiceExpression('[Cost]', { cost: 5 });
    expect(expr).toEqual({ count: 5, sides: 1, modifier: 0 });
  });

  it('handles 0 dice', () => {
    const expr = parseDiceExpression('0d6');
    expect(expr).toEqual({ count: 0, sides: 6, modifier: 0 });
  });

  it('handles 1 die', () => {
    const expr = parseDiceExpression('1d20');
    expect(expr).toEqual({ count: 1, sides: 20, modifier: 0 });
  });
});

describe('rollDice', () => {
  it('returns correct number of rolls', () => {
    const result = rollDice(3, 6);
    expect(result.rolls).toHaveLength(3);
  });

  it('each roll is within [1, sides]', () => {
    const result = rollDice(100, 6);
    for (const roll of result.rolls) {
      expect(roll).toBeGreaterThanOrEqual(1);
      expect(roll).toBeLessThanOrEqual(6);
    }
  });

  it('total equals sum of rolls plus modifier', () => {
    const result = rollDice(4, 8, 2);
    const sum = result.rolls.reduce((a, b) => a + b, 0);
    expect(result.total).toBe(sum + 2);
  });

  it('returns 0 rolls and modifier-only total for 0 dice', () => {
    const result = rollDice(0, 6, 5);
    expect(result.rolls).toHaveLength(0);
    expect(result.total).toBe(5);
  });
});

describe('rollFromNotation', () => {
  it('rolls from simple notation', () => {
    // Seed Math.random for deterministic test
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const result = rollFromNotation('2d8');
    // 0.5 * 8 = 4 -> floor = 4 -> +1 = 5, twice
    expect(result.total).toBe(10);
    expect(result.rolls).toEqual([5, 5]);
    vi.restoreAllMocks();
  });

  it('rolls with PB substitution', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const result = rollFromNotation('[PB]d8', { pb: 3 });
    // 0.99 * 8 = 7.92 -> floor = 7 -> +1 = 8, three times
    expect(result.total).toBe(24);
    expect(result.rolls).toHaveLength(3);
    vi.restoreAllMocks();
  });

  it('rolls with Cost substitution', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = rollFromNotation('[Cost]d8', { cost: 5 });
    // 0 * 8 = 0 -> floor = 0 -> +1 = 1, five times
    expect(result.total).toBe(5);
    expect(result.rolls).toEqual([1, 1, 1, 1, 1]);
    vi.restoreAllMocks();
  });

  it('handles [Cost] as direct value', () => {
    const result = rollFromNotation('[Cost]', { cost: 7 });
    // 7 dice of 1 side = 7
    expect(result.total).toBe(7);
    vi.restoreAllMocks();
  });
});
