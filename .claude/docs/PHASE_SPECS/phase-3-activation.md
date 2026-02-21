# Phase 3: Activation Flow

## Goal
Implement the full activation flow: card staging, Activation Panel overlay, cost preview with modifiers, macro generation, confirm/cancel, warp handling, and card return to deck.

## Sessions: 2

- **Session 3A**: ActivationPanel + staging + confirm/cancel core flow
- **Session 3B**: Warp handling + macro generation + Activation:None auto-activate

---

## Entry Conditions
- [ ] Phase 2 exit gate passed
- [ ] HandArea renders cards from `getHandCards()`
- [ ] `bestowToSelf()` and `activateFromHand()` work correctly (verified by tests)
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes

## Exit Conditions
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] `npm run test` passes (including new macro generator tests)
- [ ] Double-clicking a hand card opens the Activation Panel
- [ ] Activation Panel shows: feature name, EP cost (with modifiers), current EP -> new EP, focus dice, macro text
- [ ] Effective cost reflects Echo Intuition / Siphon Greed modifiers when active
- [ ] Confirm: EP deducted, Focus added, card returns to Selected Deck, effect in Active Effects panel
- [ ] Cancel: card stays in hand, no resources spent
- [ ] Warp warning appears when EP would go negative after activation
- [ ] Warp triggers auto-surge (if `autoTriggerSurgeOnWarp` setting is on)
- [ ] Activation:None features auto-open activation flow when bestowed from deck

---

## Session 3A: Core Activation Flow

### Tasks

1. **Create ActivationPanel** (`src/components/combat-hud/ActivationPanel.tsx`):
   - Overlay/side panel that appears when a card is staged for activation
   - Shows:
     - Feature name and description
     - EP Cost: base cost, effective cost (after modifiers), current EP -> new EP
     - If Echo Intuition active: show "Echo Intuition: Cost halved"
     - If Siphon Greed applies: show "Siphon Greed: Cost halved"
     - Focus Dice: notation, effective dice (if Echo Intuition halves)
     - Warp indicator: "WARP WILL TRIGGER" in danger color if EP will go negative
   - Buttons: Confirm, Cancel
   - In Macro mode: show copyable macro text + manual result input field
   - In 3D Dice mode: roll dice on confirm (placeholder -- 3D dice integration is future)

2. **Add activation state to CombatHUD** (`src/components/combat-hud/CombatHUD.tsx`):
   - `stagedCard: string | null` -- featureId being activated
   - `showActivationPanel: boolean`
   - When card double-clicked in HandArea -> set stagedCard, show panel
   - On confirm: call spendEP, addFocus, activateFromHand, optionally addActiveEffect
   - On cancel: clear stagedCard, hide panel

3. **Wire double-click in HandArea** (`src/components/combat-hud/HandArea.tsx`):
   - Double-click handler on cards calls parent callback `onActivateCard(featureId)`

### Files to Create
- `src/components/combat-hud/ActivationPanel.tsx`

### Files to Modify
- `src/components/combat-hud/CombatHUD.tsx`
- `src/components/combat-hud/HandArea.tsx`

---

## Session 3B: Warp + Macro + Auto-Activate

### Tasks

1. **Warp handling in ActivationPanel**:
   - After confirm, if `spendEP()` returns `warpTriggered = true`:
     - Show the feature's warp effect description
     - If `autoTriggerSurgeOnWarp` is on: auto-open SurgeTableModal
     - If off: show "Warp triggered" notification, user opens surge manually

2. **Create MacroDisplay** (`src/components/combat-hud/MacroDisplay.tsx`):
   - Shows copyable FoundryVTT macro text
   - Button to copy to clipboard
   - Manual result input field for entering roll result

3. **Create macro generator** (`src/utils/macroGenerator.ts`):
   - `generateActivationMacro(feature, effectiveCost, focusDice)` -> macro string
   - Format: FoundryVTT `/roll` syntax

4. **Activation:None auto-activate**:
   - In SelectedDeck: when a card with `activation === 'None'` is clicked (bestowed):
     - After `bestowToSelf()`, immediately open the Activation Panel
     - This makes bestow + activate one step for the player
   - The card still moves to hand briefly, then returns to deck on confirm
   - **IMPORTANT**: The Phase 2 SelectedDeck click handler currently just calls
     `bestowToSelf()` with no awareness of activation type. This task must wrap
     that call: check `feature.activation === 'None'`, and if so, trigger the
     full activation flow (EP cost, warp check, Focus roll) inline after the
     bestow. This is the main integration point between SelectedDeck and the
     new ActivationPanel.

5. **Write tests**:
   - `src/utils/__tests__/macroGenerator.test.ts`

### Files to Create
- `src/components/combat-hud/MacroDisplay.tsx`
- `src/utils/macroGenerator.ts`
- `src/utils/__tests__/macroGenerator.test.ts`

### Files to Modify
- `src/components/combat-hud/ActivationPanel.tsx`
- `src/components/combat-hud/CombatHUD.tsx`
- `src/components/combat-hud/SelectedDeck.tsx` (Activation:None detection)
- `src/components/combat-hud/SurgeTableModal.tsx` (auto-trigger from warp)

---

## Out of Scope
- DO NOT implement drag-and-drop activation (Phase 7 -- use double-click for now)
- DO NOT implement 3D dice rendering (future -- just use macro mode or simple random)
- DO NOT implement phase ability activation (can be Phase 3.5 or separate)
- DO NOT implement ally bestowment (Phase 6)
- DO NOT add animations to activation flow (Phase 7)

## Key References
- `.claude/docs/CARD_LIFECYCLE.md` -- Step 3: Activate
- `.claude/docs/SPECIAL_CASES.md` -- Activation:None, Echo Intuition, Siphon Greed
- `.claude/docs/RULES.md` -- RULE-EP-*, RULE-FOCUS-*, RULE-GREED-*, RULE-INTUITION-*
- `DESIGN.md` -- Activation Panel wireframe and interaction flow
