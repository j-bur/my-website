import { useState, useEffect, useRef, useCallback } from 'react';
import { useManifoldStore } from '../../store';
import { PHASE_INFO, MAX_MOTES, HIT_DICE_FOR_PHASE_SWITCH } from '../../data/echoManifold';
import type { ManifoldPhase } from '../../types';

const ALL_PHASES: ManifoldPhase[] = ['Constellation', 'Revelation', 'Oblivion'];

type SwitchCost = 'free' | 'hit-dice' | 'no-cost';

export function EchoManifoldDeck() {
  const { currentPhase, motes, regainMote, spendMotes, switchPhase, phaseSwitchAvailable } = useManifoldStore();
  const phaseInfo = PHASE_INFO[currentPhase];
  const [prevMotes, setPrevMotes] = useState(motes);
  const [animatingPips, setAnimatingPips] = useState<Map<number, 'fill' | 'drain'>>(new Map());
  const clearRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<ManifoldPhase | null>(null);
  const [switchCost, setSwitchCost] = useState<SwitchCost>(phaseSwitchAvailable ? 'free' : 'hit-dice');
  const panelRef = useRef<HTMLDivElement>(null);

  const closePanel = () => {
    setIsExpanded(false);
    setSelectedPhase(null);
  };

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (isExpanded && panelRef.current && !panelRef.current.contains(e.target as Node)) {
      closePanel();
    }
  }, [isExpanded]);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isExpanded) {
      closePanel();
    }
  }, [isExpanded]);

  useEffect(() => {
    if (isExpanded) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, handleEscape, handleClickOutside]);

  const handlePhaseClick = (phase: ManifoldPhase) => {
    setSelectedPhase(phase);
    setSwitchCost(phaseSwitchAvailable ? 'free' : 'hit-dice');
  };

  const handleConfirm = () => {
    if (!selectedPhase) return;
    if (switchCost === 'free') {
      switchPhase(selectedPhase, false);
    } else if (switchCost === 'hit-dice') {
      switchPhase(selectedPhase, true);
    } else {
      // no-cost override: directly set phase without spending resources
      useManifoldStore.setState({ currentPhase: selectedPhase });
    }
    closePanel();
  };

  const otherPhases = ALL_PHASES.filter((p) => p !== currentPhase);

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
    <div ref={panelRef} className="flex flex-col gap-2">
      {/* Phase card (face-up) */}
      <div
        className={`border rounded-lg bg-card-bg p-3 cursor-pointer transition-colors ${
          isExpanded ? 'border-siphon-accent' : 'border-siphon-border hover:border-siphon-accent/60'
        }`}
        role="button"
        tabIndex={0}
        aria-label={`Echo Manifold: ${phaseInfo.name}. Click to switch phase.`}
        aria-expanded={isExpanded}
        onClick={() => { setIsExpanded(!isExpanded); setSelectedPhase(null); }}
        onKeyDown={(e) => { if (e.key === 'Enter') { setIsExpanded(!isExpanded); setSelectedPhase(null); } }}
      >
        <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1">
          Echo Manifold
        </div>
        <div className="text-sm font-bold text-siphon-accent mb-1">
          {currentPhase}
        </div>
        <p className="text-[10px] leading-tight text-text-secondary">
          {phaseInfo.passive}
        </p>
      </div>

      {/* Phase selection panel */}
      {isExpanded && (
        <div className="flex flex-col gap-1 border border-siphon-border/50 rounded-lg bg-siphon-bg/80 backdrop-blur-sm p-2">
          <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1">
            Switch Phase
          </div>
          {otherPhases.map((phase) => {
            const info = PHASE_INFO[phase];
            const isSelected = selectedPhase === phase;
            return (
              <button
                key={phase}
                className={`w-full text-left px-2 py-1.5 rounded border transition-colors ${
                  isSelected
                    ? 'border-siphon-accent bg-siphon-accent/10 text-siphon-accent'
                    : 'border-siphon-border/30 hover:border-siphon-accent/40 hover:bg-siphon-accent/5 text-text-primary'
                }`}
                onClick={() => handlePhaseClick(phase)}
              >
                <div className="text-xs font-bold">{phase}</div>
                <p className="text-[10px] leading-tight text-text-secondary mt-0.5">
                  {info.passive}
                </p>
              </button>
            );
          })}

          {/* Confirmation area */}
          {selectedPhase && (
            <div className="mt-1 border-t border-siphon-border/30 pt-2 space-y-1.5">
              <div className="flex flex-wrap gap-1">
                {phaseSwitchAvailable && (
                  <button
                    className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                      switchCost === 'free'
                        ? 'border-ep-positive/60 bg-ep-positive/10 text-ep-positive'
                        : 'border-siphon-border/40 text-text-muted hover:border-ep-positive/40'
                    }`}
                    onClick={() => setSwitchCost('free')}
                  >
                    Free switch
                  </button>
                )}
                <button
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    switchCost === 'hit-dice'
                      ? 'border-capacitance/60 bg-capacitance/10 text-capacitance'
                      : 'border-siphon-border/40 text-text-muted hover:border-capacitance/40'
                  }`}
                  onClick={() => setSwitchCost('hit-dice')}
                >
                  {HIT_DICE_FOR_PHASE_SWITCH} Hit Dice
                </button>
                <button
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    switchCost === 'no-cost'
                      ? 'border-siphon-accent/60 bg-siphon-accent/10 text-siphon-accent'
                      : 'border-siphon-border/40 text-text-muted hover:border-siphon-accent/40'
                  }`}
                  onClick={() => setSwitchCost('no-cost')}
                >
                  No cost
                </button>
                <button
                  className="text-[10px] px-3 py-1 rounded border border-ep-positive/40 text-ep-positive hover:bg-ep-positive/10 transition-colors"
                  onClick={handleConfirm}
                >
                  Confirm
                </button>
                <button
                  className="text-[10px] px-3 py-1 rounded border border-siphon-border/40 text-text-muted hover:border-ep-negative/50 hover:text-ep-negative transition-colors"
                  onClick={closePanel}
                >
                  Cancel
                </button>
              </div>
              {/* <div className="flex gap-2">
                
              </div> */}
            </div>
          )}
        </div>
      )}

      {/* Motes row */}
      <div className="flex items-center gap-1.5 px-1" role="group" aria-label={`Motes: ${motes} of ${MAX_MOTES}`}>
        <span className="text-[10px] text-text-muted uppercase tracking-wider shrink-0">Motes</span>
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
        <span className="text-xs text-text-muted tabular-nums shrink-0 ml-auto">{motes}/{MAX_MOTES}</span>
      </div>
    </div>
  );
}
