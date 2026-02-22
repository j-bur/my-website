import type { SiphonFeature, SpendResult } from '../types';
import { FEATURE_MAP } from '../data/featureConstants';
import { useSiphonStore } from '../store/siphonStore';
import { useCharacterStore } from '../store/characterStore';
import { parseDurationToMs } from './durationParser';
import { resolveFocusDice, resolveBaseCost } from './macroGenerator';
import { parseDiceExpression, rollDice } from './diceRoller';
import { isVariableCost } from './costCalculator';

export interface ActivationResult {
  spendResult: SpendResult;
  focusGained: number;
  warpTriggered: boolean;
}

/**
 * Computes the effective cost and EP preview for a feature activation.
 * Used by the ghost preview row during drag-over.
 */
export function computeActivationPreview(
  feature: SiphonFeature,
  chosenCost?: number
): { effectiveCost: number; newEP: number; warpWillTrigger: boolean; focusDice: string } | null {
  const siphonState = useSiphonStore.getState();
  const { level, proficiencyBonus: pb } = useCharacterStore.getState();

  const isVaries = isVariableCost(feature.cost);
  if (isVaries && (!chosenCost || chosenCost <= 0)) return null;

  const baseCost = isVaries
    ? (chosenCost ?? 0)
    : resolveBaseCost(feature.cost, { pb, level });
  const effectiveCost = siphonState.getEffectiveCost(baseCost, level);
  const currentEP = siphonState.currentEP;
  const newEP = currentEP - effectiveCost;

  const resolvedFocusDice = resolveFocusDice(feature.focusDice, { pb, cost: effectiveCost });
  const focusDice = siphonState.getEffectiveFocusDice(resolvedFocusDice);

  return {
    effectiveCost,
    newEP,
    warpWillTrigger: newEP < 0,
    focusDice,
  };
}

/**
 * Activates a siphon feature: deducts EP, rolls focus dice, adds active effect,
 * and returns the card to the selected deck.
 *
 * Called from drop handlers and double-click handlers.
 * Always auto-rolls focus dice regardless of dice mode setting.
 */
export function activateFeature(
  featureId: string,
  options?: { chosenCost?: number }
): ActivationResult | null {
  const feature = FEATURE_MAP.get(featureId);
  if (!feature) return null;

  const siphonState = useSiphonStore.getState();
  const { level, proficiencyBonus: pb } = useCharacterStore.getState();

  // Resolve cost
  const isVaries = isVariableCost(feature.cost);
  const baseCost = isVaries
    ? (options?.chosenCost ?? 0)
    : resolveBaseCost(feature.cost, { pb, level });
  const effectiveCost = siphonState.getEffectiveCost(baseCost, level);

  // Resolve and roll focus dice
  const resolvedFocusDice = resolveFocusDice(feature.focusDice, { pb, cost: effectiveCost });
  const effectiveFocusDice = siphonState.getEffectiveFocusDice(resolvedFocusDice);
  const expr = parseDiceExpression(effectiveFocusDice);
  const rollResult = rollDice(expr.count, expr.sides, expr.modifier);

  // Build active effect for duration-based features
  const durationMs = parseDurationToMs(feature.duration);
  const needsActiveEffect =
    feature.duration !== 'Instant' && feature.duration !== 'Triggered';

  const { spendResult, focusGained } = siphonState.performActivation({
    featureId,
    effectiveCost,
    focusRollResult: rollResult.total,
    level,
    activeEffect: needsActiveEffect
      ? {
          sourceType: 'siphon',
          sourceId: feature.id,
          sourceName: feature.name,
          description: feature.description,
          totalDuration: feature.duration,
          durationMs,
          requiresConcentration: feature.requiresConcentration ?? false,
          featureWarpEffect: feature.warpEffect ?? undefined,
        }
      : undefined,
  });

  return {
    spendResult,
    focusGained,
    warpTriggered: spendResult.warpTriggered,
  };
}
