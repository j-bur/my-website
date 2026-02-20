# The Siphon Interface

A companion app for managing the Siphon Wielder homebrew feature in D&D 5E.

## Purpose

The Siphon Wielder is a complex feature with multiple interconnected resource systems. This interface handles the bookkeeping so the player can focus on tactical decisions rather than arithmetic and page-flipping.

## What It Tracks

### Echo Points (EP)
- Current EP value, which can go negative
- Visual indication of EP state (positive, negative, approaching Echo Drain)
- Echo Drain threshold at negative character level

### Focus
- Running total of accumulated Focus
- Automatic doubling when EP is negative
- Threshold warnings as Focus climbs toward dangerous levels

### Siphon Capacitance
- Available charges (up to Proficiency Bonus)
- 8-hour timer for Siphon Flux expenditure

### Echo Manifold
- Current phase (Constellation, Revelation, or Oblivion)
- Mote count (up to 8)
- Free phase switch availability
- Active manifold abilities and their durations

### Selected Siphon Features
- Which cards are currently prepared (limited by Proficiency Bonus)
- Features bestowed to allies

## What It Automates

### Dice Rolling
- Focus dice when activating features
- Variable dice expressions like [PB]d8 or [Cost]d6
- Wild Echo Surge table (d100 for effect, d20 for severity)

### Cost Calculation
- Resolves variable costs (PB, Level, "Twice PB", etc.)
- Displays resolved cost alongside the feature

### Focus Mechanics
- Doubles Focus gain automatically when EP is negative
- Tracks the roll separately from the final gain for transparency

### Surge Table
- Rolls both dice simultaneously
- Determines severity (Extreme 1-3, Moderate 4-9, Nuisance 10-20)
- Displays the appropriate effect text for that severity

## What It Enables

### Long Rest: Deck Building
- Browse all 30 Siphon Features
- Filter by activation type, cost, or tags
- Select up to Proficiency Bonus features for the day
- Configure character name and level

### Combat: Resource Management
- Activate features with one click
- Bestow features to allies
- Track which features have been used or bestowed
- Quick access to Wild Surge rolls when needed

### Echo Manifold Control
- Switch between phases (free once per short rest, or spend 2 Hit Dice)
- Spend motes on phase abilities
- Overdrive option to remove ability limitations at double cost
- Track active abilities and concentration

## What It Does Not Track

- Hit Points (managed in D&D Beyond or FoundryVTT)
- Spell slots
- Equipment or inventory
- Combat initiative or turn order

## Intended Workflow

1. **Before the session**: Open the Deck Builder, set character level, select Siphon Features for the day
2. **During combat**: Use the Combat HUD to activate features, track resources, and roll surges
3. **During roleplay**: Reference the Echo Manifold's passive abilities for the current phase
4. **After long rest**: Return to Deck Builder to potentially swap features
