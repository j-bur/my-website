# Store Contracts

Full interface definitions and behavioral contracts for all Zustand stores.

---

## characterStore

File: `src/store/characterStore.ts`
Persist key: `siphon-character`
Persist version: 2

### State
```typescript
interface CharacterState {
  name: string;                  // Character name
  level: number;                 // 1-20
  proficiencyBonus: number;      // Auto-calculated: Math.ceil(level / 4) + 1
  maxHP: number;                 // Base max HP (set by user)
  currentHP: number;             // Current HP (0 to reducedMaxHP)
  reducedMaxHP: number;          // maxHP - echo drain reductions
  spellSaveDC: number;           // Spell save DC
  hitDice: number;               // Current available (0 to maxHitDice)
  maxHitDice: number;            // Always = level
}
```

### Actions
```typescript
setName(name: string): void
// Sets character name.

setLevel(level: number): void
// Clamps to 1-20. Updates proficiencyBonus.
// Updates maxHitDice = level. Clamps hitDice to maxHitDice.

setMaxHP(hp: number): void
// Sets maxHP and reducedMaxHP to hp. Clamps currentHP.

setCurrentHP(hp: number): void
// Clamps to 0..reducedMaxHP.

reduceMaxHP(amount: number): void
// reducedMaxHP -= amount (min 0). Clamps currentHP.
// Used by: Echo Drain HP reduction.

restoreMaxHP(amount: number): void
// reducedMaxHP += amount (up to maxHP).
// Used by: Long Rest HP restoration.

setSpellSaveDC(dc: number): void

spendHitDice(amount: number): boolean
// Precondition: hitDice >= amount.
// If insufficient: returns false, no state change.
// If sufficient: hitDice -= amount, returns true.
// Used by: Phase switch (2 HD), Short Rest healing.

restoreAllHitDice(): void
// hitDice = maxHitDice.
// Used by: Long Rest.

resetCharacter(): void
// Resets all fields to defaults.

healToFull(): void
// currentHP = reducedMaxHP.
```

### Migration (v1 -> v2)
```typescript
if (version === 1) {
  state.hitDice = state.level;
  state.maxHitDice = state.level;
}
```

---

## siphonStore

File: `src/store/siphonStore.ts`
Persist key: `siphon-state`
Persist version: 2

### State
```typescript
interface SiphonState {
  // Core Resources
  currentEP: number;                    // Can go negative. Max = level.
  focus: number;                        // >= 0. Accumulated tension.
  siphonCapacitance: number;            // 0 to PB. Charges from Siphon Flux.
  capacitanceTimerStart: number | null; // Timestamp for 8-hour acquisition window.

  // Card Zones
  selectedCardIds: string[];            // Selected Deck (chosen at long rest).
  handCardIds: string[];                // Bestowed to self (in Hand).

  // Allies
  allies: Ally[];                       // Named ally slots.
  allyBestowments: AllyBestowment[];   // Per-ally bestowment records.

  // Active Effects (self only)
  activeEffects: SelfActiveEffect[];    // Effects currently active on self.

  // Active Modifiers
  echoIntuitionActive: boolean;         // Halves cost AND focus for siphon features.
}
```

### EP Actions
```typescript
spendEP(cost: number, level: number): SpendResult
// newEP = currentEP - cost.
// warpTriggered = newEP < 0.
// isNowEchoDrained = newEP <= -level.
// focusDoubled = newEP < 0.
// hpReduction = (was already echo drained before this spend) ? cost : 0.
// Side effect: sets currentEP = newEP.

recoverEP(amount: number, maxEP: number): void
// currentEP = min(maxEP, currentEP + amount).

setEP(ep: number): void
// Direct set. For manual overrides only.
```

### Focus Actions
```typescript
addFocus(amount: number): number
// If currentEP < 0: actual = amount * 2 (doubled).
// Else: actual = amount.
// focus += actual.
// Returns actual amount added.

reduceFocus(amount: number): void
// focus = max(0, focus - amount).

setFocus(focus: number): void
// focus = max(0, focus). For manual overrides.
```

### Capacitance Actions
```typescript
addCapacitance(): void
// siphonCapacitance += 1.
// If capacitanceTimerStart is null, sets it to Date.now().

expendCapacitance(amount: number): void
// siphonCapacitance = max(0, siphonCapacitance - amount).
// If siphonCapacitance reaches 0, clears capacitanceTimerStart.

clearCapacitance(): void
// siphonCapacitance = 0, capacitanceTimerStart = null.
```

### Card Selection (Deck Builder)
```typescript
selectCard(cardId: string, maxCards: number): boolean
// If selectedCardIds.length >= maxCards: return false.
// If cardId already selected: return false.
// Adds cardId to selectedCardIds. Returns true.

deselectCard(cardId: string): void
// Removes cardId from selectedCardIds.

clearSelection(): void
// selectedCardIds = [], handCardIds = [], allyBestowments = [].

setSelectedCards(cardIds: string[]): void
// Direct set. Clears handCardIds and allyBestowments.

isCardSelected(cardId: string): boolean
```

### Bestow Actions (Combat)
```typescript
bestowToSelf(featureId: string): void
// Precondition: featureId in selectedCardIds.
// Moves featureId from selectedCardIds to handCardIds.
// NOTE: If feature.activation === 'None', the UI layer (not the store)
// should auto-trigger the activation flow immediately after this call.

bestowToAlly(featureId: string, allyId: string): void
// Precondition: allyId exists in allies array.
// Precondition: feature is NOT a special cost feature (has * in cost).
// Creates AllyBestowment record. Does NOT remove from selectedCardIds.
```

### Activate Actions (Combat)
```typescript
activateFromHand(featureId: string, epCost: number, focusGain: number, warpTriggered: boolean): void
// Removes featureId from handCardIds.
// Adds featureId back to selectedCardIds (card returns to deck).
// EP and Focus changes are handled by the CALLER (UI activation flow)
// calling spendEP() and addFocus() separately before this method.
// This method only manages the card zone transition.
// If the feature has a duration, the caller should also call addActiveEffect().

returnCardToDeck(featureId: string): void
// Removes from handCardIds, adds to selectedCardIds.
// For edge cases where card needs to return without activation.

replaceSelectedCard(oldFeatureId: string, newFeatureId: string): void
// Removes oldFeatureId from selectedCardIds.
// Adds newFeatureId to selectedCardIds.
// Used by: Manifestation.
```

### Ally Management
```typescript
addAlly(name: string): string
// Creates Ally with generated UUID. Returns the ID.

removeAlly(allyId: string): void
// Removes from allies. Also removes all allyBestowments for that ally.

renameAlly(allyId: string, name: string): void

removeAllyBestowment(bestowmentId: string): void
clearAllyBestowments(allyId: string): void
```

### Active Effects (Self Only)
```typescript
addActiveEffect(effect: Omit<SelfActiveEffect, 'id' | 'startedAt'>): string
// Creates effect with generated UUID and startedAt = Date.now().
// Returns the effect ID.

removeActiveEffect(effectId: string): void

clearExpiredEffects(): void
// Removes effects where startedAt + durationMs < Date.now().
// Skips effects with durationMs = null (permanent/triggered).

clearEffectsBelowDuration(maxDurationMs: number): void
// Removes effects where durationMs !== null && durationMs <= maxDurationMs.
// Used by: Short Rest (clear effects < 1 hour = 3600000ms).
```

### Computed Helpers
```typescript
getDeckCards(): string[]
// selectedCardIds MINUS handCardIds MINUS triggered features.
// These are cards shown when Selected Deck is expanded.

getHandCards(): string[]
// handCardIds UNION triggered features from selectedCardIds.
// Triggered features are always logically in hand while selected.

getEffectiveCost(baseCost: number, level: number): number
// Applies Siphon Greed halving (if 'siphon-greed' in selectedCardIds AND currentEP <= -level).
// Applies Echo Intuition halving (if echoIntuitionActive).
// Both use Math.max(1, Math.floor(cost / 2)).
// If both apply, Siphon Greed first, then Echo Intuition.

getEffectiveFocusDice(baseFocusDice: string): string
// If echoIntuitionActive: halve the dice count.
// E.g., "[PB]d8" with PB=4 -> "2d8" (half of 4).

isEPNegative(): boolean
// currentEP < 0.

isEchoDrained(level: number): boolean
// currentEP <= -level.

hasSiphonGreedSelected(): boolean
// 'siphon-greed' in selectedCardIds.

setEchoIntuitionActive(active: boolean): void
```

### Rest Actions
```typescript
longRest(pb: number, maxEP: number): { epRecovered: number; focusReduced: number; maxHPRestored: number }
// 1. EP += pb (capped at maxEP). Siphon Greed 2x multiplier if applicable.
// 2. Focus -= d4 roll (min 0).
// 3. Max HP restored by amount of EP recovered (if reducedMaxHP < maxHP).
// 4. handCardIds -> all move back to selectedCardIds.
// 5. allyBestowments cleared.
// 6. Active effects with duration < 8 hours removed.
// 7. capacitance cleared.
// NOTE: Motes and Hit Dice restoration happens in manifoldStore and characterStore respectively.

shortRest(clearShortEffects: boolean): void
// If clearShortEffects: remove active effects with durationMs <= 3600000.
// Clear expired effects.
// Does NOT affect: EP, Focus, motes, selectedCardIds, handCardIds, allyBestowments.
// NOTE: Phase switch and Hit Dice handled by manifoldStore and characterStore.
```

### Migration (v1 -> v2)
```typescript
if (version === 1) {
  state.handCardIds = [];
  state.allies = [];
  state.allyBestowments = [];
  state.activeEffects = [];
  state.echoIntuitionActive = false;
  // Migrate old bestowedFeatures to handCardIds
  const bestowed = state.bestowedFeatures || [];
  state.handCardIds = bestowed
    .filter(bf => bf.targetId === 'self' && !bf.isActivated)
    .map(bf => bf.featureId);
  delete state.bestowedFeatures;
}
```

---

## settingsStore

File: `src/store/settingsStore.ts`
Persist key: `siphon-settings`
Persist version: 1

### State
```typescript
interface SettingsState {
  diceMode: {
    wildSurge: 'dice3d' | 'macro';        // Default: 'dice3d'
    siphonFeature: 'dice3d' | 'macro';     // Default: 'macro'
    phaseAbility: 'dice3d' | 'macro';      // Default: 'macro'
    longRestFocus: 'dice3d' | 'macro';     // Default: 'macro'
  };
  soundEnabled: boolean;                    // Default: false
  animationsEnabled: boolean;               // Default: true
  reducedMotion: boolean;                   // Default: false
  confirmBeforeActivation: boolean;         // Default: false
  autoTriggerSurgeOnWarp: boolean;          // Default: true
  shortRestClearEffects: boolean;           // Default: true
}
```

### Actions
```typescript
setDiceMode(rollType: keyof SettingsState['diceMode'], mode: 'dice3d' | 'macro'): void
setSoundEnabled(enabled: boolean): void
setAnimationsEnabled(enabled: boolean): void
setReducedMotion(enabled: boolean): void
setConfirmBeforeActivation(enabled: boolean): void
setAutoTriggerSurgeOnWarp(enabled: boolean): void
setShortRestClearEffects(enabled: boolean): void
resetSettings(): void
```

---

## manifoldStore

File: `src/store/manifoldStore.ts`
Persist key: `siphon-manifold`
Persist version: 1 (no changes needed)

### Existing State (no structural changes)
```typescript
interface ManifoldState {
  currentPhase: 'Constellation' | 'Revelation' | 'Calamity';
  motes: number;                    // 0-8
  maxMotes: number;                 // Always 8
  phaseSwitchAvailable: boolean;    // Free switch (resets on short rest)
  hitDiceSpentOnSwitch: number;     // Tracking
  activeAbilities: ActiveManifoldAbility[];
}
```

### Integration Notes
- Phase switch: UI calls `characterStore.spendHitDice(2)` first, then `manifoldStore.switchPhase()`. Stores stay independent.
- Mote regain (max 1/turn): Enforced by UI, not by store.
- Long Rest: Caller restores motes via `manifoldStore.restoreAllMotes()`.
- Short Rest: Caller restores free switch via `manifoldStore.restorePhaseSwitchOnShortRest()`.

---

## Type Definitions

File: `src/types/siphonFeature.ts`

### New Types to Add
```typescript
export interface Ally {
  id: string;
  name: string;
}

export interface AllyBestowment {
  id: string;                       // Unique instance ID
  allyId: string;                   // Reference to Ally.id
  featureId: string;                // Reference to SiphonFeature.id
  isFromSelectedDeck: boolean;      // false if bestowed from "All Features"
  bestowedAt: number;               // Timestamp
}

export interface SelfActiveEffect {
  id: string;                       // Unique instance ID
  sourceType: 'siphon' | 'manifold' | 'surge';
  sourceId: string;                 // Feature/ability/surge ID
  sourceName: string;               // Display name
  description: string;
  startedAt: number;                // Timestamp
  totalDuration: string;            // Original string for display ("10 min")
  durationMs: number | null;        // Parsed duration; null = permanent/triggered
  requiresConcentration: boolean;
  warpActive: boolean;
  warpDescription?: string;
}
```

---

## Variable Cost Types

Features can have these cost formats (from source PDFs):

| Format | Meaning | Resolution |
|--------|---------|------------|
| Fixed number (e.g., `5`) | Static cost | Use as-is |
| `PB` | Proficiency Bonus | `characterStore.proficiencyBonus` |
| `Twice PB` or `2x PB` | Double PB | `characterStore.proficiencyBonus * 2` |
| `Level` | Character level | `characterStore.level` |
| `Level/2` | Half level, rounded up | `Math.ceil(characterStore.level / 2)` |
| `Varies` | User chooses amount | Prompt user for input |
| `0` | No cost | 0 |
| Number with `*` | Special Cost | Cannot bestow to allies |

## Variable Focus Dice

| Format | Meaning | Resolution |
|--------|---------|------------|
| `[PB]d8` | Roll PB d8s | `${pb}d8` |
| `[Cost]d8` | Roll dice = cost paid | `${cost}d8` |
| `[Cost/2]d8` | Roll dice = half cost | `${Math.ceil(cost/2)}d8` |
| `[Cost]` | Gain Focus = cost (no dice) | Return cost directly |
