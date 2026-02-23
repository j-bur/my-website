import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ManifoldPhase, ActiveManifoldAbility } from '../types';
import { MAX_MOTES, HIT_DICE_FOR_PHASE_SWITCH } from '../data/echoManifold';

interface ManifoldStore {
  // State
  currentPhase: ManifoldPhase;
  motes: number;
  maxMotes: number;
  phaseSwitchAvailable: boolean;
  hitDiceSpentOnSwitch: number;
  activeAbilities: ActiveManifoldAbility[];

  // Phase Actions
  switchPhase: (newPhase: ManifoldPhase, useHitDice: boolean) => boolean;
  resetPhaseSwitchOnShortRest: () => void;

  // Mote Actions
  spendMotes: (amount: number, isOverdrive: boolean) => boolean;
  regainMote: () => void;  // On crit, enemy failed save, echo destroyed (max 1/turn)
  resetMotesOnLongRest: () => void;
  setMotes: (motes: number) => void;

  // Ability Actions
  activateAbility: (abilityId: string, isOverdrive: boolean, expiresAt: number | null, requiresConcentration: boolean) => string;
  deactivateAbility: (id: string) => void;
  removeExpiredAbilities: () => void;

  // Full reset
  resetManifold: () => void;
}

const DEFAULT_STATE = {
  currentPhase: 'Constellation' as ManifoldPhase,
  motes: MAX_MOTES,
  maxMotes: MAX_MOTES,
  phaseSwitchAvailable: true,
  hitDiceSpentOnSwitch: 0,
  activeAbilities: [] as ActiveManifoldAbility[],
};

export const useManifoldStore = create<ManifoldStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      switchPhase: (newPhase, useHitDice) => {
        const state = get();

        // Already on this phase
        if (state.currentPhase === newPhase) return true;

        if (useHitDice) {
          set({
            currentPhase: newPhase,
            hitDiceSpentOnSwitch: state.hitDiceSpentOnSwitch + HIT_DICE_FOR_PHASE_SWITCH
          });
          return true;
        }

        if (!state.phaseSwitchAvailable) return false;

        set({
          currentPhase: newPhase,
          phaseSwitchAvailable: false
        });
        return true;
      },

      resetPhaseSwitchOnShortRest: () => set({ phaseSwitchAvailable: true }),

      spendMotes: (amount, isOverdrive) => {
        const actualCost = isOverdrive ? amount * 2 : amount;
        const state = get();

        if (state.motes < actualCost) return false;

        set({ motes: state.motes - actualCost });
        return true;
      },

      regainMote: () => set((state) => ({
        motes: Math.min(state.maxMotes, state.motes + 1)
      })),

      resetMotesOnLongRest: () => set({
        motes: MAX_MOTES,
        phaseSwitchAvailable: true,
        hitDiceSpentOnSwitch: 0
      }),

      setMotes: (motes) => set({
        motes: Math.max(0, Math.min(MAX_MOTES, motes))
      }),

      activateAbility: (abilityId, isOverdrive, expiresAt, requiresConcentration) => {
        const id = `${abilityId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const ability: ActiveManifoldAbility = {
          id,
          abilityId,
          isOverdriven: isOverdrive,
          startedAt: Date.now(),
          expiresAt,
          requiresConcentration
        };
        set((state) => ({
          activeAbilities: [...state.activeAbilities, ability]
        }));
        return id;
      },

      deactivateAbility: (id) => set((state) => ({
        activeAbilities: state.activeAbilities.filter(a => a.id !== id)
      })),

      removeExpiredAbilities: () => {
        const now = Date.now();
        set((state) => ({
          activeAbilities: state.activeAbilities.filter(
            a => a.expiresAt === null || a.expiresAt > now
          )
        }));
      },

      resetManifold: () => set(DEFAULT_STATE),
    }),
    {
      name: 'siphon-manifold',
      version: 1,
    }
  )
);
