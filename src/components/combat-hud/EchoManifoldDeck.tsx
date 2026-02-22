import { useState, useEffect, useRef } from 'react';
import { useManifoldStore } from '../../store';
import { PHASE_INFO, MAX_MOTES } from '../../data/echoManifold';

export function EchoManifoldDeck() {
  const { currentPhase, motes, regainMote, spendMotes } = useManifoldStore();
  const phaseInfo = PHASE_INFO[currentPhase];
  const [prevMotes, setPrevMotes] = useState(motes);
  const [animatingPips, setAnimatingPips] = useState<Map<number, 'fill' | 'drain'>>(new Map());
  const clearRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Detect mote changes during render (React's "adjust state from previous renders" pattern)
  if (prevMotes !== motes) {
    setPrevMotes(motes);
    const anims = new Map<number, 'fill' | 'drain'>();
    if (motes > prevMotes) {
      for (let i = prevMotes; i < motes; i++) anims.set(i, 'fill');
    } else {
      for (let i = motes; i < prevMotes; i++) anims.set(i, 'drain');
    }
    setAnimatingPips(anims);
  }

  // Clear animation classes after duration
  useEffect(() => {
    if (animatingPips.size === 0) return;
    clearTimeout(clearRef.current);
    clearRef.current = setTimeout(() => setAnimatingPips(new Map()), 350);
    return () => clearTimeout(clearRef.current);
  }, [animatingPips]);

  return (
    <div className="flex flex-col gap-2">
      {/* Phase card (face-up) */}
      <div
        className="border border-siphon-border rounded-lg bg-card-bg p-3 cursor-pointer hover:border-siphon-accent/60 transition-colors"
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
          const animClass = animatingPips.get(i);
          return (
            <button
              key={i}
              className={`w-4 h-4 rounded-full border transition-all duration-200 ${
                isFilled
                  ? 'bg-siphon-accent border-siphon-accent shadow-sm shadow-siphon-accent/40'
                  : 'bg-transparent border-siphon-border/60 hover:border-siphon-accent/40'
              }${animClass === 'fill' ? ' pip-fill' : ''}${animClass === 'drain' ? ' pip-drain' : ''}`}
              style={animClass ? { '--pip-color': 'var(--color-siphon-accent)' } as React.CSSProperties : undefined}
              onClick={() => {
                if (isFilled) {
                  spendMotes(1, false);
                } else {
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
