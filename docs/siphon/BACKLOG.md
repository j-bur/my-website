# Backlog — The Siphon Interface

Playtesting observations, bug reports, UX improvements, and feature requests.

---

## Format

Each item has: `[status]` **`P#`** `|` **`Size`** `|` **Title**: Description

**Status**: `[ ]` open, `[~]` in progress, `[x]` resolved, `[?]` needs clarification
**Priority**: `P1` = blocks usability, `P2` = degrades experience, `P3` = nice-to-have
**Size**: `S` = < 1 hour / single file, `M` = 1-3 hours / 2-5 files, `L` = half-day+ / architectural

Related items are grouped. When investigating an item, append **Notes** beneath it as sub-bullets. Sessions should update notes with findings so the next session doesn't repeat work.

---

## Bugs

### Warp & Surge

- [ ] **P1** | **S** | **BUG-02: Wild Echo Surge only shows Effect number**: The roll result display shows the Effect number but not the Severity.

### Ally Bestow System

- [ ] **P1** | **M** | **BUG-03: Can bestow non-bestowable cards to allies**: Cards like Reject Fate or That Which Isn't can be dragged to allies. These have special activation conditions and shouldn't be bestowable.

- [ ] **P1** | **M** | **BUG-04: Dragging card onto ally does nothing**: When dragging a card onto an ally chip, nothing visibly happens — no feedback, no bestow action.

### Drag & Drop

- [ ] **P2** | **S** | **BUG-05: Drag-to-activate preview flicker**: Dragging a card from hand onto the Active Effects panel directly over where the ghost preview would appear causes the panel to flicker between rendering/not rendering the preview row.

- [ ] **P2** | **S** | **BUG-06: ActiveEffectsPanel dismiss scrollbar**: Dragging an effect row to the right causes a scrollbar to appear that gets wider the more the mouse moves right.

### Other

- [ ] **P1** | **S** | **BUG-07: Echo Manifold deck not clickable**: Cannot click the Echo Manifold deck to swap the active Phase.

- [ ] **P2** | **M** | **BUG-08: Triggered features auto-activate on bestow without feedback**: When moving certain cards to hand, they automatically Activate. The UI provides no indication that bestowing these cards will trigger activation.

---

## UX Improvements — Combat View

### Active Effects Panel

- [ ] **P2** | **L** | **UX-01: Active Effects panel is too wide**: The panel takes up most of the screen width. Consider: showing more info per row, breaking into a grid layout, or narrowing it. The center column is `1fr` between two `260px` sidebars.

- [ ] **P1** | **M** | **UX-02: Effect dismiss gesture is too hard**: Dragging an effect out of the full-width panel requires too much mouse travel to dismiss. The drag handle (⋮⋮) is also very hard to see.

### Card Readability

- [ ] **P1** | **M** | **UX-03: Cards with long descriptions get cut off**: No way to read the rest of a truncated card in combat view. Consider tooltip, expand-on-hover, or a detail popover.

- [ ] **P1** | **S** | **UX-04: Selected deck cards show no description**: After clicking the Selected deck, the expanded cards don't show descriptions — no way to know what they do.

- [ ] **P2** | **M** | **UX-05: Siphon Abilities not viewable in combat**: No way to see what Siphon Phase Abilities do. Consider hover-to-expand on the header, or always show descriptions since there's unused space on the left sidebar.

### Superconduction

- [ ] **P2** | **L** | **UX-06: Superconduction activation UX is confusing**: The Varies-cost input row appears in the Active Effects panel but is easy to miss after dropping. Consider: auto-calculate cost, guide user to drag a second card to specify cost, or visual callout. Also: does this UI allow tracking ally activation costs?

- [ ] **P2** | **M** | **UX-07: Superconduction ally bestow has no visible result**: When dragging Superconduction onto an ally, nothing happens. (Related to BUG-04.)

### Layout & Overflow

- [ ] **P2** | **M** | **UX-08: 9 selected cards causes left panel overflow**: With 9 cards in the Selected deck, clicking it overflows the left panel and requires page scroll. Needs scroll containment or card compression.

- [ ] **P3** | **S** | **UX-09: Drop target highlight shows source zone**: The droppable-area highlight glows on the zone the card came from, which is misleading.

- [ ] **P3** | **S** | **UX-10: Echo Manifold motes need numeric label**: Show the mote count as a number in addition to the visual pip indicator.

---

## UX Improvements — Deck Builder

- [ ] **P2** | **M** | **UX-11: Card highlight and spacing don't match card size**: Highlight is smaller than the card and cards slightly overlap. Deck Builder needs a visual rework similar to the Combat View redesign done in Phase 8.

---

## UX Improvements — General

- [~] **P2** | **S** | **UX-12: Focus threshold flavor text should be removed**: Do not display flavor text like "The Weavers are watching..." for Focus thresholds. Instead, change the Focus value color as it hits each threshold. *(TODO: determine color scheme for thresholds.)*
  - **Note**: Flavor text removed in `17592bd`. Stale test removed in `228ea42`. Color thresholds not yet implemented.

- [ ] **P3** | **S** | **UX-13: "Clear session data" is unclear**: The Settings option doesn't explain what it deletes, and doesn't actually delete everything it should.

- [ ] **P2** | **M** | **UX-14: Siphon Flux surge interaction**: While Siphon Flux is bestowed (in hand), it should appear as an option on the Wild Echo Surge modal when a surge triggers, in addition to being playable normally via drag/double-click.

---

## Feature Requests

- [ ] **P3** | **L** | **FEAT-01: Save/revert feature**: Allow players to save a snapshot of their state so they can experiment with cards and revert to a saved state.

- [ ] **P3** | **M** | **FEAT-02: Dynamic card values for Superconduction**: Cards like Superconduction should render their actual computed Cost and Focus values for the current player state instead of just displaying the formula.

- [ ] **P3** | **L** | **FEAT-03: Ally bestow view rework**: When clicking an Ally, collapse the user's hand except for cards bestowed to that Ally, and show the Ally's bestowed cards drawn from Selected/All Features decks. Allies can retain bestowed cards even if the user deselects them at Long Rest (until the Ally activates). Clicking the Ally again reverts the view.

---

## Questions / Investigations

- [ ] **P2** | **S** | **Q-01: Can the same card be activated multiple times?** Cards like Reject Fate create multiple Active Effect entries. This may be correct in some cases but not all — needs rules review per feature.

- [ ] **P3** | **S** | **Q-02: Short Rest Hit Dice preview**: Should the Short Rest modal show how many Hit Dice the player would have remaining if they confirm?

- [ ] **P3** | **S** | **Q-03: Siphon Feature tag audit**: Ensure all feature cards consistently use tags and that all tags make sense.

---

## Technical Debt

- [x] **P3** | **S** | **TECH-01: App.tsx coupled to siphon**: Resolved — `App.tsx` is now a neutral shell (`min-h-screen text-white`). Siphon routes wrapped in `SiphonLayout` which applies `bg-siphon-bg` and `reduce-motion`. Landing page applies `bg-black` via its own component.
