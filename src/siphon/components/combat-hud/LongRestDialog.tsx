import { useState, useMemo } from 'react';
import { useSiphonStore, useCharacterStore, useManifoldStore, useSettingsStore } from '../../store';
import { rollD } from '../../utils/diceRoller';
import { calculateWhileSelectedEffects } from '../../utils/whileSelectedCalculator';

interface LongRestDialogProps {
  onClose: () => void;
}

type DialogState = 'preview' | 'awaiting-rolls' | 'complete';

export function LongRestDialog({ onClose }: LongRestDialogProps) {
  const [dialogState, setDialogState] = useState<DialogState>('preview');
  const [focusInput, setFocusInput] = useState('');
  const [greedInput, setGreedInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<{
    epRecovered: number;
    focusReduced: number;
    maxHPRestored: number;
    whileSelectedEPCost: number;
    whileSelectedFocusGain: number;
  } | null>(null);

  // Siphon store
  const currentEP = useSiphonStore((s) => s.currentEP);
  const focus = useSiphonStore((s) => s.focus);
  const selectedCardIds = useSiphonStore((s) => s.selectedCardIds);
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

  // While Selected effects
  const whileSelectedEffects = useMemo(
    () => calculateWhileSelectedEffects(selectedCardIds, pb),
    [selectedCardIds, pb]
  );
  const supercapEffect = whileSelectedEffects.find(e => e.featureId === 'supercapacitance');
  const greedEffect = whileSelectedEffects.find(e => e.featureId === 'siphon-greed');

  // Preview calculations
  const maxEP = level;
  const newEP = Math.min(maxEP, currentEP + pb);
  const epRecoveryPreview = newEP - currentEP;
  const hasMaxHPReduction = reducedMaxHP < maxHP;

  // Preview EP after While Selected costs
  const epAfterWhileSelected = supercapEffect ? newEP - supercapEffect.epCost : newEP;
  const wouldGoNegative = supercapEffect !== undefined && epAfterWhileSelected < 0;

  // Count effects that will be cleared (duration <= 8 hours)
  const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;
  const effectsToClear = activeEffects.filter(
    (e) => e.durationMs !== null && e.durationMs <= EIGHT_HOURS_MS
  );

  const executeLongRest = (focusRoll: number, greedRoll?: number) => {
    // Build While Selected effects with actual roll values
    const effects = whileSelectedEffects.map(e => {
      if (e.featureId === 'siphon-greed' && greedRoll !== undefined) {
        return { featureId: e.featureId, epCost: e.epCost, focusGain: greedRoll };
      }
      return { featureId: e.featureId, epCost: e.epCost, focusGain: e.focusGain };
    });

    // 1. Siphon store long rest (EP, Focus, hand, bestowments, effects, capacitance, While Selected)
    const restResult = longRest(pb, maxEP, focusRoll, effects);

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
      setDialogState('awaiting-rolls');
    } else {
      // dice3d mode: auto-roll all dice
      const focusRoll = rollD(4);
      const greedRoll = greedEffect ? rollD(4) : undefined;
      executeLongRest(focusRoll, greedRoll);
    }
  };

  const handleApplyMacroResults = () => {
    const focusVal = parseInt(focusInput, 10);
    if (isNaN(focusVal) || focusVal < 0) return;

    let greedVal: number | undefined;
    if (greedEffect) {
      greedVal = parseInt(greedInput, 10);
      if (isNaN(greedVal) || greedVal < 0) return;
    }

    executeLongRest(focusVal, greedVal);
  };

  const macroText = greedEffect
    ? '/r 1d4 # Long Rest Focus Reduction\n/r 1d4 # Siphon Greed Focus'
    : '/r 1d4 # Long Rest Focus Reduction';

  const canApplyMacro = (() => {
    const focusVal = parseInt(focusInput, 10);
    if (isNaN(focusVal)) return false;
    if (greedEffect) {
      const greedVal = parseInt(greedInput, 10);
      if (isNaN(greedVal)) return false;
    }
    return true;
  })();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(macroText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
            {result.whileSelectedEPCost > 0 && (
              <div className="flex justify-between">
                <span className="text-text-muted">Supercapacitance EP Cost</span>
                <span className="text-ep-negative">-{result.whileSelectedEPCost}</span>
              </div>
            )}
            {result.whileSelectedFocusGain > 0 && (
              <div className="flex justify-between">
                <span className="text-text-muted">While Selected Focus</span>
                <span className="text-focus">+{result.whileSelectedFocusGain}</span>
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

          {/* While Selected Effects */}
          {whileSelectedEffects.length > 0 && (
            <div className="border-t border-siphon-border pt-2 mt-2">
              <div className="text-[10px] uppercase tracking-widest text-text-muted mb-2">
                While Selected
              </div>
              {supercapEffect && (
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-text-muted">Supercapacitance</span>
                  <span>
                    <span className="text-ep-negative">-{supercapEffect.epCost} EP</span>
                    <span className="text-text-muted mx-1">/</span>
                    <span className="text-focus">+{supercapEffect.focusGain} Focus</span>
                    <span className="text-text-muted ml-1">({supercapEffect.description})</span>
                  </span>
                </div>
              )}
              {greedEffect && (
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-text-muted">Siphon Greed</span>
                  <span className="text-focus">+1d4 Focus</span>
                </div>
              )}
              {wouldGoNegative && (
                <div className="text-xs text-ep-negative mt-1">
                  Warning: Supercapacitance cost will push EP to {epAfterWhileSelected} (negative)
                </div>
              )}
            </div>
          )}

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

        {/* Macro mode: awaiting roll results */}
        {dialogState === 'awaiting-rolls' ? (
          <div className="border-t border-siphon-border pt-3 space-y-3">
            {/* Macro text block */}
            <div className="relative">
              <pre className="bg-siphon-bg border border-siphon-border rounded px-3 py-2 text-xs text-text-secondary font-mono whitespace-pre-wrap">
                {macroText}
              </pre>
              <button
                className="absolute top-1 right-1 px-2 py-0.5 text-[10px] rounded bg-siphon-surface border border-siphon-border hover:border-siphon-accent/60 text-text-muted transition-colors"
                onClick={handleCopy}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Focus reduction input */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-text-muted">Focus reduction result:</label>
              <input
                type="number"
                min="0"
                value={focusInput}
                onChange={(e) => setFocusInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && canApplyMacro) handleApplyMacroResults(); }}
                className="w-20 px-2 py-1 text-sm bg-siphon-bg border border-siphon-border rounded text-text-primary tabular-nums focus:border-siphon-accent focus:outline-none"
                placeholder="0"
                aria-label="Focus roll result"
              />
            </div>

            {/* Siphon Greed input (if needed) */}
            {greedEffect && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-text-muted">Siphon Greed result:</label>
                <input
                  type="number"
                  min="0"
                  value={greedInput}
                  onChange={(e) => setGreedInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && canApplyMacro) handleApplyMacroResults(); }}
                  className="w-20 px-2 py-1 text-sm bg-siphon-bg border border-siphon-border rounded text-text-primary tabular-nums focus:border-siphon-accent focus:outline-none"
                  placeholder="0"
                  aria-label="Siphon Greed roll result"
                />
              </div>
            )}

            {/* Apply / Cancel */}
            <div className="flex gap-2">
              <button
                className="flex-1 py-1.5 text-xs rounded bg-siphon-accent/20 border border-siphon-accent/50 text-siphon-accent hover:bg-siphon-accent/30 transition-colors disabled:opacity-40"
                onClick={handleApplyMacroResults}
                disabled={!canApplyMacro}
              >
                Apply
              </button>
              <button
                className="flex-1 py-1.5 text-xs rounded border border-siphon-border text-text-muted hover:border-ep-negative/50 hover:text-ep-negative transition-colors"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
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
