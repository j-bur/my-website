# Phase 4.5: Deck Builder + Routing

## Goal
Create the Deck Builder view and React Router routing. The Deck Builder is where the **Select** step of Select → Bestow → Activate happens — players choose features for the day, configure character stats, and trigger rests. This phase fills a gap: Phases 4 and 5 both reference DeckBuilder.tsx, but no phase creates it.

## Sessions: 2

- **Session A**: React Router setup + DeckBuilder skeleton + CharacterHeader + CollectionGrid
- **Session B**: SelectedPanel + rest/nav buttons + CombatHUD nav link + tests

---

## Entry Conditions
- [ ] Phase 4 exit gate passed (295 tests green)
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes
- [ ] `react-router-dom` installed (already v7.13.0)
- [ ] All store methods needed are already implemented (`selectCard`, `deselectCard`, `isCardSelected`, `selectedCardIds`, `setLevel`, `setMaxHP`, etc.)

## Exit Conditions
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] `npm run test` passes (existing 295 + new DeckBuilder tests)
- [ ] Navigating to `/` redirects to `/deck-builder` if `selectedCardIds` is empty, otherwise shows CombatHUD
- [ ] Navigating to `/deck-builder` shows DeckBuilder
- [ ] CombatHUD header has "Deck Builder" button that navigates to `/deck-builder`
- [ ] DeckBuilder has "Enter Combat" button that navigates to `/combat`
- [ ] `/` redirects to `/deck-builder` when no cards selected, `/combat` when cards exist
- [ ] Character inputs (Level, Max HP) update characterStore and persist
- [ ] PB and EP Max display auto-update when Level changes
- [ ] Current Max HP shows Echo Drain reduction when applicable
- [ ] Collection grid shows all 42 features as SiphonCard components
- [ ] Filter dropdown filters by tag; search input filters by name
- [ ] Clicking a collection card selects it (calls `selectCard(id, maxCards)`)
- [ ] Selected cards show glowing border in collection + appear in SelectedPanel
- [ ] Clicking a selected card in SelectedPanel deselects it
- [ ] Selection respects PB limit (counter shows `N/PB`)
- [ ] Supercapacitance overflow: if `supercapacitance` is selected, allows exceeding PB; counter shows `N/PB (Supercapacitance +M)`
- [ ] Long Rest and Short Rest buttons open existing dialog components
- [ ] Cards that are already selected appear visually distinct in the collection (glowing border)

---

## Session A: Router + DeckBuilder + CharacterHeader + CollectionGrid

### Tasks

### 1. Set up React Router

Modify `src/main.tsx` and `src/App.tsx`:

```tsx
// main.tsx — use createHashRouter + RouterProvider
// Hash router (/#/combat, /#/deck-builder) chosen because:
// - App is deployed to Cloudflare Pages as a static SPA
// - No server-side redirect config needed
// - Direct URL access and browser back/forward work out of the box
import { createHashRouter, RouterProvider } from 'react-router-dom';

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomeRedirect /> },
      { path: 'combat', element: <CombatHUD /> },
      { path: 'deck-builder', element: <DeckBuilder /> },
    ],
  },
]);

// HomeRedirect — reads selectedCardIds from siphonStore, redirects accordingly
// If selectedCardIds is empty → Navigate to /deck-builder
// If selectedCardIds has cards → Navigate to /combat
function HomeRedirect() {
  const hasCards = useSiphonStore((s) => s.selectedCardIds.length > 0);
  return <Navigate to={hasCards ? '/combat' : '/deck-builder'} replace />;
}

// App.tsx — layout wrapper with <Outlet />
function App() {
  return (
    <div className="min-h-screen bg-siphon-bg text-white">
      <Outlet />
    </div>
  );
}
```

**Why hash router**: The app is deployed to Cloudflare Pages as a static SPA. `createBrowserRouter` requires server-side redirect rules (e.g., `/* → /index.html`) to handle direct navigation to `/combat` or `/deck-builder`. `createHashRouter` avoids this entirely — URLs look like `/#/combat` and `/#/deck-builder`, and all routing is client-side. No Vite or Cloudflare config changes needed.

**Testing**: Use `createMemoryRouter` in tests that need routing context (e.g., SelectedPanel's "Enter Combat" button, CombatHUD's "Deck Builder" button). Components that don't call `useNavigate()` don't need a router wrapper.

### 2. Create CharacterHeader
File: `src/components/deck-builder/CharacterHeader.tsx`

Layout per DESIGN.md:
```
┌──────────────────────────────────────────────────────┐
│  Level: [5]    Max HP: [45]   Current Max HP: 45      │
│  PB: 3 (auto)  EP Max: 5                              │
└──────────────────────────────────────────────────────┘
```

- **Level**: `<input type="number">`, min 1, max 20. `onChange` → `characterStore.setLevel()`
- **Max HP**: `<input type="number">`, min 1. `onChange` → `characterStore.setMaxHP()`
- **PB**: Read-only display from `characterStore.proficiencyBonus`
- **EP Max**: Read-only display, equals Level
- **Current Max HP**: Read-only. Shows `reducedMaxHP` from characterStore. When reduced below base, display: `"45 → 38 (-7 from Echo Drain)"`
- Use `useCharacterStore` with individual field selectors (not object destructuring) to avoid unnecessary re-renders

### 3. Create CollectionGrid
File: `src/components/deck-builder/CollectionGrid.tsx`

- Import `SIPHON_FEATURES` from `src/data/siphonFeatures.ts` (all 42)
- **Filter dropdown**: Local `useState` for selected tag
  - Options: `All` + sorted unique tags from the data: `action-economy`, `area`, `buff`, `combat`, `control`, `damage`, `debuff`, `defense`, `divination`, `echo`, `healing`, `meta`, `movement`, `reaction`, `reality-warping`, `spellcasting`, `summon`, `support`, `surge`, `teleportation`, `transformation`, `ultimate`, `utility`
  - Filter: show features where `tags` includes the selected tag (or show all)
- **Search input**: Local `useState`, filters by `feature.name` (case-insensitive includes)
- **Grid**: CSS grid, responsive columns (`grid-cols-[repeat(auto-fill,minmax(10rem,1fr))]`)
- Each card = `<SiphonCard feature={f} onClick={() => toggleSelect(f.id)} />` (non-compact, so users can read descriptions)
- **Selected state**: Cards whose `id` is in `selectedCardIds` get a glowing border (ring class, e.g. `ring-2 ring-ep-positive`). Use `useMemo` with raw `selectedCardIds` state to build a Set for O(1) lookup.
- **Selection logic on click**:
  ```ts
  const toggleSelect = (cardId: string) => {
    if (isCardSelected(cardId)) {
      deselectCard(cardId);
    } else {
      const maxCards = hasSupercapacitance ? 42 : proficiencyBonus;
      selectCard(cardId, maxCards);
    }
  };
  ```
  Where `hasSupercapacitance = selectedCardIds.includes('supercapacitance')`
- **Unplayable dimming**: Do NOT dim cards in collection (dimming is a combat-only concept for "While Selected" features)

### 4. Create DeckBuilder skeleton
File: `src/components/deck-builder/DeckBuilder.tsx`

```
┌─────────────────────────────────────────┐
│ CharacterHeader                         │
│ ┌─────────────────────────────────────┐ │
│ │ CollectionGrid (scrollable)         │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│ SelectedPanel (fixed bottom)            │
└─────────────────────────────────────────┘
```

- Flex column layout, full viewport height
- CharacterHeader: fixed top
- CollectionGrid: flex-grow, overflow-y-auto (scrollable)
- SelectedPanel: fixed bottom (rendered in Session B, placeholder div for now)

---

## Session B: SelectedPanel + Buttons + CombatHUD Nav + Tests

### Tasks

### 5. Create SelectedPanel
File: `src/components/deck-builder/SelectedPanel.tsx`

Layout per DESIGN.md:
```
┌─────────────────────────────────────────────────────┐
│  Selected (3/3):                                    │
│       ┌───┐ ┌───┐ ┌───┐                             │
│       │   │ │   │ │   │  ← click to deselect        │
│       └───┘ └───┘ └───┘                             │
│                                                     │
│     [ Short Rest ] [ Long Rest ]  [ Enter Combat ]  │
└─────────────────────────────────────────────────────┘
```

- **Counter**: `Selected (N/PB)` — use `selectedCardIds.length` and `proficiencyBonus`
  - If `supercapacitance` is selected AND count > PB: show `Selected (N/PB) (Supercapacitance +M)` where M = count - PB
- **Cards**: Compact `SiphonCard` components for each selected card ID
  - Resolve features from `SIPHON_FEATURES` via a module-level `featureMap` (same pattern as CombatHUD)
  - `onClick` → `deselectCard(cardId)`
  - Horizontal scroll if many cards (flexbox with `overflow-x-auto`)
- **Short Rest button**: Opens `ShortRestDialog` (local `showShortRest` state)
- **Long Rest button**: Opens `LongRestDialog` (local `showLongRest` state)
- **Enter Combat button**: `useNavigate()` → `navigate('/combat')`
  - Style: primary action button (more prominent than rest buttons)

### 6. Add navigation to CombatHUD
File: `src/components/combat-hud/CombatHUD.tsx`

- Add a "Deck Builder" button in the existing header row (alongside Short Rest / Long Rest)
- Uses `useNavigate()` → `navigate('/deck-builder')`
- Position: left side of header (rest buttons on right)

### 7. Create barrel export
File: `src/components/deck-builder/index.ts`

Export `DeckBuilder` (the main view component). Other sub-components are internal.

Update `src/components/index.ts` to re-export from `./deck-builder`.

### 8. Write tests

**Component tests** (`src/components/deck-builder/__tests__/`):

`CharacterHeader.test.tsx` (~8 tests):
- Renders Level and Max HP inputs with current store values
- Level input changes update characterStore.level
- Level input clamps to 1–20
- Max HP input changes update characterStore.maxHP
- PB displays correctly for the level
- EP Max displays Level value
- Current Max HP shows Echo Drain reduction when reducedMaxHP < maxHP

`CollectionGrid.test.tsx` (~10 tests):
- Renders all 42 feature cards
- Filter dropdown shows tag options
- Selecting a tag filters to only matching features
- Search input filters by name (case-insensitive)
- Combined filter + search works
- Clicking an unselected card calls selectCard
- Clicking a selected card calls deselectCard
- Selected cards have glowing border (ring class)
- Selection blocked when at PB limit (selectCard returns false)
- Supercapacitance allows exceeding PB limit

`SelectedPanel.test.tsx` (~8 tests):
- Shows "Selected (0/PB)" when no cards selected
- Shows selected cards as compact SiphonCards
- Counter updates: "Selected (N/PB)"
- Supercapacitance counter: "Selected (N/PB) (Supercapacitance +M)"
- Clicking a card deselects it
- Long Rest button opens LongRestDialog
- Short Rest button opens ShortRestDialog
- Enter Combat button triggers navigation

`DeckBuilder.test.tsx` (~4 tests):
- Renders CharacterHeader, CollectionGrid, SelectedPanel
- Full flow: select a card, see it in SelectedPanel, deselect it

---

## Out of Scope
- DO NOT implement drag-and-drop (Phase 7)
- DO NOT add gear icon or settings modal (Phase 5 adds this)
- DO NOT add view transition animations (Phase 7)
- DO NOT implement While Selected focus/cost at long rest (Siphon Greed, Supercapacitance EP cost) — these are deferred edge cases
- DO NOT add sound or visual effects

## Key References
- `DESIGN.md` lines 347–412 — Deck Builder View wireframe and behavior
- `DESIGN.md` lines 1076–1081 — Supercapacitance overflow rules
- `DESIGN.md` lines 452–454 — Card states (selected = glowing border)
- `.claude/docs/STORE_CONTRACTS.md` — siphonStore and characterStore interfaces
- `src/components/combat-hud/CombatHUD.tsx` — Pattern reference (CSS grid, featureMap, dialog state, store usage)
- `src/components/cards/SiphonCard.tsx` — Reusable card component (compact vs full)

## Known Zustand + React 19 Gotcha
**CRITICAL**: Never call store methods like `getDeckCards()` inside Zustand selectors. They return new arrays each time, causing infinite re-renders with `useSyncExternalStore`. Select raw state (`selectedCardIds`) and derive with `useMemo`.
