import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore } from '../settingsStore';

function resetStore() {
  useSettingsStore.getState().resetSettings();
}

describe('settingsStore', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('defaults', () => {
    it('has correct default dice modes', () => {
      const state = useSettingsStore.getState();
      expect(state.diceMode.wildSurge).toBe('dice3d');
      expect(state.diceMode.siphonFeature).toBe('macro');
      expect(state.diceMode.phaseAbility).toBe('macro');
      expect(state.diceMode.longRestFocus).toBe('macro');
    });

    it('has correct default boolean settings', () => {
      const state = useSettingsStore.getState();
      expect(state.soundEnabled).toBe(false);
      expect(state.animationsEnabled).toBe(true);
      expect(state.reducedMotion).toBe(false);
      expect(state.highlightDropTargets).toBe(true);
      expect(state.confirmBeforeActivation).toBe(false);
      expect(state.autoTriggerSurgeOnWarp).toBe(true);
      expect(state.shortRestClearEffects).toBe(true);
    });
  });

  describe('setDiceMode', () => {
    it('updates a single dice mode without affecting others', () => {
      useSettingsStore.getState().setDiceMode('wildSurge', 'macro');
      const state = useSettingsStore.getState();
      expect(state.diceMode.wildSurge).toBe('macro');
      expect(state.diceMode.siphonFeature).toBe('macro');
    });
  });

  describe('boolean setters', () => {
    it('setSoundEnabled', () => {
      useSettingsStore.getState().setSoundEnabled(true);
      expect(useSettingsStore.getState().soundEnabled).toBe(true);
    });

    it('setAnimationsEnabled', () => {
      useSettingsStore.getState().setAnimationsEnabled(false);
      expect(useSettingsStore.getState().animationsEnabled).toBe(false);
    });

    it('setReducedMotion', () => {
      useSettingsStore.getState().setReducedMotion(true);
      expect(useSettingsStore.getState().reducedMotion).toBe(true);
    });

    it('setConfirmBeforeActivation', () => {
      useSettingsStore.getState().setConfirmBeforeActivation(true);
      expect(useSettingsStore.getState().confirmBeforeActivation).toBe(true);
    });

    it('setAutoTriggerSurgeOnWarp', () => {
      useSettingsStore.getState().setAutoTriggerSurgeOnWarp(false);
      expect(useSettingsStore.getState().autoTriggerSurgeOnWarp).toBe(false);
    });

    it('setShortRestClearEffects', () => {
      useSettingsStore.getState().setShortRestClearEffects(false);
      expect(useSettingsStore.getState().shortRestClearEffects).toBe(false);
    });

    it('setHighlightDropTargets', () => {
      useSettingsStore.getState().setHighlightDropTargets(false);
      expect(useSettingsStore.getState().highlightDropTargets).toBe(false);
    });
  });

  describe('resetSettings', () => {
    it('restores all defaults', () => {
      const store = useSettingsStore.getState();
      store.setSoundEnabled(true);
      store.setDiceMode('wildSurge', 'macro');
      store.setAnimationsEnabled(false);
      store.resetSettings();
      const state = useSettingsStore.getState();
      expect(state.soundEnabled).toBe(false);
      expect(state.diceMode.wildSurge).toBe('dice3d');
      expect(state.animationsEnabled).toBe(true);
    });
  });
});
