import { useState } from 'react';
import { useSiphonStore, useCharacterStore, useManifoldStore, useSettingsStore } from '../../store';

interface ShortRestDialogProps {
  onClose: () => void;
}

export function ShortRestDialog({ onClose }: ShortRestDialogProps) {
  const shortRestClearDefault = useSettingsStore((s) => s.shortRestClearEffects);
  const [clearEffects, setClearEffects] = useState(shortRestClearDefault);
  const [hdToSpend, setHdToSpend] = useState(0);
  const [healingAmount, setHealingAmount] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [phaseSwitchRestored, setPhaseSwitchRestored] = useState(false);

  // Character store
  const currentHP = useCharacterStore((s) => s.currentHP);
  const reducedMaxHP = useCharacterStore((s) => s.reducedMaxHP);
  const hitDice = useCharacterStore((s) => s.hitDice);
  const spendHitDice = useCharacterStore((s) => s.spendHitDice);
  const setCurrentHP = useCharacterStore((s) => s.setCurrentHP);

  // Siphon store
  const activeEffects = useSiphonStore((s) => s.activeEffects);
  const shortRest = useSiphonStore((s) => s.shortRest);

  // Manifold store
  const phaseSwitchAvailable = useManifoldStore((s) => s.phaseSwitchAvailable);
  const resetPhaseSwitchOnShortRest = useManifoldStore((s) => s.resetPhaseSwitchOnShortRest);

  // Count effects that would be cleared (duration < 1 hour)
  const ONE_HOUR_MS = 3600000;
  const shortEffects = activeEffects.filter(
    (e) => e.durationMs !== null && e.durationMs < ONE_HOUR_MS
  );

  const handleConfirm = () => {
    // 1. Spend hit dice
    if (hdToSpend > 0) {
      spendHitDice(hdToSpend);
    }

    // 2. Heal
    const healing = parseInt(healingAmount, 10);
    if (!isNaN(healing) && healing > 0) {
      setCurrentHP(Math.min(reducedMaxHP, currentHP + healing));
    }

    // 3. Clear effects
    shortRest(clearEffects);

    // 4. Restore phase switch
    const wasUnavailable = !useManifoldStore.getState().phaseSwitchAvailable;
    resetPhaseSwitchOnShortRest();
    setPhaseSwitchRestored(wasUnavailable);

    setIsComplete(true);
  };

  if (isComplete) {
    return (
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
        onClick={onClose}
        role="dialog"
        aria-label="Short Rest Complete"
      >
        <div
          className="bg-siphon-surface border border-siphon-border rounded-lg p-5 max-w-md w-full mx-4 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1">
            Short Rest Complete
          </div>
          <div className="text-lg font-bold text-text-primary mb-4">
            Rest Results
          </div>

          <div className="space-y-2 text-sm mb-4">
            {hdToSpend > 0 && (
              <div className="flex justify-between">
                <span className="text-text-muted">Hit Dice Spent</span>
                <span className="text-text-secondary">{hdToSpend}</span>
              </div>
            )}
            {!isNaN(parseInt(healingAmount, 10)) && parseInt(healingAmount, 10) > 0 && (
              <div className="flex justify-between">
                <span className="text-text-muted">HP Healed</span>
                <span className="text-ep-positive">+{parseInt(healingAmount, 10)}</span>
              </div>
            )}
            {clearEffects && shortEffects.length > 0 && (
              <div className="flex justify-between">
                <span className="text-text-muted">Effects Cleared</span>
                <span className="text-text-secondary">{shortEffects.length}</span>
              </div>
            )}
            {phaseSwitchRestored && (
              <div className="flex justify-between">
                <span className="text-text-muted">Phase Switch</span>
                <span className="text-ep-positive">Restored</span>
              </div>
            )}
          </div>

          <button
            className="w-full py-2 text-sm rounded bg-siphon-accent/20 border border-siphon-accent/50 text-siphon-accent hover:bg-siphon-accent/30 transition-colors font-medium"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-label="Short Rest"
    >
      <div
        className="bg-siphon-surface border border-siphon-border rounded-lg p-5 max-w-md w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1">
            Short Rest
          </div>
          <div className="text-lg font-bold text-text-primary">
            Rest Options
          </div>
        </div>

        <div className="border-t border-siphon-border pt-3 mb-3 space-y-3">
          {/* Current HP */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Current HP</span>
            <span className="text-text-primary">{currentHP} / {reducedMaxHP}</span>
          </div>

          {/* Hit Dice spending */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-text-muted">Spend Hit Dice</span>
              <span className="text-text-secondary text-xs">{hitDice} available</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="w-8 h-8 rounded border border-siphon-border text-text-muted hover:border-siphon-accent/50 hover:text-siphon-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                onClick={() => setHdToSpend(Math.max(0, hdToSpend - 1))}
                disabled={hdToSpend <= 0}
                aria-label="Decrease hit dice"
              >
                &minus;
              </button>
              <span className="w-8 text-center text-sm text-text-primary tabular-nums">
                {hdToSpend}
              </span>
              <button
                className="w-8 h-8 rounded border border-siphon-border text-text-muted hover:border-siphon-accent/50 hover:text-siphon-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                onClick={() => setHdToSpend(Math.min(hitDice, hdToSpend + 1))}
                disabled={hdToSpend >= hitDice}
                aria-label="Increase hit dice"
              >
                +
              </button>
            </div>
          </div>

          {/* Healing amount (manual input — user rolls in Foundry) */}
          {hdToSpend > 0 && (
            <div>
              <label className="text-sm text-text-muted block mb-1">
                Healing roll result
              </label>
              <input
                type="number"
                min="0"
                value={healingAmount}
                onChange={(e) => setHealingAmount(e.target.value)}
                className="w-full px-2 py-1.5 text-sm bg-siphon-bg border border-siphon-border rounded text-text-primary tabular-nums focus:border-siphon-accent focus:outline-none"
                placeholder="Enter healing total from Foundry"
                aria-label="Healing roll result"
              />
            </div>
          )}

          {/* Effect clearing toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">
              Clear effects &lt; 1 hour
              {shortEffects.length > 0 && (
                <span className="text-text-secondary ml-1">({shortEffects.length})</span>
              )}
            </span>
            <button
              className={`px-3 py-1 text-xs rounded border transition-colors ${
                clearEffects
                  ? 'bg-siphon-accent/20 border-siphon-accent/50 text-siphon-accent'
                  : 'border-siphon-border text-text-muted hover:border-siphon-accent/30'
              }`}
              onClick={() => setClearEffects(!clearEffects)}
              role="switch"
              aria-checked={clearEffects}
              aria-label="Clear short-duration effects"
            >
              {clearEffects ? 'On' : 'Off'}
            </button>
          </div>

          {/* Phase switch restoration */}
          {!phaseSwitchAvailable && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Phase Switch</span>
              <span className="text-ep-positive text-xs">Will be restored</span>
            </div>
          )}
        </div>

        {/* Confirm / Cancel */}
        <div className="border-t border-siphon-border pt-3 flex gap-2">
          <button
            className="flex-1 py-2 text-sm rounded bg-siphon-accent/20 border border-siphon-accent/50 text-siphon-accent hover:bg-siphon-accent/30 transition-colors font-medium"
            onClick={handleConfirm}
          >
            Confirm Short Rest
          </button>
          <button
            className="flex-1 py-2 text-sm rounded border border-siphon-border text-text-muted hover:border-ep-negative/50 hover:text-ep-negative transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
