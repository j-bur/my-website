import type { SurgeResult, SurgeSeverity } from '../types';
import { WILD_ECHO_SURGE_TABLE } from '../data';
import { rollD20, rollD100 } from './diceRoller';

/**
 * Determine severity from a d20 roll
 * 1-3 = Extreme (15%)
 * 4-9 = Moderate (30%)
 * 10-20 = Nuisance (55%)
 */
export function getSeverityFromRoll(roll: number): SurgeSeverity {
  if (roll <= 3) return 'Extreme';
  if (roll <= 9) return 'Moderate';
  return 'Nuisance';
}

/**
 * Get the effect text from a surge entry based on severity
 */
export function getEffectBySeverity(
  entry: { extreme: string; moderate: string; nuisance: string },
  severity: SurgeSeverity
): string {
  switch (severity) {
    case 'Extreme':
      return entry.extreme;
    case 'Moderate':
      return entry.moderate;
    case 'Nuisance':
      return entry.nuisance;
  }
}

/**
 * Rolls on the Wild Echo Surge table
 * Uses d100 for table entry, d20 for severity column
 */
export function rollSurge(): SurgeResult {
  const tableRoll = rollD100();
  const severityRoll = rollD20();
  const severity = getSeverityFromRoll(severityRoll);

  // Find the entry (1-100)
  const entry = WILD_ECHO_SURGE_TABLE.find(e => e.roll === tableRoll);

  if (!entry) {
    // Fallback if somehow no entry found
    return {
      tableRoll,
      severityRoll,
      severity,
      effect: `Unknown surge effect for roll ${tableRoll}`
    };
  }

  const effect = getEffectBySeverity(entry, severity);

  return {
    tableRoll,
    severityRoll,
    severity,
    effect
  };
}

/**
 * Roll surge with specific values (for testing or manual override)
 */
export function rollSurgeWithValues(tableRoll: number, severityRoll: number): SurgeResult {
  const severity = getSeverityFromRoll(severityRoll);
  const entry = WILD_ECHO_SURGE_TABLE.find(e => e.roll === tableRoll);

  if (!entry) {
    return {
      tableRoll,
      severityRoll,
      severity,
      effect: `Unknown surge effect for roll ${tableRoll}`
    };
  }

  return {
    tableRoll,
    severityRoll,
    severity,
    effect: getEffectBySeverity(entry, severity)
  };
}

/**
 * Get color for severity display
 */
export function getSeverityColor(severity: SurgeSeverity): string {
  switch (severity) {
    case 'Extreme':
      return 'var(--color-ep-drain)'; // Red
    case 'Moderate':
      return 'var(--color-focus-warning)'; // Orange
    case 'Nuisance':
      return 'var(--color-siphon-accent)'; // Turquoise
  }
}

/**
 * Format surge result for display
 */
export function formatSurgeResult(result: SurgeResult): string {
  return `d100: ${result.tableRoll} | d20: ${result.severityRoll} (${result.severity})\n\n${result.effect}`;
}
