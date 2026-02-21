# Gap Analysis: Current Implementation vs DESIGN.md

This document identifies discrepancies between the current codebase and the DESIGN.md specification. Use this as a roadmap for bringing the implementation into alignment.

---

## Summary

| Category | Status | Priority |
|----------|--------|----------|
| Store: Character | Partial | High |
| Store: Siphon | Significant gaps | High |
| Store: Manifold | Good | Medium |
| Types | Good | Low |
| Data | Complete (42/42 features verified) | Low |
| UI: Deck Builder | Minor gaps | Medium |
| UI: Combat View | Major rework needed | High |
| UI: Settings | Not implemented | Medium |

---

## 1. Character Store (`src/store/characterStore.ts`)

### Current State
```typescript
interface CharacterStore {
  name: string;
  level: number;
  proficiencyBonus: number;
  maxHP: number;
  currentHP: number;
  reducedMaxHP: number;  // From Echo Drain
  spellSaveDC: number;
}
```

### Missing per DESIGN.md

| Gap | Design Requirement | Priority |
|-----|-------------------|----------|
| **Hit Dice tracking** | `hitDice: number` (current), `maxHitDice: number` (= level) | High |
| **Hit Dice methods** | `spendHitDice(amount)`, `restoreHitDice()` | High |

### Required Changes
```typescript
// Add to CharacterStore interface:
hitDice: number;           // Current available
maxHitDice: number;        // = level

// Add methods:
spendHitDice: (amount: number) => boolean;
restoreAllHitDice: () => void;  // On long rest
```

---

## 2. Siphon Store (`src/store/siphonStore.ts`)

### Current State
```typescript
interface SiphonStore {
  currentEP: number;
  focus: number;
  siphonCapacitance: number;
  capacitanceTimerStart: number | null;
  selectedCardIds: string[];           // Cards chosen at long rest
  bestowedFeatures: BestowedFeature[];  // All bestowed (self + allies)
}
```

### Critical Conceptual Gap

**DESIGN.md defines a three-step flow:**
1. **Select** (Long Rest): Choose cards → they go into "Selected deck"
2. **Bestow** (Combat): Grant a Selected feature to self (→ Hand) or ally
3. **Activate**: Use the feature, then it **returns to Selected deck**

**Current implementation conflates these:**
- `selectedCardIds` = correct (cards chosen at long rest)
- `bestowedFeatures` = tracks bestowments but doesn't distinguish self vs allies properly
- **Missing**: Concept of "Hand" (cards bestowed to self, separate from Selected deck)
- **Missing**: Cards returning to Selected deck after activation

### Missing per DESIGN.md

| Gap | Design Requirement | Priority |
|-----|-------------------|----------|
| **Hand vs Selected deck** | Features bestowed to self should be in a separate "hand" state | High |
| **Cards return after activation** | After Activating a card, it returns to Selected deck (must re-Bestow) | High |
| **Triggered features auto-bestowed** | Triggered features are always bestowed to self while Selected | Medium |
| **Ally tracking** | Named allies with proper tracking (currently uses 'ally' placeholder) | High |
| **Ally names storage** | `allies: { id: string, name: string }[]` | High |
| **Ally bestowment source tracking** | Track if bestowed card came from Selected deck or was non-Selected | Medium |
| **Short rest effects clearing** | Toggle to clear effects < 1 hour | Medium |

### Required Changes

```typescript
// Revise state model:
interface SiphonStore {
  currentEP: number;
  focus: number;
  siphonCapacitance: number;
  capacitanceTimerStart: number | null;

  // Card Management - REVISED
  selectedCardIds: string[];              // Cards in Selected deck (chosen at long rest)
  handCardIds: string[];                  // Cards bestowed to self (in hand)

  // Ally Management - NEW
  allies: Ally[];                         // Named ally slots
  allyBestowments: AllyBestowment[];      // What's bestowed to each ally

  // Active Effects - track self only
  activeEffects: ActiveEffect[];          // Effects currently active on self
}

interface Ally {
  id: string;
  name: string;
}

interface AllyBestowment {
  allyId: string;
  featureId: string;
  isFromSelectedDeck: boolean;  // false if bestowed from "All Features"
  isTriggered: boolean;
}

// Key behavior changes:
// 1. bestowToSelf(featureId) → moves card from selectedCardIds to handCardIds
// 2. activateFromHand(featureId) → processes activation, then moves card BACK to selectedCardIds
// 3. For Triggered features: they stay in both selectedCardIds AND are considered bestowed to self
```

---

## 3. Manifold Store (`src/store/manifoldStore.ts`)

### Current State
Good foundation. Has phase switching, motes, overdrive, active abilities.

### Minor Gaps

| Gap | Design Requirement | Priority |
|-----|-------------------|----------|
| **Passive abilities display** | Each phase has passive text that should be prominently shown | UI concern |
| **Mote regain tracking** | "max 1/turn" rule not enforced | Low |

### Current State is Acceptable
The manifold store logic is largely correct. The main work is in the UI to display passive abilities prominently.

---

## 4. Types (`src/types/`)

### Current State
Well-defined types for SiphonFeature, BestowedFeature, ManifoldAbility, ActiveEffect.

### Minor Gaps

| Gap | Design Requirement | Priority |
|-----|-------------------|----------|
| **style property** | `style: 'standard' | 'inverted'` for card appearance | Low |
| **durationType enum** | Already exists, verify matches design | Low |

Types are in good shape. Changes will flow from store redesign.

---

## 5. Data (`src/data/siphonFeatures.ts`)

### Current State
37 features implemented with full data.

### Verification Needed

| Check | Design Requirement | Status |
|-------|-------------------|--------|
| **Feature count** | DESIGN.md says 42 features | Verify against PDF |
| **All cost types** | PB, 2x PB, Level, Level/2, Varies, 0 | ✓ Present |
| **All duration types** | Time-based, Triggered, While Selected, Permanent, Special | ✓ Present |
| **Warp effects** | All features with warp effects have them | Verify |

**Action**: Cross-reference `siphonFeatures.ts` against the Echo Siphon Features.pdf to ensure all 42 features are present.

---

## 6. UI: Deck Builder (`src/components/deck-builder/`)

### Current State
Functional deck builder with card selection, filtering, character setup.

### Gaps

| Gap | Design Requirement | Priority |
|-----|-------------------|----------|
| **Long Rest button** | Should be in Deck Builder with proper mechanics | Medium |
| **Short Rest button** | Design shows Short Rest button | Medium |
| **Hit Dice display** | Show current/max Hit Dice | Medium |
| **"Selected cards become Selected deck"** | Clarify this in UI messaging | Low |

### Current Behavior vs Design

**Current**: Click "Enter Combat" → goes to combat with selected cards
**Design**:
- Long Rest button: Regain PB EP (up to max), reduce Focus by d4, restore max HP, restore motes, restore Hit Dice, restore free phase switch, clear bestowments
- Selected cards become the "Selected deck" in Combat View

---

## 7. UI: Combat View (`src/components/combat-hud/`)

### Current State
Basic combat HUD with:
- Header with character info
- Resource displays (EP bar, Focus counter, Capacitance)
- Card hand (shows all selected cards directly)
- Echo Manifold toggle
- Wild Surge button

### Major Gaps (High Priority)

| Gap | Design Requirement | Current State |
|-----|-------------------|---------------|
| **Selected Deck visualization** | Face-down deck in bottom-left, click to expand | Not implemented |
| **Hand distinction** | Hand = only cards bestowed to self | Shows all selected cards |
| **Cards return to deck** | After activation, card returns to Selected deck | Cards stay available |
| **Activation Panel** | Staged card + side panel with cost preview, macro, confirm | Not implemented |
| **Active Effects panel** | Center panel with drag-to-dismiss, duration display | Not implemented |
| **Allies panel** | Collapsible row with named allies, bestowment UI | Basic placeholder |
| **Ally bestowment view** | Hover ally → show their bestowed cards with tendrils | Not implemented |
| **Phase abilities on left** | Three ability cards displayed on left side of table | Not in current layout |
| **Short Rest button** | Restore free phase switch, optional effect clearing | Not implemented |
| **Long Rest button** | Full rest mechanics in Combat View | Not implemented |

### Layout Comparison

**DESIGN.md Layout:**
```
┌────────────────────────────────────────────────────────────────┐
│  ╭─────────╮                                  ╭─────────╮      │
│  │ Phase   │                                  │  Wild   │      │
│  │  card   │                                  │  Surge  │      │
│  ╰─────────╯                                  ╰─────────╯      │
│   ○○○●●●●● (motes)                                             │
│                                                                │
│  [Phase Abilities]     [Active Effects]      [Resources]       │
│                                                                │
│  [Allies Panel]                                                │
│                                                                │
│  ╭─────────╮                                                   │
│  │Selected │   ╭─────┬────┬────┬────╮                          │
│  │  Deck   │   │  A  │ B  │ C  │ D  │  ← Hand                  │
│  ╰─────────╯   ╰─────┴────┴────┴────╯                          │
└────────────────────────────────────────────────────────────────┘
```

**Current Layout:**
- Vertical/card-based layout, not table-like
- No Selected Deck concept
- No spatial arrangement matching design

### Required Component Changes

1. **New: SelectedDeck.tsx** - Face-down deck, click to expand, show non-bestowed cards
2. **New: HandArea.tsx** - Fanned cards bestowed to self only
3. **New: ActiveEffectsPanel.tsx** - Drag-to-dismiss, effect list
4. **New: ActivationPanel.tsx** - Staged card, cost preview, macro/3D toggle, confirm
5. **New: AlliesPanel.tsx** - Named allies, hover to see bestowments
6. **Revise: CombatHUD.tsx** - Spatial layout matching design
7. **Revise: ActiveCardHand.tsx** - Rename/repurpose for Hand only

---

## 8. UI: Settings Modal

### Current State
Not implemented.

### Required per DESIGN.md

```
┌─────────────────────────────────────────────────────────────┐
│  ⚙ Settings                                                  │
├─────────────────────────────────────────────────────────────┤
│  DICE ROLLS                                                  │
│  Wild Echo Surge                        [■ 3D ] [ Macro ]    │
│  Siphon Feature rolls                   [ 3D ] [■ Macro ]    │
│  Phase Ability rolls                    [ 3D ] [■ Macro ]    │
│  Long Rest Focus reduction              [ 3D ] [■ Macro ]    │
│                                                              │
│  SOUND / VISUAL / GAMEPLAY toggles                           │
│  MANUAL OVERRIDES (EP, Focus, Motes, Hit Dice, Max HP)       │
│  DATA (Export/Import/Reset)                                  │
└─────────────────────────────────────────────────────────────┘
```

**Priority**: Medium - needed for macro vs 3D dice toggle

---

## 9. Missing Interactions

### Drag-to-Dismiss Active Effects
Design specifies horizontal drag outside panel to dismiss effects.
**Current**: No implementation.

### Bestow Flow
Design specifies:
1. Click Selected deck to expand
2. Drag card to hand (bestow to self) or ally name (bestow to ally)
3. Double-click = bestow to self

**Current**: Direct activate/bestow buttons on cards.

### Card Activation Flow
Design specifies:
1. Drag card from hand to Active Effects panel (or double-click)
2. Activation Panel appears with cost preview, macro
3. Enter result (if macro mode)
4. Confirm → EP deducted, Focus added, card returns to Selected deck

**Current**: Click "Activate" button, immediate processing.

---

## 7. Gaps Found in Documentation Audit (2026-02-20)

These additional gaps were identified by cross-referencing source PDFs against all documentation and code.

### Special Feature Interactions (Not Yet Tracked)

| Gap | Source | Impact |
|-----|--------|--------|
| **Superconduction bypasses bestow rules** | Echo Siphon Features PDF | Reaction + 60ft range + immediate self-activation. Needs special activation path in UI. |
| **Manifestation replaces itself** | Echo Siphon Features PDF | Removes itself from Selected deck and adds a different feature. Store needs `replaceSelectedCard(oldId, newId)`. |
| **Activation: None auto-activates on bestow** | Siphon Wielder PDF | EP cost and Focus roll happen immediately at bestow, no separate activate step. |
| **Echo Intuition halves both Cost AND Focus** | Echo Manifold PDF | Activation Panel must show modified values when Echo Intuition is active. |
| **Siphon Greed cost halving is conditional** | Echo Siphon Features PDF | Only applies while Siphon Greed is Selected — NOT a general Echo Drain mechanic. |

### Missing Validation

| Gap | Location | Fix |
|-----|----------|-----|
| **No Special Cost check in bestowFeature()** | `siphonStore.ts` line 171 | Add: `if (isSpecialCost && targetId !== 'self') return error` |

### Data Verification

| Item | Status |
|------|--------|
| Feature count | **42/42 verified** (all features present in `siphonFeatures.ts`) |
| Manifold abilities | 9/9 verified |
| Surge table entries | 100/100 verified |

---

## Implementation Priority Order

### Phase 1: Store Redesign (Foundation)
1. Add Hit Dice to characterStore
2. Redesign siphonStore with Hand vs Selected deck distinction
3. Add allies array and ally bestowment tracking
4. Implement "card returns to Selected deck after activation" logic

### Phase 2: Combat View Layout
1. Create spatial layout matching DESIGN.md
2. Implement SelectedDeck component (expandable)
3. Implement HandArea component (bestowed to self only)
4. Implement ActiveEffectsPanel with drag-to-dismiss
5. Implement AlliesPanel with bestowment view

### Phase 3: Activation Flow
1. Implement ActivationPanel component
2. Add macro mode support (copy macro, manual result entry)
3. Add 3D dice mode placeholder (can implement later)
4. Wire up confirmation flow

### Phase 4: Rest Mechanics
1. Add Short Rest button to Combat View
2. Ensure Long Rest button works per spec
3. Hit Dice spending on phase switch
4. Effect clearing toggles

### Phase 5: Settings & Polish
1. Implement Settings modal
2. Add all toggles per design
3. Manual override controls
4. Export/Import functionality

---

## Verification Checklist Template

For each component, verify against DESIGN.md:

### Selected Deck
- [ ] Displays as face-down deck in bottom-left
- [ ] Click expands cards above hand area
- [ ] Cards already in hand do NOT appear in expanded view
- [ ] Drag card to hand = Bestow to self
- [ ] Drag card to ally name = Bestow to ally
- [ ] Double-click = Bestow to self
- [ ] Escape/click outside collapses deck

### Hand
- [ ] Contains ONLY cards bestowed to self
- [ ] Cards fan out along bottom, overlapping
- [ ] Hovering raises card, shows full text
- [ ] Cards can be activated (drag to Active Effects or double-click)
- [ ] After activation, card returns to Selected deck

### Active Effects Panel
- [ ] Displays effects on SELF only (not allies)
- [ ] Shows: name, source, total duration, concentration indicator
- [ ] Phase abilities show phase name in parentheses
- [ ] Drag handle appears on hover
- [ ] Horizontal drag outside = dismiss effect
- [ ] Strikethrough animation on dismiss

### Allies Panel
- [ ] Collapsible row above hand
- [ ] Each ally is a named slot
- [ ] [+] button to add new ally
- [ ] Hover ally name (500ms) → shows their bestowed cards
- [ ] Cards come from Selected deck or All Features deck
- [ ] Silvery tendrils connect cards to ally name
- [ ] Click ally name to remove bestowments

---

## Files to Create

```
src/
├── components/
│   ├── combat-hud/
│   │   ├── SelectedDeck.tsx          # NEW
│   │   ├── HandArea.tsx              # NEW
│   │   ├── ActiveEffectsPanel.tsx    # NEW
│   │   ├── ActivationPanel.tsx       # NEW
│   │   ├── AlliesPanel.tsx           # NEW
│   │   └── CombatHUD.tsx             # MAJOR REVISION
│   └── settings/
│       └── SettingsModal.tsx         # NEW
```

## Files to Modify

```
src/store/characterStore.ts    # Add Hit Dice
src/store/siphonStore.ts       # Major redesign
src/types/activeEffect.ts      # May need updates
```

---

## Notes for AI-Assisted Development

1. **Work in phases** - Complete store changes before UI changes
2. **Verify each component** - Use the checklist template above
3. **DESIGN.md is source of truth** - When in doubt, re-read the design
4. **Don't over-engineer** - Implement exactly what's specified
5. **Test incrementally** - Verify store logic works before building UI on top
