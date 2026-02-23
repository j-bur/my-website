export type SurgeSeverity = 'Extreme' | 'Moderate' | 'Nuisance';

export interface SurgeTableEntry {
  roll: number;                     // 1-100
  extreme: string;                  // 1-3 on severity die
  moderate: string;                 // 4-9 on severity die
  nuisance: string;                 // 10-20 on severity die
}

export interface SurgeResult {
  tableRoll: number;                // d100 result (1-100)
  severityRoll: number;             // d20 result for severity
  severity: SurgeSeverity;
  effect: string;
}

