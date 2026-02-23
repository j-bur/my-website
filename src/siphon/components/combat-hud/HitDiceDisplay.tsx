import { useCharacterStore } from '../../store';

export function HitDiceDisplay() {
  const hitDice = useCharacterStore((s) => s.hitDice);
  const maxHitDice = useCharacterStore((s) => s.maxHitDice);

  return (
    <div className="flex items-center justify-between" role="group" aria-label={`Hit Dice: ${hitDice} of ${maxHitDice}`}>
      <span className="text-text-muted uppercase tracking-wider text-[10px]">Hit Dice</span>
      <span className="text-xs tabular-nums text-text-primary font-medium">
        {hitDice}/{maxHitDice}
      </span>
    </div>
  );
}
