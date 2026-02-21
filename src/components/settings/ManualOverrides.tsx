import { useCharacterStore, useSiphonStore, useManifoldStore } from '../../store';

function OverrideInput({
  label,
  value,
  onChange,
  min,
  max,
  notes,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  notes?: string;
}) {
  const clamp = (v: number) => {
    let clamped = v;
    if (min !== undefined) clamped = Math.max(min, clamped);
    if (max !== undefined) clamped = Math.min(max, clamped);
    return clamped;
  };

  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex flex-col">
        <span className="text-sm text-text-secondary">{label}</span>
        {notes && (
          <span className="text-[10px] text-text-muted">{notes}</span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          className="w-6 h-6 rounded border border-siphon-border text-text-muted hover:text-text-primary hover:border-text-muted transition-colors text-xs"
          onClick={() => onChange(clamp(value - 1))}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <input
          type="number"
          className="w-14 h-6 text-center text-sm bg-siphon-bg border border-siphon-border rounded text-text-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          value={value}
          onChange={(e) => {
            const parsed = parseInt(e.target.value, 10);
            if (!isNaN(parsed)) onChange(clamp(parsed));
          }}
          min={min}
          max={max}
          aria-label={label}
        />
        <button
          className="w-6 h-6 rounded border border-siphon-border text-text-muted hover:text-text-primary hover:border-text-muted transition-colors text-xs"
          onClick={() => onChange(clamp(value + 1))}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function ManualOverrides() {
  const ep = useSiphonStore((s) => s.currentEP);
  const setEP = useSiphonStore((s) => s.setEP);
  const focus = useSiphonStore((s) => s.focus);
  const setFocus = useSiphonStore((s) => s.setFocus);
  const motes = useManifoldStore((s) => s.motes);
  const setMotes = useManifoldStore((s) => s.setMotes);
  const level = useCharacterStore((s) => s.level);
  const hitDice = useCharacterStore((s) => s.hitDice);
  const maxHP = useCharacterStore((s) => s.maxHP);
  const reducedMaxHP = useCharacterStore((s) => s.reducedMaxHP);
  const currentHP = useCharacterStore((s) => s.currentHP);

  const maxHPReduction = maxHP - reducedMaxHP;

  return (
    <div className="space-y-0.5">
      <OverrideInput
        label="Echo Points (EP)"
        value={ep}
        onChange={setEP}
        max={level}
        notes={ep <= -level ? 'Echo Drained' : undefined}
      />
      <OverrideInput
        label="Focus"
        value={focus}
        onChange={setFocus}
        min={0}
      />
      <OverrideInput
        label="Motes"
        value={motes}
        onChange={setMotes}
        min={0}
        max={8}
      />
      <OverrideInput
        label="Hit Dice"
        value={hitDice}
        onChange={(v) => {
          const clamped = Math.max(0, Math.min(level, v));
          useCharacterStore.setState({ hitDice: clamped });
        }}
        min={0}
        max={level}
      />
      <OverrideInput
        label="Max HP Reduction"
        value={maxHPReduction}
        onChange={(v) => {
          const reduction = Math.max(0, v);
          const newReducedMax = Math.max(0, maxHP - reduction);
          useCharacterStore.setState({
            reducedMaxHP: newReducedMax,
            currentHP: Math.min(currentHP, newReducedMax),
          });
        }}
        min={0}
        notes={maxHPReduction > 0 ? `Current Max HP: ${reducedMaxHP}` : undefined}
      />
    </div>
  );
}
