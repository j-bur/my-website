# Claude Code Instructions for The Siphon Interface

**The Siphon Interface** — D&D 5E companion web app for the Siphon Wielder homebrew feature.
**Tech Stack**: React 19 + TypeScript + Vite + Tailwind CSS v4 + Zustand + React Router 7
**Aesthetic**: Dark, atmospheric card game. No bright colors. Cards have no illustrations — typography and iconography only.

---

## Before You Start

Read `.claude/docs/SESSION_PROTOCOL.md` for mandatory start/end procedures. Read the phase spec for your assigned phase in `.claude/docs/PHASE_SPECS/`.

---

## Three Critical Rules

### 1. Select -> Bestow -> Activate (Do NOT conflate these steps)
- **Select** (Long Rest): Choose up to PB features -> Selected Deck
- **Bestow** (Combat): Grant a Selected feature to self (-> Hand) or ally
- **Activate** (Feature's activation): Pay EP, gain Focus -> card **returns to Selected Deck**
- **Hand** = ONLY cards bestowed to self. NOT all selected cards.

### 2. Warp Triggers AFTER Cost Deduction
Warp triggers if EP is negative **after** deducting the cost, not before. If EP was already -2 and you spend 3, warp triggers because -5 < 0.

### 3. Focus Doubles When EP is Negative
Focus gain is doubled whenever EP is negative at the time of the roll.

---

## Source of Truth

1. **DESIGN.md** — UI/UX specification (primary source)
2. **Source PDFs** (`source/`) — Game mechanics, feature data
3. **`.claude/docs/RULES.md`** — Machine-readable verification criteria
4. **`.claude/docs/STORE_CONTRACTS.md`** — Store interfaces and invariants
5. **`.claude/docs/SPECIAL_CASES.md`** — Feature-specific edge cases
6. **`.claude/docs/CARD_LIFECYCLE.md`** — Full Select/Bestow/Activate flow

The code should match the design, not the other way around.

---

## Color Palette

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

## Testing Checklist

Before marking work complete:
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] `npm run test` passes (if tests exist)
- [ ] Card flow follows Select -> Bestow -> Activate correctly

---

## Session Handoff

Before ending a session:
1. Update `IMPLEMENTATION_STATUS.md` (completed tasks, discovered issues, next session)
2. Update `ARCHITECTURE.md` if new components were created
3. Summarize to user: what was done, what remains, decisions needed

See `.claude/docs/SESSION_PROTOCOL.md` for the full protocol.

---

## Reference Documentation (read on demand, not preloaded)

| Document | Contents |
|----------|----------|
| `.claude/docs/RULES.md` | GIVEN/WHEN/THEN verification rules for tests |
| `.claude/docs/CARD_LIFECYCLE.md` | State diagrams for card flow |
| `.claude/docs/STORE_CONTRACTS.md` | Full store interfaces, cost types, focus dice |
| `.claude/docs/SPECIAL_CASES.md` | Superconduction, Manifestation, Echo Intuition, Siphon Greed, FoundryVTT |
| `.claude/docs/SESSION_PROTOCOL.md` | Mandatory session start/end procedures |
| `.claude/docs/PHASE_SPECS/` | One spec per implementation phase (0-7) |
