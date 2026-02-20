export type ActivationType = 'Action' | 'Bonus Action' | 'Reaction' | 'None';

export type DurationType =
  | 'Instant'
  | 'Triggered'
  | 'While Selected'
  | 'Permanent'
  | 'Special'
  | string; // For "10 minutes", "1 hour", "8 hours", etc.

export type CostType =
  | number                          // Fixed cost (e.g., 5)
  | 'PB'                            // Proficiency Bonus
  | 'Level'                         // Character level
  | 'Level/2'                       // Half level rounded up
  | 'Twice PB'                      // 2x Proficiency Bonus
  | 'Varies'                        // User chooses
  | 'Varies*';                      // User chooses, special cost

export interface SiphonFeature {
  id: string;
  name: string;
  cost: CostType;
  isSpecialCost: boolean;           // Has asterisk (*) - cannot bestow to allies
  focusDice: string;                // e.g., "2d6", "[PB]d8", "[Cost]d8"
  duration: DurationType;
  activation: ActivationType;
  description: string;
  warpEffect: string | null;        // null if no warp effect
  requiresConcentration?: boolean;
  tags?: string[];                  // For filtering: 'combat', 'utility', 'healing', etc.
}

export interface BestowedFeature {
  id: string;                       // Unique instance ID
  featureId: string;                // Reference to SiphonFeature
  targetId: string;                 // 'self' or ally identifier
  bestowedAt: number;               // Timestamp
  expiresAt: number | null;         // null for triggered/permanent
  isActivated: boolean;
  warpTriggered: boolean;
}

export interface ActivationResult {
  featureId: string;
  epSpent: number;
  focusRolled: number;
  focusGained: number;              // May be doubled if EP negative
  warpTriggered: boolean;
  newEP: number;
  isNowEchoDrained: boolean;
}
