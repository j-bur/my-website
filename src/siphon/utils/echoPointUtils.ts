export interface EPStatus {
  current: number;
  max: number;
  isNegative: boolean;
  isEchoDrained: boolean;
  drainThreshold: number;
  drainMultiplier: number;  // For Siphon Greed EP Recovery calculation
}

/**
 * Gets comprehensive EP status
 */
export function getEPStatus(currentEP: number, level: number): EPStatus {
  const drainThreshold = -level;
  const isEchoDrained = currentEP <= drainThreshold;

  // Calculate drain multiplier for Siphon Greed
  // ex., Level = 5, EP = -10 ... -14 -> multiplier = 2
  // ex., Level = 5, EP = -15 ... -19 -> multiplier = 3
  let drainMultiplier = 1;
  if (isEchoDrained && currentEP < drainThreshold) {
    drainMultiplier = Math.floor(Math.abs(currentEP) / level);
  }

  return {
    current: currentEP,
    max: level,
    isNegative: currentEP < 0,
    isEchoDrained,
    drainThreshold,
    drainMultiplier
  };
}

/**
 * Calculate the result of spending EP
 */
export function calculateEPSpend(
  currentEP: number,
  cost: number,
  level: number
): {
  newEP: number;
  wasPositive: boolean;
  isNowNegative: boolean;
  isNowEchoDrained: boolean;
  hpReduction: number;  // HP max reduction if already echo drained
} {
  const wasPositive = currentEP >= 0;
  const wasEchoDrained = currentEP <= -level;
  const newEP = currentEP - cost;
  const isNowNegative = newEP < 0;
  const isNowEchoDrained = newEP <= -level;

  // HP reduction only happens if already echo drained before spending
  const hpReduction = wasEchoDrained ? cost : 0;

  return {
    newEP,
    wasPositive,
    isNowNegative,
    isNowEchoDrained,
    hpReduction
  };
}

/**
 * Calculates EP recovery on long rest
 */
export function calculateLongRestRecovery(
  currentEP: number,
  maxEP: number,
  pb: number,
  hasSiphonGreed: boolean = false,
  drainMultiplier: number = 1
): {
  epRecovery: number;
  newEP: number;
  maxHPRestored: number;
} {
  // Base recovery is PB
  let epRecovery = pb;

  // Siphon Greed multiplies recovery when echo drained
  if (hasSiphonGreed && drainMultiplier > 1) {
    epRecovery = pb * drainMultiplier;
  }

  const newEP = Math.min(maxEP, currentEP + epRecovery);
  const actualRecovery = newEP - currentEP;

  // Max HP restoration happens as EP recovers from negative
  // Only restore HP for the portion that brings EP back toward 0
  let maxHPRestored = 0;
  if (currentEP < -maxEP) {
    // We were past echo drain threshold
    const oldDrainAmount = Math.abs(currentEP) - maxEP;
    const newDrainAmount = Math.max(0, Math.abs(Math.min(newEP, -maxEP)) - maxEP);
    maxHPRestored = oldDrainAmount - newDrainAmount;
  }

  return {
    epRecovery: actualRecovery,
    newEP,
    maxHPRestored
  };
}

/**
 * Format EP display
 */
export function formatEP(current: number, max: number): string {
  return `${current} / ${max} EP`;
}

/**
 * Get EP bar percentage (can exceed 100% or go negative)
 */
export function getEPBarPercentage(current: number, max: number): {
  positive: number;
  negative: number;
} {
  if (current >= 0) {
    return {
      positive: Math.min(100, (current / max) * 100),
      negative: 0
    };
  } else {
    return {
      positive: 0,
      negative: Math.min(100, (Math.abs(current) / max) * 100)
    };
  }
}
