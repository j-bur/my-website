# Phase 2: Combat Layout Restructure

## Goal
Replace the current CombatHUD layout with the DESIGN.md spatial layout. Create skeleton components for all zones. The layout should match the wireframe even if interactions are limited.

## Sessions: 2

- **Session 2A**: CSS Grid layout + SelectedDeck + HandArea + HitDiceDisplay
- **Session 2B**: ActiveEffectsPanel + ResourceDisplay wrapper + header revision

---

## Entry Conditions
- [ ] Phase 1 exit gate passed
- [ ] siphonStore has `getDeckCards()` and `getHandCards()` working
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes

## Exit Conditions
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] `npm run test` passes
- [ ] CombatHUD layout matches DESIGN.md wireframe (see Target Layout below)
- [ ] Selected Deck expands/collapses on click
- [ ] Expanded deck shows only `getDeckCards()` results
- [ ] Hand shows only `getHandCards()` results
- [ ] Clicking a card in expanded deck calls `bestowToSelf()` (moves to hand)
- [ ] Active Effects panel shows placeholder text
- [ ] Resources (EP, Focus, HD, Capacitance) display correctly on right side

---

## Target Layout (from DESIGN.md)

```
+----------------------------------------------------------------+
|                                                                  |
|  [Manifold Deck]                          [Wild Surge Deck]      |
|   oooooooo (motes)                                               |
|                                                                  |
|  [Phase Ability 1]  [Phase Ability 2]  [Phase Ability 3]         |
|                                                                  |
|        +---------- ACTIVE EFFECTS ----------+    [Focus]         |
|        | (effects on self listed here)       |    [EP Bar]       |
|        | (drag cards here to activate)       |    [Hit Dice]     |
|        +-------------------------------------+    [Capacitance]  |
|                                                                  |
|  [Allies: [Name1] [Name2] [+]]                                  |
|                                                                  |
|  [Selected]  [Card A] [Card B] [Card C] [Card D]                |
|  [ Deck  ]       ^ Hand (bestowed to self)                       |
+----------------------------------------------------------------+
```

Use CSS Grid for the spatial layout. Recommended grid areas:
```css
grid-template-areas:
  "manifold  .        .        surge"
  "abilities abilities effects  resources"
  "allies    allies   allies   allies"
  "deck      hand     hand     hand";
```

---

## Session 2A: Layout + Deck + Hand

### Tasks

1. **Rewrite CombatHUD layout** (`src/components/combat-hud/CombatHUD.tsx`):
   - Replace current vertical layout with CSS Grid
   - Define grid areas matching Target Layout
   - Place existing components (EchoManifold, WildSurge) in correct grid areas
   - Create slots for new components

2. **Create SelectedDeck** (`src/components/combat-hud/SelectedDeck.tsx`):
   - Default: shows face-down deck icon with card count badge
   - Click: expands to show `getDeckCards()` as face-up cards above the hand area
   - Each card is clickable (calls `bestowToSelf()`)
   - Escape or click outside: collapses
   - Cards already in hand do NOT appear

3. **Create HandArea** (`src/components/combat-hud/HandArea.tsx`):
   - Shows `getHandCards()` as overlapping fanned cards
   - Hover: raises card slightly, shows full text
   - Double-click: placeholder for activation (Phase 3)
   - Cards fan out along bottom, overlapping

4. **Create HitDiceDisplay** (`src/components/combat-hud/HitDiceDisplay.tsx`):
   - Shows current/max hit dice from characterStore
   - Simple display: "HD: 3/5"
   - Styled to match EP and Focus counters

### Files to Create
- `src/components/combat-hud/SelectedDeck.tsx`
- `src/components/combat-hud/HandArea.tsx`
- `src/components/combat-hud/HitDiceDisplay.tsx`

### Files to Modify
- `src/components/combat-hud/CombatHUD.tsx` (complete layout rewrite)

---

## Session 2B: Active Effects + Resources

### Tasks

1. **Create ActiveEffectsPanel** (`src/components/combat-hud/ActiveEffectsPanel.tsx`):
   - Center panel showing `activeEffects` from siphonStore
   - Each effect shows: name, source, total duration, concentration indicator
   - If empty: show "(drag cards here to activate)" placeholder
   - No drag interaction yet (Phase 3/7)

2. **Create ResourceDisplay** (`src/components/combat-hud/ResourceDisplay.tsx`):
   - Wrapper component for right column
   - Contains: FocusCounter, EchoPointsBar, HitDiceDisplay, SiphonCapacitanceTracker
   - Stacked vertically in the right grid area

3. **Adjust existing resource components**:
   - `EchoPointsBar.tsx` -- may need compact mode props
   - `FocusCounter.tsx` -- same
   - `SiphonCapacitanceTracker.tsx` -- same

4. **Delete or gut ActiveCardHand.tsx**:
   - Replaced by HandArea.tsx
   - Remove file or leave as empty re-export

### Files to Create
- `src/components/combat-hud/ActiveEffectsPanel.tsx`
- `src/components/combat-hud/ResourceDisplay.tsx`

### Files to Modify
- `src/components/combat-hud/CombatHUD.tsx` (wire in new components)
- `src/components/combat-hud/EchoPointsBar.tsx` (compact mode if needed)
- `src/components/combat-hud/FocusCounter.tsx` (compact mode if needed)
- `src/components/combat-hud/SiphonCapacitanceTracker.tsx` (compact mode if needed)

### Files to Remove
- `src/components/combat-hud/ActiveCardHand.tsx`

---

## Out of Scope
- DO NOT implement drag-and-drop (Phase 7)
- DO NOT implement the Activation Panel overlay (Phase 3)
- DO NOT implement the Allies Panel (Phase 6)
- DO NOT add animations (Phase 7)
- DO NOT implement rest buttons (Phase 4)
- DO NOT implement the Settings modal (Phase 5)

## Key References
- `DESIGN.md` lines 52-86 (Combat View wireframe)
- `DESIGN.md` lines 239-265 (layout comparison in GAP_ANALYSIS)
- `.claude/docs/CARD_LIFECYCLE.md` (zone behavior)
