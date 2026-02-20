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

```
src/
├── components/           # React components organized by feature
│   ├── landing/          # Landing page components
│   ├── deck-builder/     # Long rest card selection
│   ├── combat-hud/       # Main combat interface
│   ├── echo-manifold/    # Phase switching and abilities
│   ├── cards/            # Reusable card components
│   ├── common/           # Shared UI components
│   └── settings/         # Settings modal (TODO)
├── store/                # Zustand state stores
│   ├── characterStore.ts # Character stats
│   ├── siphonStore.ts    # Core siphon mechanics
│   └── manifoldStore.ts  # Echo Manifold state
├── types/                # TypeScript interfaces
├── data/                 # Static game data
├── utils/                # Helper functions
├── assets/               # Static assets
├── App.tsx               # Root component with routing
├── main.tsx              # Entry point
└── index.css             # Global styles and Tailwind
```

---

## State Management

Three Zustand stores manage application state. All stores persist to localStorage.

### characterStore

**Purpose**: Character identity and stats

```typescript
interface CharacterStore {
  // State
  name: string;
  level: number;              // 1-20
  proficiencyBonus: number;   // Auto-calculated from level
  maxHP: number;              // Base max HP
  currentHP: number;          // Current HP (not actively used)
  reducedMaxHP: number;       // Max HP after Echo Drain reduction
  spellSaveDC: number;

  // TODO: Add these
  hitDice: number;            // Current available Hit Dice
  maxHitDice: number;         // = level
}
```

**Key Behaviors**:
- `proficiencyBonus` auto-updates when `level` changes
- `reducedMaxHP` tracks permanent HP loss from Echo Drain spending

---

### siphonStore

**Purpose**: Core siphon mechanics and card management

```typescript
interface SiphonStore {
  // Resources
  currentEP: number;              // Can go negative
  focus: number;                  // Accumulated tension
  siphonCapacitance: number;      // Charges (max = PB)
  capacitanceTimerStart: number | null;  // 8-hour timer

  // Card Management (NEEDS REVISION - see GAP_ANALYSIS.md)
  selectedCardIds: string[];      // Cards in Selected deck
  bestowedFeatures: BestowedFeature[];

  // TODO: Add these for proper Select → Bestow → Activate flow
  handCardIds: string[];          // Cards bestowed to self
  allies: Ally[];                 // Named ally slots
  allyBestowments: AllyBestowment[];
  activeEffects: ActiveEffect[];  // Effects on self
}
```

**Key Behaviors**:
- EP can go negative (danger zone)
- Echo Drain triggers at EP = -Level
- Focus gain doubles when EP is negative
- Warp effects trigger when EP goes negative AFTER paying cost

**EP Flow**:
```
spendEP(cost, level)
  ├─ wasPositive = currentEP >= 0
  ├─ newEP = currentEP - cost
  ├─ isNowNegative = newEP < 0
  ├─ warpTriggered = wasPositive && isNowNegative (or already negative)
  └─ if newEP <= -level: Echo Drain state
```

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

```
App
├── LandingPage
│   └── GlitchButton
├── DeckBuilder
│   ├── CharacterSetup
│   ├── FilterControls
│   ├── SelectionSummary
│   └── SiphonCard (×N)
└── CombatHUD
    ├── EchoPointsBar
    ├── FocusCounter
    ├── SiphonCapacitanceTracker
    ├── ActiveCardHand
    │   └── SiphonCard (×N)
    ├── EchoManifold
    │   ├── PhaseSelector
    │   ├── MoteTracker
    │   └── ManifoldAbilityCard (×3)
    └── SurgeTableModal
```

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

```typescript
const routes = [
  { path: '/', element: <LandingPage /> },
  { path: '/deck-builder', element: <DeckBuilder /> },
  { path: '/combat', element: <CombatHUD /> },
];
```

Navigation flow:
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

### Component Patterns

```tsx
// Standard component structure
export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  const { storeValue } = useRelevantStore();
  const [localState, setLocalState] = useState(initialValue);

  const handleAction = () => {
    // Logic
  };

  return (
    <div className="bg-siphon-surface border border-siphon-border rounded-lg p-4">
      {/* Content */}
    </div>
  );
}
```

---

## Utilities

### diceRoller.ts
- `rollFromNotation(notation, context)` — Parse and roll dice notation like "2d8", "[PB]d8"
- Returns `{ rolls: number[], total: number }`

### costCalculator.ts
- `resolveCost(cost, context)` — Convert CostType to actual number
- Handles PB, Level, Level/2, Twice PB, Varies

### focusCalculator.ts
- `calculateFocusGain(rollResult, isNegativeEP)` — Apply doubling if negative EP
- `rollLongRestFocusReduction()` — Roll d4 for long rest

### echoPointUtils.ts
- `calculateEPSpend(currentEP, cost, level)` — Calculate new EP and warp trigger
- `calculateLongRestRecovery(...)` — Calculate EP recovery
- `getEPStatus(currentEP, maxEP)` — Get status (positive, negative, drained)

### durationParser.ts
- Parse duration strings like "10 minutes", "1 hour"
- Convert to milliseconds for expiration tracking

---

## Persistence

All stores use Zustand's `persist` middleware with localStorage:

```typescript
export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Store implementation
    }),
    {
      name: 'storage-key',
      version: 1,
    }
  )
);
```

Storage keys:
- `siphon-character` — Character data
- `siphon-state` — Siphon mechanics
- `siphon-manifold` — Manifold state

---

## External Dependencies

| Package | Purpose |
|---------|---------|
| `zustand` | State management |
| `react-router-dom` | Client-side routing |
| `@3d-dice/dice-box` | 3D dice rolling (for Wild Surge) |

---

## Future Considerations

### 3D Dice Integration
The `@3d-dice/dice-box` library is planned for Wild Surge rolls. It renders WebGL dice with physics. Integration will require:
- Canvas element for rendering
- Async roll handling
- Result callback processing

### Sound Design
Audio is planned but disabled by default. Will need:
- Audio file loading
- Volume controls
- Mute toggle
- Event-based playback triggers

### Export/Import
JSON export/import for session backup:
- All store state
- Previous surge results (for entry #34)
- Settings preferences
