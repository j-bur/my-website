import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BestowedFeature } from '../types';
import { rollFromNotation } from '../utils/diceRoller';
import { calculateFocusGain } from '../utils/focusCalculator';
import { calculateEPSpend, calculateLongRestRecovery, getEPStatus } from '../utils/echoPointUtils';
import { rollLongRestFocusReduction } from '../utils/focusCalculator';

interface SiphonStore {
  // Core Resources
  currentEP: number;
  focus: number;
  siphonCapacitance: number;
  capacitanceTimerStart: number | null;  // 8-hour timer for Siphon Flux

  // Card Management
  selectedCardIds: string[];              // Cards selected during long rest
  bestowedFeatures: BestowedFeature[];

  // Computed helpers
  isEPNegative: () => boolean;
  isEchoDrained: (level: number) => boolean;
  getMaxSelectedCards: (pb: number) => number;

  // EP Actions
  spendEP: (cost: number, level: number) => {
    newEP: number;
    wasPositive: boolean;
    isNowNegative: boolean;
    isNowEchoDrained: boolean;
    hpReduction: number;
  };
  recoverEP: (amount: number, maxEP: number) => void;
  setEP: (ep: number) => void;

  // Focus Actions
  addFocus: (amount: number) => number;  // Returns actual added (doubled if negative)
  rollAndAddFocus: (diceNotation: string, context: { pb?: number; level?: number; cost?: number }) => {
    baseRoll: number;
    actualGain: number;
    wasDoubled: boolean;
  };
  reduceFocus: (amount: number) => void;
  setFocus: (focus: number) => void;

  // Capacitance Actions
  addCapacitance: () => void;
  expendCapacitance: (amount: number) => void;
  clearCapacitance: () => void;

  // Card Selection Actions
  selectCard: (cardId: string, maxCards: number) => boolean;
  deselectCard: (cardId: string) => void;
  clearSelection: () => void;
  setSelectedCards: (cardIds: string[]) => void;
  isCardSelected: (cardId: string) => boolean;

  // Bestow Actions
  bestowFeature: (featureId: string, targetId: string, expiresAt: number | null) => string;
  activateFeature: (bestowedId: string, triggerWarp: boolean) => void;
  removeBestowed: (bestowedId: string) => void;
  removeExpiredBestowed: () => void;

  // Rest Actions
  longRest: (pb: number, maxEP: number, hasSiphonGreed?: boolean) => {
    epRecovered: number;
    focusReduced: number;
    maxHPRestored: number;
  };
  shortRest: () => void;
}

export const useSiphonStore = create<SiphonStore>()(
  persist(
    (set, get) => ({
      currentEP: 5,
      focus: 0,
      siphonCapacitance: 0,
      capacitanceTimerStart: null,
      selectedCardIds: [],
      bestowedFeatures: [],

      // Computed helpers
      isEPNegative: () => get().currentEP < 0,
      isEchoDrained: (level) => get().currentEP <= -level,
      getMaxSelectedCards: (pb) => pb,

      // EP Actions
      spendEP: (cost, level) => {
        const state = get();
        const result = calculateEPSpend(state.currentEP, cost, level);
        set({ currentEP: result.newEP });
        return result;
      },

      recoverEP: (amount, maxEP) => set((state) => ({
        currentEP: Math.min(maxEP, state.currentEP + amount)
      })),

      setEP: (ep) => set({ currentEP: ep }),

      // Focus Actions
      addFocus: (amount) => {
        const state = get();
        const isNegative = state.currentEP < 0;
        const actualAmount = isNegative ? amount * 2 : amount;
        set({ focus: state.focus + actualAmount });
        return actualAmount;
      },

      rollAndAddFocus: (diceNotation, context) => {
        const state = get();
        const rollResult = rollFromNotation(diceNotation, context);
        const focusResult = calculateFocusGain(rollResult, state.currentEP < 0);
        set({ focus: state.focus + focusResult.actualGain });
        return {
          baseRoll: focusResult.baseRoll,
          actualGain: focusResult.actualGain,
          wasDoubled: focusResult.wasDoubled
        };
      },

      reduceFocus: (amount) => set((state) => ({
        focus: Math.max(0, state.focus - amount)
      })),

      setFocus: (focus) => set({ focus: Math.max(0, focus) }),

      // Capacitance Actions
      addCapacitance: () => {
        const state = get();
        if (state.capacitanceTimerStart === null) {
          set({ capacitanceTimerStart: Date.now() });
        }
        set({ siphonCapacitance: state.siphonCapacitance + 1 });
      },

      expendCapacitance: (amount) => set((state) => {
        const newCapacitance = Math.max(0, state.siphonCapacitance - amount);
        return {
          siphonCapacitance: newCapacitance,
          capacitanceTimerStart: newCapacitance === 0 ? null : state.capacitanceTimerStart
        };
      }),

      clearCapacitance: () => set({
        siphonCapacitance: 0,
        capacitanceTimerStart: null
      }),

      // Card Selection
      selectCard: (cardId, maxCards) => {
        const state = get();
        if (state.selectedCardIds.length >= maxCards) return false;
        if (state.selectedCardIds.includes(cardId)) return false;
        set({ selectedCardIds: [...state.selectedCardIds, cardId] });
        return true;
      },

      deselectCard: (cardId) => set((state) => ({
        selectedCardIds: state.selectedCardIds.filter(id => id !== cardId)
      })),

      clearSelection: () => set({ selectedCardIds: [], bestowedFeatures: [] }),

      setSelectedCards: (cardIds) => set({ selectedCardIds: cardIds }),

      isCardSelected: (cardId) => get().selectedCardIds.includes(cardId),

      // Bestow Actions
      bestowFeature: (featureId, targetId, expiresAt) => {
        const id = `${featureId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const bestowed: BestowedFeature = {
          id,
          featureId,
          targetId,
          bestowedAt: Date.now(),
          expiresAt,
          isActivated: false,
          warpTriggered: false
        };
        set((state) => ({
          bestowedFeatures: [...state.bestowedFeatures, bestowed]
        }));
        return id;
      },

      activateFeature: (bestowedId, triggerWarp) => set((state) => ({
        bestowedFeatures: state.bestowedFeatures.map(bf =>
          bf.id === bestowedId
            ? { ...bf, isActivated: true, warpTriggered: triggerWarp }
            : bf
        )
      })),

      removeBestowed: (bestowedId) => set((state) => ({
        bestowedFeatures: state.bestowedFeatures.filter(bf => bf.id !== bestowedId)
      })),

      removeExpiredBestowed: () => {
        const now = Date.now();
        set((state) => ({
          bestowedFeatures: state.bestowedFeatures.filter(
            bf => bf.expiresAt === null || bf.expiresAt > now
          )
        }));
      },

      // Rest Actions
      longRest: (pb, maxEP, hasSiphonGreed = false) => {
        const state = get();
        const epStatus = getEPStatus(state.currentEP, maxEP);

        // Calculate EP recovery
        const recoveryResult = calculateLongRestRecovery(
          state.currentEP,
          maxEP,
          pb,
          hasSiphonGreed,
          epStatus.drainMultiplier
        );

        // Roll Focus reduction
        const focusReduced = rollLongRestFocusReduction();

        set({
          currentEP: recoveryResult.newEP,
          focus: Math.max(0, state.focus - focusReduced),
          // Clear capacitance on long rest
          siphonCapacitance: 0,
          capacitanceTimerStart: null,
          // Clear expired bestowed features
          bestowedFeatures: state.bestowedFeatures.filter(
            bf => bf.expiresAt === null || bf.expiresAt > Date.now()
          )
        });

        return {
          epRecovered: recoveryResult.epRecovery,
          focusReduced,
          maxHPRestored: recoveryResult.maxHPRestored
        };
      },

      shortRest: () => {
        // Short rest doesn't affect EP or Focus, but clears expired bestowed
        set((state) => ({
          bestowedFeatures: state.bestowedFeatures.filter(
            bf => bf.expiresAt === null || bf.expiresAt > Date.now()
          )
        }));
      },
    }),
    {
      name: 'siphon-state',
      version: 1,
    }
  )
);
