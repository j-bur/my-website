import type { ActivationType } from './siphonFeature';

export type ManifoldPhase = 'Constellation' | 'Revelation' | 'Oblivion';

export interface PhaseInfo {
  name: string;
  flavor: string;
  passive: string;
}

export interface ManifoldAbility {
  id: string;
  name: string;
  phase: ManifoldPhase;
  moteCost: number;
  activation: ActivationType;
  description: string;
  limitation: string;
  overdriveRemovesLimitation: boolean;
}

export interface ActiveManifoldAbility {
  id: string;                       // Unique instance ID
  abilityId: string;                // Reference to ManifoldAbility
  isOverdriven: boolean;
  startedAt: number;
  expiresAt: number | null;
  requiresConcentration: boolean;
}

export interface ManifoldState {
  currentPhase: ManifoldPhase;
  motes: number;                    // 0-8
  maxMotes: number;                 // Always 8
  phaseSwitchAvailable: boolean;    // Resets on short rest
  hitDiceSpentOnSwitch: number;     // Track for display
  activeAbilities: ActiveManifoldAbility[];
}
