# Claude Code Instructions for The Siphon Interface

This file is automatically read by Claude Code at the start of each session. It contains project-specific guidance to help you work effectively on this codebase.

## Project Summary

**The Siphon Interface** is a companion web app for the "Siphon Wielder" D&D 5E homebrew feature. It manages complex resource systems (Echo Points, Focus, Motes, Hit Dice) so the player can focus on tactical decisions rather than bookkeeping.

**Tech Stack**: React 19 + TypeScript + Vite + Tailwind CSS v4 + Zustand + React Router 7

**Aesthetic**: Dark, atmospheric card game (Inscryption/Slay the Spire inspired). No bright colors. Cards have no illustrations—typography and iconography only.

---

## Critical Concept: Select → Bestow → Activate

This three-step flow is fundamental to the entire UI. **Do not conflate these steps.**

1. **Select** (Long Rest): Player chooses up to PB features → they go into the **Selected deck**
2. **Bestow** (Combat, costs Action + Touch): Grant a Selected feature to self (→ **Hand**) or ally
3. **Activate** (Feature's activation): Use the feature's effect, pay EP, gain Focus → card **returns to Selected deck**

### Key Implications
- The **Hand** contains ONLY cards bestowed to self, NOT all selected cards
- After Activation, cards go back to the Selected deck (must re-Bestow to use again)
- **Triggered** features are always considered bestowed to self while Selected
- For allies: Triggered features are removed entirely after Activation; Duration features can be re-Bestowed

---

## Source of Truth Hierarchy

1. **DESIGN.md** — UI/UX specification, interaction flows, visual design
2. **Source PDFs** (`source/` directory) — Game mechanics, feature data, surge table
3. **GAP_ANALYSIS.md** — Differences between current code and DESIGN.md
4. **IMPLEMENTATION_STATUS.md** — What's done, what's in progress, what's next

When in doubt, re-read DESIGN.md. The code should match the design, not the other way around.

---

## Key Files

### Stores (State Management)
- `src/store/characterStore.ts` — Character stats, level, HP, Hit Dice
- `src/store/siphonStore.ts` — EP, Focus, Capacitance, card selection, bestowments
- `src/store/manifoldStore.ts` — Echo Manifold phases, motes, abilities

### Data
- `src/data/siphonFeatures.ts` — All 42 Siphon Features with costs, focus dice, warp effects
- `src/data/echoManifold.ts` — 3 phases, 9 abilities, passive effects
- `src/data/wildEchoSurgeTable.ts` — 100 surge effects with 3 severity columns

### Types
- `src/types/siphonFeature.ts` — SiphonFeature, BestowedFeature, CostType, DurationType
- `src/types/echoManifold.ts` — ManifoldPhase, ManifoldAbility
- `src/types/activeEffect.ts` — ActiveEffect for tracking active effects on self

### Key Components
- `src/components/combat-hud/CombatHUD.tsx` — Main combat interface
- `src/components/deck-builder/DeckBuilder.tsx` — Long rest card selection
- `src/components/cards/SiphonCard.tsx` — Reusable card component

---

## Common Mistakes to Avoid

### 1. Conflating Selected Deck and Hand
**Wrong**: Showing all selected cards as "in hand"
**Right**: Selected deck = not yet bestowed; Hand = bestowed to self only

### 2. Cards Not Returning After Activation
**Wrong**: Card stays available after activation
**Right**: After Activation, card returns to Selected deck (must Bestow again)

### 3. Wrong Long Rest Mechanics
**Wrong**: EP resets to PB, Focus clears to 0
**Right**: EP regains PB (up to max, which = Level), Focus reduced by d4 roll

### 4. Wrong Warp Trigger Timing
**Wrong**: Warp triggers if EP is negative before spending
**Right**: Warp triggers if EP is negative AFTER deducting the cost

### 5. Tracking Ally Effects in Active Effects Panel
**Wrong**: Active Effects panel shows effects on allies
**Right**: Active Effects panel tracks SELF only; allies tracked in Allies panel

### 6. Adding Illustrations to Cards
**Wrong**: Cards with artwork/images
**Right**: Typography and iconography only — no illustrations

### 7. Using Real-Time Countdowns
**Wrong**: Countdown timers showing remaining duration
**Right**: Total duration display only (e.g., "10 min"), no countdown

---

## Color Palette (Use These Exact Values)

| Element | Hex | Tailwind Class |
|---------|-----|----------------|
| EP Positive | `#00d4aa` | `text-ep-positive`, `bg-ep-positive` |
| EP Negative | `#ff4466` | `text-ep-negative`, `bg-ep-negative` |
| Focus | `#7a42e0` | `text-focus`, `bg-focus` |
| Warp | `#d119d1` | `text-warp`, `bg-warp` |
| Capacitance | `#ffbb33` | `text-capacitance`, `bg-capacitance` |
| Card Border | `#4e4a50` | `border-siphon-border` |
| Background | `#161418` | `bg-siphon-bg` |

---

## Variable Cost Types

Features can have these cost formats:
- Fixed number: `5`
- `PB` — Proficiency Bonus
- `Twice PB` or `2x PB` — Double Proficiency Bonus
- `Level` — Character level
- `Level/2` — Half level, rounded up
- `Varies` — User chooses
- `0` — No cost
- Number with `*` — Special Cost (cannot bestow to allies)

## Variable Focus Dice

- `[PB]d8` — Roll PB number of d8s
- `[Cost]d8` — Roll dice equal to Cost paid
- `[Cost/2]d8` — Roll dice equal to half Cost
- `[Cost]` — Gain Focus equal to Cost (no dice)

---

## Testing Checklist

Before marking work complete, verify:

- [ ] `npm run build` succeeds with no errors
- [ ] `npm run lint` passes (or only has pre-existing warnings)
- [ ] UI matches DESIGN.md layout and behavior
- [ ] State persists correctly in localStorage
- [ ] Card flow follows Select → Bestow → Activate correctly

---

## Session Handoff Protocol

Before ending a session:

1. Update `IMPLEMENTATION_STATUS.md` with:
   - What was completed
   - What's currently in progress
   - Any blockers or decisions needed
2. If you created new components, add them to ARCHITECTURE.md
3. Commit changes with descriptive message (if user requests)

---

## Asking for Clarification

If DESIGN.md is ambiguous about something, check:
1. Source PDFs in `source/` directory
2. GAP_ANALYSIS.md for known issues
3. Ask the user — they're the DM who created this homebrew

---

## FoundryVTT Integration

The app supports two dice modes (configurable per roll type):
- **Macro Mode**: Generate FoundryVTT-compatible macros for copy/paste
- **3D Dice Mode**: In-app dice rolling with physics animation

Default: Wild Surge uses 3D dice; all other rolls use Macro mode.

FoundryVTT URL: `https://foundry.jamesburns.cc`
