# Implementation Status

**Last Updated**: 2026-02-21
**Current Phase**: Phase 4 Complete (Phase 4.5 spec written, Deck Builder + Routing next)

---

## Quick Status

| Phase | Status | Gate |
|-------|--------|------|
| Documentation Restructure | ✅ Complete | CLAUDE.md lean, .claude/docs/ populated |
| Phase 0: Testing Infrastructure | ✅ Complete | 68 tests passing across 5 utility files |
| Phase 1: Store Redesign | ✅ Complete | 94 store tests + 68 utility tests = 162 total |
| Phase 2: Combat Layout | ✅ Complete | 24 component tests + 162 prior = 186 total |
| Phase 3: Activation Flow | ✅ Complete | 41 new tests (18 util + 23 component) = 227 total |
| Phase 4: Rest Mechanics | ✅ Complete | 59 new tests (24 integration + 15 + 20 component) = 300 total |
| Phase 4.5: Deck Builder + Routing | 🔴 Not Started | Blocked by Phase 4 |
| Phase 5: Settings & Polish | 🔴 Not Started | Blocked by Phase 4.5 |
| Phase 6: Ally System | 🔴 Not Started | Blocked by Phase 5 |
| Phase 7: Animations | 🔴 Not Started | Blocked by Phase 6 |

---

## Next Session

1. **Start with Phase 4.5**: Read `.claude/docs/PHASE_SPECS/phase-4.5-deckbuilder.md`
2. Hash router setup: `/#/` = HomeRedirect (→ `/#/combat` if deck exists, → `/#/deck-builder` if empty), `/#/combat` = CombatHUD, `/#/deck-builder` = DeckBuilder
3. DeckBuilder view: CharacterHeader, CollectionGrid (filter + search), SelectedPanel
4. Click-to-select cards, PB limit, Supercapacitance overflow, rest buttons, Enter Combat nav
5. All stores already have the methods needed — no new store work required

---

## Phase Specs

Each phase has a detailed spec in `.claude/docs/PHASE_SPECS/`. Read the spec before starting a phase.

| Phase | Spec File | Sessions | Key Deliverables |
|-------|-----------|----------|-----------------|
| 0 | `phase-0-testing.md` | 1 | Vitest, 15+ utility tests |
| 1 | `phase-1-stores.md` | 2 | Store redesign, 30+ store tests |
| 2 | `phase-2-combat-layout.md` | 2 | Spatial layout, Deck, Hand, Effects panel |
| 3 | `phase-3-activation.md` | 2 | Activation Panel, warp, macro |
| 4 | `phase-4-rest.md` | 1 | Long Rest, Short Rest dialogs |
| 4.5 | `phase-4.5-deckbuilder.md` | 2 | Deck Builder view, React Router, card selection |
| 5 | `phase-5-settings.md` | 3 | Settings modal, overrides, export, While Selected mechanics |
| 6 | `phase-6-allies.md` | 2 | Allies panel, bestowment overlay |
| 7 | `phase-7-polish.md` | 2-3 | Animations, drag-drop, VFX |

---

## Discovered Issues

_(Issues found during sessions that belong to a different phase. Format: `[DISCOVERY] description (found during Phase N, relevant to Phase M)`)_

- `[FIXED]` activateFromHand/returnCardToDeck could append duplicate IDs to selectedCardIds if called twice. Added dedup guard. (found during Phase 2, fixed in siphonStore.ts)
- `[RESOLVED]` Phases 4 and 5 reference `DeckBuilder.tsx` but no phase spec creates it. → Phase 4.5 spec created. (found during Phase 2, resolved during Phase 4.5 spec writing)
- `[RESOLVED]` Rest buttons in DeckBuilder deferred. → Phase 4.5 spec includes rest buttons in SelectedPanel. (Phase 4, resolved during Phase 4.5 spec writing)
- `[FIXED]` Siphon Greed EPR formula was wrong — used flat `pb * 2` instead of scaling by `floor(abs(EP) / level)`. Fixed in siphonStore.ts, added RULE-GREED-005 to RULES.md. (found during Phase 4)
- `[FIXED]` Short rest effect clearing threshold was `< 1 hour` instead of `<= 1 hour`. Fixed in siphonStore.ts and ShortRestDialog.tsx. Updated RULE-REST-006. (found during Phase 4)
- `[DISCOVERY]` `characterStore.setLevel()` does not auto-restore hitDice — future UI should offer long rest option when leveling up. (found during Phase 4, relevant to DeckBuilder)
- `[DISCOVERY]` Rest coordination is spread across 3 stores with no single orchestrator — consider extracting `performLongRest()` / `performShortRest()` utility functions to avoid duplication when DeckBuilder gets rest buttons. (found during Phase 4, relevant to DeckBuilder)
- `[DISCOVERY]` Store methods that roll dice internally (`longRest`'s d4) are hard to test deterministically. Future store methods should accept roll results as parameters. (found during Phase 4)
- `[RESOLVED]` Siphon Greed While Selected focus gain not implemented. → Added as Phase 5C. (found during Phase 4, resolved during Phase 4.5 spec writing)
- `[DISCOVERY]` `siphonStore.selectCard(cardId, maxCards)` puts PB limit logic on the caller — every call site must know about Supercapacitance to compute `maxCards`. If future code calls `selectCard` (e.g., data import in Phase 5B, or a "restore deck" feature), it needs the same Supercapacitance-aware logic. Consider refactoring the store to own this internally by reading `proficiencyBonus` from characterStore + checking if `supercapacitance` is selected. Not urgent but a latent coupling. (found during Phase 4.5 spec writing, relevant to Phase 5B data import)

---

## Completed Items

### Documentation (Pre-Phase 0)
- [x] DESIGN.md — Comprehensive UI/UX specification (65KB)
- [x] ARCHITECTURE.md — Technical overview
- [x] CLAUDE.md — Lean AI session guidance (~72 lines)
- [x] `.claude/docs/SESSION_PROTOCOL.md` — Mandatory session procedures
- [x] `.claude/docs/RULES.md` — 40+ machine-readable verification rules
- [x] `.claude/docs/CARD_LIFECYCLE.md` — Full Select/Bestow/Activate flow
- [x] `.claude/docs/STORE_CONTRACTS.md` — Store interfaces and invariants
- [x] `.claude/docs/SPECIAL_CASES.md` — Feature edge cases
- [x] `.claude/docs/PHASE_SPECS/` — 8 phase spec files (0-7)

### Phase 1: Store Redesign
- [x] New types added: `Ally`, `AllyBestowment`, `SelfActiveEffect`, `SpendResult`
- [x] `characterStore.ts` — level, HP, hit dice, PB, spell save DC (persist v2)
- [x] `settingsStore.ts` — dice modes, sound, animations, UI preferences (persist v1)
- [x] `siphonStore.ts` — EP, Focus, Capacitance, card zones, allies, active effects, cost modifiers, rest actions (persist v2)
- [x] 94 store tests covering RULE-EP-*, RULE-FOCUS-*, RULE-CARD-*, RULE-GREED-*, RULE-INTUITION-*, RULE-ALLY-*, RULE-REST-*, RULE-CAP-*

### Phase 0: Testing Infrastructure
- [x] Vitest + jsdom + @testing-library/react + @testing-library/jest-dom installed
- [x] `vitest.config.ts` created
- [x] `npm run test` and `npm run test:watch` scripts added
- [x] 68 tests across 5 utility test files:
  - costCalculator (17 tests): resolveCost, formatCost, isVariableCost
  - echoPointUtils (16 tests): EP spend, warp triggers, echo drain, long rest recovery
  - focusCalculator (5 tests): focus doubling when EP negative
  - diceRoller (17 tests): parsing, rolling, PB/Cost/Cost2 substitution
  - durationParser (13 tests): ms conversion, special duration handling

### Infrastructure
- [x] Vite + React 19 + TypeScript setup
- [x] Tailwind CSS v4 configuration
- [x] Zustand manifoldStore (kept — largely correct)
- [x] characterStore — created from STORE_CONTRACTS.md (Phase 1)
- [x] settingsStore — created from STORE_CONTRACTS.md (Phase 1)
- [x] siphonStore — created from STORE_CONTRACTS.md (Phase 1)
- [x] Custom color palette in CSS

### Data (Complete, Verified 2026-02-20)
- [x] 42/42 Siphon Features (verified against PDF)
- [x] 9 Manifold Abilities (3 phases, 3 each)
- [x] 100 Wild Echo Surge entries (3 severity columns)
- [x] All type definitions

### Phase 4: Rest Mechanics
- [x] `LongRestDialog.tsx` — Modal with EP recovery preview, Focus d4 reduction (macro/dice3d modes), motes/HD/bestowment/effect/capacitance clearing preview, cross-store coordination, completion summary
- [x] `ShortRestDialog.tsx` — Modal with HD spending (+/- controls), healing amount input, effect clearing toggle (defaults from settings), phase switch restoration, completion summary
- [x] `CombatHUD.tsx` — Added header row with Short Rest / Long Rest buttons, dialog state management
- [x] `siphonStore.ts` — Added `focusRollOverride` parameter to `longRest()` for macro mode support
- [x] Updated barrel export (`index.ts`) with 2 new components
- [x] 19 rest mechanics integration tests: cross-store Long Rest (REST-001/002/003, EP-007/008, FOCUS-003, CAP-002, phase switch, effects, max HP) + Short Rest (REST-004/005/006, motes, bestowments, HD spending, healing cap)
- [x] 15 LongRestDialog component tests: preview display, EP/Focus/motes/HD/bestowments/capacitance info, dice3d confirm, macro mode flow, store state updates, close/cancel behavior
- [x] 20 ShortRestDialog component tests: preview display, HP/HD info, HD +/- controls, healing input, effect toggle (defaults/toggling), phase switch, REST-005 (no EP/Focus change), bestowment preservation, motes preservation, REST-004, REST-006, completion summary, close/cancel
- [x] All exit conditions met: build passes, lint passes, 295 tests green

### Phase 3: Activation Flow
- [x] `macroGenerator.ts` — resolveFocusDice, generateActivationMacro, resolveBaseCost utilities
- [x] `MacroDisplay.tsx` — Copyable FoundryVTT macro text with manual result input
- [x] `ActivationPanel.tsx` — Full activation overlay: cost preview (with Echo Intuition / Siphon Greed modifiers), EP change preview, focus dice, warp warning, macro mode, dice3d mode, warp result display
- [x] `SurgeResultModal.tsx` — Standalone surge result modal (d100, d20, severity, effect)
- [x] `CombatHUD.tsx` — Added activation state management (staged card, surge result, callbacks)
- [x] `HandArea.tsx` — Wired double-click to trigger activation via onActivateCard prop
- [x] `SelectedDeck.tsx` — Activation:None features auto-open activation panel after bestow
- [x] Updated barrel export (`index.ts`) with 3 new components
- [x] 18 macro generator tests: resolveFocusDice (7), generateActivationMacro (3), resolveBaseCost (8)
- [x] 23 ActivationPanel component tests: display, cost preview, warp warning, modifiers, macro mode, dice3d mode, warp handling (auto/manual), active effects, card lifecycle
- [x] All exit conditions met: build passes, lint passes, 227 tests green

### Phase 2: Combat Layout
- [x] `SiphonCard.tsx` — Reusable card component (name, cost, focus, duration, activation, description, warp)
- [x] `CombatHUD.tsx` — CSS Grid layout matching DESIGN.md wireframe (4-column, 4-row grid)
- [x] `EchoManifoldDeck.tsx` — Phase card (face-up) with interactive mote pips
- [x] `WildSurgeDeck.tsx` — Surge deck placeholder
- [x] `PhaseAbilities.tsx` — 3 ability cards for current phase
- [x] `ActiveEffectsPanel.tsx` — Active effects list with source icons, duration, CONC/warp indicators
- [x] `ResourceDisplay.tsx` — Right column wrapper (Focus, EP, HD, Capacitance)
- [x] `EchoPointsBar.tsx` — Bidirectional EP bar (center-zero, extends left/right)
- [x] `FocusCounter.tsx` — Focus value with dynamic glow, high-focus warning
- [x] `HitDiceDisplay.tsx` — Hit dice current/max
- [x] `SiphonCapacitanceTracker.tsx` — Capacitance charge pips (max = PB)
- [x] `SelectedDeck.tsx` — Deck with expand/collapse, click-to-bestow
- [x] `HandArea.tsx` — Fanned cards with hover-raise, overlap compression for large hands
- [x] `setupTests.ts` — Vitest setup for jest-dom matchers
- [x] 24 component tests across 4 test files:
  - SelectedDeck (8 tests): expand/collapse, escape, exclude hand cards, bestow click, count
  - HandArea (4 tests): empty state, card display, triggered features, aria labels
  - ActiveEffectsPanel (5 tests): placeholder, effects display, CONC/warp indicators, multiple effects
  - ResourceDisplay (7 tests): all resources render, EP/Focus values, HD/Capacitance ratios, high focus warning

---

## Known Blockers

| Issue | Impact | Resolution |
|-------|--------|------------|
| ~~No test infrastructure~~ | ~~Cannot verify behavior~~ | ✅ Phase 0 complete |
| ~~No characterStore or siphonStore~~ | ~~Stores pruned for clean-slate rework~~ | ✅ Phase 1 complete |
| ~~No components~~ | ~~Components pruned for clean-slate rework~~ | ✅ Phase 2 complete |
| ~~No activation flow~~ | ~~Cannot activate features~~ | ✅ Phase 3 complete |
| ~~No rest mechanics~~ | ~~Cannot long/short rest~~ | ✅ Phase 4 complete |

---

## Session Log

### 2026-02-21 — Phase 4: Rest Mechanics
- Created LongRestDialog.tsx: preview dialog showing EP recovery (+PB), Focus d4 reduction, motes/HD restoration, bestowment/effect/capacitance clearing; supports both dice3d (auto-roll) and macro (Roll in Foundry + manual entry) modes via settings; cross-store coordination (siphonStore.longRest + characterStore.restoreAllHitDice/restoreMaxHP + manifoldStore.resetMotesOnLongRest); completion summary
- Created ShortRestDialog.tsx: HD spending with +/- controls, healing amount input (user enters Foundry roll result), effect clearing toggle (defaults from shortRestClearEffects setting), phase switch restoration; completion summary with pre-rest state tracking
- Added header row to CombatHUD CSS Grid with Short Rest and Long Rest buttons
- Modified siphonStore.longRest() to accept optional focusRollOverride parameter for macro mode
- Updated barrel export (index.ts) with 2 new components
- Updated ARCHITECTURE.md component hierarchy
- DeckBuilder rest buttons deferred by user choice (DeckBuilder.tsx doesn't exist yet)
- 54 new tests (19 integration + 15 LongRestDialog + 20 ShortRestDialog), total 295 tests passing
- All exit conditions met: build passes, lint passes, 295 tests green
- **Next**: Phase 5 (Settings & Polish)

### 2026-02-21 — Phase 3: Activation Flow
- Created macroGenerator.ts utility (resolveFocusDice, generateActivationMacro, resolveBaseCost)
- Created MacroDisplay.tsx: copyable macro text block + manual focus result input
- Created ActivationPanel.tsx: full overlay with cost/EP/focus preview, modifier badges (Echo Intuition, Siphon Greed), warp warning, macro mode (transitions to awaiting-result), dice3d mode (simple random roll), inline warp result display when autoSurge is on
- Created SurgeResultModal.tsx: standalone modal for surge results (used when autoSurge is off)
- Wired CombatHUD with activation state management (stagedCardId, surgeResult, ActivationPanel + SurgeResultModal overlays)
- Wired HandArea double-click → onActivateCard callback to parent
- Wired SelectedDeck Activation:None detection: after bestowToSelf, auto-opens activation panel
- Fixed ActivationPanel CJS require() → ES import for diceRoller
- 41 new tests (18 macroGenerator + 23 ActivationPanel), total 227 tests passing
- All exit conditions met: build passes, lint passes, 227 tests green
- **Next**: Phase 4 (Rest Mechanics)

### 2026-02-21 — Phase 2: Combat Layout
- Created 13 components across `src/components/cards/` and `src/components/combat-hud/`
- CombatHUD uses CSS Grid with 4 areas: manifold/surge (top), abilities/effects/resources (middle), allies (row), deck/hand (bottom)
- SiphonCard is reusable: name, cost, focus dice, duration, activation, description, warp effect, compact mode
- SelectedDeck: expand/collapse with click, Escape, click-outside; shows only getDeckCards results; click card to bestowToSelf
- HandArea: fanned cards with hover-raise; overlap compression for 8+ cards; triggered features auto-appear in hand
- ResourceDisplay: Focus (glow scales with value), EP (bidirectional bar), HD (current/max), Capacitance (charge pips)
- ActiveEffectsPanel: effect rows with source icons (⚡/◎/✦), duration, CONC/warp indicators; empty placeholder
- EchoManifoldDeck: phase card face-up with passive text, interactive mote pips (click to add/remove)
- PhaseAbilities: 3 ability cards for current phase with mote cost and activation type
- Added `setupTests.ts` for jest-dom matchers, updated `vitest.config.ts` with setupFiles
- Fixed Zustand selector issue: getDeckCards()/getHandCards() create new arrays per call → infinite re-renders with useSyncExternalStore; switched to useMemo with raw state selectors
- 24 component tests across 4 test files (total: 186 tests)
- All exit conditions met: build passes, lint passes, 186 tests green
- **Next**: Phase 3 (Activation Flow)

### 2026-02-20 — Phase 1: Store Redesign
- Added new types: `Ally`, `AllyBestowment`, `SelfActiveEffect`, `SpendResult` to `types/siphonFeature.ts`
- Created `characterStore.ts`: level, HP, hit dice, proficiency bonus, spell save DC, persist v2 with migration
- Created `settingsStore.ts`: dice modes, sound, animations, reduced motion, confirmation settings
- Created `siphonStore.ts`: EP/Focus/Capacitance, card zones (Select/Bestow/Activate), allies, active effects, cost modifiers (Siphon Greed + Echo Intuition), long rest, short rest, persist v2 with migration
- Updated `store/index.ts` to export all stores
- 94 store tests across 3 test files:
  - characterStore (17 tests): level clamping, PB calculation, HP management, hit dice spend/restore
  - settingsStore (10 tests): defaults, dice mode toggles, boolean setters, reset
  - siphonStore (67 tests): EP-001 through EP-008, FOCUS-001 through FOCUS-004, CARD-001 through CARD-008, GREED-001 through GREED-004, INTUITION-001/002, ALLY-001/002, REST-001/005/006, CAP-002
- All exit conditions met: build passes, lint passes, 162 tests green
- **Next**: Phase 2 (Combat Layout)

### 2026-02-20 — Phase 0: Testing Infrastructure
- Installed Vitest, @testing-library/react, @testing-library/jest-dom, jsdom
- Created `vitest.config.ts` (jsdom environment)
- Added `test` and `test:watch` scripts to package.json
- Wrote 68 tests across 5 utility test files covering all RULES.md EP, Focus, and cost rules
- No existing source code was modified
- All exit conditions met: build passes, lint passes, 68 tests green
- **Next**: Phase 1 (Store Redesign)

### 2026-02-20 — Documentation Restructure
- Restructured all documentation for AI-assisted development
- Created `.claude/docs/` with 6 reference documents + 8 phase specs
- Rewrote CLAUDE.md from 204 lines to 72 lines (lean, rules-only)
- Created RULES.md with 40+ GIVEN/WHEN/THEN verification rules
- Created STORE_CONTRACTS.md with full interface specs for all stores
- Created SESSION_PROTOCOL.md with mandatory session procedures
- Created CARD_LIFECYCLE.md with state diagrams for card flow
- Created SPECIAL_CASES.md consolidating all edge cases
- **Next**: Phase 0 (Testing Infrastructure)

### 2026-02-20 — Code Pruning for Clean-Slate Rework
- Deleted all 17 components (src/components/) — contradicted DESIGN.md, high anchoring risk
- Deleted characterStore.ts and siphonStore.ts — structurally wrong, Phase 1 creates fresh from STORE_CONTRACTS.md
- Kept manifoldStore.ts — largely correct, no phase rewrites it
- Kept all data (42 features, 9 manifold abilities, 100 surge entries), types, and utils
- Deleted legacy docs: GAP_ANALYSIS.md (stale), SIPHON_INTERFACE.md (inaccurate)
- Deleted boilerplate: App.css, assets/react.svg, empty hooks/
- Deleted _backup/ (pre-React artifacts), dist/ (build output)
- Replaced App.tsx with minimal stub (keeps build passing)
- Updated ARCHITECTURE.md, IMPLEMENTATION_STATUS.md, phase-1-stores.md
- **Rationale**: Incorrect existing code causes AI agents to anchor, cargo-cult, and patch rather than build correctly from spec. Clean slate + good docs = faster, more accurate implementation.
- **Next**: Phase 0 (Testing Infrastructure)

### 2026-02-20 — Documentation Audit Session
- Cross-referenced all 4 source PDFs against all docs and code
- Confirmed 42/42 features correct in data file
- Fixed CSS colors, ARCHITECTURE.md warp pseudo-code
- Added 5 "Common Mistakes" entries (now in SPECIAL_CASES.md)
- Fixed data: Spatial Flux typo, Distort Reality warp, surge #88 and #91

### 2026-02-19 — Initial Planning Session
- Created DESIGN.md, GAP_ANALYSIS.md, ARCHITECTURE.md, CLAUDE.md

