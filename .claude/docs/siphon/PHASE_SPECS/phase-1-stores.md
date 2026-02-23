# Phase 1: Store Redesign

## Goal
Rewrite siphonStore to support the Select -> Bestow -> Activate card lifecycle. Add Hit Dice to characterStore. Create settingsStore. Write comprehensive store tests.

## Sessions: 2

- **Session 1A**: characterStore + settingsStore + new types
- **Session 1B**: siphonStore rewrite + migration + store tests

---

## Entry Conditions
- [ ] Phase 0 exit gate passed
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] `npm run test` passes (Phase 0 utility tests)

## Exit Conditions
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] `npm run test` passes with 30+ store test cases (in addition to Phase 0 tests)
- [ ] Store tests verify: RULE-EP-001 through RULE-EP-005, RULE-FOCUS-001/002, RULE-CARD-001 through RULE-CARD-008, RULE-GREED-001 through RULE-GREED-004
- [ ] All store tests pass and stores export correctly from `src/store/index.ts`

---

## Session 1A: characterStore + settingsStore + Types

### Tasks

1. **Add new types** to `src/types/siphonFeature.ts`:
   - `Ally` interface
   - `AllyBestowment` interface
   - `SelfActiveEffect` interface
   - Export from `src/types/index.ts`

2. **Update characterStore** (`src/store/characterStore.ts`):
   - Add `hitDice: number` (init = level)
   - Add `maxHitDice: number` (init = level)
   - Add `spendHitDice(amount): boolean`
   - Add `restoreAllHitDice(): void`
   - Update `setLevel()` to also update `maxHitDice` and clamp `hitDice`
   - Bump persist version to 2 with migration
   - Update `resetCharacter()` to include HD defaults

3. **Create settingsStore** (`src/store/settingsStore.ts`):
   - Full interface per STORE_CONTRACTS.md
   - All defaults per DESIGN.md
   - Persist to `siphon-settings`

4. **Write tests**:
   - `src/store/__tests__/characterStore.test.ts`
   - `src/store/__tests__/settingsStore.test.ts`

### Files to Create
- `src/store/characterStore.ts` (from scratch — see STORE_CONTRACTS.md for target interface)
- `src/store/settingsStore.ts`
- `src/store/__tests__/characterStore.test.ts`
- `src/store/__tests__/settingsStore.test.ts`

### Files to Modify
- `src/types/siphonFeature.ts`
- `src/types/index.ts`
- `src/store/index.ts` (add characterStore + settingsStore exports)

---

## Session 1B: siphonStore Rewrite

### Tasks

1. **Create siphonStore** (`src/store/siphonStore.ts`) from scratch:
   - New state model per STORE_CONTRACTS.md
   - All EP, Focus, Capacitance actions (reference `src/utils/` for existing calculation logic)
   - Card zone methods: `bestowToSelf`, `bestowToAlly`, `activateFromHand`, `returnCardToDeck`, `replaceSelectedCard`
   - Computed: `getDeckCards`, `getHandCards`, `getEffectiveCost`, `getEffectiveFocusDice`
   - Ally methods: `addAlly`, `removeAlly`, `renameAlly`, etc.
   - Active effects methods: `addActiveEffect`, `removeActiveEffect`, etc.
   - Rest methods: `longRest`, `shortRest` per STORE_CONTRACTS.md
   - Persist version 1 (fresh store, no migration needed)
   - Update `src/store/index.ts` to export siphonStore

2. **Write comprehensive store tests**:
   - `src/store/__tests__/siphonStore.test.ts`
   - Test every rule from RULES.md that pertains to siphonStore
   - Test card zone transitions: select, bestow, activate, return
   - Test getEffectiveCost with Siphon Greed and Echo Intuition
   - Test ally management
   - Test rest mechanics (longRest, shortRest)

### Files to Create
- `src/store/siphonStore.ts` (from scratch — see STORE_CONTRACTS.md for target interface)
- `src/store/__tests__/siphonStore.test.ts`

### Files to Modify
- `src/store/index.ts` (add siphonStore export)

---

## Out of Scope
- DO NOT redesign any component UI
- DO NOT add new dependencies (testing deps already in Phase 0)
- DO NOT implement the Activation Panel or any new UI
- DO NOT refactor utility functions unless they break with the new store
- DO NOT change routing or add new routes
- DO NOT implement drag-and-drop

## Key References
- `.claude/docs/STORE_CONTRACTS.md` -- Full interface specs
- `.claude/docs/RULES.md` -- Test criteria
- `.claude/docs/CARD_LIFECYCLE.md` -- Card flow logic
