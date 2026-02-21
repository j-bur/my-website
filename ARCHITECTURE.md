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
├── components/
│   ├── cards/
│   │   └── SiphonCard.tsx         # Reusable card component for features
│   ├── deck-builder/                # Phase 4.5: Deck Builder view
│   │   ├── DeckBuilder.tsx          # Main view (CharacterHeader + CollectionGrid + SelectedPanel)
│   │   ├── CharacterHeader.tsx      # Level/MaxHP/PB/EP inputs
│   │   ├── CollectionGrid.tsx       # All 42 features, filterable
│   │   ├── SelectedPanel.tsx        # Selected cards + rest/nav buttons
│   │   └── index.ts                 # Barrel export
│   ├── settings/                     # Phase 5A: Settings modal
│   │   ├── SettingsModal.tsx          # Modal with all settings sections
│   │   ├── DiceModeToggle.tsx         # Reusable 3D/Macro toggle pair
│   │   └── index.ts                   # Barrel export
│   ├── combat-hud/
│   │   ├── CombatHUD.tsx          # CSS Grid layout container
│   │   ├── EchoManifoldDeck.tsx   # Phase card + mote pips (top-left)
│   │   ├── WildSurgeDeck.tsx      # Surge deck placeholder (top-right)
│   │   ├── PhaseAbilities.tsx     # Current phase's 3 abilities
│   │   ├── ActiveEffectsPanel.tsx # Active effects on self (center)
│   │   ├── ResourceDisplay.tsx    # Right column wrapper
│   │   ├── EchoPointsBar.tsx      # EP bar (center-zero bidirectional)
│   │   ├── FocusCounter.tsx       # Focus value with glow
│   │   ├── HitDiceDisplay.tsx     # Hit dice current/max
│   │   ├── SiphonCapacitanceTracker.tsx # Capacitance pips
│   │   ├── SelectedDeck.tsx       # Deck with expand/collapse (bottom-left)
│   │   ├── HandArea.tsx           # Fanned hand cards (bottom)
│   │   ├── ActivationPanel.tsx    # Feature activation overlay
│   │   ├── MacroDisplay.tsx       # Copyable macro + result input
│   │   ├── SurgeResultModal.tsx   # Wild surge result display
│   │   ├── LongRestDialog.tsx     # Long rest preview + execution
│   │   ├── ShortRestDialog.tsx    # Short rest with HD spending
│   │   └── index.ts              # Barrel export
│   └── __tests__/                 # Component tests
├── data/                          # Static game data (verified 2026-02-20)
├── types/                         # TypeScript interfaces
├── utils/                         # Helper functions
├── store/                         # Zustand state stores
│   ├── characterStore.ts          # Character stats, HP, hit dice
│   ├── siphonStore.ts             # EP, Focus, card zones, allies, effects
│   ├── settingsStore.ts           # User preferences, dice modes
│   ├── manifoldStore.ts           # Echo Manifold phase system
│   └── index.ts                   # Store re-exports
├── App.tsx                        # Layout wrapper with <Outlet /> (Phase 4.5)
├── main.tsx                       # Entry point with createHashRouter (Phase 4.5)
├── index.css                      # Global styles and Tailwind
└── setupTests.ts                  # Vitest setup for jest-dom matchers
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
3. Max HP restored by amount of EP regained (if reduced by Echo Drain)
4. All motes return to 8
5. Hit Dice fully restored
6. Free phase switch restored
7. All bestowments cleared → cards return to Selected deck
8. Active effects with duration < 8 hours removed

**Short Rest**:
1. Free phase switch restored
2. Optional: spend Hit Dice to heal
3. Optional: clear effects < 1 hour (toggle)
4. Does NOT affect: EP, Focus, motes, bestowments

---

## Component Hierarchy

### Current Structure (Phase 5A Complete)

```
App (layout wrapper with <Outlet />)
├── HomeRedirect (/ → /combat or /deck-builder)
├── DeckBuilder (/deck-builder)
│   ├── CharacterHeader (Level, Max HP, PB, EP Max inputs)
│   ├── CollectionGrid (42 cards, filter + search)
│   ├── SelectedPanel (selected cards, rest buttons, Enter Combat)
│   ├── LongRestDialog (overlay, reused from combat-hud)
│   ├── ShortRestDialog (overlay, reused from combat-hud)
│   └── SettingsModal (overlay, gear icon in header)
├── CombatHUD (/combat, CSS Grid layout)
│   ├── Header (grid: header) — Deck Builder nav + rest buttons + gear icon
│   ├── EchoManifoldDeck (grid: manifold)
│   │   └── Mote pips (8 interactive dots)
│   ├── WildSurgeDeck (grid: surge)
│   ├── PhaseAbilities (grid: abilities)
│   │   └── 3 ability cards for current phase
│   ├── ActiveEffectsPanel (grid: effects)
│   │   └── Effect rows or "(drag cards here)" placeholder
│   ├── ResourceDisplay (grid: resources)
│   │   ├── FocusCounter
│   │   ├── EchoPointsBar
│   │   ├── HitDiceDisplay
│   │   └── SiphonCapacitanceTracker
│   ├── Allies placeholder (grid: allies)
│   ├── SelectedDeck (grid: deck)
│   │   └── SiphonCard (×N, when expanded)
│   ├── HandArea (grid: hand)
│   │   └── SiphonCard (×N, fanned)
│   ├── ActivationPanel (overlay)
│   ├── SurgeResultModal (overlay)
│   ├── LongRestDialog (overlay) — preview + cross-store rest
│   ├── ShortRestDialog (overlay) — HD spending + effect clearing
│   └── SettingsModal (overlay, gear icon in header)
└── SettingsModal (shared component in settings/)
    ├── DiceModeToggle (×4, for each roll type)
    └── BooleanToggle (×6, for sound/visual/gameplay settings)
```

### Target Structure (per DESIGN.md + Phase 4.5)

```
App (layout wrapper with <Outlet />)
├── HomeRedirect (/ → /combat or /deck-builder)
├── DeckBuilder (/deck-builder)
│   ├── CharacterHeader (Level, Max HP, PB, EP Max inputs)
│   ├── CollectionGrid (42 cards, filter + search)
│   ├── SelectedPanel (selected cards, rest buttons, Enter Combat)
│   ├── LongRestDialog (overlay, reused from combat-hud)
│   └── ShortRestDialog (overlay, reused from combat-hud)
└── CombatHUD (/combat)
    ├── Header (character info, settings gear)
    ├── TableArea
    │   ├── EchoManifoldDeck (top-left)
    │   │   ├── PhaseCard (face-up)
    │   │   └── MoteTracker
    │   ├── WildSurgeDeck (top-right)
    │   ├── PhaseAbilities (left side, ×3)
    │   ├── ActiveEffectsPanel (center)
    │   ├── ResourceDisplay (right side)
    │   │   ├── EchoPointsBar
    │   │   ├── FocusCounter
    │   │   ├── HitDiceDisplay
    │   │   └── CapacitanceTracker
    │   ├── AlliesPanel (above hand)
    │   ├── SelectedDeck (bottom-left)
    │   └── HandArea (bottom-center)
    ├── ActivationPanel (overlay when activating)
    ├── PhaseSelectionOverlay
    ├── AllyBestowmentView (overlay when viewing ally)
    ├── SurgeResultModal
    └── SettingsModal
```

---

## Routing

> Phase 4.5 implements routing. Uses `createHashRouter` (hash-based URLs) for Cloudflare Pages static SPA deployment.

| Route | Component | Description |
|-------|-----------|-------------|
| `/#/` | `HomeRedirect` | Redirects to `/#/combat` if `selectedCardIds` has cards, otherwise `/#/deck-builder` |
| `/#/combat` | `CombatHUD` | Combat view (main gameplay) |
| `/#/deck-builder` | `DeckBuilder` | Character setup + card selection |

Navigation flow:
1. App loads → `HomeRedirect` → Deck Builder (if no deck) or Combat (if deck exists)
2. Deck Builder → "Enter Combat" → Combat
3. Combat → "Deck Builder" button → Deck Builder

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
- `.glitch-hover` — Subtle glitch effect on hover
- `.chromatic-aberration` — Color distortion when EP negative
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
