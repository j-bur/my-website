import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Ally, AllyBestowment, SelfActiveEffect, SpendResult } from '../types';
import { SIPHON_FEATURES } from '../data/siphonFeatures';
import { rollD } from '../utils/diceRoller';

// Pre-compute triggered feature IDs for getDeckCards/getHandCards
const TRIGGERED_FEATURE_IDS = new Set(
  SIPHON_FEATURES.filter((f) => f.duration === 'Triggered').map((f) => f.id)
);

interface SiphonStore {
  // Core Resources
  currentEP: number;
  focus: number;
  siphonCapacitance: number;
  /** @deprecated Vestigial — stores Date.now() (real-world ms) but no UI reads it.
   *  Use capacitanceInGameTime/capacitanceExpiresAt instead (in-game minutes since midnight).
   *  Kept only because addCapacitance() still sets it and existing tests check it.
   *  Safe to remove once those tests are updated. */
  capacitanceTimerStart: number | null;
  /** In-game time in minutes since midnight (0-1439), set by user via time picker. */
  capacitanceInGameTime: number | null;
  /** In-game expiry time in minutes (can exceed 1440 for next-day wrap). */
  capacitanceExpiresAt: number | null;

  // Card Zones
  selectedCardIds: string[];
  handCardIds: string[];

  // Allies
  allies: Ally[];
  allyBestowments: AllyBestowment[];

  // Active Effects (self only)
  activeEffects: SelfActiveEffect[];

  // Active Modifiers
  echoIntuitionActive: boolean;

  // EP Actions
  spendEP: (cost: number, level: number) => SpendResult;
  recoverEP: (amount: number, maxEP: number) => void;
  setEP: (ep: number) => void;

  // Focus Actions
  addFocus: (amount: number) => number;
  reduceFocus: (amount: number) => void;
  setFocus: (focus: number) => void;

  // Capacitance Actions
  addCapacitance: () => void;
  expendCapacitance: (amount: number) => void;
  clearCapacitance: () => void;
  setCapacitanceTimer: (minutesSinceMidnight: number) => void;
  extendCapacitanceTimer: () => void;

  // Card Selection (Deck Builder)
  selectCard: (cardId: string, maxCards: number) => boolean;
  deselectCard: (cardId: string) => void;
  clearSelection: () => void;
  setSelectedCards: (cardIds: string[]) => void;
  isCardSelected: (cardId: string) => boolean;

  // Bestow Actions (Combat)
  bestowToSelf: (featureId: string) => void;
  bestowToAlly: (featureId: string, allyId: string) => void;

  // Activate Actions (Combat)
  activateFromHand: (featureId: string) => void;
  returnCardToDeck: (featureId: string) => void;
  replaceSelectedCard: (oldFeatureId: string, newFeatureId: string) => void;

  // Ally Management
  addAlly: (name: string) => string;
  removeAlly: (allyId: string) => void;
  renameAlly: (allyId: string, name: string) => void;
  removeAllyBestowment: (bestowmentId: string) => void;
  clearAllyBestowments: (allyId: string) => void;

  // Active Effects (Self Only)
  addActiveEffect: (effect: Omit<SelfActiveEffect, 'id' | 'startedAt'>) => string;
  removeActiveEffect: (effectId: string) => void;
  clearExpiredEffects: () => void;
  clearEffectsBelowDuration: (maxDurationMs: number) => void;

  // Activation (combines spendEP + addFocus + addActiveEffect + activateFromHand)
  performActivation: (params: {
    featureId: string;
    effectiveCost: number;
    focusRollResult: number;
    level: number;
    activeEffect?: {
      sourceType: 'siphon' | 'manifold' | 'surge';
      sourceId: string;
      sourceName: string;
      description: string;
      totalDuration: string;
      durationMs: number | null;
      requiresConcentration: boolean;
      featureWarpEffect?: string;
    };
  }) => { spendResult: SpendResult; focusGained: number };

  // Computed Helpers
  getDeckCards: () => string[];
  getHandCards: () => string[];
  getEffectiveCost: (baseCost: number, level: number) => number;
  getEffectiveFocusDice: (baseFocusDice: string) => string;
  isEPNegative: () => boolean;
  isEchoDrained: (level: number) => boolean;
  hasSiphonGreedSelected: () => boolean;
  setEchoIntuitionActive: (active: boolean) => void;

  // Rest Actions
  longRest: (pb: number, maxEP: number, focusRollOverride?: number, whileSelectedEffects?: Array<{ featureId: string; epCost: number; focusGain: number }>) => { epRecovered: number; focusReduced: number; maxHPRestored: number; whileSelectedEPCost: number; whileSelectedFocusGain: number };
  shortRest: (clearShortEffects: boolean) => void;

  // Full Reset
  resetSiphon: () => void;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

const DEFAULT_STATE = {
  currentEP: 0,
  focus: 0,
  siphonCapacitance: 0,
  capacitanceTimerStart: null as number | null,
  capacitanceInGameTime: null as number | null,
  capacitanceExpiresAt: null as number | null,
  selectedCardIds: [] as string[],
  handCardIds: [] as string[],
  allies: [] as Ally[],
  allyBestowments: [] as AllyBestowment[],
  activeEffects: [] as SelfActiveEffect[],
  echoIntuitionActive: false,
};

export const useSiphonStore = create<SiphonStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      // --- EP Actions ---

      spendEP: (cost, level) => {
        const state = get();
        const wasEchoDrained = state.currentEP <= -level;
        const newEP = state.currentEP - cost;
        const warpTriggered = newEP < 0;
        const isNowEchoDrained = newEP <= -level;
        const focusDoubled = newEP < 0;
        const hpReduction = wasEchoDrained ? cost : 0;

        set({ currentEP: newEP });

        return { newEP, warpTriggered, isNowEchoDrained, focusDoubled, hpReduction };
      },

      recoverEP: (amount, maxEP) => {
        const state = get();
        set({ currentEP: Math.min(maxEP, state.currentEP + amount) });
      },

      setEP: (ep) => set({ currentEP: ep }),

      // --- Focus Actions ---

      addFocus: (amount) => {
        const state = get();
        const actual = state.currentEP < 0 ? amount * 2 : amount;
        set({ focus: state.focus + actual });
        return actual;
      },

      reduceFocus: (amount) => {
        set((state) => ({ focus: Math.max(0, state.focus - amount) }));
      },

      setFocus: (focus) => set({ focus: Math.max(0, focus) }),

      // --- Capacitance Actions ---

      addCapacitance: () => {
        const state = get();
        set({
          siphonCapacitance: state.siphonCapacitance + 1,
          capacitanceTimerStart: state.capacitanceTimerStart ?? Date.now(),
        });
      },

      expendCapacitance: (amount) => {
        const state = get();
        const newCap = Math.max(0, state.siphonCapacitance - amount);
        set({
          siphonCapacitance: newCap,
          capacitanceTimerStart: newCap === 0 ? null : state.capacitanceTimerStart,
          ...(newCap === 0 ? { capacitanceInGameTime: null, capacitanceExpiresAt: null } : {}),
        });
      },

      clearCapacitance: () =>
        set({ siphonCapacitance: 0, capacitanceTimerStart: null, capacitanceInGameTime: null, capacitanceExpiresAt: null }),

      setCapacitanceTimer: (minutesSinceMidnight) => {
        set({
          capacitanceInGameTime: minutesSinceMidnight,
          capacitanceExpiresAt: minutesSinceMidnight + 480,
        });
      },

      extendCapacitanceTimer: () => {
        const state = get();
        if (state.capacitanceExpiresAt !== null) {
          set({ capacitanceExpiresAt: state.capacitanceExpiresAt + 480 });
        }
      },

      // --- Card Selection ---

      selectCard: (cardId, maxCards) => {
        const state = get();
        if (state.selectedCardIds.length >= maxCards) return false;
        if (state.selectedCardIds.includes(cardId)) return false;
        set({ selectedCardIds: [...state.selectedCardIds, cardId] });
        return true;
      },

      deselectCard: (cardId) => {
        set((state) => ({
          selectedCardIds: state.selectedCardIds.filter((id) => id !== cardId),
        }));
      },

      clearSelection: () =>
        set({ selectedCardIds: [], handCardIds: [], allyBestowments: [] }),

      setSelectedCards: (cardIds) =>
        set({ selectedCardIds: cardIds, handCardIds: [], allyBestowments: [] }),

      isCardSelected: (cardId) => get().selectedCardIds.includes(cardId),

      // --- Bestow Actions ---

      bestowToSelf: (featureId) => {
        const state = get();
        if (!state.selectedCardIds.includes(featureId)) return;
        set({
          selectedCardIds: state.selectedCardIds.filter((id) => id !== featureId),
          handCardIds: [...state.handCardIds, featureId],
        });
      },

      bestowToAlly: (featureId, allyId) => {
        const state = get();
        if (!state.allies.some((a) => a.id === allyId)) return;

        const feature = SIPHON_FEATURES.find((f) => f.id === featureId);
        if (feature?.isSpecialCost) return;

        const bestowment: AllyBestowment = {
          id: generateId(),
          allyId,
          featureId,
          isFromSelectedDeck: state.selectedCardIds.includes(featureId),
          bestowedAt: Date.now(),
        };
        set({ allyBestowments: [...state.allyBestowments, bestowment] });
      },

      // --- Activate Actions ---

      activateFromHand: (featureId) => {
        const state = get();
        const newHand = state.handCardIds.filter((id) => id !== featureId);
        const newSelected = state.selectedCardIds.includes(featureId)
          ? state.selectedCardIds
          : [...state.selectedCardIds, featureId];
        set({ handCardIds: newHand, selectedCardIds: newSelected });
      },

      returnCardToDeck: (featureId) => {
        const state = get();
        const newHand = state.handCardIds.filter((id) => id !== featureId);
        const newSelected = state.selectedCardIds.includes(featureId)
          ? state.selectedCardIds
          : [...state.selectedCardIds, featureId];
        set({ handCardIds: newHand, selectedCardIds: newSelected });
      },

      replaceSelectedCard: (oldFeatureId, newFeatureId) => {
        set((state) => ({
          selectedCardIds: state.selectedCardIds.map((id) =>
            id === oldFeatureId ? newFeatureId : id
          ),
        }));
      },

      // --- Activation (orchestrated) ---

      performActivation: (params) => {
        const { featureId, effectiveCost, focusRollResult, level, activeEffect } = params;

        // 1. Spend EP
        const spendResult = get().spendEP(effectiveCost, level);

        // 2. Add focus (doubling is handled internally based on current EP)
        const focusGained = get().addFocus(focusRollResult);

        // 3. Conditionally add active effect (with warp info from spendResult)
        if (activeEffect) {
          const { featureWarpEffect, ...effectBase } = activeEffect;
          get().addActiveEffect({
            ...effectBase,
            warpActive: spendResult.warpTriggered,
            warpDescription: spendResult.warpTriggered ? featureWarpEffect : undefined,
          });
        }

        // 4. Return card from hand to selected deck
        get().activateFromHand(featureId);

        return { spendResult, focusGained };
      },

      // --- Ally Management ---

      addAlly: (name) => {
        const id = generateId();
        set((state) => ({
          allies: [...state.allies, { id, name }],
        }));
        return id;
      },

      removeAlly: (allyId) => {
        set((state) => ({
          allies: state.allies.filter((a) => a.id !== allyId),
          allyBestowments: state.allyBestowments.filter((b) => b.allyId !== allyId),
        }));
      },

      renameAlly: (allyId, name) => {
        set((state) => ({
          allies: state.allies.map((a) => (a.id === allyId ? { ...a, name } : a)),
        }));
      },

      removeAllyBestowment: (bestowmentId) => {
        set((state) => ({
          allyBestowments: state.allyBestowments.filter((b) => b.id !== bestowmentId),
        }));
      },

      clearAllyBestowments: (allyId) => {
        set((state) => ({
          allyBestowments: state.allyBestowments.filter((b) => b.allyId !== allyId),
        }));
      },

      // --- Active Effects ---

      addActiveEffect: (effect) => {
        const id = generateId();
        const fullEffect: SelfActiveEffect = { ...effect, id, startedAt: Date.now() };
        set((state) => ({
          activeEffects: [...state.activeEffects, fullEffect],
        }));
        return id;
      },

      removeActiveEffect: (effectId) => {
        set((state) => ({
          activeEffects: state.activeEffects.filter((e) => e.id !== effectId),
        }));
      },

      clearExpiredEffects: () => {
        const now = Date.now();
        set((state) => ({
          activeEffects: state.activeEffects.filter(
            (e) => e.durationMs === null || e.startedAt + e.durationMs > now
          ),
        }));
      },

      clearEffectsBelowDuration: (maxDurationMs) => {
        set((state) => ({
          activeEffects: state.activeEffects.filter(
            (e) => e.durationMs === null || e.durationMs > maxDurationMs
          ),
        }));
      },

      // --- Computed Helpers ---
      // WARNING: These methods return new arrays on every call. Do NOT use them
      // directly as Zustand selectors (e.g. useSiphonStore(s => s.getDeckCards()))
      // — this causes infinite re-renders with React 19's useSyncExternalStore.
      // Instead, select raw state (selectedCardIds, handCardIds) and derive with useMemo.

      getDeckCards: () => {
        const state = get();
        const handSet = new Set(state.handCardIds);
        return state.selectedCardIds.filter(
          (id) => !handSet.has(id) && !TRIGGERED_FEATURE_IDS.has(id)
        );
      },

      getHandCards: () => {
        const state = get();
        const triggeredInSelected = state.selectedCardIds.filter((id) =>
          TRIGGERED_FEATURE_IDS.has(id)
        );
        return [...state.handCardIds, ...triggeredInSelected];
      },

      getEffectiveCost: (baseCost, level) => {
        const state = get();
        let cost = baseCost;

        // Siphon Greed: halve if selected AND echo drained
        if (
          state.selectedCardIds.includes('siphon-greed') &&
          state.currentEP <= -level
        ) {
          cost = Math.max(1, Math.floor(cost / 2));
        }

        // Echo Intuition: halve if active
        if (state.echoIntuitionActive) {
          cost = Math.max(1, Math.floor(cost / 2));
        }

        return cost;
      },

      getEffectiveFocusDice: (baseFocusDice) => {
        const state = get();
        if (!state.echoIntuitionActive) return baseFocusDice;

        // Parse XdY pattern and halve X
        const match = baseFocusDice.match(/^(\d+)(d\d+.*)$/);
        if (!match) return baseFocusDice;

        const count = parseInt(match[1], 10);
        const halved = Math.max(1, Math.floor(count / 2));
        return `${halved}${match[2]}`;
      },

      isEPNegative: () => get().currentEP < 0,

      isEchoDrained: (level) => get().currentEP <= -level,

      hasSiphonGreedSelected: () =>
        get().selectedCardIds.includes('siphon-greed'),

      setEchoIntuitionActive: (active) => set({ echoIntuitionActive: active }),

      // --- Rest Actions ---

      longRest: (pb, maxEP, focusRollOverride?, whileSelectedEffects?) => {
        const state = get();

        // 1. EP recovery. Siphon Greed scales EPR by integer multiples over Echo Drain threshold.
        // At -Level (1x threshold): multiplier=1 (same as base). At -2*Level: multiplier=2, etc.
        const hasSiphonGreed = state.selectedCardIds.includes('siphon-greed');
        const isEchoDrained = state.currentEP <= -maxEP;
        const greedMultiplier = (hasSiphonGreed && isEchoDrained)
          ? Math.floor(Math.abs(state.currentEP) / maxEP)
          : 1;
        const epRecoveryBase = pb * greedMultiplier;
        let newEP = Math.min(maxEP, state.currentEP + epRecoveryBase);
        const epRecovered = newEP - state.currentEP;

        // 2. Focus reduction: d4 (min 0) — use override if provided (macro mode)
        const focusRoll = focusRollOverride ?? rollD(4);
        let newFocus = Math.max(0, state.focus - focusRoll);
        const focusReduced = state.focus - newFocus;

        // 3. While Selected effects (applied after EP recovery and focus reduction)
        // Order matters: EP costs deducted before focus gains to determine doubling
        let whileSelectedEPCost = 0;
        let whileSelectedFocusGain = 0;
        if (whileSelectedEffects) {
          for (const effect of whileSelectedEffects) {
            newEP -= effect.epCost;
            whileSelectedEPCost += effect.epCost;
            // Focus gain follows normal rules: doubles when EP is negative
            const actual = newEP < 0 ? effect.focusGain * 2 : effect.focusGain;
            newFocus += actual;
            whileSelectedFocusGain += actual;
          }
        }

        // 4. Max HP restoration = amount of EP recovered (caller applies to characterStore)
        const maxHPRestored = Math.max(0, epRecovered);

        // 5. Hand cards return to selected deck
        const newSelectedCardIds = [...state.selectedCardIds, ...state.handCardIds];

        // 6-8. Clear ally bestowments, short-duration effects, capacitance
        const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;
        const remainingEffects = state.activeEffects.filter(
          (e) => e.durationMs === null || e.durationMs > EIGHT_HOURS_MS
        );

        set({
          currentEP: newEP,
          focus: newFocus,
          handCardIds: [],
          selectedCardIds: newSelectedCardIds,
          allyBestowments: [],
          activeEffects: remainingEffects,
          siphonCapacitance: 0,
          capacitanceTimerStart: null,
          capacitanceInGameTime: null,
          capacitanceExpiresAt: null,
        });

        return { epRecovered, focusReduced, maxHPRestored, whileSelectedEPCost, whileSelectedFocusGain };
      },

      resetSiphon: () => set(DEFAULT_STATE),

      shortRest: (clearShortEffects) => {
        const state = get();
        const ONE_HOUR_MS = 3600000;

        let remainingEffects = state.activeEffects;

        if (clearShortEffects) {
          remainingEffects = remainingEffects.filter(
            (e) => e.durationMs === null || e.durationMs > ONE_HOUR_MS // Clears effects with duration <= 1 hour
          );
        }

        // Also clear expired effects
        const now = Date.now();
        remainingEffects = remainingEffects.filter(
          (e) => e.durationMs === null || e.startedAt + e.durationMs > now
        );

        set({ activeEffects: remainingEffects });
      },
    }),
    {
      name: 'siphon-state',
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Record<string, unknown>;
        if (version === 1) {
          state.handCardIds = [];
          state.allies = [];
          state.allyBestowments = [];
          state.activeEffects = [];
          state.echoIntuitionActive = false;

          // Migrate old bestowedFeatures to handCardIds
          const bestowed = (state.bestowedFeatures as Array<{
            targetId: string;
            isActivated: boolean;
            featureId: string;
          }>) || [];
          state.handCardIds = bestowed
            .filter((bf) => bf.targetId === 'self' && !bf.isActivated)
            .map((bf) => bf.featureId);
          delete state.bestowedFeatures;
        }
        return state as unknown as SiphonStore;
      },
    }
  )
);
