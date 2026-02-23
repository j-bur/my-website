export interface DiceExpression {
  count: number;
  sides: number;
  modifier: number;
}

export interface RollResult {
  total: number;
  rolls: number[];
  expression: string;
  modifier: number;
}

/**
 * Parses dice notation like "2d6", "4d8+2", "[PB]d6", "[Cost]d8"
 * Returns resolved expression given context values
 */
export function parseDiceExpression(
  notation: string,
  context: { pb?: number; level?: number; cost?: number } = {}
): DiceExpression {
  // Replace variables with values
  const resolved = notation
    .replace(/\[PB\]/gi, String(context.pb || 0))
    .replace(/\[Level\]/gi, String(context.level || 0))
    .replace(/\[Cost\]/gi, String(context.cost || 0))
    .replace(/\[Cost\/2\]/gi, String(Math.floor((context.cost || 0) / 2)));

  // Handle special case where the result is just a number (e.g., [Cost] = "5")
  if (/^\d+$/.test(resolved)) {
    return { count: parseInt(resolved, 10), sides: 1, modifier: 0 };
  }

  // Parse XdY+Z format
  const match = resolved.match(/(\d+)d(\d+)(?:([+-])(\d+))?/i);
  if (!match) {
    console.warn(`Could not parse dice expression: ${notation} -> ${resolved}`);
    return { count: 0, sides: 0, modifier: 0 };
  }

  return {
    count: parseInt(match[1], 10),
    sides: parseInt(match[2], 10),
    modifier: match[3] === '-'
      ? -parseInt(match[4] || '0', 10)
      : parseInt(match[4] || '0', 10)
  };
}

/**
 * Rolls dice and returns detailed results
 */
export function rollDice(count: number, sides: number, modifier = 0): RollResult {
  const rolls: number[] = [];

  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }

  const total = rolls.reduce((sum, r) => sum + r, 0) + modifier;

  let expression = `${count}d${sides}`;
  if (modifier > 0) expression += `+${modifier}`;
  else if (modifier < 0) expression += `${modifier}`;

  return {
    total,
    rolls,
    expression,
    modifier
  };
}

/**
 * Convenience function combining parse and roll
 */
export function rollFromNotation(
  notation: string,
  context: { pb?: number; level?: number; cost?: number } = {}
): RollResult {
  const expr = parseDiceExpression(notation, context);
  return rollDice(expr.count, expr.sides, expr.modifier);
}

/**
 * Roll a single die
 */
export function rollD(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Roll d20
 */
export function rollD20(): number {
  return rollD(20);
}

/**
 * Roll d100
 */
export function rollD100(): number {
  return rollD(100);
}

/**
 * Format a roll result for display
 */
export function formatRollResult(result: RollResult): string {
  if (result.rolls.length === 1) {
    return `${result.expression} = ${result.total}`;
  }

  const rollsStr = result.rolls.join(' + ');
  let output = `${result.expression} = [${rollsStr}]`;

  if (result.modifier !== 0) {
    output += ` ${result.modifier > 0 ? '+' : ''}${result.modifier}`;
  }

  output += ` = ${result.total}`;
  return output;
}
