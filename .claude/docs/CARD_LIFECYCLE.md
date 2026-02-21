# Card Lifecycle: Select -> Bestow -> Activate

This document describes the three-step card flow that is fundamental to the entire UI. **Do not conflate these steps.**

---

## State Diagram

```
                    LONG REST
                       |
                       v
              +-----------------+
              | SELECTED DECK   |  <-- Cards chosen at long rest (up to PB)
              | selectedCardIds |  <-- Also where cards RETURN after activation
              +-----------------+
                  |           |
      bestowToSelf()    bestowToAlly()
                  |           |
                  v           v
          +----------+  +------------------+
          |   HAND   |  | ALLY BESTOWMENT  |
          | handCard |  | allyBestowments  |
          |   Ids    |  |                  |
          +----------+  +------------------+
                  |
       activateFromHand()
                  |
                  v
          +----------+
          |  ACTIVE  |  <-- Effect tracked in activeEffects
          |  EFFECT  |  <-- Card returns to SELECTED DECK
          +----------+
                  |
           (card returns)
                  |
                  v
              +-----------------+
              | SELECTED DECK   |  <-- Ready to be bestowed again
              +-----------------+
```

---

## Step 1: SELECT (Long Rest)

**When**: During Long Rest or in the Deck Builder
**Action**: Player chooses up to `proficiencyBonus` features from all 42 available
**Store change**: Feature IDs added to `selectedCardIds`
**UI location**: Deck Builder view

Rules:
- Maximum selection = proficiency bonus
- Selection persists until next Long Rest
- "While Selected" features apply their cost/effects when selected

---

## Step 2: BESTOW (Combat)

**When**: During combat
**Normal cost**: Action + Touch range
**Store change**: Card moves between zones

### Bestow to Self
- Store: `bestowToSelf(featureId)` moves card from `selectedCardIds` to `handCardIds`
- UI: Card appears in the Hand area
- Duration starts immediately upon bestowing

### Bestow to Ally
- Store: `bestowToAlly(featureId, allyId)` creates an `AllyBestowment` record
- UI: Card appears in ally's bestowment list
- Card stays in `selectedCardIds` for tracking purposes
- Special cost features (`*`) CANNOT be bestowed to allies

### Exceptions to Normal Bestow Rules

**Triggered features**: Always considered bestowed to self while Selected. They appear in `getHandCards()` automatically without explicit bestowing. They do NOT need an Action to bestow.

**Activation: None features**: When bestowed, the activation happens immediately (EP cost deducted, Focus rolled) as part of the bestow step. There is no separate "activate" action. The UI should auto-trigger the activation flow.

**Superconduction**: Bypasses all normal bestow rules:
- Uses a Reaction (not Action)
- Works at 60 feet (not Touch)
- If targeting self, allows IMMEDIATE activation of the bestowed feature
- Cost: `feature_being_bestowed_cost + Superconduction_cost`

---

## Step 3: ACTIVATE (Combat)

**When**: Using the feature's activation (Action, Bonus Action, Reaction, or None)
**Store change**: Card returns to Selected Deck, effect tracked

### Activation Flow
1. Player double-clicks a card in Hand (or drags to Active Effects panel)
2. **Activation Panel** opens showing:
   - Feature name and effect
   - EP cost (with modifiers applied: Siphon Greed, Echo Intuition)
   - Current EP -> New EP preview
   - Focus dice to roll
   - Warp warning (if EP will go negative)
   - Macro for FoundryVTT (if macro mode)
3. Player enters dice result (if macro mode) or confirms (if 3D dice mode)
4. On Confirm:
   - EP deducted via `spendEP(cost, level)`
   - Focus added via `addFocus(rollResult)`
   - If warp triggered: Wild Echo Surge fires
   - Effect added to `activeEffects` (if duration-based)
   - Card returns to Selected Deck via `activateFromHand()`
5. On Cancel: Nothing happens, card stays in Hand

### After Activation
- Card is back in the Selected Deck
- To use again: must Bestow again (costs another Action)
- The active effect remains tracked until it expires or is dismissed

---

## Special Cases

### Manifestation
- On activation: removes itself from Selected Deck
- Player chooses a different Siphon Feature to replace it
- Store: `replaceSelectedCard(oldId, newId)`
- The replacement feature is immediately in the Selected Deck

### Superconduction (Self-Target)
1. Player uses Reaction to bestow a feature to self via Superconduction
2. Feature moves to Hand
3. Feature is IMMEDIATELY activated (no separate action needed)
4. Both Superconduction's cost AND the feature's cost are paid
5. Both Focus rolls happen

### Echo Intuition (Active Modifier)
When Echo Intuition is active (from Manifold):
- All Siphon Feature EP costs are halved: `Math.max(1, Math.floor(cost / 2))`
- All Siphon Feature Focus gains are halved
- The Activation Panel must show MODIFIED values, not base values
- Duration: 8 hours

### Siphon Greed (Conditional Modifier)
When Siphon Greed is in the Selected Deck AND the player is Echo Drained (`currentEP <= -level`):
- All Siphon Feature EP costs are halved: `Math.max(1, Math.floor(cost / 2))`
- This is NOT a general Echo Drain effect -- it only works because Siphon Greed is Selected

---

## Zone Summary

| Zone | Store Field | What It Contains | Shown In UI |
|------|-------------|-----------------|-------------|
| Selected Deck | `selectedCardIds` | Cards chosen at long rest, not yet bestowed (or returned after activation) | Bottom-left deck icon, expandable |
| Hand | `handCardIds` + triggered | Cards bestowed to self | Bottom-center fanned cards |
| Ally Bestowments | `allyBestowments` | Cards bestowed to allies | Allies panel hover |
| Active Effects | `activeEffects` | Duration-based effects on self | Center panel |
