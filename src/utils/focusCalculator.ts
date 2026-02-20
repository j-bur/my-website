import type { RollResult } from './diceRoller';

export interface FocusGainResult {
  baseRoll: number;
  actualGain: number;
  wasDoubled: boolean;
  rollResult: RollResult;
}

/**
 * Calculates actual Focus gained, applying double if EP negative
 */
export function calculateFocusGain(
  rollResult: RollResult,
  isEPNegative: boolean
): FocusGainResult {
  const baseRoll = rollResult.total;
  const actualGain = isEPNegative ? baseRoll * 2 : baseRoll;

  return {
    baseRoll,
    actualGain,
    wasDoubled: isEPNegative,
    rollResult
  };
}

/**
 * Calculate Focus reduction on long rest (1d4)
 */
export function rollLongRestFocusReduction(): number {
  return Math.floor(Math.random() * 4) + 1;
}

/**
 * Check if Focus is at a warning level (Weavers watching)
 */
export function isFocusWarning(focus: number, threshold = 50): boolean {
  return focus >= threshold;
}

/**
 * Format Focus gain for display
 */
export function formatFocusGain(result: FocusGainResult): string {
  if (result.wasDoubled) {
    return `${result.baseRoll} x2 = ${result.actualGain} Focus (EP negative!)`;
  }
  return `+${result.actualGain} Focus`;
}
