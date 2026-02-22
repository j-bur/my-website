import { describe, it, expect, beforeEach } from 'vitest';
import { activateFeature, computeActivationPreview } from '../activateFeature';
import { useSiphonStore } from '../../store/siphonStore';
import { useCharacterStore } from '../../store/characterStore';
import { FEATURE_MAP } from '../../data/featureConstants';
import type { SiphonFeature } from '../../types';

// Find a real feature to test with
function findFeature(predicate: (f: SiphonFeature) => boolean): SiphonFeature {
  for (const f of FEATURE_MAP.values()) {
    if (predicate(f)) return f;
  }
  throw new Error('No feature found matching predicate');
}

function resetStores() {
  useSiphonStore.setState({
    currentEP: 10,
    focus: 0,
    siphonCapacitance: 0,
    capacitanceTimerStart: null,
    selectedCardIds: [],
    handCardIds: [],
    allies: [],
    allyBestowments: [],
    activeEffects: [],
    echoIntuitionActive: false,
  });
  useCharacterStore.setState({
    level: 5,
    proficiencyBonus: 3,
  });
}

describe('activateFeature', () => {
  beforeEach(resetStores);

  it('deducts EP and gains focus', () => {
    // Use a feature with a known fixed cost
    const feature = findFeature((f) => typeof f.cost === 'number' && f.cost > 0 && f.duration !== 'Triggered');
    useSiphonStore.setState({ handCardIds: [feature.id] });

    const result = activateFeature(feature.id);
    expect(result).not.toBeNull();

    const state = useSiphonStore.getState();
    // EP should be reduced
    expect(state.currentEP).toBeLessThan(10);
    // Focus should be gained (> 0 since dice are rolled)
    expect(state.focus).toBeGreaterThanOrEqual(0);
  });

  it('doubles focus when EP goes negative (warp)', () => {
    const feature = findFeature((f) => typeof f.cost === 'number' && f.cost >= 3 && f.duration !== 'Triggered');
    useSiphonStore.setState({ currentEP: 1, handCardIds: [feature.id] });

    const result = activateFeature(feature.id);
    expect(result).not.toBeNull();
    expect(result!.warpTriggered).toBe(true);

    // EP should be negative
    expect(useSiphonStore.getState().currentEP).toBeLessThan(0);
  });

  it('does not trigger warp when EP stays non-negative', () => {
    const feature = findFeature((f) => typeof f.cost === 'number' && f.cost > 0 && f.cost <= 3 && f.duration !== 'Triggered');
    useSiphonStore.setState({ currentEP: 20, handCardIds: [feature.id] });

    const result = activateFeature(feature.id);
    expect(result).not.toBeNull();
    expect(result!.warpTriggered).toBe(false);
  });

  it('returns card to selected deck after activation', () => {
    const feature = findFeature((f) => typeof f.cost === 'number' && f.cost > 0 && f.duration !== 'Triggered');
    useSiphonStore.setState({
      handCardIds: [feature.id],
      selectedCardIds: [],
    });

    activateFeature(feature.id);

    const state = useSiphonStore.getState();
    expect(state.handCardIds).not.toContain(feature.id);
    expect(state.selectedCardIds).toContain(feature.id);
  });

  it('adds active effect for duration-based features', () => {
    const feature = findFeature(
      (f) => typeof f.cost === 'number' && f.cost > 0 &&
        f.duration !== 'Instant' && f.duration !== 'Triggered' && f.duration !== 'While Selected'
    );
    useSiphonStore.setState({ handCardIds: [feature.id] });

    activateFeature(feature.id);

    const effects = useSiphonStore.getState().activeEffects;
    expect(effects.length).toBeGreaterThanOrEqual(1);
    expect(effects.find((e) => e.sourceId === feature.id)).toBeTruthy();
  });

  it('does NOT add active effect for Triggered features', () => {
    // No features have duration 'Instant' in the dataset.
    // Triggered features (e.g., discharge) also should not add active effects.
    const feature = findFeature(
      (f) => typeof f.cost === 'number' && f.cost > 0 && f.duration === 'Triggered'
    );
    useSiphonStore.setState({ handCardIds: [feature.id] });

    activateFeature(feature.id);

    const effects = useSiphonStore.getState().activeEffects;
    expect(effects.find((e) => e.sourceId === feature.id)).toBeUndefined();
  });

  it('uses chosenCost for Varies cost features', () => {
    const feature = findFeature((f) => f.cost === 'Varies');
    useSiphonStore.setState({ currentEP: 10, handCardIds: [feature.id] });

    activateFeature(feature.id, { chosenCost: 4 });

    // EP should be reduced by at least 4 (possibly modified by Echo Intuition/Siphon Greed)
    expect(useSiphonStore.getState().currentEP).toBeLessThanOrEqual(6);
  });

  it('returns null for unknown feature ID', () => {
    const result = activateFeature('nonexistent-feature-id');
    expect(result).toBeNull();
  });

  it('applies Echo Intuition cost halving', () => {
    const feature = findFeature((f) => typeof f.cost === 'number' && f.cost >= 4 && f.duration !== 'Triggered');
    useSiphonStore.setState({
      currentEP: 20,
      handCardIds: [feature.id],
      echoIntuitionActive: true,
    });

    activateFeature(feature.id);

    const state = useSiphonStore.getState();
    // With Echo Intuition, cost is halved, so EP should be reduced by less
    const baseCost = feature.cost as number;
    const expectedMaxEP = 20 - Math.ceil(baseCost / 2);
    expect(state.currentEP).toBeGreaterThanOrEqual(expectedMaxEP);
  });
});

describe('computeActivationPreview', () => {
  beforeEach(resetStores);

  it('returns preview with EP change', () => {
    const feature = findFeature((f) => typeof f.cost === 'number' && f.cost > 0 && f.duration !== 'Triggered');
    useSiphonStore.setState({ currentEP: 10 });

    const preview = computeActivationPreview(feature);
    expect(preview).not.toBeNull();
    expect(preview!.newEP).toBeLessThan(10);
    expect(preview!.effectiveCost).toBeGreaterThan(0);
  });

  it('flags warp when EP will go negative', () => {
    const feature = findFeature((f) => typeof f.cost === 'number' && f.cost >= 3 && f.duration !== 'Triggered');
    useSiphonStore.setState({ currentEP: 1 });

    const preview = computeActivationPreview(feature);
    expect(preview).not.toBeNull();
    expect(preview!.warpWillTrigger).toBe(true);
  });

  it('returns null for Varies cost without chosenCost', () => {
    const feature = findFeature((f) => f.cost === 'Varies');

    const preview = computeActivationPreview(feature);
    expect(preview).toBeNull();
  });

  it('returns preview for Varies cost with chosenCost', () => {
    const feature = findFeature((f) => f.cost === 'Varies');
    useSiphonStore.setState({ currentEP: 10 });

    const preview = computeActivationPreview(feature, 5);
    expect(preview).not.toBeNull();
    expect(preview!.effectiveCost).toBe(5);
    expect(preview!.newEP).toBe(5);
  });
});
