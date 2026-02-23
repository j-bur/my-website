# Claude Code Instructions — jamesburns.cc

Personal website and tool suite. Deployed to Cloudflare Pages (static SPA) at jamesburns.cc, with GitHub Pages deployment from develop branch.

**Tech Stack**: React 19 + TypeScript + Vite + Tailwind CSS v4 + Zustand + React Router 7

---

## Project Structure

The codebase is organized by feature. Each feature has its own directory under `src/` with a scoped `CLAUDE.md` containing domain-specific instructions.

```
src/
  App.tsx, main.tsx, index.css, setupTests.ts   # Shared app shell
  siphon/          # Echo Siphon companion app — see src/siphon/CLAUDE.md
  landing/         # Landing page (future)
```

**When working on a specific feature**, read that feature's `CLAUDE.md` first. It contains the rules, source-of-truth references, and gotchas specific to that domain.

---

## Before You Start

Read `.claude/docs/SESSION_PROTOCOL.md` for mandatory start/end procedures.

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

---

## Session Handoff

Before ending a session:
1. Update relevant tracking docs with progress
2. Update `docs/siphon/ARCHITECTURE.md` if new components were created
3. Summarize to user: what was done, what remains, decisions needed

See `.claude/docs/SESSION_PROTOCOL.md` for the full protocol.
