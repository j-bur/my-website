import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getProficiencyBonus } from '../types';

interface CharacterStore {
  // State
  name: string;
  level: number;
  proficiencyBonus: number;
  maxHP: number;
  currentHP: number;
  reducedMaxHP: number;  // Lowered by Echo Drain
  spellSaveDC: number;

  // Actions
  setName: (name: string) => void;
  setLevel: (level: number) => void;
  setMaxHP: (hp: number) => void;
  setCurrentHP: (hp: number) => void;
  reduceMaxHP: (amount: number) => void;    // For Echo Drain
  restoreMaxHP: (amount: number) => void;   // On EP recovery
  setSpellSaveDC: (dc: number) => void;
  resetCharacter: () => void;
  healToFull: () => void;
}

const DEFAULT_CHARACTER = {
  name: 'Siphon Wielder',
  level: 5,
  proficiencyBonus: 3,
  maxHP: 44,
  currentHP: 44,
  reducedMaxHP: 44,
  spellSaveDC: 14,
};

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_CHARACTER,

      setName: (name) => set({ name }),

      setLevel: (level) => {
        const clampedLevel = Math.max(1, Math.min(20, level));
        set({
          level: clampedLevel,
          proficiencyBonus: getProficiencyBonus(clampedLevel)
        });
      },

      setMaxHP: (maxHP) => set({
        maxHP,
        reducedMaxHP: maxHP,
        currentHP: Math.min(get().currentHP, maxHP)
      }),

      setCurrentHP: (currentHP) => set((state) => ({
        currentHP: Math.max(0, Math.min(currentHP, state.reducedMaxHP))
      })),

      reduceMaxHP: (amount) => set((state) => {
        const newReducedMax = Math.max(0, state.reducedMaxHP - amount);
        return {
          reducedMaxHP: newReducedMax,
          currentHP: Math.min(state.currentHP, newReducedMax)
        };
      }),

      restoreMaxHP: (amount) => set((state) => ({
        reducedMaxHP: Math.min(state.maxHP, state.reducedMaxHP + amount)
      })),

      setSpellSaveDC: (spellSaveDC) => set({ spellSaveDC }),

      resetCharacter: () => set(DEFAULT_CHARACTER),

      healToFull: () => set((state) => ({
        currentHP: state.reducedMaxHP
      })),
    }),
    {
      name: 'siphon-character',
      version: 1,
    }
  )
);
