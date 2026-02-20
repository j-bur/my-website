export interface ActiveEffect {
  id: string;                       // Unique instance ID
  sourceType: 'siphon' | 'manifold' | 'surge';
  sourceId: string;                 // Feature/ability/surge ID
  sourceName: string;
  description: string;
  startedAt: number;                // Timestamp
  duration: number | null;          // Duration in ms, null = permanent/triggered
  expiresAt: number | null;
  requiresConcentration: boolean;
  warpActive: boolean;
  warpDescription?: string;
}

export interface TrackedDuration {
  effectId: string;
  remainingMs: number;
  formattedRemaining: string;       // "5m 30s" or "1h 20m"
}
