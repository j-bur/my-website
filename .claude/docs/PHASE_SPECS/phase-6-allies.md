# Phase 6: Ally Bestowment System

## Goal
Implement named allies, bestowing features to allies, and the ally bestowment view overlay.

## Sessions: 2

- **Session 6A**: AlliesPanel + bestow-to-ally flow
- **Session 6B**: AllyBestowmentView overlay

---

## Entry Conditions
- [ ] Phase 5 exit gate passed
- [ ] siphonStore has `allies`, `allyBestowments`, `bestowToAlly`, `addAlly`, `removeAlly` working
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes

## Exit Conditions
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] `npm run test` passes
- [ ] Can add named allies via [+] button
- [ ] Can remove allies
- [ ] Can rename allies (click name to edit)
- [ ] Can bestow a card from Selected Deck to an ally (click card, then click ally name)
- [ ] Ally shows bestowed card count badge
- [ ] Hovering ally name (500ms delay) shows their bestowed cards in overlay
- [ ] Can remove a bestowment from an ally (in overlay)
- [ ] Special cost features (`*`) show no bestow-to-ally option
- [ ] RULE-ALLY-001 enforced: special cost features blocked
- [ ] RULE-ALLY-002 enforced: removing ally clears their bestowments

---

## Session 6A: AlliesPanel + Bestow Flow

### Tasks

1. **Create AlliesPanel** (`src/components/combat-hud/AlliesPanel.tsx`):
   - Collapsible row above the hand area
   - Each ally shown as a named chip/button: `[Briar (2)] [Asmo (1)] [+]`
   - Number in parentheses = bestowed card count
   - [+] button: opens inline name input to add ally
   - Click ally name: selects as bestow target (highlight state)

2. **Wire bestow-to-ally in SelectedDeck**:
   - When an ally is selected as target AND deck is expanded:
     - Clicking a non-special-cost card bestows it to that ally
     - Special cost cards show "Cannot bestow to allies" tooltip
   - After bestowing: ally deselects, deck stays open

3. **Add AlliesPanel to CombatHUD layout**:
   - Place in the "allies" grid area (above hand, below active effects)

### Files to Create
- `src/components/combat-hud/AlliesPanel.tsx`

### Files to Modify
- `src/components/combat-hud/CombatHUD.tsx` (add AlliesPanel to layout)
- `src/components/combat-hud/SelectedDeck.tsx` (bestow-to-ally interaction)

---

## Session 6B: AllyBestowmentView Overlay

### Tasks

1. **Create AllyBestowmentView** (`src/components/combat-hud/AllyBestowmentView.tsx`):
   - Overlay that appears on ally hover (500ms delay)
   - Shows ally's bestowed cards as SiphonCard components
   - Layout per DESIGN.md:
     - Cards from Selected deck (left side)
     - Cards from All Features (right side, if applicable)
   - Each card has a remove button (or drag-away to remove)
   - Dismiss: move mouse away from ally name and overlay

2. **Add hover interaction to AlliesPanel**:
   - 500ms hover delay before showing overlay
   - Overlay positions relative to the ally chip
   - Overlay dismisses when mouse leaves both ally chip and overlay

3. **Update SiphonCard for ally context**:
   - Optional "bestowed to [AllyName]" badge on card
   - Slightly different styling when shown in ally context

### Files to Create
- `src/components/combat-hud/AllyBestowmentView.tsx`

### Files to Modify
- `src/components/combat-hud/AlliesPanel.tsx` (hover trigger)
- `src/components/cards/SiphonCard.tsx` (optional ally badge)

---

## Design Notes

### Superconduction Self-Target UI
Superconduction (feature ID: `superconduction`) can target self or an ally. When bestowed to self
and activated, the UI must present a target picker: "Target: Self / [Ally Name]". If targeting an
ally, the effect should appear in the ally's bestowment view rather than ActiveEffectsPanel. The
activation cost and focus roll still apply to the player. This target picker is NOT needed for
other features — only Superconduction has this dual-target behavior.

## Out of Scope
- DO NOT implement drag-and-drop bestow (Phase 7 -- use click-based for now)
- DO NOT implement silvery tendril animation (Phase 7)
- DO NOT implement ally-side activation tracking (allies activate on their own turns)

## Key References
- `.claude/docs/RULES.md` -- RULE-ALLY-001, RULE-ALLY-002
- `.claude/docs/STORE_CONTRACTS.md` -- Ally Management methods
- `DESIGN.md` -- Allies Panel and AllyBestowmentView wireframes
