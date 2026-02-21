# Session Protocol

Every AI session working on The Siphon Interface must follow this protocol. No exceptions.

---

## At Session Start (MANDATORY)

### 1. Identify Your Phase
Read the phase spec file for your assigned phase:
```
.claude/docs/PHASE_SPECS/phase-N-*.md
```
If no phase is assigned, ask the user which phase to work on.

### 2. Check Entry Gate
Every phase spec has Entry Conditions. Verify each one. If ANY condition fails, **STOP and report to the user**. Do not attempt workarounds.

### 3. Read Session Context
- Read `IMPLEMENTATION_STATUS.md` for what previous sessions completed
- Check the "Discovered Issues" section for anything relevant to your phase
- Check the "Next Session" instructions at the bottom

### 4. Run Verification
```bash
npm run build && npm run lint
```
If either fails, **STOP and report**. Do not proceed with a broken build.

If tests exist:
```bash
npm run test
```
If any test fails, **STOP and report**. Do not proceed with failing tests.

### 5. Announce Scope
State explicitly to the user:
- What you **will** do this session
- What you **will not** do (reference the phase's "Out of Scope" section)

---

## During Session

### Work Incrementally
1. Complete one file or one logical change before moving to the next
2. Run `npm run build` after modifying any `.ts` or `.tsx` file
3. Run relevant tests after each change (if tests exist for that area)

### No Scope Creep
If you discover a bug or gap **outside your current phase**:
1. Add it to `IMPLEMENTATION_STATUS.md` under "Discovered Issues":
   ```
   - [DISCOVERY] <description> (found during Phase N, relevant to Phase M)
   ```
2. **Do NOT fix it**
3. Mention it in your session summary

### Checkpoint Commits
After completing a logical sub-unit, suggest a checkpoint commit to the user. Format:
```
Phase N.X: <brief description of what was completed>
```

---

## At Session End (MANDATORY)

### 1. Run Full Verification
```bash
npm run build && npm run lint && npm run test
```
All three must pass. If `npm run test` doesn't exist yet (pre-Phase 0), skip it.

### 2. Update IMPLEMENTATION_STATUS.md
- Mark completed tasks with checkmarks
- Add any discovered issues
- Write "Next Session" instructions
- Log what was done in the Session Log

### 3. Update ARCHITECTURE.md
If you created new components, add them to the component hierarchy.

### 4. Summarize to User
Tell the user:
- What was completed
- What remains in this phase (if splitting across sessions)
- Any decisions or blockers for the next session
- Any discovered issues from other phases

---

## Source of Truth Hierarchy

When in doubt about how something should work:

1. **DESIGN.md** -- UI/UX specification, interaction flows, visual design
2. **Source PDFs** (`source/` directory) -- Game mechanics, feature data
3. **.claude/docs/RULES.md** -- Machine-readable behavioral rules
4. **.claude/docs/STORE_CONTRACTS.md** -- Store interfaces and invariants
5. **.claude/docs/SPECIAL_CASES.md** -- Feature-specific edge cases

The code should match the design, not the other way around.

---

## What NOT to Do

- Do not modify files outside your phase's scope
- Do not add dependencies not specified in your phase spec
- Do not refactor code that is working correctly unless your phase requires it
- Do not skip the entry gate check
- Do not skip the exit verification
- Do not create documentation files unless specified in your phase
- Do not add illustrations or images to cards (typography and iconography only)
- Do not implement real-time countdown timers (display total duration only)
- Do not treat all bestows as Action + Touch (Superconduction is different)
