import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSiphonStore } from '../siphonStore';

function resetStore() {
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
}

describe('siphonStore', () => {
  beforeEach(() => {
    resetStore();
  });

  // ========================================
  // EP Actions (RULE-EP-001 through RULE-EP-005)
  // ========================================

  describe('spendEP', () => {
    // RULE-EP-001: EP can go negative
    it('RULE-EP-001: EP can go negative', () => {
      useSiphonStore.setState({ currentEP: 3 });
      const result = useSiphonStore.getState().spendEP(5, 5);
      expect(result.newEP).toBe(-2);
      expect(useSiphonStore.getState().currentEP).toBe(-2);
    });

    // RULE-EP-002: Warp triggers when EP negative AFTER deduction
    it('RULE-EP-002: warp triggers when EP goes negative', () => {
      useSiphonStore.setState({ currentEP: 2 });
      const result = useSiphonStore.getState().spendEP(5, 5);
      expect(result.warpTriggered).toBe(true);
      expect(result.newEP).toBe(-3);
    });

    // RULE-EP-003: Warp triggers even when already negative
    it('RULE-EP-003: warp triggers when already negative', () => {
      useSiphonStore.setState({ currentEP: -2 });
      const result = useSiphonStore.getState().spendEP(3, 5);
      expect(result.warpTriggered).toBe(true);
      expect(result.newEP).toBe(-5);
    });

    // RULE-EP-004: Warp does NOT trigger when EP stays non-negative
    it('RULE-EP-004: warp does NOT trigger when EP stays non-negative', () => {
      useSiphonStore.setState({ currentEP: 5 });
      const result = useSiphonStore.getState().spendEP(3, 5);
      expect(result.warpTriggered).toBe(false);
      expect(result.newEP).toBe(2);
    });

    // RULE-EP-005: Echo Drain at EP = -Level
    it('RULE-EP-005: echo drain at EP = -level', () => {
      useSiphonStore.setState({ currentEP: -3 });
      const result = useSiphonStore.getState().spendEP(2, 5);
      expect(result.isNowEchoDrained).toBe(true);
      expect(result.newEP).toBe(-5);
    });

    it('reports focusDoubled when EP goes negative', () => {
      useSiphonStore.setState({ currentEP: 2 });
      const result = useSiphonStore.getState().spendEP(5, 5);
      expect(result.focusDoubled).toBe(true);
    });

    it('hpReduction equals cost when already echo drained', () => {
      useSiphonStore.setState({ currentEP: -5 }); // already at -level for level 5
      const result = useSiphonStore.getState().spendEP(3, 5);
      expect(result.hpReduction).toBe(3);
    });

    it('hpReduction is 0 when not already echo drained', () => {
      useSiphonStore.setState({ currentEP: -3 });
      const result = useSiphonStore.getState().spendEP(2, 5); // goes to -5 = -level, but was NOT drained before
      expect(result.hpReduction).toBe(0);
    });
  });

  // RULE-EP-006: EP recovery capped at max
  describe('recoverEP', () => {
    it('RULE-EP-006: EP recovery capped at max', () => {
      useSiphonStore.setState({ currentEP: 3 });
      useSiphonStore.getState().recoverEP(10, 5);
      expect(useSiphonStore.getState().currentEP).toBe(5);
    });

    it('recovers EP normally when under max', () => {
      useSiphonStore.setState({ currentEP: -2 });
      useSiphonStore.getState().recoverEP(3, 5);
      expect(useSiphonStore.getState().currentEP).toBe(1);
    });
  });

  describe('setEP', () => {
    it('directly sets EP value', () => {
      useSiphonStore.getState().setEP(-10);
      expect(useSiphonStore.getState().currentEP).toBe(-10);
    });
  });

  // ========================================
  // Focus Actions (RULE-FOCUS-001 through RULE-FOCUS-004)
  // ========================================

  describe('addFocus', () => {
    // RULE-FOCUS-001: Focus doubles when EP negative
    it('RULE-FOCUS-001: focus doubles when EP negative', () => {
      useSiphonStore.setState({ currentEP: -2, focus: 0 });
      const actual = useSiphonStore.getState().addFocus(10);
      expect(actual).toBe(20);
      expect(useSiphonStore.getState().focus).toBe(20);
    });

    // RULE-FOCUS-002: Focus does NOT double when EP non-negative
    it('RULE-FOCUS-002: focus does NOT double when EP non-negative', () => {
      useSiphonStore.setState({ currentEP: 3, focus: 0 });
      const actual = useSiphonStore.getState().addFocus(10);
      expect(actual).toBe(10);
      expect(useSiphonStore.getState().focus).toBe(10);
    });

    it('focus doubles when EP is exactly 0 — EP not negative', () => {
      useSiphonStore.setState({ currentEP: 0, focus: 0 });
      const actual = useSiphonStore.getState().addFocus(5);
      expect(actual).toBe(5); // EP=0 is NOT negative
    });
  });

  describe('reduceFocus', () => {
    // RULE-FOCUS-004: Focus cannot go below 0
    it('RULE-FOCUS-004: focus cannot go below 0', () => {
      useSiphonStore.setState({ focus: 3 });
      useSiphonStore.getState().reduceFocus(10);
      expect(useSiphonStore.getState().focus).toBe(0);
    });
  });

  describe('setFocus', () => {
    it('sets focus with min 0', () => {
      useSiphonStore.getState().setFocus(-5);
      expect(useSiphonStore.getState().focus).toBe(0);
    });
  });

  // ========================================
  // Capacitance (RULE-CAP-001, RULE-CAP-002)
  // ========================================

  describe('capacitance', () => {
    it('addCapacitance increments and starts timer', () => {
      useSiphonStore.getState().addCapacitance();
      const state = useSiphonStore.getState();
      expect(state.siphonCapacitance).toBe(1);
      expect(state.capacitanceTimerStart).not.toBeNull();
    });

    it('addCapacitance does not reset timer on subsequent adds', () => {
      useSiphonStore.getState().addCapacitance();
      const firstTimer = useSiphonStore.getState().capacitanceTimerStart;
      useSiphonStore.getState().addCapacitance();
      expect(useSiphonStore.getState().capacitanceTimerStart).toBe(firstTimer);
    });

    it('expendCapacitance decrements and clears timer at 0', () => {
      useSiphonStore.getState().addCapacitance();
      useSiphonStore.getState().addCapacitance();
      useSiphonStore.getState().expendCapacitance(1);
      expect(useSiphonStore.getState().siphonCapacitance).toBe(1);
      expect(useSiphonStore.getState().capacitanceTimerStart).not.toBeNull();
      useSiphonStore.getState().expendCapacitance(1);
      expect(useSiphonStore.getState().siphonCapacitance).toBe(0);
      expect(useSiphonStore.getState().capacitanceTimerStart).toBeNull();
    });

    it('clearCapacitance resets to 0', () => {
      useSiphonStore.getState().addCapacitance();
      useSiphonStore.getState().addCapacitance();
      useSiphonStore.getState().clearCapacitance();
      expect(useSiphonStore.getState().siphonCapacitance).toBe(0);
      expect(useSiphonStore.getState().capacitanceTimerStart).toBeNull();
    });
  });

  // ========================================
  // Card Selection (RULE-CARD-008)
  // ========================================

  describe('card selection', () => {
    // RULE-CARD-008: Max selected cards = proficiency bonus
    it('RULE-CARD-008: cannot exceed maxCards', () => {
      const store = useSiphonStore.getState();
      store.selectCard('a', 3);
      store.selectCard('b', 3);
      store.selectCard('c', 3);
      const result = useSiphonStore.getState().selectCard('d', 3);
      expect(result).toBe(false);
      expect(useSiphonStore.getState().selectedCardIds).toHaveLength(3);
    });

    it('cannot select duplicate cards', () => {
      useSiphonStore.getState().selectCard('a', 6);
      const result = useSiphonStore.getState().selectCard('a', 6);
      expect(result).toBe(false);
      expect(useSiphonStore.getState().selectedCardIds).toHaveLength(1);
    });

    it('deselectCard removes card', () => {
      useSiphonStore.getState().selectCard('a', 6);
      useSiphonStore.getState().selectCard('b', 6);
      useSiphonStore.getState().deselectCard('a');
      expect(useSiphonStore.getState().selectedCardIds).toEqual(['b']);
    });

    it('clearSelection clears all zones', () => {
      useSiphonStore.setState({
        selectedCardIds: ['a', 'b'],
        handCardIds: ['c'],
        allyBestowments: [{ id: '1', allyId: 'x', featureId: 'a', isFromSelectedDeck: true, bestowedAt: 0 }],
      });
      useSiphonStore.getState().clearSelection();
      const state = useSiphonStore.getState();
      expect(state.selectedCardIds).toEqual([]);
      expect(state.handCardIds).toEqual([]);
      expect(state.allyBestowments).toEqual([]);
    });

    it('setSelectedCards clears hand and bestowments', () => {
      useSiphonStore.setState({
        selectedCardIds: ['old'],
        handCardIds: ['x'],
        allyBestowments: [{ id: '1', allyId: 'x', featureId: 'old', isFromSelectedDeck: true, bestowedAt: 0 }],
      });
      useSiphonStore.getState().setSelectedCards(['a', 'b']);
      const state = useSiphonStore.getState();
      expect(state.selectedCardIds).toEqual(['a', 'b']);
      expect(state.handCardIds).toEqual([]);
      expect(state.allyBestowments).toEqual([]);
    });

    it('isCardSelected returns correct boolean', () => {
      useSiphonStore.setState({ selectedCardIds: ['a', 'b'] });
      expect(useSiphonStore.getState().isCardSelected('a')).toBe(true);
      expect(useSiphonStore.getState().isCardSelected('z')).toBe(false);
    });
  });

  // ========================================
  // Bestow Actions (RULE-CARD-005, RULE-CARD-006)
  // ========================================

  describe('bestowToSelf', () => {
    // RULE-CARD-005: bestowToSelf moves card from deck to hand
    it('RULE-CARD-005: moves card from selected to hand', () => {
      useSiphonStore.setState({ selectedCardIds: ['a', 'b'], handCardIds: [] });
      useSiphonStore.getState().bestowToSelf('a');
      const state = useSiphonStore.getState();
      expect(state.selectedCardIds).toEqual(['b']);
      expect(state.handCardIds).toEqual(['a']);
    });

    // RULE-CARD-006: Cannot bestow card not in selected deck
    it('RULE-CARD-006: no-op if card not in selected deck', () => {
      useSiphonStore.setState({ selectedCardIds: ['a'], handCardIds: [] });
      useSiphonStore.getState().bestowToSelf('z');
      const state = useSiphonStore.getState();
      expect(state.selectedCardIds).toEqual(['a']);
      expect(state.handCardIds).toEqual([]);
    });
  });

  describe('bestowToAlly', () => {
    it('creates bestowment record for valid ally', () => {
      useSiphonStore.setState({
        selectedCardIds: ['subtle-luck'],
        allies: [{ id: 'ally1', name: 'Briar' }],
      });
      useSiphonStore.getState().bestowToAlly('subtle-luck', 'ally1');
      const state = useSiphonStore.getState();
      expect(state.allyBestowments).toHaveLength(1);
      expect(state.allyBestowments[0].featureId).toBe('subtle-luck');
      expect(state.allyBestowments[0].allyId).toBe('ally1');
    });

    // RULE-ALLY-001: Special cost features cannot be bestowed to allies
    it('RULE-ALLY-001: blocks special cost features', () => {
      // 'longing' has isSpecialCost: true in siphonFeatures.ts
      useSiphonStore.setState({
        selectedCardIds: ['longing'],
        allies: [{ id: 'ally1', name: 'Briar' }],
      });
      useSiphonStore.getState().bestowToAlly('longing', 'ally1');
      expect(useSiphonStore.getState().allyBestowments).toHaveLength(0);
    });

    it('no-op if ally does not exist', () => {
      useSiphonStore.setState({ selectedCardIds: ['subtle-luck'], allies: [] });
      useSiphonStore.getState().bestowToAlly('subtle-luck', 'nonexistent');
      expect(useSiphonStore.getState().allyBestowments).toHaveLength(0);
    });
  });

  // ========================================
  // Activate Actions (RULE-CARD-002, RULE-CARD-007)
  // ========================================

  describe('activateFromHand', () => {
    // RULE-CARD-002: Cards return to deck after activation
    it('RULE-CARD-002: moves card from hand back to selected deck', () => {
      useSiphonStore.setState({
        handCardIds: ['temporal-surge'],
        selectedCardIds: ['other-card'],
      });
      useSiphonStore.getState().activateFromHand('temporal-surge');
      const state = useSiphonStore.getState();
      expect(state.handCardIds).toEqual([]);
      expect(state.selectedCardIds).toContain('temporal-surge');
      expect(state.selectedCardIds).toContain('other-card');
    });
  });

  describe('returnCardToDeck', () => {
    it('returns card from hand to deck', () => {
      useSiphonStore.setState({ handCardIds: ['a'], selectedCardIds: ['b'] });
      useSiphonStore.getState().returnCardToDeck('a');
      const state = useSiphonStore.getState();
      expect(state.handCardIds).toEqual([]);
      expect(state.selectedCardIds).toContain('a');
    });
  });

  describe('replaceSelectedCard', () => {
    // RULE-CARD-007: Manifestation replaces itself in selected deck
    it('RULE-CARD-007: replaces card in selected deck', () => {
      useSiphonStore.setState({ selectedCardIds: ['manifestation', 'other'] });
      useSiphonStore.getState().replaceSelectedCard('manifestation', 'new-feature');
      expect(useSiphonStore.getState().selectedCardIds).toEqual(['new-feature', 'other']);
    });
  });

  // ========================================
  // getDeckCards / getHandCards (RULE-CARD-001, RULE-CARD-003)
  // ========================================

  describe('getDeckCards / getHandCards', () => {
    // RULE-CARD-001: Hand contains only self-bestowed cards
    it('RULE-CARD-001: getDeckCards excludes hand cards', () => {
      useSiphonStore.setState({
        selectedCardIds: ['a', 'b', 'c'],
        handCardIds: ['b'],
      });
      expect(useSiphonStore.getState().getDeckCards()).toEqual(['a', 'c']);
      expect(useSiphonStore.getState().getHandCards()).toContain('b');
    });

    // RULE-CARD-003: Triggered features always logically in hand while selected
    it('RULE-CARD-003: triggered features appear in hand, not deck', () => {
      // 'discharge' has duration: 'Triggered' in siphonFeatures.ts
      // 'subtle-luck' has duration: '1 hour' (not triggered)
      useSiphonStore.setState({
        selectedCardIds: ['subtle-luck', 'discharge'],
        handCardIds: [],
      });
      const deckCards = useSiphonStore.getState().getDeckCards();
      const handCards = useSiphonStore.getState().getHandCards();
      // discharge should be in hand (triggered), not in deck
      expect(handCards).toContain('discharge');
      expect(deckCards).not.toContain('discharge');
      // subtle-luck is not triggered, so it's in deck
      expect(deckCards).toContain('subtle-luck');
    });
  });

  // ========================================
  // Ally Management (RULE-ALLY-002)
  // ========================================

  describe('ally management', () => {
    it('addAlly creates ally and returns id', () => {
      const id = useSiphonStore.getState().addAlly('Briar');
      const state = useSiphonStore.getState();
      expect(state.allies).toHaveLength(1);
      expect(state.allies[0].name).toBe('Briar');
      expect(state.allies[0].id).toBe(id);
    });

    // RULE-ALLY-002: Removing ally clears their bestowments
    it('RULE-ALLY-002: removeAlly clears bestowments for that ally', () => {
      const allyId = useSiphonStore.getState().addAlly('Briar');
      useSiphonStore.setState({
        allyBestowments: [
          { id: 'b1', allyId, featureId: 'a', isFromSelectedDeck: true, bestowedAt: 0 },
          { id: 'b2', allyId: 'other', featureId: 'b', isFromSelectedDeck: true, bestowedAt: 0 },
        ],
      });
      useSiphonStore.getState().removeAlly(allyId);
      const state = useSiphonStore.getState();
      expect(state.allies).toHaveLength(0);
      expect(state.allyBestowments).toHaveLength(1);
      expect(state.allyBestowments[0].allyId).toBe('other');
    });

    it('renameAlly updates ally name', () => {
      const id = useSiphonStore.getState().addAlly('Briar');
      useSiphonStore.getState().renameAlly(id, 'Thorn');
      expect(useSiphonStore.getState().allies[0].name).toBe('Thorn');
    });

    it('clearAllyBestowments clears only for specified ally', () => {
      useSiphonStore.setState({
        allyBestowments: [
          { id: 'b1', allyId: 'a1', featureId: 'x', isFromSelectedDeck: true, bestowedAt: 0 },
          { id: 'b2', allyId: 'a2', featureId: 'y', isFromSelectedDeck: true, bestowedAt: 0 },
        ],
      });
      useSiphonStore.getState().clearAllyBestowments('a1');
      expect(useSiphonStore.getState().allyBestowments).toHaveLength(1);
      expect(useSiphonStore.getState().allyBestowments[0].allyId).toBe('a2');
    });
  });

  // ========================================
  // Active Effects
  // ========================================

  describe('active effects', () => {
    it('addActiveEffect creates effect with id and startedAt', () => {
      const id = useSiphonStore.getState().addActiveEffect({
        sourceType: 'siphon',
        sourceId: 'temporal-surge',
        sourceName: 'Temporal Surge',
        description: 'Extra action',
        totalDuration: '10 minutes',
        durationMs: 600000,
        requiresConcentration: false,
        warpActive: false,
      });
      const state = useSiphonStore.getState();
      expect(state.activeEffects).toHaveLength(1);
      expect(state.activeEffects[0].id).toBe(id);
      expect(state.activeEffects[0].startedAt).toBeGreaterThan(0);
    });

    it('removeActiveEffect removes by id', () => {
      const id = useSiphonStore.getState().addActiveEffect({
        sourceType: 'siphon',
        sourceId: 'test',
        sourceName: 'Test',
        description: 'Test',
        totalDuration: '1 hour',
        durationMs: 3600000,
        requiresConcentration: false,
        warpActive: false,
      });
      useSiphonStore.getState().removeActiveEffect(id);
      expect(useSiphonStore.getState().activeEffects).toHaveLength(0);
    });

    it('clearExpiredEffects removes expired timed effects', () => {
      const pastTime = Date.now() - 100000;
      useSiphonStore.setState({
        activeEffects: [
          {
            id: 'expired',
            sourceType: 'siphon',
            sourceId: 'a',
            sourceName: 'A',
            description: 'A',
            startedAt: pastTime,
            totalDuration: '1 minute',
            durationMs: 60000,
            requiresConcentration: false,
            warpActive: false,
          },
          {
            id: 'permanent',
            sourceType: 'siphon',
            sourceId: 'b',
            sourceName: 'B',
            description: 'B',
            startedAt: pastTime,
            totalDuration: 'Permanent',
            durationMs: null,
            requiresConcentration: false,
            warpActive: false,
          },
        ],
      });
      useSiphonStore.getState().clearExpiredEffects();
      const state = useSiphonStore.getState();
      expect(state.activeEffects).toHaveLength(1);
      expect(state.activeEffects[0].id).toBe('permanent');
    });

    it('clearEffectsBelowDuration removes short-duration effects', () => {
      useSiphonStore.setState({
        activeEffects: [
          {
            id: 'short',
            sourceType: 'siphon',
            sourceId: 'a',
            sourceName: 'A',
            description: 'A',
            startedAt: Date.now(),
            totalDuration: '10 minutes',
            durationMs: 600000,
            requiresConcentration: false,
            warpActive: false,
          },
          {
            id: 'long',
            sourceType: 'siphon',
            sourceId: 'b',
            sourceName: 'B',
            description: 'B',
            startedAt: Date.now(),
            totalDuration: '8 hours',
            durationMs: 28800000,
            requiresConcentration: false,
            warpActive: false,
          },
          {
            id: 'perm',
            sourceType: 'siphon',
            sourceId: 'c',
            sourceName: 'C',
            description: 'C',
            startedAt: Date.now(),
            totalDuration: 'Permanent',
            durationMs: null,
            requiresConcentration: false,
            warpActive: false,
          },
        ],
      });
      useSiphonStore.getState().clearEffectsBelowDuration(3600000); // 1 hour
      const state = useSiphonStore.getState();
      expect(state.activeEffects).toHaveLength(2);
      expect(state.activeEffects.map((e) => e.id)).toEqual(['long', 'perm']);
    });
  });

  // ========================================
  // Cost Modifiers (RULE-GREED-001 through RULE-GREED-004, RULE-INTUITION-001/002)
  // ========================================

  describe('getEffectiveCost', () => {
    // RULE-GREED-001: Siphon Greed halves cost when selected AND echo drained
    it('RULE-GREED-001: halves cost with Siphon Greed + echo drained', () => {
      useSiphonStore.setState({
        selectedCardIds: ['siphon-greed'],
        currentEP: -5,
      });
      expect(useSiphonStore.getState().getEffectiveCost(10, 5)).toBe(5);
    });

    // RULE-GREED-002: Cost halving does NOT apply without Siphon Greed selected
    it('RULE-GREED-002: no halving without Siphon Greed', () => {
      useSiphonStore.setState({
        selectedCardIds: [],
        currentEP: -5,
      });
      expect(useSiphonStore.getState().getEffectiveCost(10, 5)).toBe(10);
    });

    // RULE-GREED-003: Cost halving does NOT apply when not echo drained
    it('RULE-GREED-003: no halving when not echo drained', () => {
      useSiphonStore.setState({
        selectedCardIds: ['siphon-greed'],
        currentEP: -3,
      });
      expect(useSiphonStore.getState().getEffectiveCost(10, 5)).toBe(10);
    });

    // RULE-GREED-004: Halved cost minimum is 1
    it('RULE-GREED-004: halved cost minimum is 1', () => {
      useSiphonStore.setState({
        selectedCardIds: ['siphon-greed'],
        currentEP: -5,
      });
      expect(useSiphonStore.getState().getEffectiveCost(1, 5)).toBe(1);
    });

    // RULE-INTUITION-001: Echo Intuition halves cost
    it('RULE-INTUITION-001: Echo Intuition halves cost', () => {
      useSiphonStore.setState({ echoIntuitionActive: true });
      expect(useSiphonStore.getState().getEffectiveCost(10, 5)).toBe(5);
    });

    // RULE-INTUITION-002: Echo Intuition and Siphon Greed stack
    it('RULE-INTUITION-002: Siphon Greed + Echo Intuition stack', () => {
      useSiphonStore.setState({
        selectedCardIds: ['siphon-greed'],
        currentEP: -5,
        echoIntuitionActive: true,
      });
      // 20 -> 10 (greed) -> 5 (intuition)
      expect(useSiphonStore.getState().getEffectiveCost(20, 5)).toBe(5);
    });
  });

  describe('getEffectiveFocusDice', () => {
    it('returns unchanged when Echo Intuition is not active', () => {
      expect(useSiphonStore.getState().getEffectiveFocusDice('4d8')).toBe('4d8');
    });

    it('halves dice count when Echo Intuition is active', () => {
      useSiphonStore.setState({ echoIntuitionActive: true });
      expect(useSiphonStore.getState().getEffectiveFocusDice('4d8')).toBe('2d8');
    });

    it('minimum 1 die when halving', () => {
      useSiphonStore.setState({ echoIntuitionActive: true });
      expect(useSiphonStore.getState().getEffectiveFocusDice('1d8')).toBe('1d8');
    });
  });

  describe('computed helpers', () => {
    it('isEPNegative', () => {
      useSiphonStore.setState({ currentEP: -1 });
      expect(useSiphonStore.getState().isEPNegative()).toBe(true);
      useSiphonStore.setState({ currentEP: 0 });
      expect(useSiphonStore.getState().isEPNegative()).toBe(false);
    });

    it('isEchoDrained', () => {
      useSiphonStore.setState({ currentEP: -5 });
      expect(useSiphonStore.getState().isEchoDrained(5)).toBe(true);
      useSiphonStore.setState({ currentEP: -4 });
      expect(useSiphonStore.getState().isEchoDrained(5)).toBe(false);
    });

    it('hasSiphonGreedSelected', () => {
      useSiphonStore.setState({ selectedCardIds: ['siphon-greed'] });
      expect(useSiphonStore.getState().hasSiphonGreedSelected()).toBe(true);
      useSiphonStore.setState({ selectedCardIds: [] });
      expect(useSiphonStore.getState().hasSiphonGreedSelected()).toBe(false);
    });

    it('setEchoIntuitionActive', () => {
      useSiphonStore.getState().setEchoIntuitionActive(true);
      expect(useSiphonStore.getState().echoIntuitionActive).toBe(true);
    });
  });

  // ========================================
  // Rest Actions (RULE-REST-001, RULE-REST-005, RULE-REST-006, RULE-EP-007, RULE-EP-008, RULE-CAP-002)
  // ========================================

  describe('longRest', () => {
    // RULE-EP-007: Long Rest EP recovery = PB
    it('RULE-EP-007: recovers EP by PB', () => {
      useSiphonStore.setState({ currentEP: 0, focus: 0, selectedCardIds: [], handCardIds: [] });
      vi.spyOn(Math, 'random').mockReturnValue(0); // d4 = 1
      const result = useSiphonStore.getState().longRest(3, 5);
      expect(result.epRecovered).toBe(3);
      expect(useSiphonStore.getState().currentEP).toBe(3);
      vi.restoreAllMocks();
    });

    // RULE-EP-008: Long Rest EP recovery does not exceed max
    it('RULE-EP-008: EP recovery capped at max', () => {
      useSiphonStore.setState({ currentEP: 4, focus: 0, selectedCardIds: [], handCardIds: [] });
      vi.spyOn(Math, 'random').mockReturnValue(0);
      const result = useSiphonStore.getState().longRest(3, 5);
      expect(result.epRecovered).toBe(1); // 4+3=7, capped at 5, so recovered 1
      expect(useSiphonStore.getState().currentEP).toBe(5);
      vi.restoreAllMocks();
    });

    // RULE-FOCUS-003: Long Rest Focus reduced by d4 (min 0)
    it('RULE-FOCUS-003: focus reduced by d4, min 0', () => {
      useSiphonStore.setState({ currentEP: 0, focus: 2, selectedCardIds: [], handCardIds: [] });
      vi.spyOn(Math, 'random').mockReturnValue(0.75); // d4 = 4
      const result = useSiphonStore.getState().longRest(3, 5);
      expect(result.focusReduced).toBe(2); // focus was 2, d4=4, min 0
      expect(useSiphonStore.getState().focus).toBe(0);
      vi.restoreAllMocks();
    });

    // RULE-REST-001: Long Rest clears hand and bestowments
    it('RULE-REST-001: clears hand and bestowments', () => {
      useSiphonStore.setState({
        currentEP: 0,
        focus: 0,
        selectedCardIds: ['b'],
        handCardIds: ['a'],
        allyBestowments: [{ id: '1', allyId: 'x', featureId: 'c', isFromSelectedDeck: true, bestowedAt: 0 }],
      });
      vi.spyOn(Math, 'random').mockReturnValue(0);
      useSiphonStore.getState().longRest(3, 5);
      const state = useSiphonStore.getState();
      expect(state.handCardIds).toEqual([]);
      expect(state.allyBestowments).toEqual([]);
      // 'a' should be back in selected deck
      expect(state.selectedCardIds).toContain('a');
      expect(state.selectedCardIds).toContain('b');
      vi.restoreAllMocks();
    });

    // RULE-CAP-002: Capacitance clears on long rest
    it('RULE-CAP-002: clears capacitance', () => {
      useSiphonStore.setState({
        currentEP: 0,
        focus: 0,
        selectedCardIds: [],
        handCardIds: [],
        siphonCapacitance: 3,
        capacitanceTimerStart: Date.now(),
      });
      vi.spyOn(Math, 'random').mockReturnValue(0);
      useSiphonStore.getState().longRest(3, 5);
      expect(useSiphonStore.getState().siphonCapacitance).toBe(0);
      expect(useSiphonStore.getState().capacitanceTimerStart).toBeNull();
      vi.restoreAllMocks();
    });

    it('clears active effects with duration < 8 hours', () => {
      useSiphonStore.setState({
        currentEP: 0,
        focus: 0,
        selectedCardIds: [],
        handCardIds: [],
        activeEffects: [
          {
            id: 'short',
            sourceType: 'siphon',
            sourceId: 'a',
            sourceName: 'A',
            description: 'A',
            startedAt: Date.now(),
            totalDuration: '1 hour',
            durationMs: 3600000,
            requiresConcentration: false,
            warpActive: false,
          },
          {
            id: 'long',
            sourceType: 'siphon',
            sourceId: 'b',
            sourceName: 'B',
            description: 'B',
            startedAt: Date.now(),
            totalDuration: '24 hours',
            durationMs: 86400000,
            requiresConcentration: false,
            warpActive: false,
          },
          {
            id: 'perm',
            sourceType: 'siphon',
            sourceId: 'c',
            sourceName: 'C',
            description: 'C',
            startedAt: Date.now(),
            totalDuration: 'Permanent',
            durationMs: null,
            requiresConcentration: false,
            warpActive: false,
          },
        ],
      });
      vi.spyOn(Math, 'random').mockReturnValue(0);
      useSiphonStore.getState().longRest(3, 5);
      const effects = useSiphonStore.getState().activeEffects;
      expect(effects).toHaveLength(2);
      expect(effects.map((e) => e.id)).toEqual(['long', 'perm']);
      vi.restoreAllMocks();
    });

    it('Siphon Greed scales EP recovery by integer multiples over echo drain', () => {
      useSiphonStore.setState({
        currentEP: -10,
        focus: 0,
        selectedCardIds: ['siphon-greed'],
        handCardIds: [],
      });
      vi.spyOn(Math, 'random').mockReturnValue(0);
      const result = useSiphonStore.getState().longRest(3, 5);
      // Siphon Greed: multiplier = floor(abs(-10) / 5) = 2, EPR = 3 * 2 = 6
      // -10 + 6 = -4, capped at 5 but -4 < 5, so newEP = -4
      expect(result.epRecovered).toBe(6);
      expect(useSiphonStore.getState().currentEP).toBe(-4);
      vi.restoreAllMocks();
    });
  });

  describe('shortRest', () => {
    // RULE-REST-005: Short Rest does NOT affect EP or Focus
    it('RULE-REST-005: does not affect EP or Focus', () => {
      useSiphonStore.setState({ currentEP: -3, focus: 15 });
      useSiphonStore.getState().shortRest(true);
      expect(useSiphonStore.getState().currentEP).toBe(-3);
      expect(useSiphonStore.getState().focus).toBe(15);
    });

    // RULE-REST-006: Short Rest optionally clears short-duration effects
    it('RULE-REST-006: clears short-duration effects when flag is true', () => {
      useSiphonStore.setState({
        activeEffects: [
          {
            id: 'short',
            sourceType: 'siphon',
            sourceId: 'a',
            sourceName: 'A',
            description: 'A',
            startedAt: Date.now(),
            totalDuration: '10 minutes',
            durationMs: 600000,
            requiresConcentration: false,
            warpActive: false,
          },
          {
            id: 'long',
            sourceType: 'siphon',
            sourceId: 'b',
            sourceName: 'B',
            description: 'B',
            startedAt: Date.now(),
            totalDuration: '8 hours',
            durationMs: 28800000,
            requiresConcentration: false,
            warpActive: false,
          },
        ],
      });
      useSiphonStore.getState().shortRest(true);
      const effects = useSiphonStore.getState().activeEffects;
      expect(effects).toHaveLength(1);
      expect(effects[0].id).toBe('long');
    });

    it('does not clear short-duration effects when flag is false', () => {
      useSiphonStore.setState({
        activeEffects: [
          {
            id: 'short',
            sourceType: 'siphon',
            sourceId: 'a',
            sourceName: 'A',
            description: 'A',
            startedAt: Date.now(),
            totalDuration: '10 minutes',
            durationMs: 600000,
            requiresConcentration: false,
            warpActive: false,
          },
        ],
      });
      useSiphonStore.getState().shortRest(false);
      expect(useSiphonStore.getState().activeEffects).toHaveLength(1);
    });
  });

  // ========================================
  // performActivation
  // ========================================

  describe('performActivation', () => {
    it('spends EP, adds focus, and returns card to deck', () => {
      useSiphonStore.setState({
        currentEP: 10,
        focus: 0,
        handCardIds: ['subtle-luck'],
        selectedCardIds: [],
      });

      const result = useSiphonStore.getState().performActivation({
        featureId: 'subtle-luck',
        effectiveCost: 3,
        focusRollResult: 7,
        level: 5,
      });

      const state = useSiphonStore.getState();
      expect(state.currentEP).toBe(7);
      expect(state.focus).toBe(7);
      expect(state.handCardIds).not.toContain('subtle-luck');
      expect(state.selectedCardIds).toContain('subtle-luck');
      expect(result.spendResult.warpTriggered).toBe(false);
      expect(result.focusGained).toBe(7);
    });

    it('doubles focus when EP goes negative (warp)', () => {
      useSiphonStore.setState({
        currentEP: 2,
        focus: 0,
        handCardIds: ['subtle-luck'],
        selectedCardIds: [],
      });

      const result = useSiphonStore.getState().performActivation({
        featureId: 'subtle-luck',
        effectiveCost: 5,
        focusRollResult: 4,
        level: 5,
      });

      expect(useSiphonStore.getState().currentEP).toBe(-3);
      expect(useSiphonStore.getState().focus).toBe(8); // 4 * 2
      expect(result.spendResult.warpTriggered).toBe(true);
      expect(result.focusGained).toBe(8);
    });

    it('adds active effect with warp info when provided', () => {
      useSiphonStore.setState({
        currentEP: 1,
        focus: 0,
        handCardIds: ['test-feature'],
        selectedCardIds: [],
      });

      useSiphonStore.getState().performActivation({
        featureId: 'test-feature',
        effectiveCost: 3,
        focusRollResult: 5,
        level: 5,
        activeEffect: {
          sourceType: 'siphon',
          sourceId: 'test-feature',
          sourceName: 'Test Feature',
          description: 'A test.',
          totalDuration: '10 minutes',
          durationMs: 600000,
          requiresConcentration: false,
          featureWarpEffect: 'Reality flickers!',
        },
      });

      const effects = useSiphonStore.getState().activeEffects;
      expect(effects).toHaveLength(1);
      expect(effects[0].warpActive).toBe(true); // EP went negative
      expect(effects[0].warpDescription).toBe('Reality flickers!');
    });

    it('does NOT set warp description when warp does not trigger', () => {
      useSiphonStore.setState({
        currentEP: 10,
        focus: 0,
        handCardIds: ['test-feature'],
        selectedCardIds: [],
      });

      useSiphonStore.getState().performActivation({
        featureId: 'test-feature',
        effectiveCost: 3,
        focusRollResult: 5,
        level: 5,
        activeEffect: {
          sourceType: 'siphon',
          sourceId: 'test-feature',
          sourceName: 'Test Feature',
          description: 'A test.',
          totalDuration: '10 minutes',
          durationMs: 600000,
          requiresConcentration: false,
          featureWarpEffect: 'Reality flickers!',
        },
      });

      const effects = useSiphonStore.getState().activeEffects;
      expect(effects).toHaveLength(1);
      expect(effects[0].warpActive).toBe(false);
      expect(effects[0].warpDescription).toBeUndefined();
    });

    it('does not add active effect when not provided', () => {
      useSiphonStore.setState({
        currentEP: 10,
        focus: 0,
        handCardIds: ['test-feature'],
        selectedCardIds: [],
      });

      useSiphonStore.getState().performActivation({
        featureId: 'test-feature',
        effectiveCost: 3,
        focusRollResult: 5,
        level: 5,
      });

      expect(useSiphonStore.getState().activeEffects).toHaveLength(0);
    });
  });
});
