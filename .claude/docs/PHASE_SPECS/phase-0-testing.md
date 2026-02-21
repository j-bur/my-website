# Phase 0: Testing Infrastructure

## Goal
Set up Vitest and write tests for existing utility functions. Establish the test runner that all future phases depend on.

## Sessions: 1

---

## Entry Conditions
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes

## Exit Conditions
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] `npm run test` passes with 15+ green test cases
- [ ] Tests cover: cost resolution (PB, Level, Level/2, Twice PB, Varies), EP spend/recovery, focus gain with doubling, dice notation parsing, duration parsing

---

## Tasks

### 1. Install test dependencies
Add as devDependencies:
- `vitest`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `jsdom`

Add scripts to `package.json`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

### 2. Create vitest config
File: `vitest.config.ts`
- Use jsdom environment
- Include `src/**/*.test.ts` and `src/**/*.test.tsx`
- Set up path aliases matching `tsconfig.json`

### 3. Write utility tests

**`src/utils/__tests__/costCalculator.test.ts`**
Test `resolveCost()` with:
- Fixed number (5 -> 5)
- PB (with pb=3 -> 3)
- Twice PB (with pb=3 -> 6)
- Level (with level=5 -> 5)
- Level/2 (with level=5 -> 3, rounds up)
- Varies (returns input or 0)
- 0 (-> 0)
- Special cost marker (`*`)

**`src/utils/__tests__/echoPointUtils.test.ts`**
Test against RULES.md:
- RULE-EP-001: EP goes negative
- RULE-EP-002: Warp triggers after deduction
- RULE-EP-003: Warp triggers when already negative
- RULE-EP-004: Warp does not trigger when non-negative
- RULE-EP-005: Echo Drain at -Level
- RULE-EP-006: EP recovery capped
- RULE-EP-007: Long Rest recovery = PB
- RULE-EP-008: Long Rest does not exceed max

**`src/utils/__tests__/focusCalculator.test.ts`**
Test against RULES.md:
- RULE-FOCUS-001: Doubled when negative
- RULE-FOCUS-002: Not doubled when non-negative
- Long rest reduction (d4 min 0)

**`src/utils/__tests__/diceRoller.test.ts`**
Test `rollFromNotation()`:
- Simple notation: "2d8"
- PB substitution: "[PB]d8" with pb=3
- Cost substitution: "[Cost]d8" with cost=5
- Cost/2 substitution: "[Cost/2]d8" with cost=6
- Direct value: "[Cost]" returns cost directly
- Edge cases: 0 dice, 1 die

**`src/utils/__tests__/durationParser.test.ts`**
Test duration parsing:
- "10 minutes" -> 600000ms
- "1 hour" -> 3600000ms
- "8 hours" -> 28800000ms
- "1 minute" -> 60000ms
- Null/undefined -> null

---

## Files to Create
- `vitest.config.ts`
- `src/utils/__tests__/costCalculator.test.ts`
- `src/utils/__tests__/echoPointUtils.test.ts`
- `src/utils/__tests__/focusCalculator.test.ts`
- `src/utils/__tests__/diceRoller.test.ts`
- `src/utils/__tests__/durationParser.test.ts`

## Files to Modify
- `package.json` (devDependencies + scripts)

## Out of Scope
- Component tests (Phase 2+)
- Store tests (Phase 1)
- Modifying any existing source code
- Adding test IDs to components
