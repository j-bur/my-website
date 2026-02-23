import { describe, it, expect, beforeEach } from 'vitest';
import { useCharacterStore } from '../characterStore';

function resetStore() {
  useCharacterStore.getState().resetCharacter();
}

describe('characterStore', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('setLevel', () => {
    it('clamps level to 1-20 range', () => {
      const store = useCharacterStore.getState();
      store.setLevel(0);
      expect(useCharacterStore.getState().level).toBe(1);
      store.setLevel(25);
      expect(useCharacterStore.getState().level).toBe(20);
    });

    it('updates proficiency bonus from level', () => {
      const store = useCharacterStore.getState();
      store.setLevel(1);
      expect(useCharacterStore.getState().proficiencyBonus).toBe(2);
      store.setLevel(5);
      expect(useCharacterStore.getState().proficiencyBonus).toBe(3);
      store.setLevel(9);
      expect(useCharacterStore.getState().proficiencyBonus).toBe(4);
      store.setLevel(13);
      expect(useCharacterStore.getState().proficiencyBonus).toBe(5);
      store.setLevel(17);
      expect(useCharacterStore.getState().proficiencyBonus).toBe(6);
    });

    it('sets maxHitDice to level', () => {
      useCharacterStore.getState().setLevel(10);
      expect(useCharacterStore.getState().maxHitDice).toBe(10);
    });

    it('clamps hitDice to new maxHitDice', () => {
      const store = useCharacterStore.getState();
      store.setLevel(10);
      store.restoreAllHitDice(); // hitDice = 10
      expect(useCharacterStore.getState().hitDice).toBe(10);
      store.setLevel(5); // maxHitDice=5, hitDice clamped to 5
      expect(useCharacterStore.getState().hitDice).toBe(5);
    });
  });

  describe('setMaxHP', () => {
    it('sets maxHP and reducedMaxHP', () => {
      useCharacterStore.getState().setMaxHP(50);
      const state = useCharacterStore.getState();
      expect(state.maxHP).toBe(50);
      expect(state.reducedMaxHP).toBe(50);
    });
  });

  describe('reduceMaxHP', () => {
    it('reduces reducedMaxHP (min 0)', () => {
      const store = useCharacterStore.getState();
      store.setMaxHP(50);
      store.reduceMaxHP(20);
      expect(useCharacterStore.getState().reducedMaxHP).toBe(30);
    });

    it('reducedMaxHP does not go below 0', () => {
      const store = useCharacterStore.getState();
      store.setMaxHP(10);
      store.reduceMaxHP(100);
      expect(useCharacterStore.getState().reducedMaxHP).toBe(0);
    });
  });

  describe('restoreMaxHP', () => {
    it('restores reducedMaxHP up to maxHP', () => {
      const store = useCharacterStore.getState();
      store.setMaxHP(50);
      store.reduceMaxHP(20);
      store.restoreMaxHP(10);
      expect(useCharacterStore.getState().reducedMaxHP).toBe(40);
    });

    it('does not exceed maxHP', () => {
      const store = useCharacterStore.getState();
      store.setMaxHP(50);
      store.reduceMaxHP(10);
      store.restoreMaxHP(100);
      expect(useCharacterStore.getState().reducedMaxHP).toBe(50);
    });
  });

  // RULE-HD-001, RULE-HD-002
  describe('spendHitDice', () => {
    it('deducts hit dice when sufficient', () => {
      const store = useCharacterStore.getState();
      store.setLevel(5);
      store.restoreAllHitDice();
      const result = store.spendHitDice(2);
      expect(result).toBe(true);
      expect(useCharacterStore.getState().hitDice).toBe(3);
    });

    it('returns false and does not change state when insufficient', () => {
      const store = useCharacterStore.getState();
      store.setLevel(5);
      store.restoreAllHitDice();
      store.spendHitDice(4); // 5 -> 1
      const result = useCharacterStore.getState().spendHitDice(2); // need 2, have 1
      expect(result).toBe(false);
      expect(useCharacterStore.getState().hitDice).toBe(1);
    });
  });

  // RULE-REST-003
  describe('restoreAllHitDice', () => {
    it('restores hitDice to maxHitDice', () => {
      const store = useCharacterStore.getState();
      store.setLevel(5);
      store.restoreAllHitDice();
      store.spendHitDice(3);
      expect(useCharacterStore.getState().hitDice).toBe(2);
      useCharacterStore.getState().restoreAllHitDice();
      expect(useCharacterStore.getState().hitDice).toBe(5);
    });
  });

  describe('resetCharacter', () => {
    it('resets all fields to defaults', () => {
      const store = useCharacterStore.getState();
      store.setName('Test');
      store.setLevel(10);
      store.setMaxHP(100);
      store.resetCharacter();
      const state = useCharacterStore.getState();
      expect(state.name).toBe('');
      expect(state.level).toBe(1);
      expect(state.maxHP).toBe(10);
      expect(state.hitDice).toBe(1);
      expect(state.maxHitDice).toBe(1);
    });
  });
});
