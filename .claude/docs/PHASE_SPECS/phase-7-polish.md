# Phase 7: Animations and Visual Polish

## Goal
Add card movement animations, resource counter animations, drag-and-drop interactions, and visual effects per DESIGN.md Motion Principles.

## Sessions: 2-3

- **Session 7A**: Card animations + resource counter animations
- **Session 7B**: Drag-and-drop for bestow, activate, dismiss
- **Session 7C**: Visual effects (warp pulse, Echo Drain warning, tendril effect)

---

## Entry Conditions
- [ ] Phase 6 exit gate passed
- [ ] All click-based interactions work correctly
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes

## Exit Conditions
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] `npm run test` passes
- [ ] Cards animate when moving between zones (deck -> hand, hand -> active effects -> deck)
- [ ] Resource counters animate value changes (smooth transitions)
- [ ] Drag-and-drop works for: bestow to self, bestow to ally, activate, dismiss effect
- [ ] Active Effects panel glows/highlights when card is being dragged over it
- [ ] Effect dismiss: horizontal drag outside panel with strikethrough animation
- [ ] Reduced motion setting (`settingsStore.reducedMotion`) disables ALL animations
- [ ] No janky or broken transitions at 60fps

---

## Session 7A: Core Animations

### Tasks

1. **Card movement animations**:
   - Card flip animation when bestowing (face-down -> face-up)
   - Slide animation when card moves from deck to hand
   - Return animation when card goes back to deck after activation
   - CSS transitions using `transform` and `opacity`

2. **Resource counter animations**:
   - EP bar: smooth width transition on value change
   - Focus counter: count-up/count-down with easing
   - Mote tracker: fill/empty animation on mote change
   - Capacitance: charge/discharge visual pulse

3. **Hand fan animation**:
   - Cards spread as fan with overlapping
   - Hover: raised card transition
   - New card entering: slide-in from left

4. **Reduced motion support**:
   - Check `settingsStore.reducedMotion`
   - If true: all transitions use `duration: 0ms` or `transition: none`
   - Respect `prefers-reduced-motion` media query as fallback

### Files to Modify
- `src/index.css` (new animation keyframes)
- `src/components/cards/SiphonCard.tsx` (card states, flip)
- `src/components/combat-hud/HandArea.tsx` (fan animation, hover)
- `src/components/combat-hud/EchoPointsBar.tsx` (smooth transitions)
- `src/components/combat-hud/FocusCounter.tsx` (count animation)
- `src/components/echo-manifold/MoteTracker.tsx` (fill/empty animation)

---

## Session 7B: Drag-and-Drop

### Tasks

1. **Drag system setup**:
   - Use HTML5 Drag and Drop API (or a lightweight library if needed)
   - Define drag data: `{ type: 'card', featureId: string }`
   - Define drop zones: HandArea, ActiveEffectsPanel, AlliesPanel
   - Visual feedback: ghost image, drop zone highlighting

2. **Bestow via drag** (SelectedDeck -> HandArea or AlliesPanel):
   - Drag card from expanded deck
   - Drop on HandArea: `bestowToSelf()`
   - Drop on ally chip: `bestowToAlly()`
   - Invalid drop: card returns to deck position

3. **Activate via drag** (HandArea -> ActiveEffectsPanel):
   - Drag card from hand
   - Drop on Active Effects panel: open Activation Panel
   - Active Effects panel glows when card is dragged over it

4. **Dismiss via drag** (ActiveEffectsPanel -> outside):
   - Drag effect row horizontally
   - If dragged past threshold: dismiss with strikethrough animation
   - If released before threshold: snaps back

### Files to Modify
- `src/components/combat-hud/SelectedDeck.tsx` (drag source)
- `src/components/combat-hud/HandArea.tsx` (drop target + drag source)
- `src/components/combat-hud/ActiveEffectsPanel.tsx` (drop target + drag source for dismiss)
- `src/components/combat-hud/AlliesPanel.tsx` (drop target)
- `src/components/combat-hud/CombatHUD.tsx` (drag context if needed)

---

## Session 7C: Visual Effects

### Tasks

1. **Warp visual effects**:
   - Screen edge tint (fuchsia) when warp triggers
   - Brief chromatic aberration pulse
   - Card border glow in warp color

2. **Echo Drain warning**:
   - Persistent screen-edge darkening when EP <= -Level
   - EP bar pulses in danger color
   - Subtle vignette effect

3. **Negative EP effects**:
   - Glitch/distortion on resource counters
   - Card borders flicker subtly

4. **Silvery tendril effect** (Ally Bestowment):
   - SVG or CSS animated lines connecting ally chip to bestowed cards
   - Subtle shimmer animation
   - Shown in AllyBestowmentView

5. **High Focus warning** (50+):
   - "Weavers watching" effect: subtle eye-like patterns at screen edges
   - Ambient glow intensifies

### Files to Modify
- `src/index.css` (keyframes for warp, drain, glitch, tendril)
- `src/components/combat-hud/CombatHUD.tsx` (screen-level effects)
- `src/components/combat-hud/EchoPointsBar.tsx` (drain pulse)
- `src/components/combat-hud/AllyBestowmentView.tsx` (tendril effect)
- `src/components/combat-hud/FocusCounter.tsx` (weavers effect)

---

## Out of Scope
- DO NOT implement 3D dice rendering (separate dedicated effort)
- DO NOT implement sound effects (separate dedicated effort)
- DO NOT change game mechanics or store logic
- DO NOT add new features beyond visual polish

## Key References
- `DESIGN.md` -- Aesthetic Direction, Motion Principles, Visual Tone sections
- Color palette in CLAUDE.md or `.claude/docs/STORE_CONTRACTS.md`
