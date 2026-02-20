# Siphon Interface — UI/UX Design Document

## Aesthetic Direction

**Inspiration**: Inscryption, Slay the Spire, Hand of Fate

The interface should feel like a physical card game played on a dark table. Not bright or cartoonish—mysterious, but tactile and slightly unsettling. The player is manipulating forces they don't fully control and barely understand.

### Visual Tone
- Dark wood or stone surface as the implied "table"
- Cards that look worn, arcane, handcrafted
- Muted colors with selective use of glowing accents
- No illustrations on cards—typography and iconography only
- Subtle texture everywhere: noise, grain, vignette at edges

### Typography
- Card titles: serif or blackletter, slightly weathered
- Body text: clean sans-serif for readability
- Numbers (EP, Focus, costs): bold, slightly stylized

### Sound Design
- Subtle ambient audio: low hum, distant echoes (off by default; can be toggled on)
- Card interactions: soft paper shuffle, placement thud
- Resource changes: crystalline chimes (positive), low rumble (negative)
- Warp/Surge triggers: discordant tone, reality-bending distortion
- Sound effects sourced from royalty-free libraries, not generated

---

## Color Language

| Element | Color | Hex Code | Meaning |
|---------|-------|----------|---------|
| EP Positive | Turquoise | `#00d4aa` | Safe, resourced |
| EP Negative | Crimson | `#ff4466` | Danger, pushing limits |
| Focus | Deep Purple | `#7a42e0` | Accumulated tension |
| Warp | Fuchsia | `#d119d1` | Chaos, unpredictability |
| Capacitance | Bright Amber | `#ffbb33` | Stored potential |
| Card border | Warm Dusk | `#4e4a50` | Neutral, grounded |
| Table surface | Void Black | `#161418` | Recedes, not distracting |

---

## Views

The app has two distinct views, each a full-screen experience with smooth transitions between them.

### 1. Combat View (Primary)

The main gameplay screen. Everything happens on one table: the Selected deck, cards in hand (Bestowed to self), resources, Echo Manifold, and Wild Surge.

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  ╭─────────╮                                  ╭─────────╮      │
│  │ ☽ Phase │                                  │  Wild   │      │
│  │  card   │                                  │  Surge  │      │
│  │(face up)│                                  │ (deck)  │      │
│  ╰─────────╯                                  ╰─────────╯      │
│   ○○○●●●●● (motes)                                             │
│                                                                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐      ┌─────┐┌─────┐┌─────┐│
│  │ Phase   │ │ Phase   │ │ Phase   │      │Focus││ EP  ││Capac││
│  │ Ability │ │ Ability │ │ Ability │      └─────┘└─────┘└─────┘│
│  │    1    │ │    2    │ │    3    │                           │
│  └─────────┘ └─────────┘ └─────────┘                           │
│                                                                │
│  ┌──────────────── ACTIVE EFFECTS ─────────────────┐           │
│  │ ⚡ Temporal Surge (Self)              10 min    │           │
│  │ ◎ Starlight Veil (Constellation)  ●CONC  1 min │           │
│  │                                                 │           │
│  │          (drag cards here to activate)          │           │
│  └─────────────────────────────────────────────────┘           │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Allies: [Briar] [Asmo] [+]                             │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                │
│  ╭─────────╮                                                   │
│  │Selected │  ← Click to view/bestow                           │
│  │  Deck   │                                                   │
│  ╰─────────╯   ╭─────┬────┬────┬────╮                          │
│                │  A  │ B  │ C  │ D  │  ← Hand (Bestowed to self)│
│                ╰─────┴────┴────┴────╯                          │
└────────────────────────────────────────────────────────────────┘
```

**Key Concept: Select → Bestow → Activate**

The Siphon Wielder system uses three distinct steps:
1. **Select** (Long Rest): Choose up to PB features for the day — these go into the Selected deck
2. **Bestow** (Combat Action): Spend an action to grant a Selected feature to self or ally, starting its Duration
3. **Activate** (Feature's Activation): Use the feature's effect, paying EP and gaining Focus

In Combat View, the **Hand** contains only cards that have been Bestowed to self. The **Selected deck** holds all features chosen at long rest that haven't yet been Bestowed.

**Selected Deck (Bottom Left)**
- Contains all features chosen at long rest that haven't been Bestowed to self
- Click to fan out cards above the hand area for viewing/bestowing
- Cards already Bestowed to self (in hand) do NOT appear in the deck view
- Drag a card down to the hand to Bestow it to self (costs an action in-game)
- Drag a card to an ally name to Bestow it to them
- Double-click a card to Bestow to self
- After a card is Activated, it returns to the Selected deck (must be re-Bestowed to use again)

**Selected Deck Expanded View:**
```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐                   │
│   │ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │ │ 6 │ │ 7 │  ← Selected cards │
│   └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘    (not yet       │
│                                                  bestowed)     │
│  ╭─────────╮                                                   │
│  │Selected │                                                   │
│  │  Deck   │                                                   │
│  ╰─────────╯   ╭─────┬────┬────┬────╮                          │
│                │  A  │ B  │ C  │ D  │  ← Hand (Bestowed to self)│
│                ╰─────┴────┴────┴────╯                          │
└────────────────────────────────────────────────────────────────┘
```
Click outside the fanned cards or press Escape to collapse back to deck.

**The Hand (Bestowed to Self)**
- Contains only cards that have been Bestowed to self
- Cards fan out along the bottom, overlapping slightly
- Hovering raises a card above the others, shows full text
- **Large hands (8-15 cards)**: Cards compress horizontally, showing only left edge + title. Hovering expands the hovered card and shifts neighbors aside. This follows the Hearthstone/Legends of Runeterra pattern for overflow hands.
- Cards in hand can be Activated (drag to Active Effects panel or double-click)
- After Activation, card returns to Selected deck and must be re-Bestowed to use again

**Resource Display**
- Right side of the table, above allies
- **EP**: Bar that extends right (positive) or left (negative) from center zero-point
- **Focus**: Large number, glows more intensely as value climbs
- **Hit Dice**: Display showing current/max (e.g., "5/7 HD") — used for phase switching and short rest healing
- **Capacitance**: Row of charge pips (max = PB) with in-game timer indicator

**Allies Panel**
- Collapsible row above the hand
- Each ally is a named slot (e.g., "Briar", "Asmo")
- Click [+] to add a new ally (prompts for name)
- Drag a card from the Selected deck (when expanded) onto an ally to Bestow it to them
- Hover over an ally's name for half a second to see their Bestowed cards:
  - The hand collapses and is put to the side, face-down
  - Cards Bestowed to that ally appear in the center, drawn from:
    - The **Selected deck** (left side) if the feature is currently Selected
    - The **All Siphon Features deck** (right side) if the feature was Bestowed before but is no longer Selected
  - A silvery, somewhat-transparent tendril of "dunamantic" magic connects the ally's name to the bottom center of each card
  - Clicking the ally's name makes the silvery tendril and their name brighter; the user can drag a Bestowed card back toward the Selected deck to mark it as no longer Bestowed
  - Once a card has been marked as no longer Bestowed to an ally, the Combat View returns to normal (showing the regular hand, tendrils fade, etc)
- Cards in the hand that are Bestowed to allies show a faint silvery tendril connecting to their ally's name when hovered

**Ally Bestowment View:**
```
┌────────────────────────────────────────────────────────────────┐
│                         Viewing: Briar                         │
│                                                                │
│  ╭─────────╮                                 ╭─────────╮       │
│  │Selected │    ┌───┐ ┌───┐ ┌───┐            │   All   │       │
│  │  Deck   │    │ X │ │ Y │ │ Z │            │Features │       │
│  ╰─────────╯    └─┬─┘ └─┬─┘ └─┬─┘            ╰─────────╯       │
│        └──────────┼─────┼─────┼───────────────────┘            │
│                   │     │     │  ← silvery tendrils            │
│                   └─────┴─────┴──── [Briar] ←─ highlighted     │
│                                                                │
│                ╭─────┬────┬────╮                               │
│       (hand    │  A  │ B  │ C  │  collapsed, face-down)        │
│                ╰─────┴────┴────╯                               │
└────────────────────────────────────────────────────────────────┘
```

**Note:** The Active Effects panel only tracks effects on **self**, not allies. Ally effect tracking is handled through the bestowment view above.

**Echo Manifold Deck (Top Left)**
- Shows current phase card face-up, displaying the **phase passive ability** prominently
- Motes displayed directly below as a row of 8 pips (filled glow, empty are dark outlines)
- **Adding motes**: Click an empty pip (○) to fill the next mote — pip animates filling with glow
  - Motes are regained when: you critically hit, cause an enemy to fail a saving throw, or one of your Echoes is destroyed by damage (max 1/turn)
- **Removing motes**: Click a filled pip (●) to empty the last filled mote — pip fades to outline
- Motes are also spent automatically when activating Phase Abilities
- All motes return at the completion of a long rest
- Click deck to fan out all 3 phase cards (see Phase Selection below)
- Current phase's 3 abilities are displayed on the left side of the table, playable from there

**Phase Passive Abilities:**
Each phase grants continuous passive benefits while active:

| Phase | Passive Effect |
|-------|----------------|
| **Constellation** | Allies within 30ft of Manifest Echo are considered within 5ft of you. Allies receiving abilities swap places with Echo and gain temp HP = their level. |
| **Revelation** | 15ft Truesight, 60ft Telepathy. Cast Detect Thoughts at will (DC 18), undetectable unless target succeeds save. |
| **Oblivion** | +1 AC. Weapon attacks deal +1d6 Force damage. |

The face-up phase card should display this passive text for quick reference.

**Wild Surge Deck (Top Right)**
- Click to trigger 3D dice roll
- After dice settle, a card animates drawing from deck showing Effect # and Severity #
- Can also trigger automatically from Warp effects (deck glows/pulses before auto-triggering)
- The 3D dice roll can be toggled off in the settings panel (instead showing a macro to determine Effect and Severity)

**Phase Abilities (Left Side)**
- Three ability cards for current phase displayed on the table
- Each shows mote cost, activation type, effect
- Can be dragged to the Active Effects panel to activate
- Overdrive toggle on each: doubles cost but removes limitation

**Active Effects Panel (Center)**
- Displays all currently active effects with their targets and total duration
- Also serves as the drop target for activating cards
- **Highlights when dragging**: When dragging any playable card, the panel border glows to indicate it's a valid drop target
- Dropping a card here (or double-clicking a card) initiates the activation flow
- After activation: card animates hitting the panel → returns to hand → effect appears in list

**Active Effects Display:**
- Tracks effects on **self only** (not allies — ally tracking is done through the Allies panel)
- Each effect shows: name, source (for Phase Abilities: phase name in parentheses), total duration, concentration indicator if applicable
- **Siphon Features**: `⚡ Temporal Surge (Self) - 10 min`
- **Phase Abilities**: `◎ Starlight Veil (Constellation) - 1 min - ●CONC`
- **No countdown**: Duration shows total time (e.g., "10 min"), not remaining time
- **Drag handle**: Subtle drag handle icon (⋮⋮) appears on the right when hovering an effect
- Empty state shows subtle "(drag cards here to activate)" hint
- Long resting removes active effects which should expire over the long rest
- Short resting removes active effects with duration < 1 hour (with toggle option)

**Dismissing Effects (Drag-to-Dismiss):**
- **Hover**: Cursor changes to `grab`, drag handle (⋮⋮) appears on right
- **Click/mousedown**: Effect "lifts" slightly (shadow + scale), cursor changes to `grabbing`
- **Dragging**: Horizontal axis only — effect slides left/right but stays in row
- **While dragging outside panel bounds**: Effect fades/desaturates, panel border dims as if "opening up" (with a minimum travel distance if the user grabs the right side of the effect)
- **Release inside panel**: Effect snaps back to original position (cancelled)
- **Release outside panel**: Effect snaps back → strike-through animation → fades away → list shifts up

```
┌──────────────── ACTIVE EFFECTS ─────────────────┐
│ ⚡ Temporal Surge (Self)        10 min    ⋮⋮    │  ← drag handle on hover
│ ⚡ Resonant Weapon → Briar      10 min    ⋮⋮    │
└─────────────────────────────────────────────────┘

       ↓ drag horizontally outside panel

  ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐  ← border dims
  ╎                                             ╎
  ╎ ⚡ Resonant Weapon → Briar      10 min      ╎
  └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘
                              ┌─────────────────────────┐
                              │ ⚡ Temporal Surge (Self)│  ← faded, outside
                              └─────────────────────────┘
       ↓ release outside

  ┌──────────────── ACTIVE EFFECTS ─────────────────┐
  │ ~~Temporal Surge~~  ← snaps back, strikethrough │
  │ ⚡ Resonant Weapon → Briar      10 min    ⋮⋮     │
  └─────────────────────────────────────────────────┘

       ↓ fades away, list shifts up

  ┌──────────────── ACTIVE EFFECTS ─────────────────┐
  │ ⚡ Resonant Weapon → Briar      10 min    ⋮⋮   │
  └─────────────────────────────────────────────────┘
```

---

### Phase Selection (Echo Manifold Interaction)

When clicking the Echo Manifold deck, phases fan out for selection:

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  ╭─────────╮                                                   │
│  │ (deck)  │  ← deck position                                  │
│  ╰─────────╯                                                   │
│       │                                                        │
│       ▼ phases fan DOWNWARD into center                        │
│                                                                │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│   │CONSTELLATION│ │ REVELATION  │ │  OBLIVION   │              │
│   │             │ │  ★ current  │ │             │              │
│   │  (passive)  │ │  (passive)  │ │  (passive)  │              │
│   │             │ │             │ │             │              │
│   │  [Ability1] │ │  [Ability1] │ │  [Ability1] │  ← abilities │
│   │  [Ability2] │ │  [Ability2] │ │  [Ability2] │    slide out │
│   │  [Ability3] │ │  [Ability3] │ │  [Ability3] │    on hover  │
│   └─────────────┘ └─────────────┘ └─────────────┘              │
│         ↑ hover effect: drop shadow, slight scale up           │
│                                                                │
│   [ Free Switch Available ]  or  [ Costs 2 Hit Dice ]          │
└────────────────────────────────────────────────────────────────┘
```

**Interaction Flow:**
1. Click Manifold deck → 3 Phase cards fan downward into center area
2. Current phase is highlighted (glowing border or raised)
3. **Hover** a phase card:
   - Card gets drop shadow, slightly increases in size
   - Its 3 abilities slide out from "under" the card, displayed in center
   - Minimum 300ms delay before abilities retract when moving away
4. **Tab** cycles through phases with same hover behavior
5. **Click** a phase card to select it:
   - If free switch available: immediate transition
   - If not: prompt to spend 2 Hit Dice
   - Selected phase card animates back to deck position (face-up)
   - Other phases slide back into deck (hidden)
   - New abilities "drop" onto the table in their dedicated spot
6. **Escape** or click outside to cancel without switching

---

### Wild Surge Animation

When Wild Surge triggers (click or Warp effect):

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                    🎲 🎲  ← 3D dice tumbling                   │
│                   d100  d20                                    │
│                                                                │
│                         ↓ dice settle                          │
│                                                                │
│                  ╭───────────────────╮                         │
│                  │  WILD ECHO SURGE  │  ← card draws from deck │
│                  │                   │                         │
│                  │   Effect: 47      │                         │
│                  │   Severity: 12    │                         │
│                  │   (Nuisance)      │                         │
│                  │                   │                         │
│                  ╰───────────────────╯                         │
│                                                                │
│              [Space/Enter/Click to dismiss]                    │
└────────────────────────────────────────────────────────────────┘
```

**When triggered by Warp effect:**
- Wild Surge deck glows/pulses briefly
- Then auto-triggers the dice + card draw animation

---

### 2. Deck Builder View (Long Rest)

Where the player selects features for the day. Drag cards from Collection to Selected to choose which features will be available in the Selected deck during Combat View.

```
┌─────────────────────────────────────────────────────┐
│  Level: [5]    Max HP: [45]   Current Max HP: 45    │
│  PB: 3 (auto)  EP Max: 5                            │
│                                                     │
│  [Filter: All ▼]  [Search...]                       │
│                                                     │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐          │
│  │   │ │   │ │   │ │   │ │   │ │   │ │   │  ← Collection
│  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘          │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐          │
│  │   │ │   │ │   │ │   │ │   │ │   │ │   │          │
│  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘          │
│                    ...                              │
├─────────────────────────────────────────────────────┤
│  Selected (3/3):  ← drag cards here to bestow       │
│       ┌───┐ ┌───┐ ┌───┐                             │
│       │   │ │   │ │   │  ← drag away to remove      │
│       └───┘ └───┘ └───┘                             │
│                                                     │
│     [ Long Rest ]              [ Enter Combat ]     │
└─────────────────────────────────────────────────────┘
```

**Character Setup**
- Click any field to edit: Level, Base Max HP
- PB auto-calculated from level (can override for edge cases)
- EP Max equals Level
- Current Max HP shows reduction from Echo Drain (if any)
- All values persist to localStorage

**Card Selection**
- Drag card from Collection → Selected area
- Drag card away from Selected → returns to Collection
- Selection limited by Proficiency Bonus (unless Supercapacitance)
- Selected cards become your **Selected deck** in Combat View (not the hand)
- Cards must be Bestowed to self in Combat View to move from Selected deck → Hand

**Long Rest Button**
- Regain EP equal to PB (up to EP Max, which equals Level) — does NOT reset to PB
- Roll d4 and reduce Focus by the result (does NOT clear to 0)
- Restore max HP if reduced by Echo Drain (restores amount equal to EP regained)
- All motes return to full (8)
- Hit Dice fully restored (Hit Dice Max = Level)
- Free phase switch restored
- Clears all bestowments — cards return to Selected deck
- Removes active effects that would expire during the rest
- If Focus roll results in Focus going below 0, set to 0

**Short Rest Button**
- Restore free phase switch (once per short rest)
- Optional: Spend Hit Dice to heal (tracked for phase switching cost)
- Toggle: "Clear effects < 1 hour" (on by default, configurable in Settings)
  - When enabled, automatically dismisses active effects with duration under 1 hour
- Does NOT affect EP, Focus, motes, or bestowments

**Hit Dice Tracking**
- Hit Dice Max = Level
- Current Hit Dice shown in resource area
- Spent when: switching phases without free switch (costs 2), or healing during short rest
- Fully restored on long rest

---

## Card Design

Each card should feel like a physical object.

```
┌─────────────────────┐
│ ▪ TEMPORAL SURGE ▪  │  ← Name (centered, stylized)
├─────────────────────┤
│                     │
│   Cost: 5 EP        │  ← Cost (prominent)
│   Focus: 2d8        │  ← Focus dice
│                     │
│   Duration: 10 min  │
│   Activation: None  │
│                     │
├─────────────────────┤
│ You gain an extra   │  ← Description (readable)
│ action on each of   │
│ your turns...       │
├─────────────────────┤
│ WARP: On a 4,       │  ← Warp effect (highlighted if it will trigger)
│ gain bonus action   │
└─────────────────────┘
```

### Card Styles

Most cards use the standard style, but some have distinct visual treatments:

| Style | Appearance | Cards | Feeling |
|-------|------------|-------|---------|
| Standard | Light card, dark text | Most features | Normal, safe |
| Inverted | Dark card, light text, subtle glow | "That Which Isn't" | Ominous, tempting, powerful |

The inverted style can be applied to any card with thematic weight—cards that feel dangerous or forbidden. In the data, this is a `style: 'inverted'` property.

### Card States
- **Default**: Flat on table, slightly shadowed
- **Hovered**: Raised, enlarged, fully readable
- **Selected** (in deck builder): Glowing border
- **Playable**: Normal appearance
- **Unplayable** (not enough EP): Desaturated, dimmed
- **Warp Active** (negative EP): Fuchsia tint on warp section
- **Bestowed to Ally**: Badge showing ally name (e.g., "→ Briar"), can have multiple badges
- **Used**: Badge changes to struck-through or faded (e.g., "→ ~~B̶r̶i̶a̶r̶~~")
- **Special Cost**: Asterisk or lock icon indicating cannot be bestowed to allies

### Card Back
- Abstract geometric pattern (a provided image), no illustration
- Faint glow suggesting contained power
- Used for Manifold and Surge decks

### Dragging
- When a card is being dragged, the UI should show where it can be dragged to

---

## FoundryVTT Integration

The app supports two modes for dice rolling, configurable per roll type in Settings:

1. **Macro Mode** (default for most rolls): Generates FoundryVTT-compatible macros for the player to copy/paste into Foundry chat, then manually enter results
2. **3D Dice Mode** (default for Wild Surge): Rolls dice in-app with physics-based 3D animation, auto-calculating results

### Macro Mode Workflow

When playing a card with Macro mode enabled:
1. Card slides to center, Activation Panel appears
2. A copyable text block shows the Foundry macro
3. Player copies, pastes into Foundry, Foundry handles the roll
4. Player enters the result in the app
5. App calculates final values (applying Focus doubling if EP negative, etc.)

**Example macro output:**
```
/roll 2d8 # Focus for Temporal Surge (Cost: 5 EP)
```

**Variable dice expressions** are resolved before generating the macro:
```
/roll 3d8 # Focus for Reject Fate (Cost: 6 EP) — [PB]d8 resolved to 3d8
```

**Combined rolls** (when a feature has multiple dice expressions):
```
Temporal Surge (Cost: 5 EP)
[[2d8]] Focus | [[1d6]] bonus damage
```

### 3D Dice Mode Workflow

When playing a card with 3D Dice mode enabled:
1. Card slides to center, Activation Panel appears
2. 3D dice tumble across the screen
3. Results are auto-calculated and displayed
4. Player confirms to apply (EP deducted, Focus added)

### Manual Resource Entry
- Available regardless of dice mode
- Click EP/Focus/Hit Dice counters to adjust manually
- Increment/decrement buttons, or click to type exact value
- Useful for corrections or syncing with external tracking

---

## Wild Echo Surge (3D Dice)

Wild Surge is the one roll the app handles internally, using 3D rendered dice for dramatic effect.

### Implementation
- Uses `@3d-dice/dice-box` library for WebGL 3D dice
- Physics-based tumbling animation
- Fits the arcane, mysterious aesthetic

### Surge Flow
1. Click the Wild Surge deck (or trigger from Warp effect)
2. 3D d100 and d20 tumble across the screen
3. Results display prominently:
   ```
   ┌─────────────────────────────┐
   │      WILD ECHO SURGE        │
   │                             │
   │   Effect: 47                │
   │   Severity: 12 (Nuisance)   │
   │                             │
   │                             │
   └─────────────────────────────┘
   ```
4. Player reads the result aloud; DM describes the effect
5. No automatic lookup—player references the table manually
6. Space/Enter or clicking this popup dismisses it. 

### Severity Interpretation
- **1-3**: Extreme
- **4-9**: Moderate
- **10-20**: Nuisance

---

## Interactions & Feedback

### Activating Cards (General)

Cards can be activated by:
1. **Dragging** to the Active Effects panel (center of table)
2. **Double-clicking** the card (sends it to Active Effects panel automatically)

When a card enters the Active Effects panel, the card enlarges in the center and the **Activation Panel** appears beside it.

---

### Activating a Siphon Feature (Card from Hand)

**Step 1: Card enters Active Effects panel**
- Card animates from hand to center of table
- Card is enlarged and fully readable
- Active Effects panel border glows to confirm the card is "staged"

**Step 2: Activation Panel appears**
```
┌─────────────────────────────────┐
│  ACTIVATING: Temporal Surge     │
├─────────────────────────────────┤
│  Cost: 5 EP                     │
│  Current EP: 8 → 3 after        │
│                                 │
│  Focus: 2d8                     │
│  ┌─────────────────────────┐    │
│  │ /roll 2d8 # Focus...   │ 📋 │  ← Copy Macro
│  └─────────────────────────────┘│
│                                 │
│  [ Cancel ]     [ Confirm ]     │
└─────────────────────────────────┘
```

**Step 3: Player rolls in Foundry**
- Copy the macro, paste into Foundry chat
- (Or if 3D dice enabled in settings, dice roll automatically and skip to Step 4)

**Step 4: Enter Focus result**
- Input field appears for Focus roll result
- If 3D dice enabled, this is auto-filled
- Focus value updates: shows rolled amount (doubled if EP is negative)

**Step 5: Confirm activation**
- Click "Confirm" to finalize
- EP is deducted (before Focus is rolled — this determines if Warp triggers)
- Focus is added to total (doubled if EP is now negative)
- Card animates "hitting" the Active Effects panel with brief flash
- Card shrinks and returns to **Selected deck** (must be re-Bestowed to use again)
- Effect appears in Active Effects list (name, "Self", total duration)
- If EP is negative after deducting cost: Warp effect triggers, card's Warp section glows

**Warp Trigger Timing:**
Warp effects trigger when EP is negative **after** deducting the feature's cost, not before. The sequence is:
1. Deduct cost from EP
2. Check if EP is now negative → if yes, Warp triggers and Focus dice are doubled
3. Roll Focus dice (doubled if EP negative)
4. Add Focus to total

**Warp Warning:**
If activation would cause EP to go negative, the panel shows:
```
│  ⚠️ WARP ACTIVE                 │
│  EP will be negative (-2)       │
│  Focus dice DOUBLED (4d8)       │
│  Warp effect will trigger       │
```

**Canceling:**
- Click "Cancel" or press Escape
- Card animates back to hand
- No resources spent

---

### Activating a Phase Ability

**Step 1: Drag ability to Active Effects panel**
- Phase Ability card animates to center
- (Or double-click the ability card)

**Step 2: Activation Panel appears**
```
┌─────────────────────────────────┐
│  ACTIVATING: Starlight Veil     │
│  (Constellation Ability)        │
├─────────────────────────────────┤
│  Mote Cost: 2                   │
│  Current Motes: 5 → 3 after     │
│                                 │
│  Activation: Bonus Action       │
│  Duration: 1 minute             │
│  ☐ Overdrive (4 motes, no limit)│
│                                 │
│  ⚠️ Requires Concentration      │
│                                 │
│  [ Cancel ]     [ Confirm ]     │
└─────────────────────────────────┘
```

**Overdrive Toggle:**
- Checkbox to enable Overdrive mode
- Doubles mote cost but removes usage limitation
- Panel updates to show new cost when toggled

**Concentration Warning:**
- If ability requires concentration and another concentration effect is active:
```
│  ⚠️ CONCENTRATION CONFLICT      │
│  Currently concentrating on:    │
│  "Gravity Well"                 │
│  Activating will END that effect│
```

**Step 3: Confirm activation**
- Click "Confirm"
- Motes are deducted
- Card animates "hitting" the Active Effects panel with brief flash
- Phase Ability card returns to its spot on the left
- Effect appears in Active Effects list (name, "Self", total duration, concentration indicator if applicable)
- If concentration: previous concentration effect gets strike-through animation and fades from list

**Canceling:**
- Click "Cancel" or press Escape
- Ability card returns to its position
- No motes spent

---

### Activation Panel Position

When a card is staged, the Activation Panel appears to the right of the enlarged card, overlaying the Active Effects panel:
```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│       ┌─────────────── ACTIVE EFFECTS ───────────────┐         │
│       │  ┌─────────┐  ┌─────────────────┐            │         │
│       │  │  Card   │  │ Activation      │            │         │
│       │  │ (staged)│  │ Panel           │            │         │
│       │  │         │  │                 │            │         │
│       │  └─────────┘  └─────────────────┘            │         │
│       └──────────────────────────────────────────────┘         │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

The Active Effects list is temporarily hidden while a card is being activated.

---

### Playing a Card (Quick Reference)
1. Drag card from hand to Active Effects panel (or double-click)
2. Review cost/effects in Activation Panel
3. Copy macro and roll in Foundry, OR use in-app 3D dice (based on settings)
4. Enter result (if using macros) or view auto-calculated result (if using 3D dice)
5. Click Confirm to finalize
6. Card animates hitting panel, returns to **Selected deck**, effect appears in list
7. To use that feature again, must Bestow it to self again (costs an action)

### Dismissing Active Effects
1. Hover an effect — drag handle (⋮⋮) appears, cursor becomes `grab`
2. Click and drag horizontally — effect slides left/right only
3. Drag outside the Active Effects panel — effect fades, panel border dims
4. Release outside — effect snaps back, strike-through plays, then fades away
5. (Or release inside to cancel — effect snaps back to position)

Use this when:
- An effect's duration expires (you track this mentally/in-game)
- Concentration is broken
- An effect is dispelled or ends early

### Bestowing

Bestowing requires an **action** and **touch** in-game. The app tracks which features are Bestowed to whom.

**Selecting (Deck Builder — Long Rest):**
- Drag card from Collection → Selected area
- Card is now **Selected** for the day and appears in the Selected deck in Combat View
- Selection limit = Proficiency Bonus (unless using Supercapacitance)

**Bestowing to Self (Combat View):**
1. Click Selected deck to expand it
2. Drag a card down to your hand, or double-click it
3. Card moves from Selected deck → Hand (now Bestowed to self)
4. This represents spending an action in-game to Bestow

**Bestowing to Ally (Combat View):**
1. Click Selected deck to expand it
2. Drag a card onto an ally's name in the Allies panel
3. If dropping on [+]: prompt appears for ally's name, then card is Bestowed
4. Card remains in Selected deck but is tracked as Bestowed to that ally
5. Same card can be Bestowed to multiple allies (tracked separately)

**After Activation:**
- When a Bestowed feature is Activated, it returns to the Selected deck
- Must be Bestowed again (costs an action) to use again
- For allies with **Triggered** features: once Activated, the feature is removed from their Bestowed list entirely

**Viewing Ally Bestowments:**
- Hover an ally's name to see all features Bestowed to them
- Click the ally's name to enter "edit mode" — can drag features away to remove Bestowment
- Features no longer in the current Selected set appear from the "All Siphon Features" deck (right side)

### Wild Surge
1. Click the Wild Surge deck
2. 3D dice (d100 + d20) tumble across screen
3. Results display: Effect number and Severity number
4. Player reads aloud; DM describes effect from table
5. Click "Dismiss" to close

### Phase Switching
1. Click the Echo Manifold deck (top left of Combat View)
2. Three phase cards fan downward into center area
3. Hover a phase to see its abilities slide out; Tab to cycle
4. Click a phase to select it:
   - If free switch available: immediate transition
   - If not: prompt to spend 2 Hit Dice
5. Selected phase animates back to deck position (face-up)
6. New phase's abilities "drop" onto the table
7. Press Escape or click outside to cancel

## Settings Menu

Accessed via a gear icon in the top-right corner of both views. Opens as a modal overlay.

```
┌─────────────────────────────────────────────────────────────┐
│  ⚙ Settings                                           [ × ] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  DICE ROLLS                                                 │
│  ─────────────────────────────────────────────────────────  │
│  Wild Echo Surge                        [■ 3D ] [ Macro ]   │
│  Siphon Feature rolls                   [ 3D ] [■ Macro ]   │
│  Phase Ability rolls                    [ 3D ] [■ Macro ]   │
│  Long Rest Focus reduction              [ 3D ] [■ Macro ]   │
│                                                             │
│  SOUND                                                      │
│  ─────────────────────────────────────────────────────────  │
│  Enable sound effects                   [ On ] [■ Off ]     │
│                                                             │
│  VISUAL                                                     │
│  ─────────────────────────────────────────────────────────  │
│  Highlight drop targets when dragging   [■ On ] [ Off ]     │
│  Enable animations                      [■ On ] [ Off ]     │
│  Reduced motion                         [ On ] [■ Off ]     │
│                                                             │
│  GAMEPLAY                                                   │
│  ─────────────────────────────────────────────────────────  │
│  Confirm before activating cards        [ On ] [■ Off ]     │
│  Auto-trigger Wild Surge on Warp        [■ On ] [ Off ]     │
│  Short Rest: Clear effects < 1 hour     [■ On ] [ Off ]     │
│                                                             │
│  MANUAL OVERRIDES                                           │
│  ─────────────────────────────────────────────────────────  │
│  Echo Points (EP)         [ -2 ]  [−] [+]                   │
│  Focus                    [ 15 ]  [−] [+]                   │
│  Motes                    [  5 ]  [−] [+]                   │
│  Hit Dice                 [  3 ]  [−] [+]                   │
│  Max HP Reduction         [  0 ]  [−] [+]                   │
│                                                             │
│  DATA                                                       │
│  ─────────────────────────────────────────────────────────  │
│  [ Export Data ]  [ Import Data ]                           │
│  [ Reset Session ]  [ Clear All Data ]                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Settings Details

#### Dice Rolls

Each dice roll type can be toggled between **3D** (in-app dice) and **Macro** (copy/paste to FoundryVTT):

| Setting | Default | 3D Mode | Macro Mode |
|---------|---------|---------|------------|
| Wild Echo Surge | 3D | d100 + d20 tumble on screen, results auto-calculated | Shows macro to copy, manual entry of Effect # and Severity # |
| Siphon Feature rolls | Macro | Focus dice roll in-app, result auto-applied | Shows macro to copy, manual entry of Focus result |
| Phase Ability rolls | Macro | Any activation dice roll in-app | Shows macro to copy, manual entry |
| Long Rest Focus reduction | Macro | d4 rolls automatically, Focus reduced | Shows macro to copy, manual entry |

**When 3D mode is enabled:**
- Activation Panel shows 3D dice tumbling
- Results are auto-calculated and applied (EP deducted, Focus added)
- No manual entry required

**When Macro mode is enabled:**
- Activation Panel shows a copyable FoundryVTT macro
- Player copies, pastes into Foundry, then manually enters the result
- App updates resources based on entered value

**What counts as "activation dice":**
- Focus dice (e.g., 2d8, [PB]d8)
- One-time effect dice rolled when the card is played (e.g., "roll 1d4 to determine duration")
- Long rest Focus reduction (d4)

**What this app does NOT roll:**
- Ongoing effect dice that trigger repeatedly during gameplay
- Per-attack damage (e.g., Resonant Weapon's "1d6 extra force damage on weapon attacks")
- Per-turn effects, saving throw damage, etc.

These ongoing rolls happen in Foundry where combat is managed.

#### Sound

| Setting | Default | Behavior |
|---------|---------|----------|
| Enable sound effects | Off | Master toggle for all audio (ambient, card sounds, resource chimes, surge effects) |

Sound is off by default to avoid surprising users. Individual sound categories (ambient, UI, dice) could be added later.

#### Visual

| Setting | Default | Behavior |
|---------|---------|----------|
| Highlight drop targets when dragging | On | Active Effects panel and Allies panel glow when dragging a card |
| Enable animations | On | Card movements, dice physics, resource count animations |
| Reduced motion | Off | Minimal animations for accessibility; overrides "Enable animations" when on |

When "Reduced motion" is enabled:
- Cards snap to positions instead of flying
- Resource numbers update instantly instead of counting up/down
- Dice results appear without tumbling animation
- Phase cards appear in fan position without sliding

#### Gameplay

| Setting | Default | Behavior |
|---------|---------|----------|
| Confirm before activating cards | Off | When on, adds a "Are you sure?" step before any activation |
| Auto-trigger Wild Surge on Warp | On | When a Warp effect triggers, automatically rolls on Wild Surge table |
| Short Rest: Clear effects < 1 hour | On | When using Short Rest, automatically dismiss effects with duration under 1 hour |

When "Auto-trigger Wild Surge on Warp" is off, the Wild Surge deck pulses but waits for manual click.

The "Short Rest: Clear effects < 1 hour" setting controls the **default state** of the toggle shown on the Short Rest confirmation. Users can override this per-rest, but this sets what the toggle defaults to.

#### Manual Overrides

Direct access to modify any tracked value. Useful for:
- Correcting mistakes
- Syncing with external state (Foundry, paper tracking)
- Starting mid-session with existing values
- Testing or debugging

Values can be typed directly or adjusted with +/− buttons.

| Override | Range | Notes |
|----------|-------|-------|
| Echo Points (EP) | -∞ to Level | Can go negative; Echo Drain at -Level |
| Focus | 0 to ∞ | Cannot go below 0 |
| Motes | 0 to 8 | All 8 return on long rest |
| Hit Dice | 0 to Level | Max = Level; fully restored on long rest |
| Max HP Reduction | 0 to ∞ | From Echo Drain spending; cleared on long rest |

#### Data

| Action | Behavior |
|--------|----------|
| Export Data | Downloads JSON file with all session + character data |
| Import Data | Opens file picker to load previously exported JSON |
| Reset Session | Clears combat state (EP → PB, Focus → 0, bestowments cleared, motes → 0) while preserving character setup and selected features |
| Clear All Data | Full reset to initial state; prompts "Are you sure?" with confirmation |

**Export format** includes:
- Character info (name, level, base max HP)
- Current session state (EP, Focus, motes, capacitance, etc.)
- Selected features and bestowments
- Ally names
- All settings
- Previous Wild Surge results (for entry #34)

---

### Settings Access

The gear icon appears in the header area:

**Combat View:**
```
┌────────────────────────────────────────────────────────────────┐
│  Character Name                                          [⚙]  │
│  Level X Siphon Wielder                                        │
└────────────────────────────────────────────────────────────────┘
```

**Deck Builder:**
```
┌────────────────────────────────────────────────────────────────┐
│  Level: [5]    Max HP: [45]   Current Max HP: 45         [⚙]  │
│  ...                                                           │
└────────────────────────────────────────────────────────────────┘
```

Clicking the gear opens the Settings modal. Clicking outside the modal or pressing Escape closes it. Changes are applied immediately (no "Save" button needed).

---

## Edge Cases & Complex Mechanics

Based on source document analysis, the UI must handle:

### Echo Drain State
- Triggers when EP reaches -Level (e.g., Level 5 character enters Echo Drain at -5 EP)
- While drained: spending EP also reduces max HP by the same amount
- If max HP reaches 0 this way: instant death, only a greater deity can restore
- Visual: EP bar turns deep red, "ECHO DRAINED" warning prominently displayed
- Recovery: Long rest regains PB EP (up to max), and restores max HP by the amount of EP regained

### Max HP Tracking
The app tracks max HP reduction from Echo Drain spending:

| Field | Description |
|-------|-------------|
| Base Max HP | Entered by player in Deck Builder |
| Max HP Reduction | Accumulated from spending EP while drained |
| Current Max HP | Base - Reduction |

**Display (when reduced):**
> "Max HP: 45 → **38** (-7 from Echo Drain)"

**Recovery:**
- Long Rest: Max HP is restored by the amount of EP regained (up to Base Max HP)
- Example: If Max HP Reduction is 7 and you regain 3 EP, reduction becomes 4
- Full recovery requires multiple long rests if reduction exceeds PB

### Siphon Capacitance Timer (In-Game Time)

The timer tracks in-game time, not real time. Uses preset buttons for quick selection.

**Time Picker UI:**
```
┌───────────────────────────────────────────────────┐
│  ☀ Dawn   Morning   Midday   Afternoon            │
│  🌅 Dusk   Evening   Night   🌙 Midnight         │
├───────────────────────────────────────────────────┤
│           [ ◄ ]  7:00 AM  [ ► ]                   │
│                                                   │
│           Expires at: 3:00 PM                     │
│                                                   │
│  [ Timer Expired ]  [ Extend +8 hrs ]  [ Clear ]  │
└───────────────────────────────────────────────────┘
```

**Preset Mappings:**
| Preset | Time |
|--------|------|
| Dawn | 6:00 AM |
| Morning | 9:00 AM |
| Midday | 12:00 PM |
| Afternoon | 3:00 PM |
| Dusk | 6:00 PM |
| Evening | 9:00 PM |
| Night | 11:00 PM |
| Midnight | 12:00 AM |

**Behavior:**
- Click preset → sets current in-game time
- Arrow buttons adjust by 1 hour for fine-tuning
- App calculates and displays expiration (current + 8 hours)
- "Extend +8 hrs" button for Flux Capacitance
- "Timer Expired" button when in-game time passes expiration
- "Clear" removes timer and charges

### Concentration Tracking
- Three Revelation abilities require concentration
- Only one can be active at a time
- Visual: "Concentrating" icon on active ability
- Warning if attempting to activate second concentration effect

### Variable Costs
Features with non-fixed costs need calculation. The app must parse and resolve these:

| Cost Format | Meaning | Example |
|-------------|---------|---------|
| `PB` | Proficiency Bonus | Wound Reversal (Cost: PB) |
| `Twice your PB` or `2x PB` | Double Proficiency Bonus | Reject Fate (Cost: Twice your PB) |
| `Level` | Character level | Manifestation (Cost: Level*) |
| `Level/2 (rounded up)` | Half level, rounded up | Sentience (Cost: Level/2 (rounded up)*) |
| `Varies` | User chooses; may have special rules | Supercapacitance, Longing |
| `0` | No EP cost | Siphon Greed (Cost: 0*) |
| Number with `*` | Special Cost — cannot be Bestowed to allies | Harness Potential (Cost: 18*) |

**Variable Focus Dice:**
Some features have Focus expressions that reference other values:

| Focus Format | Meaning | Example |
|--------------|---------|---------|
| `[PB]d8` | Roll PB number of d8s | Reject Fate (Focus: [PB]d8) |
| `[Cost]d8` | Roll dice equal to the Cost paid | Doublecast (Focus: [Cost]d8) |
| `[Cost]d6` | Roll dice equal to the Cost paid | Manifestation (Focus: [Cost]d6) |
| `[Cost/2]d8` | Roll dice equal to half the Cost | Superconduction (Focus: [Cost/2]d8) |
| `[Cost]` | Gain Focus equal to the Cost (no dice) | Supercapacitance (Focus: [Cost]) |

**Special Cost Rules:**
- Features marked with `*` have Special Costs and **cannot be Bestowed to allies**
- Display these with an asterisk or lock icon on the card

### Supercapacitance Overflow
- Allows selecting more features than PB
- Cost doubles if exceeding PB
- Hand UI compresses to show up to 15 cards
- Slot counter shows "5/3 (Supercapacitance +2)"

### Duration Types

Features have different duration behaviors that affect tracking:

| Duration | Behavior | Examples |
|----------|----------|----------|
| **Time-based** (10 min, 1 hour, etc.) | Effect lasts for stated duration, then expires | Temporal Surge, Resonant Weapon |
| **Triggered** | For self: always Bestowed while Selected. For allies: Bestowed until Activated, then removed entirely | Discharge, Siphon Flux, Entanglement |
| **While Selected** | Effect applies continuously while the feature is in the Selected deck; Focus/Cost applied at each long rest | Supercapacitance, Siphon Greed |
| **Permanent** | Effect persists indefinitely once activated | Flux Capacitance |
| **Special** | Unique duration rules defined in the feature text | That Which Isn't |

**Triggered Features:**
- The Siphon Wielder always has Triggered features Bestowed to self while they are Selected
- For allies: Triggered features remain Bestowed until Activated, then the ally loses the feature entirely (different from Duration features, which the ally keeps until re-Bestowed)
- Visual: Show "Triggered" badge vs "Duration" badge to distinguish

**While Selected Features:**
- These features apply their Cost and Focus at the end of every long rest while Selected
- They don't need to be Bestowed or Activated — the effect is passive while in the Selected deck
- Example: Supercapacitance allows selecting extra features, with Cost/Focus applied at each long rest

---

## Motion Principles

- **Cards**: Smooth, physical—ease-out when lifting, slight bounce when placing
- **Numbers**: Quick count-up/down animations for resource changes
- **Mote pips**: Click empty pip → fills with glowing pulse; click filled pip → glow fades to outline
- **Active Effects panel**: Subtle glow/pulse when card is being dragged; brighter glow when card hovers over it
- **Card staging**: Card smoothly flies from hand/ability slot to Active Effects panel center, enlarges
- **Activation Panel**: Slides in from right side when card is staged
- **Activation confirm**: Brief flash on card, card "hits" Active Effects panel, resources animate (EP bar shrinks, Focus number increases), effect fades into list
- **Activation cancel**: Card shrinks and flies back to original position
- **Effect dismissal**: Drag horizontally outside panel → effect fades/desaturates, panel border dims → release → snap back → strike-through → fade out → list shifts up
- **Warp trigger**: Card's Warp section pulses with fuchsia glow, screen edges may briefly tint
- **Phase fan-out**: Cards slide smoothly from deck position, fan into arc
- **Phase selection**: Selected card animates to deck; others slide back into deck
- **Ability reveal**: Abilities slide out from "under" phase card on hover
- **Ability placement**: When phase selected, abilities "drop" onto table with slight bounce
- **Wild Surge**: Dice tumble with physics, then card draws from deck with flip animation
- **Bestow tendril**: Silvery tendril fades in/out smoothly; brightens on click
- **Hover effects**: Immediate response, no delay (except 300ms minimum for ability retraction)
- **Macro copy**: Brief (~2s) "Copied!" text box which hovers over the button
- **View transitions**: Smooth slide between Combat View and Deck Builder

---

## What This Design Avoids

- Bright colors or "gamey" UI chrome
- AI-generated illustrations
- Cluttered information density
- Tooltips as primary information—cards should be readable at a glance
- Mobile-first compromises—this is a desktop companion app
- Current HP tracking (managed in D&D Beyond or Foundry; only max HP reduction from Echo Drain)
- Spell slot tracking
- Initiative or turn order
- Real-time countdown timers (uses in-game time reference instead)
- Rolling ongoing effect dice (per-attack damage, per-turn effects — these happen in Foundry)
- Tracking effects on allies in the Active Effects panel (use the Allies bestowment view instead)

---

## Session & Campaign Persistence

### Per-Session State
- Current EP value
- Current Focus value
- Current Hit Dice (max = Level)
- Selected features (in Selected deck)
- Bestowed to self features (in hand)
- Saved allies: `[{name: allyName}, {name: allyName}, ...]`
- Ally bestowments: `{ allyName, featureId, isTriggered }[]` (includes features no longer Selected)
- Active manifold phase and motes
- Free phase switch available (boolean, resets on short/long rest)
- Capacitance charges (max = PB) and in-game expiration time
- Active effects on self (with duration and concentration status)
- Max HP reduction from Echo Drain
- Settings

### Campaign/Character Data
- Character name
- Level
- Base Max HP
- Previous Wild Echo Surge results (for entry #34: "remove any previous effect")
- Ally names (persisted for quick re-use)

### Siphon Feature Data
- All 42 Siphon Features from Echo Siphon Features.pdf
- Each feature includes: id, name, cost, costType, isSpecialCost, focusDice, duration, durationType, activation, description, warpEffect, style

### Data Storage
- LocalStorage for persistence
- Export/import as JSON for backup
- No cloud sync required
- Session state is saved automatically whenever data that should be persisted in localStorage is updated

---

## Accessibility

### At-a-Glance Priorities
1. Current EP (with drain status) — most prominent
2. Current Focus — second most prominent
3. Hand of cards — primary interaction area
4. Capacitance charges + timer — if active
5. Manifold phase indicator — corner badge or deck glow

### Keyboard Navigation
- Arrow keys to move between cards in hand
- Enter/Space to play selected card
- Escape to cancel/close modals, close phase selection
- Tab to cycle through phases when phase selection is open
- Tab to cycle between resource counters when not in modal
