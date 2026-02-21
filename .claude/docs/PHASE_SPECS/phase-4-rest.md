# Phase 4: Rest Mechanics

## Goal
Implement Long Rest and Short Rest buttons with full mechanics, dialogs, and cross-store coordination.

## Sessions: 1

---

## Entry Conditions
- [ ] Phase 3 exit gate passed
- [ ] Activation flow works end-to-end
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes

## Exit Conditions
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] `npm run test` passes (including new rest mechanics tests)
- [ ] Long Rest button shows dialog with preview of all changes
- [ ] Long Rest confirm: EP += PB (capped at Level), Focus -= d4 (min 0), motes = 8, HD = max, hand cleared, ally bestowments cleared, short-duration effects cleared, capacitance cleared, free phase switch restored
- [ ] Short Rest button shows dialog with HD spending option and effect clearing toggle
- [ ] Short Rest confirm: free phase switch restored, optionally clear effects < 1 hour
- [ ] Short Rest does NOT affect EP, Focus, motes, or bestowments
- [ ] Rest buttons appear in both Combat View and Deck Builder

---

## Tasks

### 1. Create LongRestDialog
File: `src/components/combat-hud/LongRestDialog.tsx`

Modal dialog showing:
- EP recovery preview: "+{pb} EP (current {current} -> {new}, max {level})"
- Focus reduction: "Focus reduced by d4 roll"
- Resources restored: "Motes: 8/8, Hit Dice: {level}/{level}"
- Bestowments cleared: "{n} bestowments will be cleared"
- Active effects: "{n} short-duration effects will be removed"
- Confirm / Cancel buttons

On Confirm, coordinate across stores:
1. `siphonStore.longRest(pb, maxEP)` -- EP, Focus, capacitance, hand, bestowments, effects
2. `characterStore.restoreAllHitDice()` -- HD
3. `characterStore.restoreMaxHP(epRecovered)` -- if reduced by Echo Drain
4. `manifoldStore.restoreAllMotes()` -- motes to 8
5. `manifoldStore.restorePhaseSwitchOnShortRest()` -- free phase switch

### 2. Create ShortRestDialog
File: `src/components/combat-hud/ShortRestDialog.tsx`

Modal dialog showing:
- Hit Dice spending: input for how many HD to spend for healing
- Effect clearing toggle: "Clear effects with duration < 1 hour"
- Current HP display
- Confirm / Cancel buttons

On Confirm:
1. `characterStore.spendHitDice(amount)` -- spend HD
2. `characterStore.setCurrentHP(currentHP + healingRoll)` -- heal (in macro mode, user enters roll)
3. `siphonStore.shortRest(clearShortEffects)` -- effect clearing
4. `manifoldStore.restorePhaseSwitchOnShortRest()` -- free phase switch

### 3. Add rest buttons to CombatHUD
- Long Rest button in header area
- Short Rest button in header area
- State for showing/hiding each dialog

### 4. Add rest buttons to DeckBuilder
- Both buttons available in Deck Builder as well
- Same dialog components reused

### 5. Write integration tests
File: `src/store/__tests__/restMechanics.test.ts`

Test against RULES.md:
- RULE-REST-001: Long Rest clears hand and bestowments
- RULE-REST-002: Long Rest restores motes
- RULE-REST-003: Long Rest restores Hit Dice
- RULE-REST-004: Short Rest restores free phase switch
- RULE-REST-005: Short Rest does NOT affect EP or Focus
- RULE-REST-006: Short Rest optionally clears short-duration effects

---

## Files to Create
- `src/components/combat-hud/LongRestDialog.tsx`
- `src/components/combat-hud/ShortRestDialog.tsx`
- `src/store/__tests__/restMechanics.test.ts`

## Files to Modify
- `src/components/combat-hud/CombatHUD.tsx` (rest buttons + dialog state)
- `src/components/deck-builder/DeckBuilder.tsx` (rest buttons)
- `src/store/siphonStore.ts` (verify longRest/shortRest work with new model)

---

## Out of Scope
- DO NOT implement While Selected feature cost/focus at long rest (complex, can be Phase 4.5)
- DO NOT implement capacitance timer UI (Phase 5)
- DO NOT add animations to rest transitions (Phase 7)

## Key References
- `.claude/docs/RULES.md` -- RULE-REST-001 through RULE-REST-006, RULE-HD-001 through RULE-HD-003
- `ARCHITECTURE.md` -- Rest Mechanics section
- `DESIGN.md` -- Long Rest and Short Rest dialog specs
