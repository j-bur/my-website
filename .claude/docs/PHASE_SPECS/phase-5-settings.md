# Phase 5: Settings and Polish

## Goal
Implement the Settings modal with all toggles, manual override controls, capacitance timer UI, and data export/import.

## Sessions: 2

- **Session 5A**: Settings modal core with dice mode and gameplay toggles
- **Session 5B**: Capacitance timer, manual overrides, data export/import

---

## Entry Conditions
- [ ] Phase 4 exit gate passed
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

## Out of Scope
- DO NOT implement sound playback (just the toggle)
- DO NOT implement 3D dice rendering (just the toggle)
- DO NOT add settings for features not yet implemented

## Key References
- `.claude/docs/STORE_CONTRACTS.md` -- settingsStore interface
- `DESIGN.md` -- Settings modal wireframe
