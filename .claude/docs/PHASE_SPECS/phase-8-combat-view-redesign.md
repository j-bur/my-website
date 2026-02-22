# Phase 8: Combat View Redesign

## Context

After Phase 7, the Combat HUD uses a **row-based grid** that wastes horizontal space on wide viewports and pushes the hand (primary interaction) to the bottom with excessive dead space. Active Effects dominates the center but is mostly empty.

**Goal**: Restructure to a **three-column sidebar layout** optimized for 1080p (1920×1080) with larger, more legible cards, immersive navigation, and no modals.

**Reference mockup**: `mockup-combat-redesign.html` (open in browser to see the target layout at scale)

---

## Design Decisions (Locked In)

These decisions were made during the design iteration session and should not be revisited without discussion.

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Hand card size | 200 × 280px (5:7 ratio) | Large enough for readable text; fits 5-6 cards in center column |
| Hand overflow | Dense single-row overlap, no arc | Cards compress horizontally as count increases (Supercapacitance) |
| Phase Abilities | Info-only compact bars, not playable | App is for Echo Siphon mechanics; phase abilities are reference only |
| Card activation | Drag → inline preview → drop to activate | No modal; preview shows as ghost row in Active Effects |
| Modals | Eliminated entirely | Don't feel like a card game |
| Rest flows | Separate view/route (design TBD) | "Retreating inward" transition feel; not a modal or drawer |
| Wild Surge | Macro copy/paste or dice roll only | App does NOT look up surge table results |
| Settings | Deck Builder only | No settings gear in Combat View |
| Rest buttons | Right sidebar | Compact, below resources |
| Catalog navigation | Grimoire (CSS book/tome) in bottom-right | Click navigates to Deck Builder; replaces text button |
| Card content | Simplified — functional summary only | App manages mechanics; cards show what it does, not full rules |
| Navigation | Grimoire → Deck Builder; Deck Builder → Combat | No other nav needed in Combat View |

---

## Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│ ECHO MANIFOLD │  ACTIVE EFFECTS                  │ FOCUS: 66    │
│ ┌───────────┐ │  ┌───────────────────────────┐   │              │
│ │ Oblivi0n  │ │  │ ✦ Reject Fate    1hr   W  │   │ EP ████ -19 │
│ │           │ │  │ ✦ Resonant Wpn   10m   W  │   │             │
│ └───────────┘ │  │ ✦ Altered Form   1hr   W  │   │ HD: 8/11    │
│ ●●●●●○○○     │  │                            │   │              │
│               │  │╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌─│   │ CAP: 0/4     │
│ ┌─Echo Surge──BA│ │ ⟡ Distort Reality · 4 EP │   │ ■■■■         │
│ ┌─Siphon Orth─1m│ │   EP: -2 → -6 (WARP)     │   │──────────────│
│ ┌─Temp. Res.──No│ │     (ghost preview row)  │   │ WILD SURGE   │
│               │  └───────────────────────────┘   │ /r 1d100     │
│               │                                  │ [Roll]       │
│               │  ALLIES: [Briar(1)] [Asmo(2)] [+]│──────────────│
│               │                                  │ [Short Rest] │
│ ┌──┐          │  HAND                            │ [Long Rest]  │
│ │7 │          │  ┌──────┐┌──────┐┌──────┐┌──────┐│              │
│ │  │          │  │ That ││Dist. ││Para- ││Super ││ ┌─────────┐  │
│ └──┘          │  │ Which││Reali ││cast- ││cond. ││ │ 📖  42  │ │
│ SELECTED      │  │ Isn't││ty    ││ing   ││      ││ │ Grimoire│  │
│               │  └──────┘└──────┘└──────┘└──────┘│ └─────────┘  │
│               │                                  │ SIPHON       │
│               │                                  │ FEATURES     │
└─────────────────────────────────────────────────────────────────┘
```

### Why This Layout Works
- **Hand** is center-bottom — primary interaction, prominent, easy to reach
- **Active Effects** fills center-top — the "battlefield" grows to use available vertical space
- **Left sidebar** groups Echo Manifold + Phase Abilities + Selected Deck — thematically coherent
- **Right sidebar** has glanceable resources + Wild Surge + rest buttons + grimoire navigation
- **No header** — all functions are distributed to sidebars; cleaner, more immersive
- **Grimoire** as Deck Builder navigation feels like a physical object on the table, not a UI button

---

## Grid Structure

```css
gridTemplateColumns: '260px 1fr 260px'
gridTemplateRows: '1fr auto auto'
gridTemplateAreas: `
  "left    effects  right"
  "left    allies   right"
  "deck    hand     right"
`
```

- **No header row** — settings gear removed from Combat View
- **Left** spans all rows: Manifold + Phase Abilities + Selected Deck (stacked vertically, deck pinned to bottom)
- **Right** spans all rows: Resources + Wild Surge + Rest buttons + Grimoire (stacked vertically, grimoire pinned to bottom)
- **Effects** (row 1, 1fr): Active Effects panel grows to fill vertical space
- **Allies** (row 2, auto): compact ally chips row
- **Hand** (row 3, auto): hand cards in single centered row

### Width Math (1920px viewport)
- Padding: 16px × 2 = 32px
- Sidebars: 260 + 260 = 520px
- Gaps: 2 × 16px = 32px
- Center column: 1920 − 32 − 520 − 32 = **1336px**
- 5 hand cards (200px) + 4 gaps (16px) = 1064px → fits with 272px breathing room
- 6 hand cards (200px) + 5 gaps (16px) = 1280px → fits with 56px room
- 7+ cards: overlap/compress to fit (Supercapacitance)

### Vertical Math (1080px viewport)
- Padding: 16px × 2 = 32px
- Gaps: 2 × 16px = 32px
- Hand row: 280px cards + "Hand" label ≈ 310px
- Allies row: ≈ 40px
- Active Effects: 1080 − 32 − 32 − 310 − 40 = **666px** (generous)

---

## Card Sizes

| Card Type | Dimensions | Ratio | Usage |
|-----------|-----------|-------|-------|
| Hand card (SiphonCard) | 200 × 280px | 5:7 | Hand area, Selected Deck expansion |
| Phase Ability bar | ~full sidebar width × 50px | n/a | Left sidebar, info-only badges |
| Echo Manifold card | ~full sidebar width × 160px | n/a | Left sidebar, phase/mote display |
| Selected Deck stack | ~100 × 140px | 5:7 | Left sidebar bottom, face-down pile |
| Grimoire | ~180 × 130px | n/a | Right sidebar bottom, CSS book/tome |

---

## Component Changes

### Card Content Simplification (SiphonCard)

The app manages all mechanics (EP cost, focus rolls, warp triggers). Card text should be a **functional summary** of what the feature does, not a full mechanical explanation. Each card shows:

- **Name** (serif, bold, uppercase)
- **EP Cost** (number or "Special"/"Varies")
- **Focus Dice** (e.g., "1d4", "2d8")
- **Activation** (Action / Bonus Action / Reaction / None)
- **Duration** (time or "Triggered"/"Instant"/"Special")
- **1-2 sentence functional description** (what it *does*, not how the engine processes it)
- **Warp indicator** (compact — badge or icon, not full warp text)

Current card descriptions are copied from source PDFs and explain full mechanics. These should be rewritten for the app context where the user just needs to understand the feature's purpose.

### Activation Flow (No Modal)

**Current**: Drag card to Active Effects → modal appears → confirm → activate
**New**: Drag card over Active Effects → **ghost preview row** appears inline → drop card → **immediately activate**

The ghost preview row shows:
- Feature name, EP cost, Focus dice
- EP state change: "EP: -2 → -6 (WARP)" in crimson if warp triggers
- Styled with dashed border and pulsing glow to distinguish from real effect rows

On drop: cost deducted, focus rolled, effect row becomes real. If warp triggers, surge handling is inline (macro/roll display), not a modal.

### Hand Overflow (Supercapacitance)

When hand has more cards than fit at full spacing:
- Cards remain in a **single horizontal row** (never wrap to second row)
- Gaps decrease, then cards overlap (each showing enough of the left edge to identify)
- Hovering/clicking a card separates it from neighbors for inspection
- Implementation: calculate available width, divide by card count, set overlap via negative margin or CSS

### Phase Abilities (Info Badges)

Phase abilities are **not playable** in the app — they're reference information only. No drag/drop, no activation, no tracking in Active Effects.

Each phase ability renders as a **compact horizontal bar** (full sidebar width × ~50px):
- Ability name (left-aligned)
- Activation type badge (right-aligned, e.g., "BA", "1m", "None")
- Muted border, clearly subordinate to hand cards in visual hierarchy

### Selected Deck

**Resting state**: Face-down card stack with count badge (e.g., "7") in bottom-left sidebar.

**Expanded state** (on click): Cards spread out, overlaying the center area. User drags a card from the spread to:
- **Hand area** → bestow to self
- **Ally chip** → bestow to ally

The spread closes after a bestow action or clicking away. Detailed expansion interaction design is TBD during implementation.

### Grimoire (Siphon Features → Deck Builder)

A **CSS-only book/tome** visual in the bottom-right sidebar. Clicking it navigates to the Deck Builder view (`/#/deck-builder`).

Visual treatment (all pure CSS, no images):
- Rectangular book shape (~180 × 130px)
- Spine on left edge (darker strip with subtle ridge lines via repeating gradient)
- Cover with dark leather-like gradient (dark browns/purples)
- Decorative border lines in gold/amber on cover
- Page edges visible on right side (thin lighter strip)
- Circular gold/amber seal in center showing feature count ("42")
- Text label "Siphon Features" below
- Hover: amber glow, slight scale-up, cursor pointer
- Must feel "browsable/inviting", clearly distinct from playable card stacks

### Wild Surge (Simplified)

The app does **NOT** look up Wild Echo Surge table results. The Wild Surge area provides:
- A macro string to copy (e.g., `/r 1d100`) in a monospace copyable box
- A "Roll" button that rolls dice and displays the numeric result
- That's it — the user interprets the result using their own surge table

### Rest Buttons

"Short Rest" and "Long Rest" buttons in the right sidebar, below Wild Surge.

**Rest flow design is deferred** — the current modal-based rest dialogs will be replaced with a separate view/route in a future phase. The vision: clicking a rest button triggers a **view transition** that feels like "retreating inward" — a subconscious/meditative space where the player confirms rest details before returning to combat. Design details TBD.

### Settings

Settings gear **removed from Combat View entirely**. Settings lives only in the Deck Builder view. All current settings (character level, PB, animations, data management) are setup/management concerns, not combat-critical.

### Header

**Removed**. The "Deck Builder" text button is replaced by the grimoire. Rest buttons move to the right sidebar. Settings moves to Deck Builder. Nothing remains for a header row.

---

## File Changes

### Modified Files
1. **`CombatHUD.tsx`** — New three-column grid layout, no header, sidebar wrappers, remove settings state/button, add grimoire navigation
2. **`SiphonCard.tsx`** — Update card dimensions to 200×280 (was 192×224), simplify content layout, add warp badge (replacing warp text block)
3. **`PhaseAbilities.tsx`** — Replace card-based layout with compact horizontal info bars
4. **`EchoManifoldDeck.tsx`** — Remove fixed width, let sidebar constrain
5. **`WildSurgeDeck.tsx`** — Simplify to macro copy + roll button (remove card visual), remove fixed width/alignment
6. **`HandArea.tsx`** — Center cards in wide column, add overlap logic for Supercapacitance
7. **`ActiveEffectsPanel.tsx`** — Add ghost preview row for drag-over activation UX
8. **`SelectedDeck.tsx`** — Update to face-down stack visual with expansion overlay
9. **`ResourceDisplay.tsx`** — Remove internal width constraints (sidebar constrains)

### New Files
10. **`Grimoire.tsx`** — New component: CSS book/tome visual, click navigates to Deck Builder
11. **`index.css`** — New keyframes: `ghost-glow` (preview row pulse), grimoire hover effects

### Files NOT Modified
- Store files — no state shape changes in this phase
- Test files — update only as needed for changed component interfaces
- `ActivationPanel.tsx` — **Removed or gutted** (modal activation replaced by inline preview)

---

## Implementation Notes

### Card Overlap Algorithm (HandArea)
```
availableWidth = container width
cardWidth = 200
gap = 16

if (cardCount * cardWidth + (cardCount - 1) * gap <= availableWidth):
  // Normal spacing — cards fit without overlap
  use flex with gap-4
else:
  // Overlap mode — compress cards to fit
  overlapOffset = (availableWidth - cardWidth) / (cardCount - 1)
  each card gets: marginLeft = overlapOffset - cardWidth (negative)
  first card: marginLeft = 0
```

### Grimoire CSS Approach
Build entirely from CSS gradients, shadows, and borders:
- `background: linear-gradient(...)` for leather texture
- `box-shadow` for depth
- `::before` pseudo-element for spine
- `::after` pseudo-element for page edges
- Hover state: `filter: drop-shadow(0 0 8px var(--capacitance))`

### Ghost Preview Row
- Appears in ActiveEffectsPanel when a card is dragged over the panel
- Uses `onDragOver`/`onDragLeave` events on the panel
- Row styled with `border: 1px dashed`, pulsing glow via CSS animation
- Shows feature name, EP cost, focus dice, and EP state change
- EP state change calculated from current EP minus card cost
- If resulting EP < 0: show "(WARP)" in crimson

---

## Deferred to Future Phases

- **Rest view design** — replacing rest modals with a separate view/route
- **Card description rewriting** — simplifying all 42 feature descriptions for app context
- **Selected Deck expansion animation** — detailed interaction design for the card spread overlay
- **Responsive/mobile layout** — this phase targets 1080p desktop only
- **Sound design** — card interactions, resource changes, warp triggers

---

## Verification

1. `npm run build` — must succeed
2. `npm run lint` — must pass
3. `npm run test` — all existing tests must pass (update tests for changed component interfaces)
4. Visual check against `mockup-combat-redesign.html`:
   - Three-column layout matches mockup proportions
   - Left sidebar: Manifold + Phase Ability bars + Selected Deck stack at bottom
   - Center: Active Effects (fills space) + Allies row + Hand (centered, single row)
   - Right sidebar: Resources + Wild Surge + Rest buttons + Grimoire at bottom
   - Hand cards are 200×280px, legible, with simplified content
   - Ghost preview row appears when simulating drag-over on Active Effects
   - Grimoire looks like a book/tome, navigates to Deck Builder on click
   - No header row, no settings gear in Combat View
   - With 7+ hand cards, overlap compression keeps cards in a single row
