import { useSiphonStore } from '../../store';

export function ActiveEffectsPanel() {
  const activeEffects = useSiphonStore((s) => s.activeEffects);

  return (
    <div
      className="border border-siphon-border rounded-lg bg-siphon-surface/30 p-3 min-h-24"
      role="region"
      aria-label="Active Effects"
    >
      <div className="text-[10px] uppercase tracking-widest text-text-muted mb-2 text-center">
        Active Effects
      </div>

      {activeEffects.length === 0 ? (
        <div className="flex items-center justify-center h-16 text-text-muted/50 text-xs italic">
          (drag cards here to activate)
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {activeEffects.map((effect) => (
            <div
              key={effect.id}
              className="flex items-center gap-2 px-2 py-1 rounded bg-siphon-bg/50 text-xs"
            >
              {/* Source icon */}
              <span className="shrink-0">
                {effect.sourceType === 'siphon' ? '\u26A1' : effect.sourceType === 'manifold' ? '\u25CE' : '\u2726'}
              </span>

              {/* Name and source */}
              <span className="text-text-primary truncate flex-1">
                {effect.sourceName}
                {effect.sourceType === 'manifold' && (
                  <span className="text-text-muted ml-1">({effect.sourceType})</span>
                )}
              </span>

              {/* Duration */}
              <span className="text-text-secondary shrink-0">
                {effect.totalDuration}
              </span>

              {/* Concentration indicator */}
              {effect.requiresConcentration && (
                <span className="text-capacitance shrink-0" title="Concentration">
                  CONC
                </span>
              )}

              {/* Warp indicator */}
              {effect.warpActive && (
                <span className="text-warp shrink-0" title="Warp active">
                  W
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
