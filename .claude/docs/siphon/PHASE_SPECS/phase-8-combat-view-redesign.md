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

## Sub-Phases

### Dependencies
```
8A (Grid Layout) ──→ 8B (Card Sizing + Restyling)
                ──→ 8C (Grimoire Navigation)
                ──→ 8D (Inline Activation)
```
8A is the foundation. 8B, 8C, and 8D all depend on 8A but are independent of each other and can be done in any order. The recommended order is 8A → 8B → 8C → 8D (simplest to most complex).

---

## Phase 8A: Three-Column Grid Layout

**Goal**: Restructure CombatHUD from row-based grid to three-column sidebar layout. Reposition all existing components — no component internals change.

### Scope
- Replace CombatHUD's grid definition with the new three-column layout
- Wrap left sidebar components (EchoManifoldDeck, PhaseAbilities, SelectedDeck) in a flex column
- Wrap right sidebar components (ResourceDisplay, WildSurgeDeck, rest buttons) in a flex column
- Remove the header row entirely:
  - Remove "Deck Builder" navigation button (grimoire replaces it in 8C; for 8A, navigation to Deck Builder is temporarily unavailable from Combat View)
  - Remove settings gear button and `showSettings` state (settings moves to Deck Builder only)
  - Remove `SettingsModal` import and rendering from CombatHUD
- Move rest buttons ("Short Rest", "Long Rest") into the right sidebar below WildSurgeDeck
- Remove `w-56` and `self-start` from ResourceDisplay wrapper (sidebar constrains width)

### What Does NOT Change in 8A
- Card sizes (SiphonCard stays w-48/w-36 until 8B)
- PhaseAbilities layout (stays as cards until 8B)
- WildSurgeDeck appearance (stays as card until 8B)
- EchoManifoldDeck internal layout (just remove fixed width)
- ActiveEffectsPanel (no changes)
- No new components
- Store interfaces

### Files Modified
1. **`CombatHUD.tsx`** — New grid layout, sidebar wrappers, remove header/settings, move rest buttons
2. **`EchoManifoldDeck.tsx`** — Remove `w-44` from card div (let sidebar constrain width)
3. **`WildSurgeDeck.tsx`** — Remove `w-44` and `self-start justify-self-end` (sidebar positions it)
4. **`ResourceDisplay.tsx`** — Remove internal width constraints if any

### Test Impact
- CombatHUD tests: update for removed header elements (Deck Builder button, settings gear)
- Component tests with `useNavigate()` wrappers may need updates if header assertions exist
- All 445 existing tests should still pass after updates

### Verification
1. `npm run build` succeeds
2. `npm run lint` passes
3. `npm run test` — all tests pass
4. Visual check:
   - Three-column layout visible
   - Left sidebar: Manifold + Phase Abilities + Selected Deck stacked vertically
   - Center: Active Effects (fills space) + Allies + Hand
   - Right sidebar: Resources + Wild Surge + Rest buttons stacked vertically
   - No header row visible
   - All existing interactions work (drag-drop bestow, activation, rest dialogs, deck expansion)

---

## Phase 8B: Card Sizing + Component Restyling

**Goal**: Make all elements the correct size and style per the mockup. Cards to 200×280, phase abilities to compact bars, hand overlap for Supercapacitance, wild surge simplified.

### Scope

**SiphonCard (200 × 280px)**:
- Change from `w-48 min-h-56` (192×224) to `w-[200px] min-h-[280px]` (200×280)
- Compact variant: scale proportionally (e.g., `w-[160px] min-h-[224px]`)
- Simplify content layout:
  - Card content is a **functional summary**, not full mechanical description
  - Warp effect section: replace multi-line text with compact warp badge/indicator
- Card text should be larger and more readable at the new size

**PhaseAbilities → Info Bars**:
- Replace card-based layout with compact horizontal bars
- Each bar: full sidebar width × ~50px
- Content: ability name (left), activation type badge (right, e.g., "BA", "1m", "None")
- Container: `flex flex-col gap-2` (vertical stack)
- Muted styling — clearly subordinate to hand cards

**EchoManifoldDeck**:
- Let sidebar constrain width (already done in 8A)
- Verify visual at sidebar width

**WildSurgeDeck → Macro/Roll Widget**:
- Remove card visual entirely
- Replace with compact widget: macro text in monospace copyable box + "Roll" button
- The app does NOT look up surge table results
- Display: label "Wild Surge", macro text (`/r 1d100`), roll button, result display area

**HandArea → Centered + Overlap**:
- Center cards in the wide center column (`justify-center`)
- Add overlap logic for Supercapacitance (7+ cards):
  ```
  availableWidth = container width
  cardWidth = 200
  gap = 16

  if (cardCount * cardWidth + (cardCount - 1) * gap <= availableWidth):
    // Normal spacing
    use flex with gap-4
  else:
    // Overlap mode
    overlapOffset = (availableWidth - cardWidth) / (cardCount - 1)
    each card: marginLeft = overlapOffset - cardWidth (negative)
    first card: marginLeft = 0
  ```
- Hovering a card in overlap mode should separate it from neighbors (z-index + translate)

### Files Modified
1. **`SiphonCard.tsx`** — New dimensions (200×280), simplified content, warp badge
2. **`PhaseAbilities.tsx`** — Replace card layout with compact horizontal info bars
3. **`WildSurgeDeck.tsx`** — Replace card visual with macro/roll widget
4. **`HandArea.tsx`** — Center cards, add overlap algorithm

### Test Impact
- SiphonCard tests: update assertions for new dimensions/class names
- PhaseAbilities tests: update for new bar-based rendering (no longer renders SiphonCard)
- WildSurgeDeck tests: update for new widget rendering
- HandArea tests: add tests for overlap behavior with many cards

### Verification
1. `npm run build` succeeds
2. `npm run lint` passes
3. `npm run test` — all tests pass
4. Visual check:
   - Hand cards are 200×280px, readable, properly spaced
   - Phase abilities render as compact sidebar bars
   - Wild Surge area shows macro + roll button (no card)
   - With 7+ hand cards, overlap compresses to single row
   - Hovering overlapped card raises it for inspection

---

## Phase 8C: Grimoire Navigation

**Goal**: Add the grimoire (CSS book/tome) to the right sidebar as navigation to the Deck Builder.

### Scope

**New `Grimoire.tsx` component**:
- CSS-only book/tome visual (~180 × 130px)
- Visual treatment (no images, pure CSS):
  - Spine on left edge: darker strip (~15px) with subtle ridge lines via `repeating-linear-gradient`
  - Cover: dark leather-like gradient (dark browns/purples)
  - Decorative border lines in gold/amber on cover
  - Page edges on right side: thin lighter strip suggesting paper
  - Circular gold/amber seal in center showing feature count (read from `FEATURE_MAP.size`)
  - CSS approach:
    - `background: linear-gradient(...)` for leather texture
    - `box-shadow` for depth
    - `::before` pseudo-element for spine
    - `::after` pseudo-element for page edges
- Text label "Siphon Features" below the book
- `onClick`: `useNavigate()` to `'/deck-builder'`
- Hover: amber glow (`filter: drop-shadow(0 0 8px var(--capacitance))`), slight scale-up, cursor pointer
- Must feel "browsable/inviting" — clearly distinct from playable card stacks

**CombatHUD integration**:
- Add `<Grimoire />` to the right sidebar, pinned to bottom (below rest buttons)
- Use `margin-top: auto` on grimoire to push it to the bottom of the sidebar

**CSS additions** (in `index.css` or component-scoped):
- Grimoire hover glow animation

### Files Modified/Created
1. **NEW: `src/components/combat-hud/Grimoire.tsx`** — CSS book/tome component
2. **`CombatHUD.tsx`** — Add Grimoire to right sidebar

### Test Impact
- New tests for Grimoire component (renders, shows count, navigates on click)
- CombatHUD tests: verify grimoire is present in right sidebar
- Grimoire uses `useNavigate()` so tests need `createMemoryRouter` wrapper

### Verification
1. `npm run build` succeeds
2. `npm run lint` passes
3. `npm run test` — all tests pass
4. Visual check:
   - Grimoire appears at bottom of right sidebar
   - Looks like a physical book/tome, not a button
   - Shows feature count ("42") in a seal
   - Hover produces amber glow + slight scale
   - Click navigates to Deck Builder (`/#/deck-builder`)
   - Visually distinct from the Selected Deck stack on the left

---

## Phase 8D: Inline Activation Flow

**Goal**: Replace modal-based card activation with inline drag-preview-drop. Eliminate the ActivationPanel modal and SurgeResultModal.

### Scope

**Ghost Preview Row (ActiveEffectsPanel)**:
- When a card is dragged over the Active Effects panel, a **ghost preview row** appears at the bottom of the effect list
- Uses `onDragOver`/`onDragLeave` events on the panel
- Read the dragged card's feature ID from drag data (existing `getCardDragData()`)
- Ghost row displays:
  - Feature name, EP cost, Focus dice
  - EP state change: current EP → resulting EP (e.g., "EP: -2 → -6")
  - If resulting EP < 0: show "(WARP)" in crimson
- Styling: dashed border, pulsing glow via `ghost-glow` CSS animation
- Row disappears when drag leaves the panel

**Drop-to-Activate (Immediate)**:
- On drop: immediately activate the card (no modal confirmation)
  - Deduct EP cost
  - Roll focus dice
  - Add effect row to Active Effects
  - Return card to Selected Deck (per existing activation flow)
- If warp triggers (EP negative after cost):
  - Focus gain doubles (existing rule)
  - Inline warp indicator on the new effect row (brief flash/highlight)
  - Wild Surge handling: the Wild Surge widget in the right sidebar highlights/pulses to indicate a roll is needed — the user handles it there

**Remove ActivationPanel Modal**:
- Remove `ActivationPanel.tsx` component (or gut it)
- Remove `stagedCardId`/`stagedFeature` state from CombatHUD
- Remove the `ActivationPanel` overlay rendering
- The activation logic (EP deduction, focus roll, warp check) moves into the drop handler or a shared utility

**Remove SurgeResultModal**:
- Remove `SurgeResultModal.tsx` or repurpose
- Remove `surgeResult` state from CombatHUD
- Surge results are no longer displayed as a modal — the Wild Surge widget handles this

**CSS additions**:
- `ghost-glow` keyframe animation for the preview row pulsing effect
- Warp flash animation for newly-activated effect rows

### Important: Activation Logic Extraction
The current `ActivationPanel` contains activation logic (EP deduction, focus roll, warp check, surge trigger). This logic must be extracted into a reusable function or moved into the drop handler before removing the modal. Do NOT lose this logic — it enforces the Three Critical Rules.

### Files Modified
1. **`ActiveEffectsPanel.tsx`** — Add ghost preview row on drag-over, add drop-to-activate handler
2. **`CombatHUD.tsx`** — Remove `stagedCardId`, `stagedFeature`, `surgeResult` state; remove ActivationPanel and SurgeResultModal rendering
3. **`ActivationPanel.tsx`** — Remove or gut (extract activation logic first)
4. **`SurgeResultModal.tsx`** — Remove or repurpose
5. **`index.css`** — Add `ghost-glow` keyframe, warp flash animation

### Test Impact
- ActiveEffectsPanel tests: add tests for ghost preview row (drag-over shows preview, drag-leave hides it, drop triggers activation)
- CombatHUD tests: remove assertions for ActivationPanel modal and SurgeResultModal
- New tests for activation logic utility (EP deduction, focus roll, warp trigger)
- Existing activation flow tests need migration from modal-based to drop-based

### Verification
1. `npm run build` succeeds
2. `npm run lint` passes
3. `npm run test` — all tests pass
4. Visual check:
   - Dragging a hand card over Active Effects shows ghost preview row
   - Preview row shows correct EP cost and warp warning
   - Dropping the card immediately activates (no modal)
   - Effect row appears in Active Effects
   - Warp indicator shows when EP goes negative
   - No modals appear during any activation flow
   - Wild Surge widget highlights when a surge roll is needed

---

## Deferred to Future Phases

- **Rest view design** — replacing rest modals with a separate view/route ("retreating inward" transition)
- **Card description rewriting** — simplifying all 42 feature descriptions for app context
- **Selected Deck expansion animation** — detailed interaction design for the card spread overlay
- **Responsive/mobile layout** — this phase targets 1080p desktop only
- **Sound design** — card interactions, resource changes, warp triggers
