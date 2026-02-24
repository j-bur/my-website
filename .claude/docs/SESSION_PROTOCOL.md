# Session Protocol

Every AI session working on this project must follow this protocol. No exceptions.

---

## At Session Start (MANDATORY)

### 1. Identify Your Feature

Determine which feature you're working on and read its `CLAUDE.md`:

| Feature | CLAUDE.md | Phase Specs | Tracking |
|---------|-----------|-------------|----------|
| Siphon | `src/siphon/CLAUDE.md` | `.claude/docs/siphon/PHASE_SPECS/` | `docs/siphon/IMPLEMENTATION_STATUS.md`, `docs/siphon/BACKLOG.md` |
| Landing | `src/landing/CLAUDE.md` | `.claude/docs/landing/PHASE_SPECS/` | `docs/landing/IMPLEMENTATION_STATUS.md`, `docs/landing/BACKLOG.md` |

**Phase work**: Read the phase spec file for your assigned phase.
**Backlog work**: Read the feature's `BACKLOG.md` and identify the item(s) the user wants addressed. If none specified, suggest the highest-priority open items.

If neither a phase nor backlog items are assigned, ask the user what to work on.

### 2. Check Entry Gate

Every phase spec has Entry Conditions. Verify each one. If ANY condition fails, **STOP and report to the user**. Do not attempt workarounds.

### 3. Read Session Context

- Read the feature's `IMPLEMENTATION_STATUS.md` for what previous sessions completed
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

If you discover a bug or gap **outside your current work**:
1. For phase work: add to the feature's `IMPLEMENTATION_STATUS.md` under "Discovered Issues":
   ```
   - [DISCOVERY] <description> (found during Phase N, relevant to Phase M)
   ```
2. For any work: add new items to the feature's `BACKLOG.md` with appropriate `P#`, Size, and ID (use next available ID in that category).
3. **Do NOT fix out-of-scope items** — mention them in your session summary.

### Checkpoint Commits

After completing a logical sub-unit, suggest a checkpoint commit to the user. Format:
```
<feature> Phase N.X: <brief description of what was completed>
```

---

## At Session End (MANDATORY)

### 1. Run Full Verification

```bash
npm run build && npm run lint && npm run test
```
All must pass. If `npm run test` has no tests for your feature, skip that check.

### 2. Update Tracking Documents

Update the feature's tracking docs (see the feature's `CLAUDE.md` for which docs to update):
- **`IMPLEMENTATION_STATUS.md`**: Mark completed tasks, add discovered issues, write "Next Session" instructions, log what was done
- **`BACKLOG.md`**: Mark resolved items `[x]`, items in progress `[~]`, add investigation notes as sub-bullets, add any newly discovered items

### 3. Update Architecture / Feature Docs

If you created new components or modules, update the feature's architecture documentation (referenced in its `CLAUDE.md`).

### 4. Summarize to User

Tell the user:
- What was completed
- What remains in this phase (if splitting across sessions)
- Any decisions or blockers for the next session
- Any discovered issues from other phases

---

## What NOT to Do

- Do not modify files outside your phase's scope
- Do not add dependencies not specified in your phase spec
- Do not refactor code that is working correctly unless your phase requires it
- Do not skip the entry gate check
- Do not skip the exit verification
- Do not create documentation files unless specified in your phase
