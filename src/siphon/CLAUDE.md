# Echo Siphon — Feature Instructions

**The Siphon Interface** — D&D 5E companion web app for the Siphon Wielder homebrew feature.
**Aesthetic**: Dark, atmospheric card game. No bright colors. Cards have no illustrations — typography and iconography only.

**Current State**: Phase 8 complete (all sub-phases 8A-8D). All 4 stores, CombatHUD with 3-column sidebar layout (260px/1fr/260px), cards 200x280px, inline activation via drag-to-ActiveEffects (no modal), Grimoire in right sidebar navigates to Deck Builder. Check `docs/siphon/IMPLEMENTATION_STATUS.md` for the current phase and next steps.

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

1. **`docs/siphon/DESIGN.md`** — UI/UX specification (primary source)
2. **Source PDFs** (`source/`) — Game mechanics, feature data
3. **`.claude/docs/siphon/RULES.md`** — Machine-readable verification criteria
4. **`.claude/docs/siphon/STORE_CONTRACTS.md`** — Store interfaces and invariants
5. **`.claude/docs/siphon/SPECIAL_CASES.md`** — Feature-specific edge cases
6. **`.claude/docs/siphon/CARD_LIFECYCLE.md`** — Full Select/Bestow/Activate flow

The code should match the design, not the other way around.

---

## Siphon-Specific Testing

In addition to the project-wide testing checklist:
- [ ] Card flow follows Select -> Bestow -> Activate correctly

---

## Session Handoff (Siphon)

Before ending a session:
1. Update `docs/siphon/IMPLEMENTATION_STATUS.md` (phase work) or `docs/siphon/BACKLOG.md` (backlog work)
2. Update `docs/siphon/ARCHITECTURE.md` if new components were created

---

## Reference Documentation (read on demand, not preloaded)

| Document | Contents |
|----------|----------|
| `.claude/docs/siphon/RULES.md` | GIVEN/WHEN/THEN verification rules for tests |
| `.claude/docs/siphon/CARD_LIFECYCLE.md` | State diagrams for card flow |
| `.claude/docs/siphon/STORE_CONTRACTS.md` | Full store interfaces, cost types, focus dice |
| `.claude/docs/siphon/SPECIAL_CASES.md` | Superconduction, Manifestation, Echo Intuition, Siphon Greed, FoundryVTT |
| `.claude/docs/SESSION_PROTOCOL.md` | Mandatory session start/end procedures |
| `.claude/docs/siphon/PHASE_SPECS/` | One spec per implementation phase (0-8); Phase 8 has sub-phases 8A-8D |
| `docs/siphon/BACKLOG.md` | Prioritized bug reports, UX improvements, and feature requests from playtesting |
