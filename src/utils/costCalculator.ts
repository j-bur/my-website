import type { CostType } from '../types';

export interface CostContext {
  pb: number;
  level: number;
  chosenValue?: number;  // For "Varies" costs
}

/**
 * Resolves a cost type to a numeric value
 */
export function resolveCost(cost: CostType, context: CostContext): number {
  if (typeof cost === 'number') return cost;

  switch (cost) {
    case 'PB':
      return context.pb;
    case 'Level':
      return context.level;
    case 'Level/2':
      return Math.ceil(context.level / 2);
    case 'Twice PB':
      return context.pb * 2;
    case 'Varies':
    case 'Varies*':
      return context.chosenValue || 0;
    default:
      // Handle any other string costs
      console.warn(`Unknown cost type: ${cost}`);
      return 0;
  }
}

/**
 * Formats cost for display
 */
export function formatCost(cost: CostType, context?: CostContext): string {
  if (typeof cost === 'number') return String(cost);

  const isSpecial = cost.toString().endsWith('*');
  const baseCost = cost.toString().replace('*', '');

  if (context) {
    const resolved = resolveCost(cost, context);
    return `${baseCost} (${resolved})${isSpecial ? '*' : ''}`;
  }

  return cost.toString();
}

/**
 * Check if a cost is variable (requires user input)
 */
export function isVariableCost(cost: CostType): boolean {
  return cost === 'Varies' || cost === 'Varies*';
}

/**
 * Get the minimum possible cost (for display/filtering)
 */
export function getMinCost(cost: CostType): number {
  if (typeof cost === 'number') return cost;

  switch (cost) {
    case 'PB':
      return 2; // Min PB at level 1
    case 'Level':
      return 1;
    case 'Level/2':
      return 1;
    case 'Twice PB':
      return 4;
    case 'Varies':
    case 'Varies*':
      return 1;
    default:
      return 0;
  }
}

/**
 * Get the maximum possible cost (for display/filtering)
 */
export function getMaxCost(cost: CostType): number {
  if (typeof cost === 'number') return cost;

  switch (cost) {
    case 'PB':
      return 6; // Max PB at level 17+
    case 'Level':
      return 20;
    case 'Level/2':
      return 10;
    case 'Twice PB':
      return 12;
    case 'Varies':
    case 'Varies*':
      return 20; // Reasonable max
    default:
      return 0;
  }
}
