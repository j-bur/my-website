import { useSiphonStore } from '../../store';
import { useCharacterStore } from '../../store';

export function SiphonCapacitanceTracker() {
  const capacitance = useSiphonStore((s) => s.siphonCapacitance);
  const pb = useCharacterStore((s) => s.proficiencyBonus);
  const maxCapacitance = pb;

  return (
    <div className="flex flex-col gap-1" role="group" aria-label={`Capacitance: ${capacitance} of ${maxCapacitance}`}>
      <div className="flex items-center justify-between">
        <span className="text-text-muted uppercase tracking-wider text-[10px]">Capacitance</span>
        <span className="text-xs tabular-nums text-capacitance font-medium">
          {capacitance}/{maxCapacitance}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: maxCapacitance }, (_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-sm border transition-all ${
              i < capacitance
                ? 'bg-capacitance border-capacitance shadow-sm shadow-capacitance/30'
                : 'bg-transparent border-siphon-border/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
