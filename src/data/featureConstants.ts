import { SIPHON_FEATURES } from './siphonFeatures';
import type { SiphonFeature } from '../types';

/** Pre-computed lookup: feature ID → SiphonFeature */
export const FEATURE_MAP: ReadonlyMap<string, SiphonFeature> = new Map(
  SIPHON_FEATURES.map((f) => [f.id, f])
);

/** Feature IDs with duration "Triggered" — always appear in hand when selected */
export const TRIGGERED_FEATURE_IDS: ReadonlySet<string> = new Set(
  SIPHON_FEATURES.filter((f) => f.duration === 'Triggered').map((f) => f.id)
);

/** Feature IDs with duration "While Selected" — passive effects, not bestowable */
export const WHILE_SELECTED_FEATURE_IDS: ReadonlySet<string> = new Set(
  SIPHON_FEATURES.filter((f) => f.duration === 'While Selected').map((f) => f.id)
);
