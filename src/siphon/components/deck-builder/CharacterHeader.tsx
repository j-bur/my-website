import { useCharacterStore } from '../../store';

export function CharacterHeader() {
  const level = useCharacterStore((s) => s.level);
  const maxHP = useCharacterStore((s) => s.maxHP);
  const reducedMaxHP = useCharacterStore((s) => s.reducedMaxHP);
  const proficiencyBonus = useCharacterStore((s) => s.proficiencyBonus);
  const setLevel = useCharacterStore((s) => s.setLevel);
  const setMaxHP = useCharacterStore((s) => s.setMaxHP);

  const epMax = level;
  const hasEchoDrain = reducedMaxHP < maxHP;
  const echoDrainAmount = maxHP - reducedMaxHP;

  return (
    <div
      className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 border-b border-siphon-border bg-siphon-surface/50"
      role="region"
      aria-label="Character stats"
    >
      <label className="flex items-center gap-2 text-sm text-text-secondary">
        Level:
        <input
          type="number"
          min={1}
          max={20}
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
          className="w-14 px-2 py-1 text-sm bg-siphon-bg border border-siphon-border rounded text-text-primary text-center focus:outline-none focus:border-siphon-accent"
          aria-label="Level"
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-text-secondary">
        Max HP:
        <input
          type="number"
          min={1}
          value={maxHP}
          onChange={(e) => setMaxHP(Number(e.target.value))}
          className="w-16 px-2 py-1 text-sm bg-siphon-bg border border-siphon-border rounded text-text-primary text-center focus:outline-none focus:border-siphon-accent"
          aria-label="Max HP"
        />
      </label>

      <div className="flex items-center gap-2 text-sm text-text-secondary">
        Current Max HP:
        {hasEchoDrain ? (
          <span className="text-ep-negative">
            {maxHP} → {reducedMaxHP}{' '}
            <span className="text-xs">(-{echoDrainAmount} from Echo Drain)</span>
          </span>
        ) : (
          <span className="text-text-primary">{reducedMaxHP}</span>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-text-secondary">
        PB: <span className="text-text-primary">{proficiencyBonus}</span>
        <span className="text-text-muted text-xs">(auto)</span>
      </div>

      <div className="flex items-center gap-2 text-sm text-text-secondary">
        EP Max: <span className="text-ep-positive">{epMax}</span>
      </div>
    </div>
  );
}
