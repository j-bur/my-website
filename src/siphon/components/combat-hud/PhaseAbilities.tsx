import { useManifoldStore } from '../../store';
import { getAbilitiesByPhase } from '../../data/echoManifold';

const ACTIVATION_ABBREV: Record<string, string> = {
  'Action': 'A',
  'Bonus Action': 'BA',
  'Reaction': 'R',
  'None': '—',
};

export function PhaseAbilities() {
  const currentPhase = useManifoldStore((s) => s.currentPhase);
  const abilities = getAbilitiesByPhase(currentPhase);

  return (
    <div className="flex flex-col gap-1.5" role="list" aria-label="Phase abilities">
      {abilities.map((ability) => (
        <div
          key={ability.id}
          className="flex items-center justify-between px-3 py-2.5 border border-siphon-border/50 rounded bg-card-bg/50 min-h-[50px]"
          role="listitem"
          title={ability.description}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-siphon-accent font-medium shrink-0">
              {ability.moteCost}m
            </span>
            <span className="text-xs font-medium text-text-secondary truncate">
              {ability.name}
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-text-muted bg-siphon-surface/30 px-1.5 py-0.5 rounded shrink-0 ml-2">
            {ACTIVATION_ABBREV[ability.activation] ?? ability.activation}
          </span>
        </div>
      ))}
    </div>
  );
}
