# Phase 8: Combat View Redesign — Sidebar Layout

## Context
After the Phase 7 scale-up (max-w-5xl → max-w-[1800px]), the Combat HUD still has excessive dead space. The root cause is a **row-based grid** where every section gets a horizontal band. This wastes the wide viewport and pushes the hand (primary interaction) to the very bottom with a huge gap above it. The Active Effects panel dominates the center but is mostly empty.

**Goal**: Restructure to a **three-column sidebar layout** where the hand and effects own the center, and supporting elements live in sidebars.

---

## New Layout

```
┌─────────────────────────────────────────────────────────┐
│          |                                  |       [⚙] │
│ ECHO     │  ACTIVE EFFECTS                  │ FOCUS: 66 │
│ MANIFOLD │  ┌────────────────────────────┐  │           │
│ ┌──────┐ │  │ ✦ Reject Fate    1hr   W   │  │ EP ██░-19 │
│ │Obliv-│ │  │ ✦ Resonant Wpn   10m   W   │  │           │
│ │ion   │ │  │ ✦ Altered Form   1hr   W   │  │ HD: 8/11  │
│ └──────┘ │  │                            │  │           │
│ ●●●●●●●● │  │    (grows to fill space)   │  │ CAP: 0/4  │
│          │  │                            │  │ ■■■■      │
│ PHASE    │  └────────────────────────────┘  │           │
│ ABILITIES│                                  │───────────│
│ ┌──────┐ │  ALLIES: [Briar(1)] [+]          │           │
│ │Echo  │ │                                  │ WILD      │
│ │Surge │ │  HAND CARDS                      │ SURGE     │
│ │1m  BA│ │  ┌──────┐┌──────┐┌──────┐        │ ┌───────┐ │
│ │desc..│ │  │ That ││Dist. ││Para- │        │ │Echo   │ │
│ └──────┘ │  │ Which││Reali ││cast- │        │ │Surge  │ │
│ ┌──────┐ │  │ Isn't││ty    ││ing   │        │ │       │ │
│ │Siphon│ │  └──────┘└──────┘└──────┘        │ └───────┘ │
│ │Ortho.│ │  ┌──────┐┌──────┐                │           │
│ │1m  No│ │  │Super ││Siphon│                │ Short Rest│
│ │desc..│ │  │cond. ││Flux  │                │ Long Rest │
│ └──────┘ │  └──────┘└──────┘                │           │
│ ┌──────┐ │                                  │           │
│ │Temp. │ │                                  │           │
│ │Reson.│ │                                  │           │
│ │1m  No│ │                                  │           │
│ │desc..│ │                                  │           │
│ └──────┘ │                                  │           │
│          │                                  │           │
│ SELECTED │                                  │  SIPHON   │ 
│ DECK     │                                  │ FEATURES  │ 
│ ┌──────┐ │                                  │ ┌──────┐  │
│ │  7   │ │                                  │ │  42  │  │
│ └──────┘ │                                  │ └──────┘  │
├──────────┴──────────────────────────────────┴───────────┤
└─────────────────────────────────────────────────────────┘
```

### Why this layout works
- **Hand** is in the center-bottom — primary interaction, prominent, easy to reach
- **Active Effects** fills the center-top — the "battlefield" grows to use available vertical space
- **Left sidebar** groups all Echo Manifold–related info (phase card, motes, abilities, deck) — thematically coherent
- **Right sidebar** has glanceable stats (resources) + the Wild Surge trigger
- **Phase Abilities stack vertically** in the sidebar — each card gets MORE width than before (full sidebar vs fixed w-44), showing more text
- **Allies** sits between effects and hand — compact row, always visible

---

## Grid Structure

```css
gridTemplateColumns: '240px 1fr 240px'
gridTemplateRows: 'auto 1fr auto auto'
gridTemplateAreas: `
  "header  header   header"
  "left    effects  right"
  "left    allies   right"
  "deck    hand     right"
`
```

- **Left** spans rows 2–3: Manifold + Phase Abilities (stacked vertically)
- **Right** spans rows 2–4: Resources + Wild Surge (stacked vertically)
- **Effects** (row 2, 1fr): Active Effects panel grows to fill vertical space
- **Allies** (row 3, auto): compact ally chips row
- **Deck** (row 4, left column): Selected Deck icon (current expansion behavior unchanged)
- **Hand** (row 4, center column): hand cards, centered horizontally

### Width math (at 1800px container)
- Sidebars: 240 + 240 = 480px
- Gaps (gap-4): 2 × 16px = 32px
- Center: 1800 − 480 − 32 = 1288px
- 6 full cards (192px) + 5 gaps (16px) = 1232px → fits with 56px breathing room

---

## File Changes

### 1. `src/components/combat-hud/CombatHUD.tsx`

**Grid layout**: Replace entire grid definition:
```jsx
className="grid gap-4 p-4 min-h-screen w-full max-w-[1800px] mx-auto"
style={{
  gridTemplateColumns: '240px 1fr 240px',
  gridTemplateRows: 'auto 1fr auto auto',
  gridTemplateAreas: `
    "header  header   header"
    "left    effects  right"
    "left    allies   right"
    "deck    hand     right"
  `,
}}
```

**Replace manifold/surge/abilities/resources cells** with two sidebar wrappers:
```jsx
{/* Left sidebar: Manifold + Phase Abilities */}
<div style={{ gridArea: 'left' }} className="flex flex-col gap-4 self-start">
  <EchoManifoldDeck />
  <PhaseAbilities />
</div>

{/* Right sidebar: Resources + Wild Surge */}
<div style={{ gridArea: 'right' }} className="flex flex-col gap-4 self-start">
  <ResourceDisplay />
  <WildSurgeDeck />
</div>
```

**Effects cell**: keep as-is (grid area "effects")
**Allies cell**: keep as-is (grid area "allies")
**Deck cell**: grid area "deck", keep `flex items-end`
**Hand cell**: grid area "hand", keep as-is

**Remove** the `w-56` and `self-start` from ResourceDisplay wrapper (sidebar constrains width now).

### 2. `src/components/combat-hud/PhaseAbilities.tsx`

Switch from horizontal to vertical layout:
- Container: `flex gap-2` → `flex flex-col gap-3`
- Individual cards: remove `w-44`, use full sidebar width
- Increase line-clamp from 3 to 4 (more vertical room in sidebar)

### 3. `src/components/combat-hud/EchoManifoldDeck.tsx`

- Remove `w-44` from card div (let sidebar constrain width)

### 4. `src/components/combat-hud/WildSurgeDeck.tsx`

- Remove `w-44` from card div (let sidebar constrain width)
- Remove `self-start justify-self-end` (no longer needed — sidebar positions it)

### 5. `src/components/combat-hud/HandArea.tsx`

- Add `justify-center` to the inner card flex container so hand cards are centered in the wide center column

### 6. `src/components/combat-hud/ActiveEffectsPanel.tsx`

- No changes needed (already has `h-full flex flex-col` from the previous round)

---

## Files Modified (5 files)
1. `src/components/combat-hud/CombatHUD.tsx` — new grid layout, sidebar wrappers
2. `src/components/combat-hud/PhaseAbilities.tsx` — vertical stack, full-width cards
3. `src/components/combat-hud/EchoManifoldDeck.tsx` — remove fixed width
4. `src/components/combat-hud/WildSurgeDeck.tsx` — remove fixed width + alignment
5. `src/components/combat-hud/HandArea.tsx` — center hand cards

## Files NOT Modified
- `SiphonCard.tsx` — card sizes stay as-is from previous round
- `ActiveEffectsPanel.tsx` — already configured for flex fill
- `SelectedDeck.tsx` — expansion behavior unchanged
- `ResourceDisplay.tsx` — no internal width, sidebar constrains it
- No test files, stores, or CSS changes needed

---

## Verification
1. `npm run build` — must succeed
2. `npm run lint` — must pass
3. `npm run test` — all 445 tests must pass
4. Visual check:
   - Left sidebar shows Manifold + motes + 3 Phase Abilities stacked vertically + deck at bottom
   - Center shows Active Effects (top, growing) + Allies + Hand cards (bottom, centered)
   - Right sidebar shows Resources + Wild Surge
   - Hand cards are prominently displayed and centered in the wide center column
   - Active Effects panel fills vertical space between header and allies row
   - Deck expansion still works (cards appear above deck icon)
   - All drag-and-drop interactions still work (deck→hand, hand→effects)
