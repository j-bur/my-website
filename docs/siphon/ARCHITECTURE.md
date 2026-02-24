# Architecture Overview

This document describes the technical architecture of The Siphon Interface.

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | React | 19.x |
| Language | TypeScript | 5.x |
| Build Tool | Vite | 7.x |
| Styling | Tailwind CSS | 4.x |
| State Management | Zustand | 5.x |
| Routing | React Router | 7.x |
| Persistence | localStorage | - |

---

## Directory Structure

```
src/
├── App.tsx                          # Neutral layout wrapper with <Outlet />
├── main.tsx                         # Entry point with createHashRouter
├── index.css                        # Global styles and Tailwind
├── setupTests.ts                    # Vitest setup for jest-dom matchers
├── landing/                         # Landing page — Three.js wireframe mesh
│   ├── CLAUDE.md                    # Landing page AI instructions
│   ├── LandingPage.tsx              # Route component (canvas + HTML anchor overlays)
│   ├── MeshScene.ts                 # Pure Three.js scene, animation loop, dispose
│   ├── meshConfig.ts                # Constants, anchors, GLSL shader sources
│   └── delaunator.d.ts             # TypeScript declarations for delaunator
└── siphon/                          # Echo Siphon companion app
    ├── CLAUDE.md                    # Siphon-specific AI instructions
    ├── components/
    │   ├── cards/
    │   │   └── SiphonCard.tsx         # Reusable card component for features
    │   ├── deck-builder/                # Deck Builder view
    │   │   ├── DeckBuilder.tsx          # Main view (CharacterHeader + CollectionGrid + SelectedPanel)
    │   │   ├── CharacterHeader.tsx      # Level/MaxHP/PB/EP inputs
    │   │   ├── CollectionGrid.tsx       # All 42 features, filterable
    │   │   ├── SelectedPanel.tsx        # Selected cards + rest/nav buttons
    │   │   └── index.ts                 # Barrel export
    │   ├── settings/                     # Settings modal + overrides + data
    │   │   ├── SettingsModal.tsx          # Modal with all settings sections
    │   │   ├── DiceModeToggle.tsx         # Reusable 3D/Macro toggle pair
    │   │   ├── ManualOverrides.tsx        # EP/Focus/Motes/HD/MaxHP override inputs
    │   │   ├── DataManagement.tsx         # Export/Import/Reset/Clear buttons
    │   │   └── index.ts                   # Barrel export
    │   ├── combat-hud/
    │   │   ├── CombatHUD.tsx          # CSS Grid layout container
    │   │   ├── EchoManifoldDeck.tsx   # Phase card + mote pips (top-left)
    │   │   ├── WildSurgeDeck.tsx      # Surge deck placeholder (top-right)
    │   │   ├── PhaseAbilities.tsx     # Current phase's 3 abilities
    │   │   ├── ActiveEffectsPanel.tsx # Active effects + drop target + dismiss gesture (center)
    │   │   ├── ResourceDisplay.tsx    # Right column wrapper
    │   │   ├── EchoPointsBar.tsx      # EP bar (center-zero bidirectional)
    │   │   ├── FocusCounter.tsx       # Focus value with glow
    │   │   ├── HitDiceDisplay.tsx     # Hit dice current/max
    │   │   ├── SiphonCapacitanceTracker.tsx # Capacitance pips + in-game timer
    │   │   ├── SelectedDeck.tsx       # Deck with expand/collapse (bottom-left)
    │   │   ├── HandArea.tsx           # Fanned hand cards (bottom)
    │   │   ├── LongRestDialog.tsx     # Long rest preview + execution
    │   │   ├── ShortRestDialog.tsx    # Short rest with HD spending
    │   │   ├── AlliesPanel.tsx        # Ally chips, add/rename/remove, bestow target, hover trigger
    │   │   ├── AllyBestowmentView.tsx # Overlay showing ally's bestowed cards with remove
    │   │   ├── Grimoire.tsx         # CSS book/tome navigation to Deck Builder
    │   │   └── index.ts              # Barrel export
    │   └── __tests__/                 # Component tests
    ├── hooks/                           # Custom React hooks
    │   ├── useReducedMotion.ts          # Combines settings + OS prefers-reduced-motion
    │   ├── useAnimatedNumber.ts         # Smooth number interpolation via rAF
    │   └── useCardDragDetection.ts      # Global card drag detection for drop zone highlighting
    ├── data/                          # Static game data (verified 2026-02-20)
    │   ├── siphonFeatures.ts            # 42 Siphon Features
    │   ├── featureConstants.ts          # FEATURE_MAP, TRIGGERED_FEATURE_IDS, WHILE_SELECTED_FEATURE_IDS
    │   ├── echoManifold.ts              # 9 Manifold Abilities (3 phases × 3)
    │   ├── wildEchoSurgeTable.ts        # 100 Wild Echo Surge entries
    │   └── index.ts                     # Barrel export
    ├── types/                         # TypeScript interfaces
    │   ├── dragData.ts                  # CardDragData type + setCardDragData/getCardDragData/isCardDrag helpers
    │   └── index.ts                     # Barrel export
    ├── utils/                         # Helper functions
    └── store/                         # Zustand state stores
        ├── characterStore.ts          # Character stats, HP, hit dice
        ├── siphonStore.ts             # EP, Focus, card zones, allies, effects
        ├── settingsStore.ts           # User preferences, dice modes
        ├── manifoldStore.ts           # Echo Manifold phase system
        └── index.ts                   # Store re-exports
```

---

## State Management

Four Zustand stores manage application state. All stores persist to localStorage.

### characterStore
**Purpose**: Character stats (level, HP, hit dice, proficiency bonus, spell save DC)
**Storage key**: `siphon-character` (version 2)

### siphonStore
**Purpose**: EP, Focus, Capacitance, card zones (Selected Deck / Hand), allies, active effects, cost modifiers
**Storage key**: `siphon-state` (version 2)

### settingsStore
**Purpose**: User preferences (dice modes, sound, animations, confirmations)
**Storage key**: `siphon-settings` (version 1)

### manifoldStore
**Purpose**: Echo Manifold phase system (phase, motes, abilities)
**Storage key**: `siphon-manifold` (version 1)

---

## Data Flow

### Card Lifecycle (Target State)

```
┌─────────────────────────────────────────────────────────────┐
│                        LONG REST                             │
│  Player selects up to PB features from all 42 available     │
│  Selected cards → selectedCardIds (Selected Deck)           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      COMBAT: BESTOW                          │
│  Player spends Action to bestow a Selected feature          │
│                                                              │
│  To Self:  selectedCardIds → handCardIds (Hand)             │
│  To Ally:  selectedCardIds → allyBestowments                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     COMBAT: ACTIVATE                         │
│  Player uses feature's activation (Action/Bonus/Reaction)   │
│                                                              │
│  1. Deduct EP cost                                          │
│  2. Check if EP now negative → Warp triggers                │
│  3. Roll Focus dice (doubled if EP negative)                │
│  4. Add Focus to total                                      │
│  5. Card returns: handCardIds → selectedCardIds             │
│  6. Effect added to activeEffects                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         REPEAT                               │
│  Card is back in Selected Deck, can be Bestowed again       │
└─────────────────────────────────────────────────────────────┘
```

### Rest Mechanics

**Long Rest**:
1. EP regains PB (up to max, which = Level)
2. Focus reduced by d4 roll (min 0)
3. While Selected effects applied (after EP recovery):
   - Supercapacitance: EP cost = extra features beyond PB × 2; Focus gain = extra count (doubles if EP negative)
   - Siphon Greed: +1d4 Focus (doubles if EP negative)
4. Max HP restored by amount of EP regained (if reduced by Echo Drain)
5. All motes return to 8
6. Hit Dice fully restored
7. Free phase switch restored
8. All bestowments cleared → cards return to Selected deck
9. Active effects with duration < 8 hours removed

**Short Rest**:
1. Free phase switch restored
2. Optional: spend Hit Dice to heal
3. Optional: clear effects < 1 hour (toggle)
4. Does NOT affect: EP, Focus, motes, bestowments

---

## Component Hierarchy

### Current Structure (Phase 8D Complete)

```
App (neutral layout wrapper with <Outlet />)
├── LandingPage (/ — Three.js wireframe mesh + anchor overlays)
├── SiphonLayout (siphon route wrapper — bg-siphon-bg + reduce-motion)
├── DeckBuilder (/deck-builder)
│   ├── CharacterHeader (Level, Max HP, PB, EP Max inputs)
│   ├── CollectionGrid (42 cards, filter + search)
│   ├── SelectedPanel (selected cards, rest buttons, Enter Combat)
│   ├── LongRestDialog (overlay, reused from combat-hud)
│   ├── ShortRestDialog (overlay, reused from combat-hud)
│   └── SettingsModal (overlay, gear icon in header)
│       ├── DiceModeToggle (×4), BooleanToggle (×6)
│       ├── ManualOverrides (EP, Focus, Motes, HD, Max HP Reduction)
│       └── DataManagement (Export, Import, Reset Session, Clear All)
├── CombatHUD (/combat, 3-column CSS Grid: 260px 1fr 260px)
│   ├── Left Sidebar (flex column, rows 1-2)
│   │   ├── EchoManifoldDeck — phase card + mote pips
│   │   └── PhaseAbilities — compact info bars (name + activation badge)
│   ├── SelectedDeck (grid: deck, row 3 col 1, aligned with hand)
│   │   └── SiphonCard (×N, when expanded)
│   ├── Center Column
│   │   ├── ActiveEffectsPanel (row 1, 1fr) — effect rows + drop target
│   │   ├── AlliesPanel (row 2, auto) — ally chips, bestow target, hover→overlay
│   │   └── HandArea (row 3, auto) — centered cards with dynamic overlap
│   │       └── SiphonCard (×N, 200×280px, compact when overlapping)
│   ├── Right Sidebar (flex column, spans all rows)
│   │   ├── ResourceDisplay — Focus, EP, HD, Capacitance
│   │   │   ├── FocusCounter
│   │   │   ├── EchoPointsBar
│   │   │   ├── HitDiceDisplay
│   │   │   └── SiphonCapacitanceTracker (with in-game timer)
│   │   ├── WildSurgeDeck — macro/roll widget (dice3d or macro mode)
│   │   ├── Rest Buttons — Short Rest / Long Rest
│   │   └── Grimoire — CSS book/tome, navigates to Deck Builder
│   ├── AllyBestowmentView (overlay) — ally bestowed cards view with remove
│   ├── LongRestDialog (overlay) — preview + cross-store rest
│   └── ShortRestDialog (overlay) — HD spending + effect clearing
│   [No header row — settings accessed from Deck Builder only]
└── SettingsModal (shared component in settings/, accessed from Deck Builder only)
    ├── DiceModeToggle (×4, for each roll type)
    ├── BooleanToggle (×6, for sound/visual/gameplay settings)
    ├── ManualOverrides (direct value editing)
    └── DataManagement (export/import/reset/clear)
```

---

## Routing

> Phase 4.5 implements routing. Uses `createHashRouter` (hash-based URLs) for Cloudflare Pages static SPA deployment.

| Route | Component | Description |
|-------|-----------|-------------|
| `/#/` | `LandingPage` | Three.js wireframe mesh with anchor overlays |
| `/#/combat` | `SiphonLayout` → `CombatHUD` | Combat view (main gameplay) |
| `/#/deck-builder` | `SiphonLayout` → `DeckBuilder` | Character setup + card selection |

Navigation flow:
1. App loads → Landing page with FoundryVTT and Gauldurg anchors
2. Gauldurg anchor → Deck Builder
3. Deck Builder → "Enter Combat" → Combat
4. Combat → Grimoire (right sidebar bottom) → Deck Builder

---

## Styling Patterns

### Tailwind Configuration

Custom colors defined in `src/index.css` via `@theme`:

```css
--color-ep-positive: #00d4aa;
--color-ep-negative: #ff4466;
--color-focus: #7a42e0;
--color-warp: #d119d1;
--color-capacitance: #ffbb33;
--color-siphon-border: #4e4a50;
--color-siphon-bg: #161418;
--color-siphon-surface: #1e1c20;
```

### Animation Classes

Defined in `src/index.css`:

**Active (used by components):**
- `.card-enter` — Slide-in animation for new hand cards (HandArea)
- `.pip-fill` / `.pip-drain` — Scale+glow pulse for mote/capacitance pips (EchoManifoldDeck, SiphonCapacitanceTracker)
- `.effect-dismiss` — Strikethrough + fade + collapse for dismissed effects (ActiveEffectsPanel)
- `.drop-zone-glow` — Pulsing accent shadow for ambient drop zone highlighting (ActiveEffectsPanel)
- `.ghost-glow` — Pulsing accent glow for ghost preview row during drag-over (ActiveEffectsPanel)
- `.warp-flash` — Purple flash on newly activated effect rows with warp (ActiveEffectsPanel)
- `.warp-pulse` — Pulsing warp glow on WildSurgeDeck when surge roll is needed
- `.reduce-motion` — Applied to root div; disables all animations when reduced motion is enabled

**Reserved for Phase 7C (defined but not yet referenced by components):**
- `.glitch-hover` — Subtle glitch effect on hover
- `.chromatic-aberration` — Color distortion when EP negative
- `.warp-active` — Warp visual effect
- `.focus-pulse` — Pulse animation for Focus changes
- `.weavers-watch` — Subtle effect at high Focus (50+)

---

## Persistence

All stores use Zustand `persist` middleware with localStorage.

| Store | Key | Version |
|-------|-----|---------|
| characterStore | `siphon-character` | 2 |
| siphonStore | `siphon-state` | 2 |
| settingsStore | `siphon-settings` | 1 |
| manifoldStore | `siphon-manifold` | 1 |
