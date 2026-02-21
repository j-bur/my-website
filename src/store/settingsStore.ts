import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DiceMode {
  wildSurge: 'dice3d' | 'macro';
  siphonFeature: 'dice3d' | 'macro';
  phaseAbility: 'dice3d' | 'macro';
  longRestFocus: 'dice3d' | 'macro';
}

interface SettingsStore {
  // State
  diceMode: DiceMode;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  reducedMotion: boolean;
  highlightDropTargets: boolean;
  confirmBeforeActivation: boolean;
  autoTriggerSurgeOnWarp: boolean;
  shortRestClearEffects: boolean;

  // Actions
  setDiceMode: (rollType: keyof DiceMode, mode: 'dice3d' | 'macro') => void;
  setSoundEnabled: (enabled: boolean) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setHighlightDropTargets: (enabled: boolean) => void;
  setConfirmBeforeActivation: (enabled: boolean) => void;
  setAutoTriggerSurgeOnWarp: (enabled: boolean) => void;
  setShortRestClearEffects: (enabled: boolean) => void;
  resetSettings: () => void;
}

const DEFAULT_STATE = {
  diceMode: {
    wildSurge: 'dice3d' as const,
    siphonFeature: 'macro' as const,
    phaseAbility: 'macro' as const,
    longRestFocus: 'macro' as const,
  },
  soundEnabled: false,
  animationsEnabled: true,
  reducedMotion: false,
  highlightDropTargets: true,
  confirmBeforeActivation: false,
  autoTriggerSurgeOnWarp: true,
  shortRestClearEffects: true,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      setDiceMode: (rollType, mode) =>
        set((state) => ({
          diceMode: { ...state.diceMode, [rollType]: mode },
        })),

      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setAnimationsEnabled: (enabled) => set({ animationsEnabled: enabled }),
      setReducedMotion: (enabled) => set({ reducedMotion: enabled }),
      setHighlightDropTargets: (enabled) => set({ highlightDropTargets: enabled }),
      setConfirmBeforeActivation: (enabled) => set({ confirmBeforeActivation: enabled }),
      setAutoTriggerSurgeOnWarp: (enabled) => set({ autoTriggerSurgeOnWarp: enabled }),
      setShortRestClearEffects: (enabled) => set({ shortRestClearEffects: enabled }),

      resetSettings: () => set(DEFAULT_STATE),
    }),
    {
      name: 'siphon-settings',
      version: 1,
    }
  )
);
