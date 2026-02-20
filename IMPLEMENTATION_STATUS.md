# Implementation Status

**Last Updated**: 2026-02-19
**Current Phase**: Pre-implementation (Planning Complete)

---

## Quick Status

| Area | Status | Notes |
|------|--------|-------|
| Design Document | ✅ Complete | DESIGN.md is comprehensive |
| Gap Analysis | ✅ Complete | GAP_ANALYSIS.md identifies all gaps |
| Store: Character | 🟡 Partial | Missing Hit Dice |
| Store: Siphon | 🟡 Needs Redesign | Missing Hand vs Selected Deck distinction |
| Store: Manifold | ✅ Good | Minor UI work needed |
| UI: Landing | ✅ Complete | Functional |
| UI: Deck Builder | 🟡 Partial | Missing rest buttons, Hit Dice display |
| UI: Combat View | 🔴 Major Rework | Layout doesn't match design |
| UI: Settings | 🔴 Not Started | Not implemented |
| Data: Features | ✅ Good | 37 features (verify if all 42 present) |
| Data: Manifold | ✅ Complete | 3 phases, 9 abilities |
| Data: Surge Table | ✅ Complete | 100 entries |

---

## Implementation Phases

### Phase 1: Store Redesign
**Status**: 🔴 Not Started
**Priority**: High — All UI work depends on this

| Task | Status | File |
|------|--------|------|
| Add Hit Dice to characterStore | 🔴 TODO | `src/store/characterStore.ts` |
| Add `spendHitDice()` method | 🔴 TODO | `src/store/characterStore.ts` |
| Add `restoreAllHitDice()` method | 🔴 TODO | `src/store/characterStore.ts` |
| Add `handCardIds` array | 🔴 TODO | `src/store/siphonStore.ts` |
| Add `allies` array | 🔴 TODO | `src/store/siphonStore.ts` |
| Add `allyBestowments` array | 🔴 TODO | `src/store/siphonStore.ts` |
| Add `activeEffects` array | 🔴 TODO | `src/store/siphonStore.ts` |
| Implement `bestowToSelf()` | 🔴 TODO | `src/store/siphonStore.ts` |
| Implement `bestowToAlly()` | 🔴 TODO | `src/store/siphonStore.ts` |
| Implement `activateFromHand()` | 🔴 TODO | `src/store/siphonStore.ts` |
| Card returns to Selected deck after activation | 🔴 TODO | `src/store/siphonStore.ts` |
| Update `longRest()` for new model | 🔴 TODO | `src/store/siphonStore.ts` |
| Update `shortRest()` for new model | 🔴 TODO | `src/store/siphonStore.ts` |

---

### Phase 2: Combat View Layout
**Status**: 🔴 Not Started
**Priority**: High

| Task | Status | File |
|------|--------|------|
| Create SelectedDeck component | 🔴 TODO | `src/components/combat-hud/SelectedDeck.tsx` |
| Create HandArea component | 🔴 TODO | `src/components/combat-hud/HandArea.tsx` |
| Create ActiveEffectsPanel component | 🔴 TODO | `src/components/combat-hud/ActiveEffectsPanel.tsx` |
| Create AlliesPanel component | 🔴 TODO | `src/components/combat-hud/AlliesPanel.tsx` |
| Revise CombatHUD layout | 🔴 TODO | `src/components/combat-hud/CombatHUD.tsx` |
| Implement Selected deck expand/collapse | 🔴 TODO | `src/components/combat-hud/SelectedDeck.tsx` |
| Implement drag card to Hand (bestow to self) | 🔴 TODO | - |
| Implement drag card to Ally (bestow to ally) | 🔴 TODO | - |
| Implement drag-to-dismiss for Active Effects | 🔴 TODO | `src/components/combat-hud/ActiveEffectsPanel.tsx` |
| Display phase abilities on left side | 🔴 TODO | `src/components/combat-hud/CombatHUD.tsx` |
| Add Hit Dice display to resources | 🔴 TODO | - |

---

### Phase 3: Activation Flow
**Status**: 🔴 Not Started
**Priority**: High

| Task | Status | File |
|------|--------|------|
| Create ActivationPanel component | 🔴 TODO | `src/components/combat-hud/ActivationPanel.tsx` |
| Implement card staging (drag/double-click to activate) | 🔴 TODO | - |
| Show cost preview in Activation Panel | 🔴 TODO | - |
| Implement macro mode (copy macro, manual input) | 🔴 TODO | - |
| Implement 3D dice mode toggle | 🔴 TODO | - |
| Show Warp warning when applicable | 🔴 TODO | - |
| Implement confirm/cancel flow | 🔴 TODO | - |
| Card returns to Selected deck on confirm | 🔴 TODO | - |

---

### Phase 4: Rest Mechanics
**Status**: 🔴 Not Started
**Priority**: Medium

| Task | Status | File |
|------|--------|------|
| Add Short Rest button to Combat View | 🔴 TODO | `src/components/combat-hud/CombatHUD.tsx` |
| Add Long Rest button to Combat View | 🔴 TODO | `src/components/combat-hud/CombatHUD.tsx` |
| Implement Short Rest dialog | 🔴 TODO | - |
| Implement Long Rest dialog | 🔴 TODO | - |
| Hit Dice spending for phase switch | 🔴 TODO | - |
| Hit Dice spending for Short Rest healing | 🔴 TODO | - |
| Effect clearing toggle for Short Rest | 🔴 TODO | - |
| Verify Long Rest mechanics match DESIGN.md | 🔴 TODO | - |

---

### Phase 5: Settings & Polish
**Status**: 🔴 Not Started
**Priority**: Medium

| Task | Status | File |
|------|--------|------|
| Create SettingsModal component | 🔴 TODO | `src/components/settings/SettingsModal.tsx` |
| Add dice roll mode toggles | 🔴 TODO | - |
| Add sound toggle | 🔴 TODO | - |
| Add visual toggles (animations, reduced motion) | 🔴 TODO | - |
| Add gameplay toggles | 🔴 TODO | - |
| Add manual override controls | 🔴 TODO | - |
| Implement Export/Import | 🔴 TODO | - |
| Implement Reset Session | 🔴 TODO | - |
| Add settings gear to header | 🔴 TODO | - |

---

### Phase 6: Ally Bestowment View
**Status**: 🔴 Not Started
**Priority**: Medium

| Task | Status | File |
|------|--------|------|
| Create AllyBestowmentView overlay | 🔴 TODO | `src/components/combat-hud/AllyBestowmentView.tsx` |
| Show ally's bestowed cards | 🔴 TODO | - |
| Cards from Selected deck (left) | 🔴 TODO | - |
| Cards from All Features (right) | 🔴 TODO | - |
| Silvery tendril effect | 🔴 TODO | - |
| Click ally name to edit bestowments | 🔴 TODO | - |
| Drag card away to remove bestowment | 🔴 TODO | - |

---

### Phase 7: Polish & Animations
**Status**: 🔴 Not Started
**Priority**: Low

| Task | Status | File |
|------|--------|------|
| Card flip animations | 🔴 TODO | - |
| Card movement animations | 🔴 TODO | - |
| Dice roll animations (if 3D mode) | 🔴 TODO | - |
| Resource counter animations | 🔴 TODO | - |
| Mote fill/empty animations | 🔴 TODO | - |
| Phase transition animations | 🔴 TODO | - |
| Glitch effects for negative EP | 🟡 Partial | `src/index.css` |
| "Weavers watching" effect at high Focus | 🟡 Partial | `src/index.css` |

---

## Completed Items

### Documentation
- [x] DESIGN.md — Comprehensive UI/UX specification
- [x] GAP_ANALYSIS.md — Current vs target comparison
- [x] CLAUDE.md — AI session guidance
- [x] ARCHITECTURE.md — Technical overview
- [x] IMPLEMENTATION_STATUS.md — This file

### Infrastructure
- [x] Vite + React + TypeScript setup
- [x] Tailwind CSS v4 configuration
- [x] Zustand stores (basic structure)
- [x] React Router configuration
- [x] Custom color palette in CSS

### Data
- [x] 37 Siphon Features transcribed (verify if complete)
- [x] Echo Manifold phases and abilities
- [x] Wild Echo Surge table (100 entries)
- [x] Type definitions for all data

### Components (Existing, May Need Revision)
- [x] LandingPage
- [x] GlitchButton
- [x] DeckBuilder
- [x] CharacterSetup
- [x] FilterControls
- [x] SelectionSummary
- [x] SiphonCard
- [x] CombatHUD (needs major revision)
- [x] EchoPointsBar
- [x] FocusCounter
- [x] SiphonCapacitanceTracker
- [x] ActiveCardHand (needs revision)
- [x] EchoManifold
- [x] PhaseSelector
- [x] MoteTracker
- [x] ManifoldAbilityCard
- [x] SurgeTableModal

---

## Known Issues / Blockers

| Issue | Impact | Resolution |
|-------|--------|------------|
| Store model doesn't support Hand vs Selected deck | Blocks Phase 2 UI | Complete Phase 1 first |
| No Hit Dice tracking | Blocks phase switch cost, short rest | Add to characterStore |
| Feature count may be incomplete | Minor | Verify against PDF |

---

## Session Log

### 2026-02-19 — Initial Planning Session
- Created comprehensive DESIGN.md with all UI/UX specifications
- Identified gaps between current code and design
- Created GAP_ANALYSIS.md documenting all discrepancies
- Created supporting documentation (CLAUDE.md, ARCHITECTURE.md, this file)
- **Next**: Begin Phase 1 (Store Redesign)

---

## Notes for Next Session

1. **Start with Phase 1** — Store changes are foundational
2. **characterStore first** — Simpler changes, good warm-up
3. **siphonStore is complex** — Take time to understand current bestow logic before revising
4. **Test store changes** — Verify with console/devtools before building UI
5. **Refer to DESIGN.md** — It's the source of truth for expected behavior
