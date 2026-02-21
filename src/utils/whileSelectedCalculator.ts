/**
 * Calculates "While Selected" effects that apply at the end of every long rest.
 *
 * Two features have While Selected duration:
 * - Supercapacitance: EP cost for extra features beyond PB (cost doubles when total > PB)
 * - Siphon Greed: Focus dice roll gained at each long rest
 *
 * Returns effects in application order: Supercapacitance (EP cost first) then Siphon Greed.
 */

export interface WhileSelectedEffect {
  featureId: string;
  featureName: string;
  epCost: number;
  focusGain: number; // 0 for dice-based (caller sets after rolling)
  focusDice: string | null; // non-null means dice need to be rolled by caller
  description: string;
}

export function calculateWhileSelectedEffects(
  selectedCardIds: string[],
  proficiencyBonus: number,
): WhileSelectedEffect[] {
  const effects: WhileSelectedEffect[] = [];

  // Supercapacitance: EP cost = extra features beyond PB, doubled when total > PB
  // Focus gain = undoubled cost (extra feature count)
  if (selectedCardIds.includes('supercapacitance')) {
    const extraFeatures = Math.max(0, selectedCardIds.length - proficiencyBonus);
    if (extraFeatures > 0) {
      effects.push({
        featureId: 'supercapacitance',
        featureName: 'Supercapacitance',
        epCost: extraFeatures * 2,
        focusGain: extraFeatures,
        focusDice: null,
        description: `${extraFeatures} extra feature${extraFeatures !== 1 ? 's' : ''} beyond PB`,
      });
    }
  }

  // Siphon Greed: 1d4 Focus gained at each long rest while selected
  // EP cost = 0, focus is dice-based (caller must roll and fill in focusGain)
  if (selectedCardIds.includes('siphon-greed')) {
    effects.push({
      featureId: 'siphon-greed',
      featureName: 'Siphon Greed',
      epCost: 0,
      focusGain: 0,
      focusDice: '1d4',
      description: 'Focus gained at long rest',
    });
  }

  return effects;
}
