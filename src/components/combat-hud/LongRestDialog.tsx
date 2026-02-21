import { useState } from 'react';
import { useSiphonStore, useCharacterStore, useManifoldStore, useSettingsStore } from '../../store';
import { rollD } from '../../utils/diceRoller';
import { MacroDisplay } from './MacroDisplay';

interface LongRestDialogProps {
  onClose: () => void;
}

type DialogState = 'preview' | 'awaiting-focus-roll' | 'complete';

export function LongRestDialog({ onClose }: LongRestDialogProps) {
  const [dialogState, setDialogState] = useState<DialogState>('preview');
  const [result, setResult] = useState<{
    epRecovered: number;
    focusReduced: number;
    maxHPRestored: number;
  } | null>(null);

  // Siphon store
  const currentEP = useSiphonStore((s) => s.currentEP);
  const focus = useSiphonStore((s) => s.focus);
  const handCardIds = useSiphonStore((s) => s.handCardIds);
  const allyBestowments = useSiphonStore((s) => s.allyBestowments);
  const activeEffects = useSiphonStore((s) => s.activeEffects);
  const siphonCapacitance = useSiphonStore((s) => s.siphonCapacitance);
  const longRest = useSiphonStore((s) => s.longRest);

  // Character store
  const level = useCharacterStore((s) => s.level);
  const pb = useCharacterStore((s) => s.proficiencyBonus);
  const hitDice = useCharacterStore((s) => s.hitDice);
  const maxHitDice = useCharacterStore((s) => s.maxHitDice);
  const reducedMaxHP = useCharacterStore((s) => s.reducedMaxHP);
  const maxHP = useCharacterStore((s) => s.maxHP);
  const restoreAllHitDice = useCharacterStore((s) => s.restoreAllHitDice);
  const restoreMaxHP = useCharacterStore((s) => s.restoreMaxHP);

  // Manifold store
  const motes = useManifoldStore((s) => s.motes);
  const resetMotesOnLongRest = useManifoldStore((s) => s.resetMotesOnLongRest);

  // Settings
  const diceMode = useSettingsStore((s) => s.diceMode);
  const isMacroMode = diceMode.longRestFocus === 'macro';

  // Preview calculations
  const maxEP = level;
  const newEP = Math.min(maxEP, currentEP + pb);
  const epRecoveryPreview = newEP - currentEP;
  const hasMaxHPReduction = reducedMaxHP < maxHP;

  // Count effects that will be cleared (duration <= 8 hours)
  const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;
  const effectsToClear = activeEffects.filter(
    (e) => e.durationMs !== null && e.durationMs <= EIGHT_HOURS_MS
  );

  const executeLongRest = (focusRollOverride?: number) => {
    // 1. Siphon store long rest (EP, Focus, hand, bestowments, effects, capacitance)
    const restResult = longRest(pb, maxEP, focusRollOverride);

    // 2. Restore all hit dice
    restoreAllHitDice();

    // 3. Restore max HP if reduced by Echo Drain
    if (restResult.maxHPRestored > 0) {
      restoreMaxHP(restResult.maxHPRestored);
    }

    // 4. Restore motes + phase switch
    resetMotesOnLongRest();

    setResult(restResult);
    setDialogState('complete');
  };

  const handleConfirm = () => {
    if (isMacroMode) {
      setDialogState('awaiting-focus-roll');
    } else {
      // dice3d mode: auto-roll d4
      const focusRoll = rollD(4);
      executeLongRest(focusRoll);
    }
  };

  const handleMacroResult = (focusRoll: number) => {
    executeLongRest(focusRoll);
  };

  // Complete state — show summary and close
  if (dialogState === 'complete' && result) {
    return (
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
        onClick={onClose}
        role="dialog"
        aria-label="Long Rest Complete"
      >
        <div
          className="bg-siphon-surface border border-siphon-border rounded-lg p-5 max-w-md w-full mx-4 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1">
            Long Rest Complete
          </div>
          <div className="text-lg font-bold text-text-primary mb-4">
            Rest Results
          </div>

          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-text-muted">EP Recovered</span>
              <span className="text-ep-positive">+{result.epRecovered}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Focus Reduced</span>
              <span className="text-focus">-{result.focusReduced}</span>
            </div>
            {result.maxHPRestored > 0 && (
              <div className="flex justify-between">
                <span className="text-text-muted">Max HP Restored</span>
                <span className="text-ep-positive">+{result.maxHPRestored}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-text-muted">Motes</span>
              <span className="text-text-secondary">8/8</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Hit Dice</span>
              <span className="text-text-secondary">{maxHitDice}/{maxHitDice}</span>
            </div>
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
      aria-label="Long Rest"
    >
      <div
        className="bg-siphon-surface border border-siphon-border rounded-lg p-5 max-w-md w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1">
            Long Rest
          </div>
          <div className="text-lg font-bold text-text-primary">
            Rest Preview
          </div>
        </div>

        {/* Preview items */}
        <div className="border-t border-siphon-border pt-3 mb-3 space-y-2">
          {/* EP Recovery */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">EP Recovery</span>
            <span>
              <span className="text-ep-positive">+{pb} EP</span>
              <span className="text-text-muted ml-1">
                ({currentEP} &rarr; {newEP}, max {maxEP})
              </span>
            </span>
          </div>

          {/* Focus Reduction */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Focus Reduction</span>
            <span className="text-focus">d4 roll (current: {focus})</span>
          </div>

          {/* Resources Restored */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Motes</span>
            <span className="text-text-secondary">{motes} &rarr; 8/8</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Hit Dice</span>
            <span className="text-text-secondary">{hitDice}/{maxHitDice} &rarr; {maxHitDice}/{maxHitDice}</span>
          </div>

          {/* Max HP */}
          {hasMaxHPReduction && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Max HP Restored</span>
              <span className="text-ep-positive">+{epRecoveryPreview} (from EP recovery)</span>
            </div>
          )}

          {/* Bestowments */}
          {(handCardIds.length > 0 || allyBestowments.length > 0) && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Bestowments Cleared</span>
              <span className="text-text-secondary">
                {handCardIds.length + allyBestowments.length} bestowment{handCardIds.length + allyBestowments.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Active Effects */}
          {effectsToClear.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Effects Removed</span>
              <span className="text-text-secondary">
                {effectsToClear.length} short-duration effect{effectsToClear.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Capacitance */}
          {siphonCapacitance > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Capacitance</span>
              <span className="text-capacitance">{siphonCapacitance} &rarr; 0</span>
            </div>
          )}
        </div>

        {/* Macro mode: awaiting focus roll */}
        {dialogState === 'awaiting-focus-roll' ? (
          <div className="border-t border-siphon-border pt-3">
            <MacroDisplay
              macroText="/r 1d4 # Long Rest Focus Reduction"
              focusLabel="Focus reduction"
              onResultEntered={handleMacroResult}
            />
            <button
              className="w-full mt-2 py-1.5 text-xs rounded border border-siphon-border text-text-muted hover:border-ep-negative/50 hover:text-ep-negative transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        ) : (
          /* Confirm / Cancel */
          <div className="border-t border-siphon-border pt-3 flex gap-2">
            <button
              className="flex-1 py-2 text-sm rounded bg-siphon-accent/20 border border-siphon-accent/50 text-siphon-accent hover:bg-siphon-accent/30 transition-colors font-medium"
              onClick={handleConfirm}
            >
              {isMacroMode ? 'Roll in Foundry' : 'Confirm Long Rest'}
            </button>
            <button
              className="flex-1 py-2 text-sm rounded border border-siphon-border text-text-muted hover:border-ep-negative/50 hover:text-ep-negative transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
