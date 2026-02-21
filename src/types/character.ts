export interface Character {
  name: string;
  level: number;                    // 1-20, determines max EP
  proficiencyBonus: number;         // 2-6, determines max selected cards
  maxHP: number;
  reducedMaxHP: number;             // Lowered by Echo Drain
  spellSaveDC: number;              // For surge table effects
}

export interface CharacterState extends Character {
  isEchoDrained: boolean;           // EP <= -level
}

// Calculate proficiency bonus from level
export function getProficiencyBonus(level: number): number {
  return Math.floor((level - 1) / 4) + 2;
}
