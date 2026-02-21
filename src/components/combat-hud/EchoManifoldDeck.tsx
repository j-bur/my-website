import { useManifoldStore } from '../../store';
import { PHASE_INFO, MAX_MOTES } from '../../data/echoManifold';

export function EchoManifoldDeck() {
  const { currentPhase, motes, regainMote, spendMotes } = useManifoldStore();
  const phaseInfo = PHASE_INFO[currentPhase];

  return (
    <div className="flex flex-col gap-2">
      {/* Phase card (face-up) */}
      <div
        className="w-36 border border-siphon-border rounded-lg bg-card-bg p-3 cursor-pointer hover:border-siphon-accent/60 transition-colors"
        role="button"
        tabIndex={0}
        aria-label={`Echo Manifold: ${phaseInfo.name}`}
      >
        <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1">
          Echo Manifold
        </div>
        <div className="text-sm font-bold text-siphon-accent mb-1">
          {currentPhase}
        </div>
        <p className="text-[10px] leading-tight text-text-secondary line-clamp-3">
          {phaseInfo.passive}
        </p>
      </div>

      {/* Motes row */}
      <div className="flex gap-1 px-1" role="group" aria-label={`Motes: ${motes} of ${MAX_MOTES}`}>
        {Array.from({ length: MAX_MOTES }, (_, i) => {
          const isFilled = i < motes;
          return (
            <button
              key={i}
              className={`w-3.5 h-3.5 rounded-full border transition-all ${
                isFilled
                  ? 'bg-siphon-accent border-siphon-accent shadow-sm shadow-siphon-accent/40'
                  : 'bg-transparent border-siphon-border/60 hover:border-siphon-accent/40'
              }`}
              onClick={() => {
                if (isFilled) {
                  // Spend last filled mote (click filled to remove)
                  spendMotes(1, false);
                } else {
                  // Regain next mote (click empty to add)
                  regainMote();
                }
              }}
              aria-label={isFilled ? `Spend mote ${i + 1}` : `Regain mote ${i + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}
