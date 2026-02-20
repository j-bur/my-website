import type { ManifoldPhase, PhaseInfo, ManifoldAbility } from '../types';

export const PHASE_INFO: Record<ManifoldPhase, PhaseInfo> = {
  Constellation: {
    name: 'Constellation Phase',
    flavor: 'The stars shine against the void.',
    passive: 'Allies within 30 feet of your Manifest Echo are considered within 5 feet of you. Allies that receive an ability under this Phase may swap places with your Manifest Echo, then they gain temporary hit points equal to their level. You activate abilities under this Phase on allies that are within 5 feet of you.'
  },
  Revelation: {
    name: 'Revelation Phase',
    flavor: 'Knowledge subsumed, a hunger never satisfied.',
    passive: 'You have 15 feet of Truesight, and 60 feet of Telepathy. You can cast Detect Thoughts at will, requiring no components (DC 18). Creatures can\'t detect this probing unless they succeed their save.'
  },
  Oblivion: {
    name: 'Oblivion Phase',
    flavor: 'An endless act of unmaking which draws through the stairs like a curtain.',
    passive: 'Your Armor Class increases by 1, and your weapon attacks deal 1d6 additional Force damage.'
  }
};

export const MANIFOLD_ABILITIES: ManifoldAbility[] = [
  // Constellation Phase
  {
    id: 'echo-conduit',
    name: 'Echo Conduit',
    phase: 'Constellation',
    moteCost: 1,
    activation: 'Bonus Action',
    description: 'One ally within the next minute may expend their reaction to take an action.',
    limitation: 'The action may only be used to make one weapon attack or cast a Cantrip.',
    overdriveRemovesLimitation: true
  },
  {
    id: 'siphon-suffering',
    name: 'Siphon Suffering',
    phase: 'Constellation',
    moteCost: 2,
    activation: 'Reaction',
    description: 'When an ally within 5 feet takes damage or fails a saving throw, the triggering effect instead targets you.',
    limitation: 'You either have disadvantage against the save or take additional damage equal to half the damage the triggering effect dealt, rounded down.',
    overdriveRemovesLimitation: true
  },
  {
    id: 'temporal-reprise',
    name: 'Temporal Reprise',
    phase: 'Constellation',
    moteCost: 3,
    activation: 'Action',
    description: 'For the next minute, prismatic afterimages trail your allies. When they use a reaction, they regain their reaction at the end of the triggering creature\'s turn.',
    limitation: 'Only one ally may receive this effect.',
    overdriveRemovesLimitation: true
  },
  // Revelation Phase
  {
    id: 'echo-intuition',
    name: 'Echo Intuition',
    phase: 'Revelation',
    moteCost: 3,
    activation: 'Action',
    description: 'For the next 8 hours, the Cost and the number of Focus points you gain when using a Siphon Feature are halved.',
    limitation: 'You must maintain Concentration on this effect, as if Concentrating on a spell.',
    overdriveRemovesLimitation: true
  },
  {
    id: 'siphon-resonance',
    name: 'Siphon Resonance',
    phase: 'Revelation',
    moteCost: 2,
    activation: 'Action',
    description: 'For one hour, the ranges granted by this Phase are increased to 30 feet of Truesight, and 300 feet of Telepathy.',
    limitation: 'You must maintain Concentration on this effect, as if Concentrating on a spell.',
    overdriveRemovesLimitation: true
  },
  {
    id: 'temporal-manifestation',
    name: 'Temporal Manifestation',
    phase: 'Revelation',
    moteCost: 3,
    activation: 'None',
    description: 'When you summon your Echo Avatar, you may summon it anywhere you have been in the past 24 hours.',
    limitation: 'You must maintain Concentration on this effect, as if Concentrating on a spell.',
    overdriveRemovesLimitation: true
  },
  // Oblivion Phase
  {
    id: 'echo-surge',
    name: 'Echo Surge',
    phase: 'Oblivion',
    moteCost: 1,
    activation: 'Bonus Action',
    description: 'You summon an Echo Siphon, as per Manifest Echo, potentially summoning a number of Manifest Echoes above your normal limit.',
    limitation: 'This feature does not stack.',
    overdriveRemovesLimitation: true
  },
  {
    id: 'siphon-orthosis',
    name: 'Siphon Orthosis',
    phase: 'Oblivion',
    moteCost: 1,
    activation: 'None',
    description: 'For the next minute, your movement speed is increased by 15 feet. Until the start of your next turn, you may roll an additional d20 when rolling to attack and choose the highest result.',
    limitation: 'This feature does not stack.',
    overdriveRemovesLimitation: true
  },
  {
    id: 'temporal-resonance',
    name: 'Temporal Resonance',
    phase: 'Oblivion',
    moteCost: 1,
    activation: 'None',
    description: 'For the next minute, you gain an additional Bonus Action.',
    limitation: 'You take 1d6 Force damage whenever you use a second Bonus Action in the same turn.',
    overdriveRemovesLimitation: true
  }
];

// Helper to get abilities by phase
export function getAbilitiesByPhase(phase: ManifoldPhase): ManifoldAbility[] {
  return MANIFOLD_ABILITIES.filter(a => a.phase === phase);
}

// Helper to get ability by ID
export function getAbilityById(id: string): ManifoldAbility | undefined {
  return MANIFOLD_ABILITIES.find(a => a.id === id);
}

// Constants
export const MAX_MOTES = 8;
export const HIT_DICE_FOR_PHASE_SWITCH = 2;
