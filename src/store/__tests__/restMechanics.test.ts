import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSiphonStore } from '../siphonStore';
import { useCharacterStore } from '../characterStore';
import { useManifoldStore } from '../manifoldStore';

/**
 * Cross-store integration tests for rest mechanics.
 * Tests RULE-REST-001 through RULE-REST-006 as full rest flows
 * coordinating siphonStore + characterStore + manifoldStore.
 */

function resetAllStores() {
  useSiphonStore.setState({
    currentEP: 0,
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
  useCharacterStore.getState().resetCharacter();
  useManifoldStore.getState().resetManifold();
}

/**
 * Simulate the full Long Rest flow that LongRestDialog performs.
 */
function performFullLongRest(focusRollOverride?: number) {
  const charState = useCharacterStore.getState();
  const pb = charState.proficiencyBonus;
  const maxEP = charState.level;

  // 1. Siphon long rest
  const result = useSiphonStore.getState().longRest(pb, maxEP, focusRollOverride);

  // 2. Restore all hit dice
  useCharacterStore.getState().restoreAllHitDice();

  // 3. Restore max HP
  if (result.maxHPRestored > 0) {
    useCharacterStore.getState().restoreMaxHP(result.maxHPRestored);
  }

  // 4. Manifold long rest (motes + phase switch)
  useManifoldStore.getState().resetMotesOnLongRest();

  return result;
}

/**
 * Simulate the full Short Rest flow that ShortRestDialog performs.
 */
function performFullShortRest(
  hdToSpend: number,
  healingAmount: number,
  clearEffects: boolean
) {
  // 1. Spend hit dice
  if (hdToSpend > 0) {
    useCharacterStore.getState().spendHitDice(hdToSpend);
  }

  // 2. Heal
  if (healingAmount > 0) {
    const charState = useCharacterStore.getState();
    useCharacterStore.getState().setCurrentHP(
      Math.min(charState.reducedMaxHP, charState.currentHP + healingAmount)
    );
  }

  // 3. Clear effects
  useSiphonStore.getState().shortRest(clearEffects);

  // 4. Restore phase switch
  useManifoldStore.getState().resetPhaseSwitchOnShortRest();
}

describe('Rest Mechanics (Integration)', () => {
  beforeEach(() => {
    resetAllStores();
  });

  // ========================================
  // Long Rest
  // ========================================

  describe('Long Rest', () => {
    // RULE-REST-001: Long Rest clears hand and bestowments
    it('RULE-REST-001: clears hand cards (returns to selected) and ally bestowments', () => {
      useSiphonStore.setState({
        selectedCardIds: ['c'],
        handCardIds: ['a', 'b'],
        allyBestowments: [
          {
            id: 'best-1',
            allyId: 'ally-1',
            featureId: 'x',
            isFromSelectedDeck: true,
            bestowedAt: Date.now(),
          },
        ],
      });

      vi.spyOn(Math, 'random').mockReturnValue(0); // d4 = 1
      performFullLongRest(1);

      const state = useSiphonStore.getState();
      expect(state.handCardIds).toEqual([]);
      expect(state.allyBestowments).toEqual([]);
      // Hand cards return to selected deck
      expect(state.selectedCardIds).toContain('a');
      expect(state.selectedCardIds).toContain('b');
      expect(state.selectedCardIds).toContain('c');

      vi.restoreAllMocks();
    });

    // RULE-REST-002: Long Rest restores motes to max (8)
    it('RULE-REST-002: restores motes to 8', () => {
      useManifoldStore.setState({ motes: 3 });

      performFullLongRest(1);

      expect(useManifoldStore.getState().motes).toBe(8);
    });

    // RULE-REST-003: Long Rest restores all Hit Dice
    it('RULE-REST-003: restores all hit dice to max', () => {
      useCharacterStore.getState().setLevel(5);
      useCharacterStore.getState().restoreAllHitDice(); // hitDice = 5
      useCharacterStore.getState().spendHitDice(3);
      expect(useCharacterStore.getState().hitDice).toBe(2);

      performFullLongRest(1);

      expect(useCharacterStore.getState().hitDice).toBe(5);
      expect(useCharacterStore.getState().maxHitDice).toBe(5);
    });

    // RULE-EP-007 + RULE-EP-008: EP recovery = PB, capped at max
    it('recovers EP by PB (capped at level)', () => {
      useCharacterStore.getState().setLevel(5); // PB=3, maxEP=5
      useSiphonStore.setState({ currentEP: 0 });

      const result = performFullLongRest(1);

      expect(result.epRecovered).toBe(3); // PB=3
      expect(useSiphonStore.getState().currentEP).toBe(3);
    });

    it('EP recovery does not exceed max (level)', () => {
      useCharacterStore.getState().setLevel(5); // PB=3, maxEP=5
      useSiphonStore.setState({ currentEP: 4 });

      const result = performFullLongRest(1);

      expect(result.epRecovered).toBe(1); // Can only recover 1 to reach max 5
      expect(useSiphonStore.getState().currentEP).toBe(5);
    });

    // RULE-FOCUS-003: Focus reduced by d4 (min 0)
    it('reduces Focus by d4 roll (min 0)', () => {
      useSiphonStore.setState({ focus: 2 });

      const result = performFullLongRest(4); // d4 = 4

      expect(result.focusReduced).toBe(2); // Focus was 2, d4=4, clamped to 2 reduction
      expect(useSiphonStore.getState().focus).toBe(0);
    });

    it('focus roll override works for macro mode', () => {
      useSiphonStore.setState({ focus: 10 });

      const result = performFullLongRest(3); // User entered 3

      expect(result.focusReduced).toBe(3);
      expect(useSiphonStore.getState().focus).toBe(7);
    });

    // RULE-CAP-002: Capacitance clears on long rest
    it('RULE-CAP-002: clears capacitance', () => {
      useSiphonStore.setState({
        siphonCapacitance: 2,
        capacitanceTimerStart: Date.now(),
      });

      performFullLongRest(1);

      expect(useSiphonStore.getState().siphonCapacitance).toBe(0);
      expect(useSiphonStore.getState().capacitanceTimerStart).toBeNull();
    });

    // Long rest restores phase switch
    it('restores free phase switch', () => {
      useManifoldStore.setState({ phaseSwitchAvailable: false });

      performFullLongRest(1);

      expect(useManifoldStore.getState().phaseSwitchAvailable).toBe(true);
    });

    // Long rest clears short-duration effects
    it('clears effects with duration <= 8 hours', () => {
      const now = Date.now();
      useSiphonStore.setState({
        activeEffects: [
          {
            id: 'short',
            sourceType: 'siphon',
            sourceId: 'a',
            sourceName: 'Short',
            description: 'Short effect',
            totalDuration: '1 minute',
            durationMs: 60_000,
            startedAt: now,
            requiresConcentration: false,
            warpActive: false,
          },
          {
            id: 'long',
            sourceType: 'siphon',
            sourceId: 'b',
            sourceName: 'Long',
            description: 'Long effect',
            totalDuration: '24 hours',
            durationMs: 86_400_000,
            startedAt: now,
            requiresConcentration: false,
            warpActive: false,
          },
          {
            id: 'permanent',
            sourceType: 'siphon',
            sourceId: 'c',
            sourceName: 'Permanent',
            description: 'Permanent effect',
            totalDuration: 'Special',
            durationMs: null,
            startedAt: now,
            requiresConcentration: false,
            warpActive: false,
          },
        ],
      });

      performFullLongRest(1);

      const effects = useSiphonStore.getState().activeEffects;
      expect(effects).toHaveLength(2);
      expect(effects.map((e) => e.id)).toEqual(['long', 'permanent']);
    });

    // Siphon Greed EPR scaling: multiplier = floor(abs(EP) / level)
    it('Siphon Greed EPR: at EP=-10, level=5, multiplier=2 → EPR = PB*2', () => {
      useCharacterStore.getState().setLevel(5); // PB=3
      useSiphonStore.setState({
        currentEP: -10,
        selectedCardIds: ['siphon-greed'],
      });

      const result = performFullLongRest(1);

      // multiplier = floor(10/5) = 2, EPR = 3*2 = 6
      expect(result.epRecovered).toBe(6);
      expect(useSiphonStore.getState().currentEP).toBe(-4); // -10 + 6
    });

    it('Siphon Greed EPR: at EP=-15, level=5, multiplier=3 → EPR = PB*3', () => {
      useCharacterStore.getState().setLevel(5); // PB=3
      useSiphonStore.setState({
        currentEP: -15,
        selectedCardIds: ['siphon-greed'],
      });

      const result = performFullLongRest(1);

      // multiplier = floor(15/5) = 3, EPR = 3*3 = 9
      expect(result.epRecovered).toBe(9);
      expect(useSiphonStore.getState().currentEP).toBe(-6); // -15 + 9
    });

    it('Siphon Greed EPR: at EP=-5 (exactly echo drained), multiplier=1 → EPR = PB (no bonus)', () => {
      useCharacterStore.getState().setLevel(5); // PB=3
      useSiphonStore.setState({
        currentEP: -5,
        selectedCardIds: ['siphon-greed'],
      });

      const result = performFullLongRest(1);

      // multiplier = floor(5/5) = 1, EPR = 3*1 = 3 (same as without greed)
      expect(result.epRecovered).toBe(3);
      expect(useSiphonStore.getState().currentEP).toBe(-2); // -5 + 3
    });

    it('Siphon Greed EPR: not echo drained, no multiplier', () => {
      useCharacterStore.getState().setLevel(5); // PB=3
      useSiphonStore.setState({
        currentEP: -3, // Not echo drained (-3 > -5)
        selectedCardIds: ['siphon-greed'],
      });

      const result = performFullLongRest(1);

      // Not echo drained, so normal EPR = PB = 3
      expect(result.epRecovered).toBe(3);
      expect(useSiphonStore.getState().currentEP).toBe(0); // -3 + 3
    });

    // Long rest restores max HP
    it('restores max HP equal to EP recovered', () => {
      useCharacterStore.getState().setLevel(5);
      useCharacterStore.getState().setMaxHP(40);
      useCharacterStore.getState().reduceMaxHP(5); // Reduced to 35
      useSiphonStore.setState({ currentEP: 0 });

      const result = performFullLongRest(1);

      expect(result.maxHPRestored).toBe(3); // PB=3
      expect(useCharacterStore.getState().reducedMaxHP).toBe(38); // 35 + 3
    });
  });

  // ========================================
  // Short Rest
  // ========================================

  describe('Short Rest', () => {
    // RULE-REST-004: Short Rest restores free phase switch
    it('RULE-REST-004: restores free phase switch', () => {
      useManifoldStore.setState({ phaseSwitchAvailable: false });

      performFullShortRest(0, 0, false);

      expect(useManifoldStore.getState().phaseSwitchAvailable).toBe(true);
    });

    // RULE-REST-005: Short Rest does NOT affect EP or Focus
    it('RULE-REST-005: does not affect EP or Focus', () => {
      useSiphonStore.setState({ currentEP: -3, focus: 15 });

      performFullShortRest(0, 0, false);

      expect(useSiphonStore.getState().currentEP).toBe(-3);
      expect(useSiphonStore.getState().focus).toBe(15);
    });

    // Short Rest does NOT affect motes
    it('does not affect motes', () => {
      useManifoldStore.setState({ motes: 3 });

      performFullShortRest(0, 0, false);

      expect(useManifoldStore.getState().motes).toBe(3);
    });

    // Short Rest does NOT affect bestowments
    it('does not affect bestowments', () => {
      useSiphonStore.setState({
        handCardIds: ['a'],
        allyBestowments: [
          {
            id: 'best-1',
            allyId: 'ally-1',
            featureId: 'x',
            isFromSelectedDeck: true,
            bestowedAt: Date.now(),
          },
        ],
      });

      performFullShortRest(0, 0, false);

      expect(useSiphonStore.getState().handCardIds).toEqual(['a']);
      expect(useSiphonStore.getState().allyBestowments).toHaveLength(1);
    });

    // RULE-REST-006: Short Rest optionally clears short-duration effects
    it('RULE-REST-006: clears effects <= 1 hour when clearEffects=true', () => {
      const now = Date.now();
      useSiphonStore.setState({
        activeEffects: [
          {
            id: 'short',
            sourceType: 'siphon',
            sourceId: 'a',
            sourceName: 'Short',
            description: 'Short effect',
            totalDuration: '10 minutes',
            durationMs: 600_000,
            startedAt: now,
            requiresConcentration: false,
            warpActive: false,
          },
          {
            id: 'long',
            sourceType: 'siphon',
            sourceId: 'b',
            sourceName: 'Long',
            description: 'Long effect',
            totalDuration: '8 hours',
            durationMs: 28_800_000,
            startedAt: now,
            requiresConcentration: false,
            warpActive: false,
          },
        ],
      });

      performFullShortRest(0, 0, true);

      const effects = useSiphonStore.getState().activeEffects;
      expect(effects).toHaveLength(1);
      expect(effects[0].id).toBe('long');
    });

    it('RULE-REST-006: clears effects with exactly 1 hour duration', () => {
      const now = Date.now();
      useSiphonStore.setState({
        activeEffects: [
          {
            id: 'exactly-1h',
            sourceType: 'siphon',
            sourceId: 'a',
            sourceName: 'One Hour',
            description: 'Exactly 1 hour effect',
            totalDuration: '1 hour',
            durationMs: 3_600_000, // Exactly 1 hour
            startedAt: now,
            requiresConcentration: false,
            warpActive: false,
          },
          {
            id: 'over-1h',
            sourceType: 'siphon',
            sourceId: 'b',
            sourceName: 'Over One Hour',
            description: 'Over 1 hour effect',
            totalDuration: '2 hours',
            durationMs: 7_200_000,
            startedAt: now,
            requiresConcentration: false,
            warpActive: false,
          },
        ],
      });

      performFullShortRest(0, 0, true);

      const effects = useSiphonStore.getState().activeEffects;
      expect(effects).toHaveLength(1);
      expect(effects[0].id).toBe('over-1h'); // Exactly 1 hour was cleared
    });

    it('does not clear short-duration effects when clearEffects=false', () => {
      const now = Date.now();
      useSiphonStore.setState({
        activeEffects: [
          {
            id: 'short',
            sourceType: 'siphon',
            sourceId: 'a',
            sourceName: 'Short',
            description: 'Short effect',
            totalDuration: '10 minutes',
            durationMs: 600_000,
            startedAt: now,
            requiresConcentration: false,
            warpActive: false,
          },
        ],
      });

      performFullShortRest(0, 0, false);

      expect(useSiphonStore.getState().activeEffects).toHaveLength(1);
    });

    // Hit dice spending on short rest
    it('spends hit dice and heals', () => {
      useCharacterStore.getState().setLevel(5);
      useCharacterStore.getState().restoreAllHitDice(); // hitDice = 5
      useCharacterStore.getState().setMaxHP(40);
      useCharacterStore.getState().setCurrentHP(20);

      performFullShortRest(2, 15, false);

      expect(useCharacterStore.getState().hitDice).toBe(3); // 5 - 2
      expect(useCharacterStore.getState().currentHP).toBe(35); // 20 + 15
    });

    it('healing capped at reduced max HP', () => {
      useCharacterStore.getState().setLevel(5);
      useCharacterStore.getState().restoreAllHitDice();
      useCharacterStore.getState().setMaxHP(40);
      useCharacterStore.getState().setCurrentHP(35);

      performFullShortRest(1, 100, false);

      expect(useCharacterStore.getState().currentHP).toBe(40); // Capped at reducedMaxHP
    });
  });
});
