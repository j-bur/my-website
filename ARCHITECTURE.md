# Architecture Overview

This document describes the technical architecture of The Siphon Interface.

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | React | 19.x |
| Language | TypeScript | 5.x |
| Build Tool | Vite | 6.x |
| Styling | Tailwind CSS | 4.x |
| State Management | Zustand | 5.x |
| Routing | React Router | 7.x |
| Persistence | localStorage | - |

---

## Directory Structure

> **Note**: Components and most stores were pruned on 2026-02-20 for clean-slate rework.
> Phase 1 creates characterStore + siphonStore from STORE_CONTRACTS.md.
> Phase 2+ creates components from DESIGN.md.

```
src/
├── data/                 # Static game data (verified 2026-02-20)
├── types/                # TypeScript interfaces
├── utils/                # Helper functions
├── store/                # Zustand state stores
│   ├── manifoldStore.ts  # Echo Manifold state (kept — largely correct)
│   └── index.ts          # Store re-exports
├── App.tsx               # Minimal stub (placeholder until Phase 2)
├── main.tsx              # Entry point
└── index.css             # Global styles and Tailwind
```

---

## State Management

Three Zustand stores manage application state. All stores persist to localStorage.

### characterStore — PRUNED (Phase 1A creates from scratch)

See `.claude/docs/STORE_CONTRACTS.md` for target interface. Key additions over previous version: Hit Dice tracking, persist version migration.

---

### siphonStore — PRUNED (Phase 1B creates from scratch)

See `.claude/docs/STORE_CONTRACTS.md` for target interface. Key changes: Hand/Deck card zones, ally management, card-return-after-activate flow.

---

### manifoldStore

**Purpose**: Echo Manifold phase system

```typescript
interface ManifoldStore {
  currentPhase: 'Constellation' | 'Revelation' | 'Oblivion';
  motes: number;                  // 0-8
  maxMotes: number;               // Always 8
  phaseSwitchAvailable: boolean;  // Free switch (resets on short rest)
  hitDiceSpentOnSwitch: number;   // Tracking
  activeAbilities: ActiveManifoldAbility[];
}
```

**Key Behaviors**:
- One free phase switch per short rest
- Additional switches cost 2 Hit Dice each
- Motes regain on: crit hit, enemy failed save, Echo destroyed (max 1/turn)
- All motes return on long rest
- Overdrive doubles mote cost but removes usage limitations

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

### Current Structure

> All components were pruned on 2026-02-20. Phase 2+ rebuilds from DESIGN.md.

### Target Structure (per DESIGN.md)

```
App
├── LandingPage
├── DeckBuilder
│   ├── CharacterSetup
│   ├── FilterControls
│   ├── CardGallery
│   │   └── SiphonCard (×42)
│   └── SelectionSummary
└── CombatHUD
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

> Routing was pruned with components. Phase 2 will restore routes per DESIGN.md.

Target navigation flow:
1. Landing → "Open Siphon" → Deck Builder (if no session) or Combat (if session exists)
2. Deck Builder → "Enter Combat" → Combat
3. Combat → "Deck Builder" button → Deck Builder

---

## Styling Patterns

### Tailwind Configuration

Custom colors defined in `tailwind.config.js` or `index.css`:

```css
/* Color tokens */
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

Storage keys:
- `siphon-character` — Character data
- `siphon-state` — Siphon mechanics
- `siphon-manifold` — Manifold state
