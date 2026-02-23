import { describe, it, expect } from 'vitest';
import {
  calculateEPSpend,
  calculateLongRestRecovery,
  getEPStatus,
} from '../echoPointUtils';

describe('calculateEPSpend', () => {
  // RULE-EP-001: EP can go negative
  it('allows EP to go negative (RULE-EP-001)', () => {
    const result = calculateEPSpend(3, 5, 5);
    expect(result.newEP).toBe(-2);
  });

  // RULE-EP-002: Warp triggers when EP negative AFTER deduction
  it('triggers warp when EP goes negative after deduction (RULE-EP-002)', () => {
    const result = calculateEPSpend(2, 5, 5);
    expect(result.newEP).toBe(-3);
    expect(result.isNowNegative).toBe(true);
  });

  // RULE-EP-003: Warp triggers even when already negative
  it('triggers warp when already negative (RULE-EP-003)', () => {
    const result = calculateEPSpend(-2, 3, 5);
    expect(result.newEP).toBe(-5);
    expect(result.isNowNegative).toBe(true);
  });

  // RULE-EP-004: Warp does NOT trigger when EP stays non-negative
  it('does not trigger warp when EP stays non-negative (RULE-EP-004)', () => {
    const result = calculateEPSpend(5, 3, 5);
    expect(result.newEP).toBe(2);
    expect(result.isNowNegative).toBe(false);
  });

  // RULE-EP-005: Echo Drain at EP = -Level
  it('detects echo drained at -Level (RULE-EP-005)', () => {
    const result = calculateEPSpend(-3, 2, 5);
    expect(result.newEP).toBe(-5);
    expect(result.isNowEchoDrained).toBe(true);
  });

  it('tracks wasPositive correctly', () => {
    const fromPositive = calculateEPSpend(3, 5, 5);
    expect(fromPositive.wasPositive).toBe(true);

    const fromNegative = calculateEPSpend(-1, 2, 5);
    expect(fromNegative.wasPositive).toBe(false);
  });

  it('calculates HP reduction when already echo drained', () => {
    // Already echo drained (EP <= -level), spending more causes HP reduction
    const result = calculateEPSpend(-5, 3, 5);
    expect(result.hpReduction).toBe(3);
  });

  it('does not reduce HP when not yet echo drained', () => {
    const result = calculateEPSpend(-3, 2, 5);
    expect(result.hpReduction).toBe(0);
  });
});

describe('calculateLongRestRecovery', () => {
  // RULE-EP-007: Long Rest EP recovery = PB (up to max)
  it('recovers PB on long rest (RULE-EP-007)', () => {
    const result = calculateLongRestRecovery(0, 5, 3);
    expect(result.newEP).toBe(3);
  });

  // RULE-EP-008: Long Rest EP recovery does not exceed max
  it('caps recovery at max EP (RULE-EP-008)', () => {
    const result = calculateLongRestRecovery(4, 5, 3);
    expect(result.newEP).toBe(5);
    expect(result.epRecovery).toBe(1); // Only recovered 1, not full PB
  });

  // RULE-EP-006: EP recovery capped at max
  it('does not exceed max even with large PB (RULE-EP-006)', () => {
    const result = calculateLongRestRecovery(3, 5, 10);
    expect(result.newEP).toBe(5);
  });

  it('recovers from negative EP', () => {
    const result = calculateLongRestRecovery(-3, 5, 3);
    expect(result.newEP).toBe(0);
  });
});

describe('getEPStatus', () => {
  it('reports non-negative EP correctly', () => {
    const status = getEPStatus(3, 5);
    expect(status.isNegative).toBe(false);
    expect(status.isEchoDrained).toBe(false);
    expect(status.max).toBe(5);
    expect(status.drainThreshold).toBe(-5);
  });

  it('reports negative EP correctly', () => {
    const status = getEPStatus(-2, 5);
    expect(status.isNegative).toBe(true);
    expect(status.isEchoDrained).toBe(false);
  });

  it('reports echo drained at exactly -level', () => {
    const status = getEPStatus(-5, 5);
    expect(status.isEchoDrained).toBe(true);
  });

  it('reports echo drained past -level', () => {
    const status = getEPStatus(-8, 5);
    expect(status.isEchoDrained).toBe(true);
  });
});
