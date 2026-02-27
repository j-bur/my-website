import { describe, it, expect } from 'vitest';
import { calculateFocusGain, getFocusThreshold } from '../focusCalculator';
import type { RollResult } from '../diceRoller';

function makeRoll(total: number): RollResult {
  return { total, rolls: [total], expression: '1d8', modifier: 0 };
}

describe('calculateFocusGain', () => {
  // RULE-FOCUS-001: Focus doubles when EP negative
  it('doubles focus gain when EP is negative (RULE-FOCUS-001)', () => {
    const result = calculateFocusGain(makeRoll(10), true);
    expect(result.actualGain).toBe(20);
    expect(result.wasDoubled).toBe(true);
  });

  // RULE-FOCUS-002: Focus does NOT double when EP non-negative
  it('does not double focus gain when EP is non-negative (RULE-FOCUS-002)', () => {
    const result = calculateFocusGain(makeRoll(10), false);
    expect(result.actualGain).toBe(10);
    expect(result.wasDoubled).toBe(false);
  });

  it('preserves the base roll value', () => {
    const result = calculateFocusGain(makeRoll(7), true);
    expect(result.baseRoll).toBe(7);
    expect(result.actualGain).toBe(14);
  });

  it('handles zero roll', () => {
    const result = calculateFocusGain(makeRoll(0), true);
    expect(result.actualGain).toBe(0);
  });

  it('attaches the original roll result', () => {
    const roll = makeRoll(5);
    const result = calculateFocusGain(roll, false);
    expect(result.rollResult).toBe(roll);
  });
});

describe('getFocusThreshold', () => {
  it('returns normal for focus 0-14', () => {
    expect(getFocusThreshold(0).level).toBe('normal');
    expect(getFocusThreshold(14).level).toBe('normal');
  });

  it('returns elevated for focus 15-29', () => {
    expect(getFocusThreshold(15).level).toBe('elevated');
    expect(getFocusThreshold(29).level).toBe('elevated');
  });

  it('returns warning for focus 30-49', () => {
    expect(getFocusThreshold(30).level).toBe('warning');
    expect(getFocusThreshold(49).level).toBe('warning');
  });

  it('returns critical for focus 50+', () => {
    expect(getFocusThreshold(50).level).toBe('critical');
    expect(getFocusThreshold(100).level).toBe('critical');
  });

  it('returns distinct colors for each threshold level', () => {
    const colors = new Set([
      getFocusThreshold(0).color,
      getFocusThreshold(15).color,
      getFocusThreshold(30).color,
      getFocusThreshold(50).color,
    ]);
    expect(colors.size).toBe(4);
  });
});
