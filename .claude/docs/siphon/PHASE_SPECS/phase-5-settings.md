# Phase 5: Settings and Polish

## Goal
Implement the Settings modal with all toggles, manual override controls, capacitance timer UI, data export/import, and While Selected long rest mechanics.

## Sessions: 3

- **Session 5A**: Settings modal core with dice mode and gameplay toggles
- **Session 5B**: Capacitance timer, manual overrides, data export/import
- **Session 5C**: While Selected focus/cost mechanics at long rest (Siphon Greed, Supercapacitance)

---

## Routing Note
Phase 4.5 changed the route structure. CombatHUD is now at `/combat` (not `/`), DeckBuilder is at `/deck-builder`, and `/` is a `HomeRedirect` that sends users to the appropriate view based on whether they have selected cards. The app uses `createHashRouter` (URLs look like `/#/combat`, `/#/deck-builder`).

## Entry Conditions
- [ ] Phase 4.5 exit gate passed (DeckBuilder + routing working)
- [ ] settingsStore exists and works (created in Phase 1)
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes

## Exit Conditions
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] `npm run test` passes
- [ ] Settings modal opens from gear icon in both Combat View and Deck Builder
- [ ] All dice mode toggles work and persist to localStorage
- [ ] Sound/Visual/Gameplay toggles work and persist
- [ ] Manual overrides correctly update store values (EP, Focus, Motes, HD, Max HP)
- [ ] Export produces valid JSON containing all store state
- [ ] Import restores all store state from JSON
- [ ] Reset clears all stores to defaults
- [ ] Capacitance tracker shows in-game time with presets
- [ ] Long Rest applies Siphon Greed focus gain when selected
- [ ] Long Rest applies Supercapacitance EP cost when selected and over PB
- [ ] LongRestDialog shows While Selected effects preview

---

## Session 5A: Settings Modal

### Tasks

1. **Create SettingsModal** (`src/components/settings/SettingsModal.tsx`):
   Layout per DESIGN.md:
   ```
   +---------------------------------------------------+
   | Settings                                     [X]  |
   |---------------------------------------------------|
   | DICE ROLLS                                        |
   | Wild Echo Surge          [3D] [Macro]             |
   | Siphon Feature rolls     [3D] [Macro]             |
   | Phase Ability rolls      [3D] [Macro]             |
   | Long Rest Focus reduction[3D] [Macro]             |
   |                                                   |
   | SOUND                                             |
   | Sound effects            [On] [Off]               |
   |                                                   |
   | VISUAL                                            |
   | Animations               [On] [Off]               |
   | Reduced motion           [On] [Off]               |
   |                                                   |
   | GAMEPLAY                                          |
   | Confirm before activation [On] [Off]              |
   | Auto-trigger surge on warp[On] [Off]              |
   | Short rest clears effects [On] [Off]              |
   +---------------------------------------------------+
   ```

2. **Create DiceModeToggle** (`src/components/settings/DiceModeToggle.tsx`):
   - Toggle pair: [3D] [Macro]
   - Active state uses accent color
   - Calls `settingsStore.setDiceMode(rollType, mode)`

3. **Add gear icon to headers**:
   - CombatHUD header: gear icon button
   - DeckBuilder header: gear icon button
   - Both open SettingsModal

### Files to Create
- `src/components/settings/SettingsModal.tsx`
- `src/components/settings/DiceModeToggle.tsx`
- `src/components/settings/index.ts`

### Files to Modify
- `src/components/combat-hud/CombatHUD.tsx` (gear icon + modal state)
- `src/components/deck-builder/DeckBuilder.tsx` (gear icon + modal state)

---

## Session 5B: Timer + Overrides + Data

### Tasks

1. **Create ManualOverrides** (`src/components/settings/ManualOverrides.tsx`):
   - Number inputs for: EP, Focus, Motes, Hit Dice, Max HP
   - Each input calls the appropriate store setter
   - Show current value as placeholder
   - Validation: clamp to valid ranges

2. **Create DataManagement** (`src/components/settings/DataManagement.tsx`):
   - Export button: downloads JSON file with all store state
   - Import button: file picker, loads JSON, restores all stores
   - Reset button: clears all stores to defaults (with confirmation dialog)
   - Clear Session button: clears combat state but keeps character/settings

3. **Create data export utility** (`src/utils/dataExport.ts`):
   - `exportAllState()`: reads all stores, returns JSON string
   - `importAllState(json)`: parses JSON, writes to all stores
   - `resetAllStores()`: calls reset on all stores
   - Include version field for future compatibility

4. **Update Capacitance tracker** (`src/components/combat-hud/SiphonCapacitanceTracker.tsx`):
   - Add in-game time picker per DESIGN.md
   - Show presets: "Now", "+1 hour", "+4 hours", "+8 hours"
   - Display remaining time in acquisition window

### Files to Create
- `src/components/settings/ManualOverrides.tsx`
- `src/components/settings/DataManagement.tsx`
- `src/utils/dataExport.ts`

### Files to Modify
- `src/components/settings/SettingsModal.tsx` (add overrides and data sections)
- `src/components/combat-hud/SiphonCapacitanceTracker.tsx` (timer UI)

---

## Session 5C: While Selected Long Rest Mechanics

### Background
Two features have "While Selected" duration — their cost and focus apply at **every long rest** while they remain in the Selected deck. This was deferred from Phases 4 and 4.5 and has no other phase that owns it. It naturally fits here because it's a long rest modifier that integrates with the existing LongRestDialog.

### Features Affected

**Siphon Greed** (id: `siphon-greed`):
- While Selected, Focus for Siphon Greed is gained at the end of every long rest
- The Focus gain equals the feature's focus dice roll (normal focus rules apply — doubles when EP negative)
- Source: "The Focus for Siphon Greed is gained at the end of every long rest while this is Selected."

**Supercapacitance** (id: `supercapacitance`):
- While Selected, EP cost is paid at the end of every long rest
- Cost = number of additional features selected beyond PB
- If total selected > PB, cost is **doubled** (DESIGN.md lines 1076–1081)
- Focus gain equals the (undoubled) cost
- Example: PB = 3, 5 features selected → 2 extra → cost = 2 EP. But 5 > PB, so cost doubles to 4 EP. Focus gained = 2.

### Tasks

1. **Extend `siphonStore.longRest()`** to accept a `whileSelectedEffects` parameter:
   - Array of `{ featureId: string, epCost: number, focusGain: number }`
   - Applied after EP recovery (so EP recovers first, then While Selected costs deduct)
   - Focus gain follows normal rules (doubles when EP negative at time of gain)

2. **Create `whileSelectedCalculator` utility** (`src/utils/whileSelectedCalculator.ts`):
   - `calculateWhileSelectedEffects(selectedCardIds, proficiencyBonus, currentEP)` → array of effects
   - Handles Siphon Greed focus calculation
   - Handles Supercapacitance cost/focus calculation with doubling rule
   - Returns empty array if neither feature is selected

3. **Update LongRestDialog** to show While Selected preview:
   - After EP recovery preview, show: "While Selected effects:"
   - "Siphon Greed: +Xd8 Focus" (if selected)
   - "Supercapacitance: -N EP, +M Focus (N extra features)" (if selected and over PB)
   - Warning if Supercapacitance cost would push EP negative after recovery

4. **Write tests** (~10 tests):
   - Siphon Greed focus gain at long rest (macro and dice3d modes)
   - Supercapacitance cost calculation (at PB, over PB, doubling)
   - Combined: both selected simultaneously
   - Focus doubling when EP is negative after recovery
   - No effect when neither feature is selected
   - LongRestDialog shows While Selected preview section

### Files to Create
- `src/utils/whileSelectedCalculator.ts`
- `src/utils/__tests__/whileSelectedCalculator.test.ts`

### Files to Modify
- `src/store/siphonStore.ts` (longRest parameter extension)
- `src/components/combat-hud/LongRestDialog.tsx` (While Selected preview section)

---

## Out of Scope
- DO NOT implement sound playback (just the toggle)
- DO NOT implement 3D dice rendering (just the toggle)
- DO NOT add settings for features not yet implemented

## Key References
- `.claude/docs/STORE_CONTRACTS.md` -- settingsStore interface
- `.claude/docs/SPECIAL_CASES.md` -- Supercapacitance and Siphon Greed edge cases
- `DESIGN.md` -- Settings modal wireframe
- `DESIGN.md` lines 1076–1081 -- Supercapacitance overflow and cost doubling rules
