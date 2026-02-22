# Implementation Status

**Last Updated**: 2026-02-22
**Current Phase**: Phase 8D Complete (Phase 8 Complete)

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
| Phase 4.5: Deck Builder + Routing | ✅ Complete | 32 new tests (8+10+8+4+2) = 332 total |
| Phase 5A: Settings Modal | ✅ Complete | 15 new tests, 347 total |
| Phase 5B: Timer + Overrides + Data | ✅ Complete | 36 new tests, 383 total |
| Phase 5C: While Selected Mechanics | ✅ Complete | 20 new tests, 403 total |
| Phase 6A: Ally Panel + Bestow | ✅ Complete | 17 new tests (13 AlliesPanel + 4 SelectedDeck), 413 total |
| Phase 6B: AllyBestowmentView | ✅ Complete | 10 new tests (8 AllyBestowmentView + 2 AlliesPanel hover), 425 total |
| Post-Phase 6 Audit | ✅ Complete | 3 bugs fixed, dead code removed, constants consolidated |
| Phase 7A: Core Animations | ✅ Complete | Card slide-in, animated counters, pip pulse, reduced motion |
| Phase 7B: Drag-and-Drop | ✅ Complete | DnD bestow/activate, dismiss gesture, drop zone highlights |
| Post-Phase 7 Audit | ✅ Complete | Hook extraction, dead code removal, docs updated |
| Phase 8A: Three-Column Grid Layout | ✅ Complete | Sidebar layout, header removed, rest buttons moved |
| Phase 8B: Card Sizing + Restyling | ✅ Complete | 14 new tests (6 PhaseAbilities + 6 WildSurgeDeck + 2 HandArea), 459 total |
| Phase 8C: Grimoire Navigation | ✅ Complete | 5 new tests (Grimoire), 464 total |
| Phase 8D: Inline Activation | ✅ Complete | -6 tests (removed ActivationPanel tests, added activateFeature + updated ActiveEffectsPanel tests), 458 total |

---

## Next Session

1. **Phase 7C: Visual Effects** — Warp visual, chromatic aberration, high focus warning (deferred from Phase 7)
2. Or begin Phase 9 planning if applicable
3. All 458 tests passing across 33 test files
4. Phase 8 is fully complete (8A-8D)

> **Note**: Phase 7C (Visual Effects) was originally next but deferred until after Phase 8. Phase 8 is now complete, so Phase 7C effects (warp visual, chromatic aberration, high focus warning) can proceed.
> **Note**: Combat → Deck Builder navigation restored via Grimoire (right sidebar bottom, CSS book/tome). Deck Builder → Combat via "Enter Combat" button.

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
| 8 | `phase-8-combat-view-redesign.md` | 4 | Three-column layout, card resize, grimoire nav, inline activation |

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
- `[RESOLVED]` `CombatHUD` previously used `useNavigate()` for the "Deck Builder" nav button. Removed in Phase 8A (header row eliminated). CombatHUD no longer requires `createMemoryRouter` in tests. (found during Phase 4.5, resolved during Phase 8A)
- `[DISCOVERY]` `LongRestDialog` and `ShortRestDialog` live in `combat-hud/` but are reused by `deck-builder/SelectedPanel` via cross-directory import. If a third consumer appears, consider extracting them to a `shared/` or `dialogs/` directory. (found during Phase 4.5, relevant to Phase 5+)
- `[FIXED]` `SiphonFeature.tags` was typed as optional (`tags?: string[]`) but all 42 features have tags. Made required to eliminate defensive optional chaining in filter code. (found and fixed during Phase 4.5)
- `[FIXED]` `resetSession()` cleared `handCardIds` without returning them to `selectedCardIds`, causing bestowed cards to vanish. Fixed to merge hand cards back into selected (same pattern as `longRest()`). (found during Phase 5B self-review, fixed in dataExport.ts)
- `[DISCOVERY]` `capacitanceTimerStart` stores `Date.now()` (real-world ms) in `addCapacitance()`, while the new `capacitanceInGameTime`/`capacitanceExpiresAt` fields store in-game minutes since midnight. These coexist as independent timer systems — `capacitanceTimerStart` is vestigial (no UI reads it). Consider removing it in a future cleanup pass. (found during Phase 5B self-review)
- `[DISCOVERY]` `importAllState()` uses raw `useSiphonStore.setState()` which bypasses action-level validation (e.g., `setSelectedCards()` would also clear hand/ally data). Round-trip export/import is self-consistent, but manually-edited JSON could produce inconsistent state. Consider adding a post-import validation pass if this becomes a user-facing feature. (found during Phase 5B self-review)
- `[DISCOVERY]` `LongRestDialog` no longer uses `MacroDisplay` — replaced with inline macro UI to support dual roll inputs (Focus d4 + Siphon Greed 1d4). `ActivationPanel` still uses `MacroDisplay`. If updating the macro UI pattern globally, LongRestDialog must be updated separately. (found during Phase 5C)
- `[DISCOVERY]` `siphonStore.longRest()` processes `whileSelectedEffects` array sequentially — each effect's EP cost is deducted before its focus gain is calculated (doubling depends on EP sign at that moment). The calculator returns Supercapacitance first (has EP cost that can push EP negative) then Siphon Greed (no EP cost). **This ordering is load-bearing**: if a future caller passes effects in a different order, focus doubling results will differ. Consider enforcing order in the store or documenting the contract. (found during Phase 5C, relevant to any future `longRest()` caller)
- `[DISCOVERY]` `whileSelectedCalculator` returns `focusGain: 0` for Siphon Greed because it's dice-based — the caller (LongRestDialog) must roll dice and fill in the actual value before passing to `longRest()`. If a future caller forgets this step, Siphon Greed silently contributes 0 focus with no runtime error. (found during Phase 5C, relevant to any future `longRest()` caller)
- `[DISCOVERY]` Test count drift: IMPLEMENTATION_STATUS.md documented 403 tests after Phase 5C, but baseline run at Phase 6A start showed 396. The 7-test discrepancy was not investigated — likely a previous session overcounted. Phase 6A recorded 413 based on the actual 396 baseline + 17 new. Future sessions should trust `npm run test` output, not this document's running totals. (found during Phase 6A)
- `[DISCOVERY]` Phase 6 spec has conflicting ally click behaviors: exit conditions say "click name to edit" (rename), while the task description says "click ally name: selects as bestow target." Phase 6A resolved this with separate buttons (click chip = select target, pencil icon = rename, × icon = remove). Phase 6B sessions should follow the implemented pattern, not the spec's "click name to edit" wording. (found during Phase 6A, relevant to Phase 6B)
- `[DISCOVERY]` `selectedAllyId` (the ally bestow-target selection) is transient React state in CombatHUD, not persisted in siphonStore. It resets on navigation. Phase 6B's AllyBestowmentView needs its own state for tracking which ally is being hovered/viewed — it cannot reuse `selectedAllyId` since hover and bestow-target are independent interactions. (found during Phase 6A, relevant to Phase 6B)
- `[FIXED]` AllyBestowmentView grouping logic re-derived "From Selected Deck" from current `selectedCardIds` instead of using the stored `isFromSelectedDeck` flag. Fixed to use `b.isFromSelectedDeck` directly. (found during Phase 6B review, fixed during post-Phase 6 audit)
- `[FIXED]` `onMouseLeave={onDismiss}` on AllyBestowmentView's `fixed inset-0` backdrop was dead code — mouse can't leave a full-screen element. Removed the dead handlers. (found during Phase 6B review, fixed during post-Phase 6 audit)
- `[FIXED]` HandArea showed no visual feedback on special-cost cards when ally is selected. Added `isUnplayable` styling and "Cannot bestow to allies" label to match SelectedDeck behavior. (found during Phase 6B review, fixed during post-Phase 6 audit)
- `[DISCOVERY]` `setupTests.ts` mocks `window.matchMedia` returning `matches: false` for all queries. Tests cannot exercise the OS-level `prefers-reduced-motion: reduce` path. To test it, override the mock per-test with `matches: true`. (found during Phase 7A, relevant to any future media-query-dependent hooks)
- `[DISCOVERY]` HandArea's `setEnteringCards` in `useEffect` calls setState synchronously — same pattern the lint rule `react-hooks/set-state-in-effect` flagged in the pip components. Currently not flagged (lint may not catch all cases). If the rule gets stricter, HandArea will need the same "adjust state during render" refactor used in EchoManifoldDeck/SiphonCapacitanceTracker. (found during Phase 7A)
- `[DISCOVERY]` `useAnimatedNumber` returns `target` directly when `skipAnimation` is true, but `displayed` state can drift if `skipAnimation` toggles mid-animation. Harmless in practice (nobody toggles settings mid-animation), but the state model isn't clean. A ref-based approach for `displayed` would be more robust. (found during Phase 7A)
- `[DISCOVERY]` Pip animation uses React's "adjust state during render" pattern (`if (prev !== current) { setPrev; setAnimating }`) which triggers a double render per change. Correct per React docs but slightly wasteful. A `useMemo`+ref approach could avoid the extra render. Not a real perf issue with 5 pips. (found during Phase 7A)
- `[FIXED]` SelectedDeck was placed inside the `left` sidebar div (rows 1-2) but the grid template defines `deck` as a separate area in row 3. SelectedDeck appeared misaligned above the hand instead of beside it. Fixed by extracting SelectedDeck to its own `gridArea: 'deck'` div. **Lesson**: When a CSS grid template defines named areas, each area needs its own element — don't nest children inside a spanning area and assume `mt-auto` will push them into adjacent rows. (found during Phase 8A visual review, fixed same session)
- `[FIXED]` Duplicated drag detection logic across HandArea, AlliesPanel, and ActiveEffectsPanel (3×17 lines). Extracted to `useCardDragDetection()` hook in `src/hooks/`. (found during Phase 7B, fixed during post-Phase 7 audit)
- `[FIXED]` 5 unused exported data functions (`getFeatureById`, `getFeaturesByTag`, `getFeaturesByActivation`, `getAbilityById`, `getSurgeEntry`) and 1 unused constant (`SEVERITY_THRESHOLDS`) removed. (found during post-Phase 7 audit)
- `[FIXED]` `macroGenerator` and `whileSelectedCalculator` not in `utils/index.ts` barrel export — inconsistent with other utilities. Added. (found during post-Phase 7 audit)
- `[FIXED]` ARCHITECTURE.md stale — referenced "Phase 6 Complete", missing hooks/data/types directory details, missing Phase 7A/7B animation classes. Updated. (found during post-Phase 7 audit)

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

### Phase 5B: Timer + Overrides + Data
- [x] `ManualOverrides.tsx` — Number inputs with ±1 buttons for EP, Focus, Motes, Hit Dice, Max HP Reduction; clamping validation; Echo Drained note display
- [x] `DataManagement.tsx` — Export (JSON download), Import (file picker with error/success feedback), Reset Session (EP→PB, clears combat), Clear All Data (two-click confirmation with blur reset)
- [x] `dataExport.ts` — `exportAllState()`, `importAllState(json)`, `resetAllStores()`, `resetSession(pb)` utilities with version 1 format
- [x] `SiphonCapacitanceTracker.tsx` — In-game time picker (8 presets), ±1 hour arrows, expiration display, Extend +8 hrs / Timer Expired / Clear buttons; shows only when charges exist
- [x] `siphonStore.ts` — Added `capacitanceInGameTime`, `capacitanceExpiresAt`, `setCapacitanceTimer()`, `extendCapacitanceTimer()`, `resetSiphon()`
- [x] `SettingsModal.tsx` — Added Manual Overrides and Data sections with ManualOverrides and DataManagement components
- [x] 12 dataExport tests: export format/values/no-functions, import restore/invalid/missing-version/bad-version, resetAllStores, resetSession (4 tests)
- [x] 9 ManualOverrides tests: renders all inputs, EP/Focus/Motes/HD/MaxHP updates, clamping, Echo Drained note
- [x] 6 DataManagement tests: renders buttons, export download, import file, reset session, clear confirmation, blur cancels confirmation
- [x] 9 SiphonCapacitanceTracker tests: charge pips, no timer when empty, preset picker, preset click, arrow adjust, extend, timer expired, clear, action buttons
- [x] All exit conditions met: build passes, lint passes, 383 tests green

### Phase 5C: While Selected Mechanics
- [x] `whileSelectedCalculator.ts` — `calculateWhileSelectedEffects()` handles Supercapacitance (EP cost = extras × 2, focus = extras) and Siphon Greed (1d4 focus dice)
- [x] `siphonStore.longRest()` — Extended with `whileSelectedEffects` parameter; EP costs deducted then focus gains added (with doubling when EP negative)
- [x] `LongRestDialog.tsx` — While Selected preview section, Supercapacitance negative EP warning, Siphon Greed dice roll (dice3d auto-roll / macro input), completion summary
- [x] 7 whileSelectedCalculator tests: no effects, at/under PB, 1 extra, 2 extra (DESIGN.md example), Siphon Greed dice info, combined ordering, singular description
- [x] 5 siphonStore tests: Siphon Greed focus gain, focus doubling when EP negative, Supercapacitance cost+focus, combined effects, zero defaults
- [x] 8 LongRestDialog tests: Siphon Greed preview, Supercapacitance preview, no preview when unselected, negative EP warning, dice3d execution, macro inputs, macro apply, completion summary
- [x] All exit conditions met: build passes, lint passes, 403 tests green

### Phase 5A: Settings Modal
- [x] `DiceModeToggle.tsx` — Reusable [3D] [Macro] toggle pair with accent color active state, `aria-pressed` accessibility
- [x] `SettingsModal.tsx` — Modal overlay: Dice Rolls (4 toggles), Sound (1 toggle), Visual (2 toggles), Gameplay (3 toggles); Escape/backdrop/X close; immediate persistence
- [x] `settings/index.ts` — Barrel export
- [x] Gear icon in CombatHUD header (right side, after rest buttons)
- [x] Gear icon in DeckBuilder (absolute-positioned over CharacterHeader)
- [x] 15 SettingsModal tests: section headings, all toggles render, dice mode toggle → store, boolean toggles → store (×6), close behaviors (backdrop, X, Escape, click-inside-no-close)
- [x] All exit conditions met: build passes, lint passes, 347 tests green

### Phase 4.5: Deck Builder + Routing
- [x] React Router setup: `createHashRouter` with `/#/`, `/#/combat`, `/#/deck-builder` routes
- [x] `HomeRedirect.tsx` — Redirects `/` to `/combat` (if deck has cards) or `/deck-builder` (if empty)
- [x] `App.tsx` — Converted to layout wrapper with `<Outlet />`
- [x] `main.tsx` — Converted to `createHashRouter` + `RouterProvider`
- [x] `DeckBuilder.tsx` — Flex column layout: CharacterHeader (top), CollectionGrid (scrollable), SelectedPanel (bottom)
- [x] `CharacterHeader.tsx` — Level/Max HP inputs, PB auto-display, EP Max, Current Max HP with Echo Drain reduction
- [x] `CollectionGrid.tsx` — All 42 features in responsive grid, tag filter dropdown, name search, click-to-select with glowing border, PB limit enforcement, Supercapacitance overflow support
- [x] `SelectedPanel.tsx` — Selected cards (compact, horizontal scroll), N/PB counter with Supercapacitance overflow display, Short Rest/Long Rest/Enter Combat buttons, click-to-deselect
- [x] `CombatHUD.tsx` — Added "Deck Builder" navigation button (left side of header), `useNavigate()` integration [removed in Phase 8A]
- [x] Barrel exports: `deck-builder/index.ts`
- [x] 8 CharacterHeader tests: Level/Max HP inputs, store updates, level clamping, PB display, EP Max, Current Max HP, Echo Drain display
- [x] 10 CollectionGrid tests: all 42 cards, tag filter, search, combined filter+search, select/deselect clicks, glowing border, PB limit, Supercapacitance overflow
- [x] 8 SelectedPanel tests: empty counter, compact cards, counter updates, Supercapacitance counter, deselect click, Long Rest dialog, Short Rest dialog, Enter Combat navigation
- [x] 4 DeckBuilder tests: renders all sections, full select/deselect flow, filter+search controls, rest+combat buttons
- [x] 2 HomeRedirect tests: redirects to deck-builder when empty, redirects to combat when cards selected
- [x] All exit conditions met: build passes, lint passes, 332 tests green

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

### Phase 8D: Inline Activation Flow
- [x] `activateFeature.ts` (new utility) — `activateFeature(featureId, options?)` and `computeActivationPreview(feature, chosenCost?)` extracted from removed ActivationPanel; always auto-rolls focus dice; handles EP deduction, focus gain, warp detection, active effect creation, card return to deck
- [x] `dragData.ts` — Added `setActiveDragData()`/`getActiveDragData()` module-level state for dragover preview (workaround for `getData()` restriction during dragover events)
- [x] `ActiveEffectsPanel.tsx` — Major rewrite: `GhostPreviewRow` sub-component shows EP change + warp warning during drag-over; `VariesActivationForm` sub-component for inline cost input after dropping Varies-cost cards; drop handler calls `activateFeature()` directly; new effect tracking for `warp-flash` animation on newly added rows; props changed from `onActivateCard` to `onWarpTriggered`
- [x] `HandArea.tsx` — Sets active drag data on drag start/end; double-click activates via `activateFeature()` directly (blocks Varies-cost features); Activation:None auto-activate uses `activateFeature()`; props changed from `onActivateCard` to `onWarpTriggered`
- [x] `SelectedDeck.tsx` — Sets active drag data on drag start/end; Activation:None auto-activate uses `activateFeature()`; props changed from `onActivateCard` to `onWarpTriggered`
- [x] `WildSurgeDeck.tsx` — Added `warpPulse` prop; shows "Roll Needed!" text and `warp-pulse` animation when pulsing
- [x] `CombatHUD.tsx` — Removed `stagedCardId`/`surgeResult` state, removed ActivationPanel/SurgeResultModal; added `warpPulse` state with 3s auto-clear and `handleWarpTriggered` callback passed to children
- [x] Deleted `ActivationPanel.tsx`, `SurgeResultModal.tsx`, `MacroDisplay.tsx`; updated barrel exports
- [x] `index.css` — Added `ghost-glow`, `warp-flash`, `warp-pulse` keyframe animations; added to `.reduce-motion` and `@media (prefers-reduced-motion)` blocks
- [x] 13 new `activateFeature.test.ts` tests: EP deduction, focus gain, warp trigger, card return, active effect for duration-based, no effect for Triggered, Varies cost, unknown feature, Echo Intuition halving, preview tests
- [x] 19 rewritten `ActiveEffectsPanel.test.tsx` tests: ghost preview on drag-over, drop-to-activate, Varies cost form, warp-flash class on new effects, dismiss gesture, settings toggle
- [x] Deleted `ActivationPanel.test.tsx` (23 tests removed); updated HandArea/SelectedDeck tests for new auto-activate behavior
- [x] **Design decisions**: Always auto-roll focus dice (no macro mode for activation); Varies cost shows inline form in ghost preview row
- [x] All exit conditions met: build passes, lint passes, 458 tests green across 33 test files

### Phase 8C: Grimoire Navigation
- [x] `Grimoire.tsx` (new) — CSS-only book/tome visual (200×280px, matching card height); spine with ridge lines via `repeating-linear-gradient`; dark leather cover with `linear-gradient`; page edges on right side; decorative gold/amber border lines; "Siphon Features" title text on cover; circular seal showing feature count from `FEATURE_MAP.size`; `useNavigate('/deck-builder')` on click; hover amber glow + scale-up via `group-hover`
- [x] `CombatHUD.tsx` — Added `<Grimoire />` to right sidebar, pinned to bottom via `mt-auto` on component wrapper
- [x] `index.ts` — Added `Grimoire` to barrel export
- [x] New test file `Grimoire.test.tsx` — 5 tests: accessible label, feature count display, "Siphon Features" label, navigation on click, hover title
- [x] `ARCHITECTURE.md` — Updated component hierarchy (Phase 8C complete), added Grimoire to directory listing and right sidebar, updated navigation flow
- [x] All exit conditions met: build passes, lint passes, 464 tests green across 33 test files

### Phase 8B: Card Sizing + Component Restyling
- [x] `SiphonCard.tsx` — Resized from `w-48 min-h-56` (192×224) to `w-[200px] min-h-[280px]` (200×280); compact from `w-36 min-h-44` to `w-[160px] min-h-[224px]`; text sizes bumped up (name: `text-sm`, stats: `text-sm`); warp section changed from multi-line text to compact "Warp" badge visible in both modes; increased padding for larger card
- [x] `PhaseAbilities.tsx` — Replaced card-based layout with compact horizontal info bars (~50px height); each bar shows mote cost, ability name, and activation type badge (A/BA/R/—); muted styling subordinate to hand cards; description available via title attribute
- [x] `WildSurgeDeck.tsx` — Replaced card visual with macro/roll widget; supports dice3d mode (Roll d100 button with random result display) and macro mode (click-to-copy `/r 1d100`); reads `diceMode.wildSurge` from settingsStore
- [x] `HandArea.tsx` — Added `justify-center` to card row; replaced fixed overlap values with dynamic ResizeObserver-based algorithm (measures container width, calculates overlap offset per card count); cards use gap-4 when they fit, negative margins when overlapping; `compact` prop now driven by `needsOverlap` instead of hardcoded `isLargeHand > 7`
- [x] `setupTests.ts` — Added `ResizeObserver` mock for jsdom (no-op observer, constructor accepts callback)
- [x] New test file `PhaseAbilities.test.tsx` — 6 tests: compact bars, ability names, mote costs, activation badges, phase change reactivity, accessible list structure
- [x] New test file `WildSurgeDeck.test.tsx` — 6 tests: label, Roll d100 button, macro mode text, result display, copy macro, accessible region
- [x] `HandArea.test.tsx` — 2 new tests: justify-center class, many cards render without error
- [x] All exit conditions met: build passes, lint passes, 459 tests green

### Phase 8A: Three-Column Grid Layout
- [x] `CombatHUD.tsx` — Replaced 4-column/5-row grid with 3-column/3-row sidebar layout (`260px 1fr 260px`)
- [x] Left sidebar (flex column): EchoManifoldDeck + PhaseAbilities (rows 1-2); SelectedDeck in own `deck` grid area (row 3, aligned with hand)
- [x] Right sidebar (flex column): ResourceDisplay + WildSurgeDeck + rest buttons (Short Rest / Long Rest)
- [x] Center: ActiveEffectsPanel (row 1, fills space) + AlliesPanel (row 2) + HandArea (row 3)
- [x] Removed header row entirely: Deck Builder nav button, settings gear, `showSettings` state, `SettingsModal` import
- [x] Removed `useNavigate` import from CombatHUD (no longer needed without Deck Builder button)
- [x] `EchoManifoldDeck.tsx` — Removed `w-44` fixed width (sidebar constrains)
- [x] `WildSurgeDeck.tsx` — Removed `w-44`, `self-start`, `justify-self-end` (sidebar constrains and positions)
- [x] `ResourceDisplay.tsx` — No changes needed (no internal width constraints to remove)
- [x] `max-w-[1800px] mx-auto` removed from grid container (sidebars define max width)
- [x] No test changes needed — no CombatHUD-level tests exist; all 445 component tests pass unchanged
- [x] All exit conditions met: build passes, lint passes, 445 tests green

### Post-Phase 7 Audit
- [x] **Refactor**: Extracted `useCardDragDetection(onDragEnd?)` hook from 3 components (HandArea, AlliesPanel, ActiveEffectsPanel) — eliminated 3×17 lines of duplicated window event listener code
- [x] **Cleanup**: Removed 5 unused exported data functions (`getFeatureById`, `getFeaturesByTag`, `getFeaturesByActivation`, `getAbilityById`, `getSurgeEntry`) and 1 unused constant (`SEVERITY_THRESHOLDS`)
- [x] **Cleanup**: Added `macroGenerator` and `whileSelectedCalculator` to `utils/index.ts` barrel export for consistency
- [x] **Docs**: Updated ARCHITECTURE.md — phase label (6→7B), expanded directory structure (hooks, data, types), animation classes split into active vs reserved-for-7C, removed stale target structure section
- [x] **Docs**: Updated phase-7-polish.md — marked duplicated drag detection issues as [FIXED]
- [x] All changes verified: build passes, lint passes, 445 tests green

### Phase 7B: Drag-and-Drop
- [x] `settingsStore.ts` — Added `highlightDropTargets` boolean (default: true) with setter
- [x] `SettingsModal.tsx` — Added "Highlight drop targets when dragging" toggle in VISUAL section
- [x] `src/types/dragData.ts` (new) — `CardDragData` type, `setCardDragData`/`getCardDragData`/`isCardDrag` helpers; dual MIME types (`application/json` + `text/x-card-type`) for dragover detection
- [x] `SiphonCard.tsx` — Added optional `draggable`, `onDragStart`, `onDragEnd` props; `cursor-grab` when draggable, `opacity-50` while dragging
- [x] `SelectedDeck.tsx` — Deck cards are now draggable (except While Selected and special cost when ally selected); sets drag data with `source: 'deck'`
- [x] `HandArea.tsx` — Drop target for deck cards (bestowToSelf + Activation:None auto-activate); hand cards draggable with `source: 'hand'`; ambient + active ring highlights via global dragstart/dragend listeners; respects `highlightDropTargets` setting
- [x] `ActiveEffectsPanel.tsx` — Drop target for hand cards (onActivateCard); border glow + `drop-zone-glow` CSS animation when card being dragged; extracted `EffectRow` sub-component with pointer-event-based horizontal dismiss gesture (grab → drag → release outside → strikethrough → remove); drag handle (⋮⋮) on hover; respects `useReducedMotion()` for dismiss delay
- [x] `AlliesPanel.tsx` — Each ally chip is a drop target for deck cards; `bestowToAlly` on drop, rejects `isSpecialCost` cards; ambient + active ring highlights
- [x] `CombatHUD.tsx` — Passes `onActivateCard={handleActivateCard}` to ActiveEffectsPanel
- [x] `index.css` — Added `effect-dismiss` (strikethrough → fade → collapse) and `drop-zone-glow` (pulsing accent glow) keyframes; added both to `.reduce-motion` and `@media (prefers-reduced-motion)` blocks
- [x] 19 new tests: 1 settingsStore, 1 SettingsModal, 4 SelectedDeck (draggable, While Selected blocked, special cost blocked, drag data), 5 HandArea (drop bestow, auto-activate, draggable, special cost blocked, setting off), 5 ActiveEffectsPanel (drop activate, wrong source rejected, drag handle, dismiss outside, cancel inside), 3 AlliesPanel (drop bestow, special cost blocked, hand rejected)
- [x] All exit conditions met: build passes, lint passes, 445 tests green

### Phase 7A: Core Animations
- [x] `useReducedMotion.ts` — Hook combining `settingsStore.reducedMotion`, `!animationsEnabled`, and `prefers-reduced-motion` media query; defensive `matchMedia` check for jsdom environments
- [x] `useAnimatedNumber.ts` — Hook that smoothly interpolates displayed numbers toward target using requestAnimationFrame with ease-out cubic easing; respects reduced motion
- [x] `index.css` — Added 3 new keyframe animations: `card-enter` (slide-in from left), `pip-fill` (scale+glow pulse), `pip-drain` (shrink+fade); `.reduce-motion` class disables all animations; `@media (prefers-reduced-motion)` fallback
- [x] `App.tsx` — Applies `.reduce-motion` class to root div when `useReducedMotion()` returns true
- [x] `HandArea.tsx` — Tracks entering cards via ref comparison; new cards get `card-enter` CSS animation (300ms slide+fade); updated transition to `duration-300 ease-out`
- [x] `FocusCounter.tsx` — Uses `useAnimatedNumber(focus, 400)` for smooth count-up/down; aria-label reads true value
- [x] `EchoPointsBar.tsx` — Uses `useAnimatedNumber(currentEP, 300)` for numeric display; added `ease-out` to fill bar transition
- [x] `EchoManifoldDeck.tsx` — Mote pips get `pip-fill`/`pip-drain` CSS animation on state change; uses React's "adjust state from previous renders" pattern (setState during render, not in effect)
- [x] `SiphonCapacitanceTracker.tsx` — Capacitance pips get `pip-fill`/`pip-drain` animations; same pattern as motes
- [x] `setupTests.ts` — Added `window.matchMedia` mock for jsdom
- [x] All exit conditions met: build passes, lint passes, 426 tests green

### Post-Phase 6 Audit
- [x] **Bug Fix**: AllyBestowmentView now uses stored `isFromSelectedDeck` flag instead of re-deriving from `selectedCardIds` (which misclassified hand cards)
- [x] **Bug Fix**: Removed dead `onMouseLeave` handlers from AllyBestowmentView's full-screen backdrop
- [x] **Bug Fix**: HandArea now shows `isUnplayable` styling + "Cannot bestow to allies" label on special-cost cards when ally is selected
- [x] **Refactor**: Extracted `FEATURE_MAP`, `TRIGGERED_FEATURE_IDS`, `WHILE_SELECTED_FEATURE_IDS` to `src/data/featureConstants.ts` — eliminated 3× TRIGGERED_FEATURE_IDS and 5× featureMap duplicates across components and store
- [x] **Cleanup**: Removed dead types `BestowedFeature` and `ActivationResult` from siphonFeature.ts (defined but never imported)
- [x] **Cleanup**: Removed deprecated `activateFromHand` from siphonStore — `performActivation` now calls `returnCardToDeck` directly; consolidated duplicate tests
- [x] All changes verified: build passes, lint passes, 425 tests green

### Phase 6B: AllyBestowmentView Overlay
- [x] `AllyBestowmentView.tsx` — Full-screen overlay showing ally's bestowed cards: "Viewing: AllyName" header, two groups (From Selected Deck / From All Features) based on whether card is still in selectedCardIds, compact SiphonCard components with ally name badge, × remove button per card, backdrop click to dismiss
- [x] `AlliesPanel.tsx` — Added 500ms hover delay on ally chips via `onHoverAlly` prop; mouseEnter starts timer, mouseLeave cancels it; cleanup on unmount
- [x] `SiphonCard.tsx` — Added optional `allyName` prop; renders `→ AllyName` badge at bottom of card when provided
- [x] `CombatHUD.tsx` — Added `hoveredAllyId` state (independent from `selectedAllyId`), wired `onHoverAlly` to AlliesPanel, renders AllyBestowmentView overlay when hoveredAlly exists
- [x] Barrel export updated: `AllyBestowmentView` added to `combat-hud/index.ts`
- [x] 8 AllyBestowmentView tests: empty state, displays bestowed cards, groups into Selected/All Features sections, remove bestowment, only shows target ally, backdrop dismiss, ally name badge, From All Features only when no selected cards
- [x] 2 AlliesPanel hover tests: 500ms delay fires onHoverAlly, mouse leave before 500ms cancels timer
- [x] All Phase 6 exit conditions met: build passes, lint passes, 423 tests green

### Phase 6A: AlliesPanel + Bestow Flow
- [x] `AlliesPanel.tsx` — Ally chips with name, bestowed count badge, [+] add button (inline name input), pencil icon for rename, × icon for remove; click chip to select as bestow target (highlighted state)
- [x] `CombatHUD.tsx` — Replaced allies placeholder with AlliesPanel, added `selectedAllyId` state, passed to AlliesPanel and SelectedDeck
- [x] `SelectedDeck.tsx` — When ally selected as bestow target: click card bestows to ally via `bestowToAlly()`, deck stays open, ally deselects after bestow; special cost features blocked with "Cannot bestow to allies" label (RULE-ALLY-001); instruction text shown when ally is selected
- [x] Barrel export updated: `AlliesPanel` added to `combat-hud/index.ts`
- [x] 13 AlliesPanel tests: empty state, add ally, render chips, bestowed count, select/deselect target, highlight, remove (RULE-ALLY-002), rename, cancel rename, cancel add, clear selected on remove, empty name
- [x] 4 SelectedDeck bestow-to-ally tests: bestow to ally, block special cost (RULE-ALLY-001), ally instruction text, deck stays open
- [x] All exit conditions met: build passes, lint passes, 413 tests green

### 2026-02-21 — Phase 5C: While Selected Long Rest Mechanics
- Created `whileSelectedCalculator.ts`: `calculateWhileSelectedEffects(selectedCardIds, pb)` returns ordered effects for Supercapacitance (EP cost doubled when total > PB, focus = undoubled cost) and Siphon Greed (1d4 focus dice)
- Extended `siphonStore.longRest()` with optional `whileSelectedEffects` parameter: applies EP costs and focus gains after recovery, with focus doubling when EP is negative at time of gain
- Updated `LongRestDialog.tsx`: While Selected preview section shows Supercapacitance cost/focus and Siphon Greed dice; warning when Supercapacitance would push EP negative; completion summary shows While Selected EP cost and focus gained; macro mode supports both Focus d4 and Siphon Greed 1d4 inputs simultaneously
- Replaced MacroDisplay usage in LongRestDialog with inline macro UI to support multiple roll inputs (Focus d4 + Siphon Greed 1d4)
- 20 new tests: 7 whileSelectedCalculator utility, 5 siphonStore longRest While Selected, 8 LongRestDialog While Selected UI
- Total: 403 tests passing across 28 test files
- All exit conditions met: build passes, lint passes, 403 tests green
- **Next**: Phase 6 (Ally System)

### 2026-02-21 — Phase 5B: Timer + Overrides + Data
- Created `ManualOverrides.tsx`: number inputs with +/− buttons for EP, Focus, Motes, Hit Dice, Max HP Reduction; each calls appropriate store setter with clamping validation
- Created `DataManagement.tsx`: Export Data (JSON download), Import Data (file picker), Reset Session (EP→PB, Focus→0, motes→0, clear combat state), Clear All Data (confirmation required)
- Created `dataExport.ts` utility: `exportAllState()` (version 1 JSON with all 4 stores), `importAllState(json)` (validate + restore), `resetAllStores()`, `resetSession(pb)`
- Updated `SiphonCapacitanceTracker.tsx`: in-game time picker with 8 presets (Dawn/Morning/Midday/Afternoon/Dusk/Evening/Night/Midnight), ±1 hour arrow buttons, expiration display (current + 8 hours), Extend +8 hrs/Timer Expired/Clear action buttons; collapsible preset grid
- Added `siphonStore` fields: `capacitanceInGameTime`, `capacitanceExpiresAt`, `setCapacitanceTimer()`, `extendCapacitanceTimer()`, `resetSiphon()`
- Updated `SettingsModal.tsx`: added Manual Overrides and Data sections
- Updated barrel export `settings/index.ts` with ManualOverrides and DataManagement
- 36 new tests across 4 test files: 12 dataExport utility, 9 ManualOverrides, 6 DataManagement, 9 SiphonCapacitanceTracker
- Total: 383 tests passing across 27 test files
- All exit conditions met: build passes, lint passes, 383 tests green
- **Next**: Phase 5C (While Selected long rest mechanics)

### 2026-02-21 — Phase 5A: Settings Modal
- Created `DiceModeToggle.tsx`: reusable 3D/Macro toggle pair with accent color active state
- Created `SettingsModal.tsx`: modal overlay with 4 sections (Dice Rolls, Sound, Visual, Gameplay), Escape/backdrop/X close, immediate persistence via settingsStore
- Created `settings/index.ts`: barrel export
- Added gear icon (⚙) to CombatHUD header (right side, after rest buttons)
- Added gear icon (⚙) to DeckBuilder (absolute-positioned in CharacterHeader area)
- Skipped "Highlight drop targets when dragging" toggle — drag-drop is Phase 7, and phase spec says "DO NOT add settings for features not yet implemented"
- 15 new SettingsModal tests: section headings, all toggles render, dice mode toggle updates store, boolean toggle updates store (sound, animations, reduced motion, confirm, auto-surge, short rest effects), backdrop/X/Escape close, click inside doesn't close
- Total: 347 tests passing across 23 test files
- All exit conditions met: build passes, lint passes, 347 tests green
- **Next**: Phase 5B (Manual Overrides, Data Export/Import, Capacitance Timer)

### 2026-02-21 — Phase 4.5: Deck Builder + Routing
- Set up React Router: `createHashRouter` with 3 routes (`/` → HomeRedirect, `/combat` → CombatHUD, `/deck-builder` → DeckBuilder)
- Converted App.tsx to layout wrapper with `<Outlet />`, main.tsx to `RouterProvider`
- Created HomeRedirect: reads `selectedCardIds`, redirects to `/deck-builder` (empty) or `/combat` (has cards)
- Created DeckBuilder.tsx: flex column layout (CharacterHeader top, CollectionGrid scrollable center, SelectedPanel bottom)
- Created CharacterHeader.tsx: Level/Max HP number inputs, PB auto-calculated, EP Max = Level, Current Max HP with Echo Drain display
- Created CollectionGrid.tsx: renders all 42 SIPHON_FEATURES in responsive CSS grid, tag filter dropdown (All + sorted unique tags), name search input, click-to-toggle select, selected cards get `ring-2 ring-ep-positive` glow, PB limit via `selectCard(id, maxCards)`, Supercapacitance overflow (maxCards=42 when selected)
- Created SelectedPanel.tsx: compact SiphonCards in horizontal scroll, `Selected (N/PB)` counter with Supercapacitance `+M` overflow display, Short Rest/Long Rest buttons (reuse existing dialog components), Enter Combat button (`useNavigate` → `/combat`)
- Added "Deck Builder" nav button to CombatHUD header (left side, rest buttons right)
- Created barrel export: `deck-builder/index.ts`
- Fixed `tags` optional type issue in CollectionGrid (`f.tags?.includes()`)
- 32 new tests across 5 test files (8 CharacterHeader + 10 CollectionGrid + 8 SelectedPanel + 4 DeckBuilder + 2 HomeRedirect), total 332 tests passing
- All exit conditions met: build passes, lint passes, 332 tests green
- **Next**: Phase 5 (Settings & Polish)

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

