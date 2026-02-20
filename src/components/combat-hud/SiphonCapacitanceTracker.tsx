import { useSiphonStore, useCharacterStore } from '../../store';

export function SiphonCapacitanceTracker() {
  const { siphonCapacitance, expendCapacitance, clearCapacitance, currentEP, setEP } = useSiphonStore();
  const { proficiencyBonus, level } = useCharacterStore();

  const maxCharges = proficiencyBonus;
  const maxEP = level;

  const handleUseCharge = () => {
    if (siphonCapacitance <= 0) return;

    // Using a charge restores EP equal to proficiency bonus
    const epRestored = proficiencyBonus;
    expendCapacitance(1);
    setEP(Math.min(maxEP, currentEP + epRestored));
  };

  return (
    <div className="bg-siphon-surface border border-siphon-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text-secondary">Siphon Capacitance</h3>
        <span className="text-sm text-siphon-accent">
          {siphonCapacitance} / {maxCharges}
        </span>
      </div>

      {/* Charge indicators */}
      <div className="flex gap-2 mb-3">
        {Array.from({ length: maxCharges }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-8 rounded border-2 transition-all ${
              i < siphonCapacitance
                ? 'bg-siphon-accent/30 border-siphon-accent'
                : 'bg-siphon-bg border-siphon-border'
            }`}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleUseCharge}
          disabled={siphonCapacitance <= 0}
          className="flex-1 py-2 text-sm bg-siphon-accent/20 hover:bg-siphon-accent/30 border border-siphon-accent rounded text-siphon-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Use (+{proficiencyBonus} EP)
        </button>
        <button
          onClick={clearCapacitance}
          className="py-2 px-3 text-sm text-text-muted hover:text-text-secondary transition-colors"
          title="Reset after 8-hour rest"
        >
          Reset
        </button>
      </div>

      {/* Info */}
      <p className="mt-3 text-xs text-text-muted">
        Charges reset after 8 hours. Use a charge to restore {proficiencyBonus} EP.
      </p>
    </div>
  );
}
