import { useManifoldStore } from '../../store';
import { PHASE_INFO, HIT_DICE_FOR_PHASE_SWITCH } from '../../data/echoManifold';
import type { ManifoldPhase } from '../../types';

const PHASES: ManifoldPhase[] = ['Constellation', 'Revelation', 'Oblivion'];

export function PhaseSelector() {
  const { currentPhase, phaseSwitchAvailable, hitDiceSpentOnSwitch, switchPhase, resetPhaseSwitchOnShortRest } = useManifoldStore();

  const handlePhaseSwitch = (phase: ManifoldPhase, useHitDice: boolean) => {
    if (phase === currentPhase) return;
    switchPhase(phase, useHitDice);
  };

  const currentInfo = PHASE_INFO[currentPhase];

  return (
    <div className="space-y-4">
      {/* Phase tabs */}
      <div className="flex gap-2">
        {PHASES.map(phase => (
          <button
            key={phase}
            onClick={() => handlePhaseSwitch(phase, !phaseSwitchAvailable)}
            disabled={phase === currentPhase}
            className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-all ${
              phase === currentPhase
                ? 'bg-siphon-accent text-siphon-bg'
                : phaseSwitchAvailable
                  ? 'bg-siphon-bg hover:bg-siphon-border text-text-secondary hover:text-text-primary'
                  : 'bg-siphon-bg text-text-muted border border-dashed border-siphon-border hover:border-warp hover:text-warp'
            }`}
            title={phase !== currentPhase && !phaseSwitchAvailable ? `Spend ${HIT_DICE_FOR_PHASE_SWITCH} Hit Dice to switch` : undefined}
          >
            {phase}
          </button>
        ))}
      </div>

      {/* Switch availability */}
      <div className="flex items-center justify-between text-xs">
        <span className={`${phaseSwitchAvailable ? 'text-siphon-accent' : 'text-text-muted'}`}>
          {phaseSwitchAvailable ? '✓ Free switch available' : '✗ Free switch used'}
        </span>
        {!phaseSwitchAvailable && (
          <button
            onClick={resetPhaseSwitchOnShortRest}
            className="text-text-muted hover:text-text-secondary"
          >
            Short Rest
          </button>
        )}
        {hitDiceSpentOnSwitch > 0 && (
          <span className="text-warp">
            {hitDiceSpentOnSwitch} HD spent
          </span>
        )}
      </div>

      {/* Current phase info */}
      <div className="bg-siphon-bg rounded-lg p-3">
        <h4 className="text-sm font-medium text-siphon-accent mb-1">{currentInfo.name}</h4>
        <p className="text-xs text-text-muted italic mb-2">{currentInfo.flavor}</p>
        <p className="text-xs text-text-secondary">{currentInfo.passive}</p>
      </div>
    </div>
  );
}
