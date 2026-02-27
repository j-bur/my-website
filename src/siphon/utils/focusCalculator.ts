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

export type FocusThresholdLevel = 'normal' | 'elevated' | 'warning' | 'critical';

export interface FocusThreshold {
  level: FocusThresholdLevel;
  color: string;
  glowColor: string;
}

const FOCUS_THRESHOLDS: { min: number; threshold: FocusThreshold }[] = [
  { min: 50, threshold: { level: 'critical', color: '#ff4466', glowColor: 'rgba(255, 68, 102, 0.35)' } },
  { min: 30, threshold: { level: 'warning', color: '#ff6600', glowColor: 'rgba(255, 102, 0, 0.3)' } },
  { min: 15, threshold: { level: 'elevated', color: '#ffbb33', glowColor: 'rgba(255, 187, 51, 0.25)' } },
];

const NORMAL_THRESHOLD: FocusThreshold = {
  level: 'normal',
  color: '#7a42e0',
  glowColor: 'rgba(122, 66, 224, 0.4)',
};

export function getFocusThreshold(focus: number): FocusThreshold {
  for (const { min, threshold } of FOCUS_THRESHOLDS) {
    if (focus >= min) return threshold;
  }
  return NORMAL_THRESHOLD;
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
