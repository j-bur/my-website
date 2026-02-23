import type { SiphonFeature, CostType } from '../types';
import { parseDiceExpression } from './diceRoller';
import { resolveCost } from './costCalculator';

export interface MacroContext {
  pb: number;
  level: number;
  effectiveCost: number;
}

/**
 * Resolves focus dice notation by substituting variables ([PB], [Cost], [Cost/2])
 * and returns a concrete dice string like "3d8"
 */
export function resolveFocusDice(
  focusDice: string,
  context: { pb: number; cost: number }
): string {
  const expr = parseDiceExpression(focusDice, { pb: context.pb, cost: context.cost });
  if (expr.sides === 0) return focusDice; // Could not parse
  if (expr.sides === 1) return String(expr.count); // Just a number

  let result = `${expr.count}d${expr.sides}`;
  if (expr.modifier > 0) result += `+${expr.modifier}`;
  else if (expr.modifier < 0) result += `${expr.modifier}`;
  return result;
}

/**
 * Generates a FoundryVTT-compatible macro string for a Siphon Feature activation.
 *
 * Format: /roll XdY # Focus for FeatureName (Cost: Z EP)
 */
export function generateActivationMacro(
  feature: SiphonFeature,
  effectiveCost: number,
  resolvedFocusDice: string
): string {
  return `/roll ${resolvedFocusDice} # Focus for ${feature.name} (Cost: ${effectiveCost} EP)`;
}

/**
 * Resolves the base numeric cost of a feature given character context.
 * This handles CostType -> number conversion (PB, Level, etc.)
 */
export function resolveBaseCost(
  cost: CostType,
  context: { pb: number; level: number; chosenValue?: number }
): number {
  return resolveCost(cost, context);
}
