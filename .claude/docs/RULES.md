# Verification Rules

Machine-readable behavioral rules for The Siphon Interface. Each rule maps directly to a test case. Reference by ID (e.g., RULE-EP-001) when writing tests.

---

## EP (Echo Points)

### RULE-EP-001: EP can go negative
- GIVEN: currentEP = 3, cost = 5
- WHEN: spendEP(5, level=5)
- THEN: currentEP = -2

### RULE-EP-002: Warp triggers when EP negative AFTER deduction
- GIVEN: currentEP = 2, cost = 5
- WHEN: spendEP(5, level=5)
- THEN: result.warpTriggered = true (because -3 < 0)

### RULE-EP-003: Warp triggers even when already negative
- GIVEN: currentEP = -2, cost = 3
- WHEN: spendEP(3, level=5)
- THEN: result.warpTriggered = true (because -5 < 0)

### RULE-EP-004: Warp does NOT trigger when EP stays non-negative
- GIVEN: currentEP = 5, cost = 3
- WHEN: spendEP(3, level=5)
- THEN: result.warpTriggered = false (because 2 >= 0)

### RULE-EP-005: Echo Drain at EP = -Level
- GIVEN: currentEP = -3, cost = 2, level = 5
- WHEN: spendEP(2, level=5)
- THEN: result.isNowEchoDrained = true (because -5 <= -5)

### RULE-EP-006: EP recovery capped at max (Level)
- GIVEN: currentEP = 3, maxEP = 5
- WHEN: recoverEP(10, maxEP=5)
- THEN: currentEP = 5 (not 13)

### RULE-EP-007: Long Rest EP recovery = PB (up to max)
- GIVEN: currentEP = 0, pb = 3, maxEP = 5
- WHEN: longRest(pb=3, maxEP=5)
- THEN: currentEP = 3

### RULE-EP-008: Long Rest EP recovery does not exceed max
- GIVEN: currentEP = 4, pb = 3, maxEP = 5
- WHEN: longRest(pb=3, maxEP=5)
- THEN: currentEP = 5 (not 7)

---

## Focus

### RULE-FOCUS-001: Focus doubles when EP negative
- GIVEN: currentEP = -2, focus = 0
- WHEN: addFocus(10)
- THEN: focus = 20

### RULE-FOCUS-002: Focus does NOT double when EP non-negative
- GIVEN: currentEP = 3, focus = 0
- WHEN: addFocus(10)
- THEN: focus = 10

### RULE-FOCUS-003: Long Rest Focus reduced by d4 (min 0)
- GIVEN: focus = 2
- WHEN: longRest (Focus reduction rolls 4)
- THEN: focus = 0 (min 0, not -2)

### RULE-FOCUS-004: Focus cannot go below 0
- GIVEN: focus = 3
- WHEN: reduceFocus(10)
- THEN: focus = 0

---

## Card Lifecycle

### RULE-CARD-001: Hand contains only self-bestowed cards
- GIVEN: selectedCardIds = ['a', 'b', 'c'], handCardIds = ['b']
- WHEN: getDeckCards()
- THEN: returns ['a', 'c'] (excludes hand cards)
- AND: getHandCards() includes 'b'

### RULE-CARD-002: Cards return to deck after activation
- GIVEN: handCardIds = ['temporal-surge'], selectedCardIds = ['other-card']
- WHEN: activateFromHand('temporal-surge', ...)
- THEN: handCardIds = []
- AND: selectedCardIds includes 'temporal-surge'

### RULE-CARD-003: Triggered features always logically in hand while selected
- GIVEN: selectedCardIds includes feature with duration='Triggered'
- WHEN: getHandCards()
- THEN: result includes that feature (even if not in handCardIds)
- AND: getDeckCards() does NOT include it

### RULE-CARD-004: Activation:None auto-activates on bestow
- GIVEN: feature.activation = 'None'
- WHEN: bestowToSelf(featureId)
- THEN: Card moves to hand AND UI should immediately trigger activation flow
- NOTE: The store moves the card; the UI layer handles the auto-activation prompt

### RULE-CARD-005: bestowToSelf moves card from deck to hand
- GIVEN: selectedCardIds = ['a', 'b'], handCardIds = []
- WHEN: bestowToSelf('a')
- THEN: selectedCardIds = ['b'], handCardIds = ['a']

### RULE-CARD-006: Cannot bestow card not in selected deck
- GIVEN: selectedCardIds = ['a'], handCardIds = []
- WHEN: bestowToSelf('z')
- THEN: No state change (card 'z' not in deck)

### RULE-CARD-007: Manifestation replaces itself in selected deck
- GIVEN: selectedCardIds = ['manifestation', 'other']
- WHEN: replaceSelectedCard('manifestation', 'new-feature')
- THEN: selectedCardIds = ['new-feature', 'other']

### RULE-CARD-008: Max selected cards = proficiency bonus
- GIVEN: selectedCardIds.length = 3, maxCards = 3
- WHEN: selectCard('new-card', maxCards=3)
- THEN: returns false, selectedCardIds unchanged

---

## Cost Modifiers

### RULE-GREED-001: Siphon Greed halves cost when selected AND echo drained
- GIVEN: 'siphon-greed' in selectedCardIds, currentEP = -5, level = 5
- WHEN: getEffectiveCost(baseCost=10, level=5)
- THEN: returns 5

### RULE-GREED-002: Cost halving does NOT apply without Siphon Greed selected
- GIVEN: 'siphon-greed' NOT in selectedCardIds, currentEP = -5, level = 5
- WHEN: getEffectiveCost(baseCost=10, level=5)
- THEN: returns 10

### RULE-GREED-003: Cost halving does NOT apply when not echo drained
- GIVEN: 'siphon-greed' in selectedCardIds, currentEP = -3, level = 5
- WHEN: getEffectiveCost(baseCost=10, level=5)
- THEN: returns 10 (not drained: -3 > -5)

### RULE-GREED-004: Halved cost minimum is 1
- GIVEN: 'siphon-greed' in selectedCardIds, currentEP = -5, level = 5
- WHEN: getEffectiveCost(baseCost=1, level=5)
- THEN: returns 1 (not 0)

### RULE-INTUITION-001: Echo Intuition halves BOTH cost AND focus
- GIVEN: echoIntuitionActive = true
- WHEN: getEffectiveCost(baseCost=10, level=5)
- THEN: returns 5
- AND: getEffectiveFocusDice("[PB]d8", pb=3) returns modified dice

### RULE-INTUITION-002: Echo Intuition and Siphon Greed stack
- GIVEN: echoIntuitionActive = true, 'siphon-greed' in selectedCardIds, echo drained
- WHEN: getEffectiveCost(baseCost=20, level=5)
- THEN: returns 5 (20 -> 10 from greed -> 5 from intuition, each applies floor/2)

---

## Allies

### RULE-ALLY-001: Special cost features cannot be bestowed to allies
- GIVEN: feature has specialCost = true
- WHEN: attempting bestowToAlly(featureId, allyId)
- THEN: Operation blocked (store returns early or UI prevents it)

### RULE-ALLY-002: Removing ally clears their bestowments
- GIVEN: allies = [{id: 'a1', name: 'Briar'}], allyBestowments has entries for 'a1'
- WHEN: removeAlly('a1')
- THEN: allies = [], allyBestowments filtered to exclude allyId='a1'

---

## Rest Mechanics

### RULE-REST-001: Long Rest clears hand and bestowments
- GIVEN: handCardIds = ['a', 'b'], allyBestowments has entries
- WHEN: longRest(...)
- THEN: handCardIds = [], allyBestowments = []
- AND: 'a' and 'b' are back in selectedCardIds

### RULE-REST-002: Long Rest restores motes to max
- GIVEN: motes = 3
- WHEN: longRest(...)
- THEN: motes = 8

### RULE-REST-003: Long Rest restores all Hit Dice
- GIVEN: hitDice = 2, maxHitDice = 5
- WHEN: longRest(...)
- THEN: hitDice = 5

### RULE-REST-004: Short Rest restores free phase switch
- GIVEN: phaseSwitchAvailable = false
- WHEN: shortRest(...)
- THEN: phaseSwitchAvailable = true

### RULE-REST-005: Short Rest does NOT affect EP or Focus
- GIVEN: currentEP = -3, focus = 15
- WHEN: shortRest(...)
- THEN: currentEP = -3, focus = 15

### RULE-REST-006: Short Rest optionally clears short-duration effects
- GIVEN: activeEffects includes effect with durationMs < 3600000 (1 hour)
- WHEN: shortRest(clearShortEffects=true)
- THEN: that effect is removed

---

## Hit Dice

### RULE-HD-001: Phase switch costs 2 Hit Dice (after free switch used)
- GIVEN: phaseSwitchAvailable = false, hitDice = 4
- WHEN: switchPhase(newPhase) with paid switch
- THEN: hitDice = 2

### RULE-HD-002: Cannot switch phase without enough Hit Dice
- GIVEN: phaseSwitchAvailable = false, hitDice = 1
- WHEN: attempting paid phase switch
- THEN: Operation blocked (need 2, have 1)

### RULE-HD-003: Free phase switch does not cost Hit Dice
- GIVEN: phaseSwitchAvailable = true, hitDice = 4
- WHEN: switchPhase(newPhase)
- THEN: hitDice = 4 (unchanged)

---

## Capacitance

### RULE-CAP-001: Capacitance max = PB
- GIVEN: siphonCapacitance = 3, pb = 3
- WHEN: addCapacitance()
- THEN: siphonCapacitance still capped at pb

### RULE-CAP-002: Capacitance clears on long rest
- GIVEN: siphonCapacitance = 2
- WHEN: longRest(...)
- THEN: siphonCapacitance = 0, capacitanceTimerStart = null
