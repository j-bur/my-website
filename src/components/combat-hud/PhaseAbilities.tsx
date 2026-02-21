import { useManifoldStore } from '../../store';
import { getAbilitiesByPhase } from '../../data/echoManifold';

export function PhaseAbilities() {
  const currentPhase = useManifoldStore((s) => s.currentPhase);
  const abilities = getAbilitiesByPhase(currentPhase);

  return (
    <div className="flex gap-2" role="list" aria-label="Phase abilities">
      {abilities.map((ability) => (
        <div
          key={ability.id}
          className="w-36 border border-siphon-border rounded-lg bg-card-bg p-2 cursor-pointer hover:border-siphon-accent/60 transition-colors"
          role="listitem"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wide text-text-primary truncate">
              {ability.name}
            </span>
            <span className="text-[10px] text-siphon-accent font-medium ml-1 shrink-0">
              {ability.moteCost}m
            </span>
          </div>
          <div className="text-[10px] text-text-muted mb-1">
            {ability.activation}
          </div>
          <p className="text-[10px] leading-tight text-text-secondary line-clamp-3">
            {ability.description}
          </p>
        </div>
      ))}
    </div>
  );
}
