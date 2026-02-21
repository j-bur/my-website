import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getProficiencyBonus } from '../types/character';

interface CharacterStore {
  // State
  name: string;
  level: number;
  proficiencyBonus: number;
  maxHP: number;
  currentHP: number;
  reducedMaxHP: number;
  spellSaveDC: number;
  hitDice: number;
  maxHitDice: number;

  // Actions
  setName: (name: string) => void;
  setLevel: (level: number) => void;
  setMaxHP: (hp: number) => void;
  setCurrentHP: (hp: number) => void;
  reduceMaxHP: (amount: number) => void;
  restoreMaxHP: (amount: number) => void;
  setSpellSaveDC: (dc: number) => void;
  spendHitDice: (amount: number) => boolean;
  restoreAllHitDice: () => void;
  healToFull: () => void;
  resetCharacter: () => void;
}

const DEFAULT_LEVEL = 1;

const DEFAULT_STATE = {
  name: '',
  level: DEFAULT_LEVEL,
  proficiencyBonus: getProficiencyBonus(DEFAULT_LEVEL),
  maxHP: 10,
  currentHP: 10,
  reducedMaxHP: 10,
  spellSaveDC: 13,
  hitDice: DEFAULT_LEVEL,
  maxHitDice: DEFAULT_LEVEL,
};

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      setName: (name) => set({ name }),

      setLevel: (level) => {
        const clamped = Math.max(1, Math.min(20, level));
        const pb = getProficiencyBonus(clamped);
        const state = get();
        set({
          level: clamped,
          proficiencyBonus: pb,
          maxHitDice: clamped,
          hitDice: Math.min(state.hitDice, clamped),
        });
      },

      setMaxHP: (hp) => {
        const maxHP = Math.max(1, hp);
        set({
          maxHP,
          reducedMaxHP: maxHP,
          currentHP: Math.min(get().currentHP, maxHP),
        });
      },

      setCurrentHP: (hp) => {
        const state = get();
        set({ currentHP: Math.max(0, Math.min(hp, state.reducedMaxHP)) });
      },

      reduceMaxHP: (amount) => {
        const state = get();
        const newReducedMax = Math.max(0, state.reducedMaxHP - amount);
        set({
          reducedMaxHP: newReducedMax,
          currentHP: Math.min(state.currentHP, newReducedMax),
        });
      },

      restoreMaxHP: (amount) => {
        const state = get();
        set({
          reducedMaxHP: Math.min(state.maxHP, state.reducedMaxHP + amount),
        });
      },

      setSpellSaveDC: (dc) => set({ spellSaveDC: dc }),

      spendHitDice: (amount) => {
        const state = get();
        if (state.hitDice < amount) return false;
        set({ hitDice: state.hitDice - amount });
        return true;
      },

      restoreAllHitDice: () => {
        set({ hitDice: get().maxHitDice });
      },

      healToFull: () => {
        set({ currentHP: get().reducedMaxHP });
      },

      resetCharacter: () => set(DEFAULT_STATE),
    }),
    {
      name: 'siphon-character',
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Record<string, unknown>;
        if (version === 1) {
          const level = (state.level as number) || DEFAULT_LEVEL;
          state.hitDice = level;
          state.maxHitDice = level;
        }
        return state as unknown as CharacterStore;
      },
    }
  )
);
