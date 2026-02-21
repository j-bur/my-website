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

**What makes it special**: Has TWO distinct effects:

### Effect 1: Cost Halving (Passive, While Echo Drained)
Halves Siphon Feature costs, but ONLY while:
1. Siphon Greed is in the Selected Deck (`selectedCardIds`)
2. The player is Echo Drained (`currentEP <= -level`)

**This is NOT a general Echo Drain mechanic.** Echo Drain itself does not reduce costs.

**Implementation**:
- Check: `selectedCardIds.includes('siphon-greed') && currentEP <= -level`
- `getEffectiveCost()` applies `Math.max(1, Math.floor(cost / 2))`
- If both Siphon Greed AND Echo Intuition are active, apply Siphon Greed first, then Echo Intuition

### Effect 2: EP Recovery Scaling (Long Rest, While Echo Drained)
Multiplies Long Rest EP recovery by integer multiples of Echo Drain depth.

**Implementation**:
- At Long Rest: `EPR = pb × floor(abs(currentEP) / level)`
- At exactly `-Level`: multiplier = 1 (same as base, no bonus)
- At `-2 × Level`: multiplier = 2, so EPR = pb × 2
- At `-3 × Level`: multiplier = 3, so EPR = pb × 3

### Effect 3: Focus Gain (While Selected, Long Rest)
Grants 1d4 Focus at each Long Rest while in the Selected Deck. See **While Selected Features** section for full details.

**Common mistake**: Treating cost halving as a general Echo Drain effect. Forgetting that the `focusGain: 0` sentinel from the calculator must be replaced with the actual d4 roll.

---

## While Selected Features

**What makes it special**: These features apply their effect simply by being in the Selected Deck. Their costs and focus gains are applied **at the end of every Long Rest** (after EP recovery and focus d4 reduction), not at selection time and not during combat. No bestow or activate step needed.

**Two features have While Selected duration**:

### Supercapacitance (While Selected)
- **EP Cost**: `(extra features beyond PB) × 2`. "Extra features" = `selectedCardIds.length - proficiencyBonus`. If no extras, no cost.
- **Focus Gain**: `extra feature count` (undoubled base). Follows normal doubling rules (doubles if EP < 0 after cost deduction).
- **Order dependency**: Supercapacitance is processed FIRST. Its EP cost can push EP negative, which then causes Siphon Greed's focus gain to double.

### Siphon Greed (While Selected)
- **EP Cost**: 0
- **Focus Gain**: 1d4 (dice-based — caller must roll and provide the value)
- **Focus Doubling**: If EP < 0 at time of processing, the rolled value is doubled.
- **Sentinel value**: `calculateWhileSelectedEffects()` returns `focusGain: 0` for Siphon Greed. This is a sentinel — the caller (LongRestDialog) must roll the d4 and fill in the actual value before passing to `longRest()`.

**Implementation** (`src/utils/whileSelectedCalculator.ts`):
- `calculateWhileSelectedEffects(selectedCardIds, proficiencyBonus)` returns effects in application order: Supercapacitance first, then Siphon Greed.
- Callers MUST preserve this order — it is load-bearing for focus doubling correctness.
- The `longRest()` store action accepts an optional `whileSelectedEffects` array and processes them sequentially after EP recovery and focus d4 reduction.

---

## Supercapacitance (Feature Selection)

**What makes it special**: When Supercapacitance is selected, the player can select MORE features than their Proficiency Bonus allows. The overflow cost is paid at Long Rest via the While Selected mechanic above.

**Implementation**: `selectCard(cardId, maxCards)` — the caller computes `maxCards` as `PB + extraSlots` when Supercapacitance is selected. The PB limit logic is on the caller, not the store.

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
- **Supercapacitance** (While Selected): EP cost = extra features beyond PB × 2 (see While Selected section above)
- **Siphon Greed** (While Selected): 1d4 Focus at Long Rest, no EP cost (see While Selected section above)
