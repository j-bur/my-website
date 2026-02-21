import { describe, it, expect, beforeEach } from 'vitest';
import { exportAllState, importAllState, resetAllStores, resetSession } from '../dataExport';
import { useCharacterStore } from '../../store/characterStore';
import { useSiphonStore } from '../../store/siphonStore';
import { useManifoldStore } from '../../store/manifoldStore';
import { useSettingsStore } from '../../store/settingsStore';

function resetStores() {
  useCharacterStore.getState().resetCharacter();
  useSiphonStore.getState().resetSiphon();
  useManifoldStore.getState().resetManifold();
  useSettingsStore.getState().resetSettings();
}

describe('dataExport', () => {
  beforeEach(() => {
    resetStores();
  });

  describe('exportAllState', () => {
    it('exports JSON with version and all store state', () => {
      const json = exportAllState();
      const data = JSON.parse(json);

      expect(data.version).toBe(1);
      expect(data.exportedAt).toBeDefined();
      expect(data.character).toBeDefined();
      expect(data.siphon).toBeDefined();
      expect(data.manifold).toBeDefined();
      expect(data.settings).toBeDefined();
    });

    it('exports current store values', () => {
      useCharacterStore.getState().setLevel(10);
      useSiphonStore.getState().setEP(-5);
      useSiphonStore.getState().setFocus(12);

      const json = exportAllState();
      const data = JSON.parse(json);

      expect(data.character.level).toBe(10);
      expect(data.siphon.currentEP).toBe(-5);
      expect(data.siphon.focus).toBe(12);
    });

    it('does not include functions in export', () => {
      const json = exportAllState();
      const data = JSON.parse(json);

      // All store sections should only have data, not functions
      for (const section of ['character', 'siphon', 'manifold', 'settings']) {
        for (const value of Object.values(data[section])) {
          expect(typeof value).not.toBe('function');
        }
      }
    });
  });

  describe('importAllState', () => {
    it('restores all store state from valid JSON', () => {
      // Set up some state
      useCharacterStore.getState().setLevel(15);
      useSiphonStore.getState().setEP(7);
      useSiphonStore.getState().selectCard('discharge', 6);

      // Export
      const json = exportAllState();

      // Reset
      resetStores();
      expect(useCharacterStore.getState().level).toBe(1);

      // Import
      const result = importAllState(json);
      expect(result.success).toBe(true);

      // Verify restored
      expect(useCharacterStore.getState().level).toBe(15);
      expect(useSiphonStore.getState().currentEP).toBe(7);
      expect(useSiphonStore.getState().selectedCardIds).toContain('discharge');
    });

    it('returns error for invalid JSON', () => {
      const result = importAllState('not json');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to parse JSON file');
    });

    it('returns error for missing version', () => {
      const result = importAllState(JSON.stringify({ character: {} }));
      expect(result.success).toBe(false);
      expect(result.error).toContain('missing version');
    });

    it('returns error for unsupported version', () => {
      const result = importAllState(JSON.stringify({ version: 999 }));
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported version');
    });
  });

  describe('resetAllStores', () => {
    it('resets all stores to defaults', () => {
      // Modify all stores
      useCharacterStore.getState().setLevel(12);
      useSiphonStore.getState().setEP(5);
      useSiphonStore.getState().setFocus(20);
      useManifoldStore.getState().spendMotes(3, false);
      useSettingsStore.getState().setSoundEnabled(true);

      resetAllStores();

      expect(useCharacterStore.getState().level).toBe(1);
      expect(useSiphonStore.getState().currentEP).toBe(0);
      expect(useSiphonStore.getState().focus).toBe(0);
      expect(useManifoldStore.getState().motes).toBe(8);
      expect(useSettingsStore.getState().soundEnabled).toBe(false);
    });
  });

  describe('resetSession', () => {
    it('sets EP to PB and clears combat state', () => {
      useSiphonStore.getState().setEP(-5);
      useSiphonStore.getState().setFocus(15);
      useSiphonStore.getState().addCapacitance();
      useSiphonStore.getState().selectCard('discharge', 6);
      useSiphonStore.getState().bestowToSelf('discharge');

      resetSession(3); // PB = 3

      const state = useSiphonStore.getState();
      expect(state.currentEP).toBe(3);
      expect(state.focus).toBe(0);
      expect(state.siphonCapacitance).toBe(0);
      expect(state.handCardIds).toEqual([]);
      expect(state.allyBestowments).toEqual([]);
      expect(state.activeEffects).toEqual([]);
    });

    it('preserves selected cards and returns hand cards to selected', () => {
      useSiphonStore.getState().selectCard('discharge', 6);
      useSiphonStore.getState().selectCard('siphon-flux', 6);
      useSiphonStore.getState().bestowToSelf('discharge'); // Moves to hand

      resetSession(3);

      const state = useSiphonStore.getState();
      expect(state.selectedCardIds).toContain('siphon-flux');
      // discharge was in hand, should be returned to selected
      expect(state.selectedCardIds).toContain('discharge');
      expect(state.handCardIds).toEqual([]);
    });

    it('sets motes to 0 and resets manifold combat state', () => {
      useManifoldStore.getState().spendMotes(3, false);

      resetSession(3);

      const manifold = useManifoldStore.getState();
      expect(manifold.motes).toBe(0);
      expect(manifold.phaseSwitchAvailable).toBe(true);
      expect(manifold.activeAbilities).toEqual([]);
    });

    it('does not reset character or settings', () => {
      useCharacterStore.getState().setLevel(10);
      useSettingsStore.getState().setSoundEnabled(true);

      resetSession(4);

      expect(useCharacterStore.getState().level).toBe(10);
      expect(useSettingsStore.getState().soundEnabled).toBe(true);
    });
  });
});
