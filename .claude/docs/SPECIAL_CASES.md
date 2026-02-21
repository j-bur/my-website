# Special Cases

Feature-specific edge cases and exceptions that agents must handle correctly. Read this when implementing activation flows, bestow logic, or cost calculations.

---

## Superconduction

**What makes it special**: Bypasses ALL normal bestow rules.

| Property | Normal Bestow | Superconduction |
|----------|--------------|-----------------|
| Action cost | Action | Reaction |
| Range | Touch | 60 feet |
| Self-activation | Separate step | Immediate |
| Cost | Feature cost only | Feature cost + Superconduction cost |

**Implementation**:
- When Superconduction targets self: bestow AND activate happen in one step
- Both focus rolls happen (Superconduction's + bestowed feature's)
- Both EP costs are paid
- UI should show a combined activation panel

---

## Manifestation

**What makes it special**: Removes itself from the Selected Deck and replaces itself with a different Siphon Feature.

**Implementation**:
- On activation: `replaceSelectedCard('manifestation', newFeatureId)`
- The new feature ID is chosen by the player from all 42 features
- UI needs a feature picker modal during activation
- The replacement feature is immediately available in the Selected Deck
- Manifestation is gone for the rest of the day (until next Long Rest selection)

---

## Activation: None Features

**What makes it special**: No separate activate step. EP cost and Focus roll happen immediately when bestowed.

**Features with Activation: None** (verify against data file):
- Subtle Luck
- Temporal Surge
- Echo-Relocation
- (check `siphonFeatures.ts` for full list where `activation === 'None'`)

**Implementation**:
- `bestowToSelf()` moves card to hand
- UI detects `feature.activation === 'None'` and immediately opens activation flow
- After activation completes, card returns to Selected Deck as normal
- From the player's perspective: they click a card in the deck, confirm the cost, and it's done

---

## Echo Intuition (Manifold Ability)

**What makes it special**: Halves BOTH the EP cost AND the Focus gained from Siphon Features for 8 hours.

**Source**: Echo Manifold > Revelation Phase > 3 motes

**Implementation**:
- Track with `siphonStore.echoIntuitionActive`
- `getEffectiveCost()` applies `Math.max(1, Math.floor(cost / 2))` when active
- `getEffectiveFocusDice()` halves dice count when active
- Activation Panel MUST show modified values (not base values) when this is active
- Label clearly: "Echo Intuition: Cost halved, Focus halved"
- Duration: 8 hours (add to activeEffects for tracking)

**Common mistake**: Only halving cost but forgetting to halve focus.

---

## Siphon Greed (Siphon Feature)

**What makes it special**: Its passive effect halves Siphon Feature costs, but ONLY while:
1. Siphon Greed is in the Selected Deck (`selectedCardIds`)
2. The player is Echo Drained (`currentEP <= -level`)

**This is NOT a general Echo Drain mechanic.** Echo Drain itself does not reduce costs.

**Implementation**:
- Check: `selectedCardIds.includes('siphon-greed') && currentEP <= -level`
- `getEffectiveCost()` applies `Math.max(1, Math.floor(cost / 2))`
- If both Siphon Greed AND Echo Intuition are active, apply Siphon Greed first, then Echo Intuition

**Common mistake**: Treating cost halving as a general Echo Drain effect.

---

## While Selected Features

**What makes it special**: These features apply their effect simply by being in the Selected Deck. They have a cost that is paid at Long Rest selection time, not during combat.

**Implementation**:
- Cost is deducted when the card is added to `selectedCardIds` during Long Rest
- The effect is passive and ongoing while the card remains selected
- No bestow or activate step needed

---

## Supercapacitance (Overflow)

**What makes it special**: When Siphon Capacitance is full (= PB) and the player would gain another charge, they can "overflow" into Supercapacitance.

**Implementation**: Per DESIGN.md -- the capacitance tracker should show the overflow state and allow the player to choose what to do with excess charges.

---

## FoundryVTT Integration

The app supports two dice modes (configurable per roll type in Settings):

| Mode | Behavior |
|------|----------|
| **Macro** | Generate FoundryVTT-compatible macro text for copy/paste |
| **3D Dice** | In-app dice rolling with physics animation |

**Defaults**: Wild Surge = 3D dice; all other rolls = Macro mode.

**FoundryVTT URL**: `https://foundry.jamesburns.cc`

**Macro format**: Generate Roll commands compatible with FoundryVTT's `/roll` syntax.

---

## Source PDF Corrections

These corrections have been verified and applied to the data files:

| Feature | PDF Says | Correction | Reason |
|---------|----------|------------|--------|
| Spatial Flux | "Static Capacitance" | "Siphon Capacitance" | Confirmed typo by designer |
| Distort Reality | References "Wild Magic Surge" | Uses "Wild Echo Surge" | Designer decision for app simplicity |

---

## Variable Cost Formulas (Specific Features)

Some features have complex cost calculations:

- **Longing**: Cost scales with distance (details in feature description)
- **Doublecast**: Cost = original feature cost (you pay it twice)
- **Superconduction**: Cost = bestowed feature's cost + Superconduction's own cost
