import { useState } from 'react';
import type { SiphonFeature, SurgeResult } from '../../types';
import { useSiphonStore, useCharacterStore, useSettingsStore } from '../../store';
import { resolveFocusDice, generateActivationMacro, resolveBaseCost } from '../../utils/macroGenerator';
import { parseDurationToMs } from '../../utils/durationParser';
import { parseDiceExpression, rollDice } from '../../utils/diceRoller';
import { isVariableCost } from '../../utils/costCalculator';
import { rollSurge } from '../../utils/surgeRoller';
import { MacroDisplay } from './MacroDisplay';
import { SurgeResultModal } from './SurgeResultModal';

interface ActivationPanelProps {
  feature: SiphonFeature;
  onComplete: (surgeResult: SurgeResult | null) => void;
  onCancel: () => void;
}

type PanelState = 'preview' | 'awaiting-result' | 'warp-result';

export function ActivationPanel({ feature, onComplete, onCancel }: ActivationPanelProps) {
  const [panelState, setPanelState] = useState<PanelState>('preview');
  const [warpResult, setWarpResult] = useState<SurgeResult | null>(null);
  const [chosenCost, setChosenCost] = useState<number>(0);

  // Store selectors (primitives — safe for selectors)
  const currentEP = useSiphonStore((s) => s.currentEP);
  const echoIntuitionActive = useSiphonStore((s) => s.echoIntuitionActive);
  const performActivation = useSiphonStore((s) => s.performActivation);
  const getEffectiveCost = useSiphonStore((s) => s.getEffectiveCost);
  const getEffectiveFocusDice = useSiphonStore((s) => s.getEffectiveFocusDice);
  const hasSiphonGreedSelected = useSiphonStore((s) => s.hasSiphonGreedSelected);
  const isEchoDrained = useSiphonStore((s) => s.isEchoDrained);

  const level = useCharacterStore((s) => s.level);
  const pb = useCharacterStore((s) => s.proficiencyBonus);
  const diceMode = useSettingsStore((s) => s.diceMode);
  const autoSurge = useSettingsStore((s) => s.autoTriggerSurgeOnWarp);

  // Varies cost handling
  const isVaries = isVariableCost(feature.cost);

  // Compute costs (uses chosenCost for Varies features)
  const baseCost = isVaries
    ? chosenCost
    : resolveBaseCost(feature.cost, { pb, level });
  const effectiveCost = getEffectiveCost(baseCost, level);
  const newEP = currentEP - effectiveCost;
  const warpWillTrigger = newEP < 0;

  // Compute focus dice (cost-dependent dice like [Cost]d8 react to chosenCost)
  const resolvedFocusDice = resolveFocusDice(feature.focusDice, { pb, cost: effectiveCost });
  const effectiveFocusDice = getEffectiveFocusDice(resolvedFocusDice);

  // Modifiers display
  const siphonGreedApplies = hasSiphonGreedSelected() && isEchoDrained(level);

  // Macro text
  const macroText = generateActivationMacro(feature, effectiveCost, effectiveFocusDice);

  const isMacroMode = diceMode.siphonFeature === 'macro';

  // Cannot confirm Varies features without a chosen cost
  const canConfirm = !isVaries || chosenCost > 0;

  const executeActivation = (focusRollResult: number) => {
    // Build active effect config for duration-based features
    const durationMs = parseDurationToMs(feature.duration);
    const needsActiveEffect =
      feature.duration !== 'Instant' && feature.duration !== 'Triggered';

    const { spendResult } = performActivation({
      featureId: feature.id,
      effectiveCost,
      focusRollResult,
      level,
      activeEffect: needsActiveEffect
        ? {
            sourceType: 'siphon',
            sourceId: feature.id,
            sourceName: feature.name,
            description: feature.description,
            totalDuration: feature.duration,
            durationMs,
            requiresConcentration: feature.requiresConcentration ?? false,
            featureWarpEffect: feature.warpEffect ?? undefined,
          }
        : undefined,
    });

    // Handle warp
    if (spendResult.warpTriggered && autoSurge) {
      const surge = rollSurge();
      setWarpResult(surge);
      setPanelState('warp-result');
      return; // Wait for user to dismiss surge
    }

    if (spendResult.warpTriggered) {
      const surge = rollSurge();
      onComplete(surge);
    } else {
      onComplete(null);
    }
  };

  const handleConfirmDirect = () => {
    if (isMacroMode) {
      setPanelState('awaiting-result');
    } else {
      // Simple random roll (placeholder for future 3D dice)
      const expr = parseDiceExpression(effectiveFocusDice);
      const result = rollDice(expr.count, expr.sides, expr.modifier);
      executeActivation(result.total);
    }
  };

  const handleMacroResult = (result: number) => {
    executeActivation(result);
  };

  const handleDismissWarp = () => {
    onComplete(warpResult);
  };

  // Warp result sub-view — delegates to SurgeResultModal
  if (panelState === 'warp-result' && warpResult) {
    return (
      <SurgeResultModal
        result={warpResult}
        featureWarpEffect={feature.warpEffect ?? undefined}
        onDismiss={handleDismissWarp}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onCancel}
      role="dialog"
      aria-label={`Activate ${feature.name}`}
    >
      <div
        className="bg-siphon-surface border border-siphon-border rounded-lg p-5 max-w-lg w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1">
            Activate Feature
          </div>
          <div className="text-lg font-bold text-text-primary">
            {feature.name}
          </div>
          <p className="text-xs text-text-secondary mt-1 leading-relaxed">
            {feature.description}
          </p>
        </div>

        {/* Cost breakdown */}
        <div className="border-t border-siphon-border pt-3 mb-3 space-y-2">
          {/* Varies cost input */}
          {isVaries ? (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">EP Cost (choose)</span>
              <input
                type="number"
                min="1"
                value={chosenCost || ''}
                onChange={(e) => setChosenCost(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-20 px-2 py-1 text-sm bg-siphon-bg border border-siphon-border rounded text-text-primary tabular-nums text-right focus:border-siphon-accent focus:outline-none"
                placeholder="0"
                aria-label="Choose EP cost"
              />
            </div>
          ) : (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">EP Cost</span>
              <span>
                {baseCost !== effectiveCost ? (
                  <>
                    <span className="text-text-muted line-through mr-2">{baseCost}</span>
                    <span className="text-ep-positive font-bold">{effectiveCost}</span>
                  </>
                ) : (
                  <span className="text-ep-positive font-bold">{effectiveCost}</span>
                )}
              </span>
            </div>
          )}

          {/* Effective cost display for Varies (after modifiers) */}
          {isVaries && chosenCost > 0 && baseCost !== effectiveCost && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Effective Cost</span>
              <span>
                <span className="text-text-muted line-through mr-2">{baseCost}</span>
                <span className="text-ep-positive font-bold">{effectiveCost}</span>
              </span>
            </div>
          )}

          {/* EP Change preview */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">EP</span>
            <span>
              <span className={currentEP < 0 ? 'text-ep-negative' : 'text-ep-positive'}>
                {currentEP}
              </span>
              <span className="text-text-muted mx-1">&rarr;</span>
              <span className={newEP < 0 ? 'text-ep-negative font-bold' : 'text-ep-positive'}>
                {newEP}
              </span>
            </span>
          </div>

          {/* Focus dice */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Focus Dice</span>
            <span className="text-focus font-medium">{effectiveFocusDice}</span>
          </div>

          {/* Duration */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Duration</span>
            <span className="text-text-secondary">{feature.duration}</span>
          </div>

          {/* Modifier labels */}
          {echoIntuitionActive && (
            <div className="text-[10px] text-siphon-accent px-2 py-1 rounded bg-siphon-accent/10 border border-siphon-accent/20">
              Echo Intuition: Cost and Focus halved
            </div>
          )}
          {siphonGreedApplies && (
            <div className="text-[10px] text-capacitance px-2 py-1 rounded bg-capacitance/10 border border-capacitance/20">
              Siphon Greed: Cost halved (Echo Drained)
            </div>
          )}
        </div>

        {/* Warp warning */}
        {warpWillTrigger && (
          <div className="mb-3 px-3 py-2 rounded border border-warp/50 bg-warp/10 text-center">
            <span className="text-sm font-bold text-warp">WARP WILL TRIGGER</span>
            {feature.warpEffect && (
              <p className="text-[10px] text-warp/70 mt-1">{feature.warpEffect}</p>
            )}
          </div>
        )}

        {/* Macro display (macro mode) or action buttons */}
        {panelState === 'awaiting-result' ? (
          <div className="border-t border-siphon-border pt-3">
            <MacroDisplay
              macroText={macroText}
              focusLabel="Focus"
              onResultEntered={handleMacroResult}
            />
            <button
              className="w-full mt-2 py-1.5 text-xs rounded border border-siphon-border text-text-muted hover:border-ep-negative/50 hover:text-ep-negative transition-colors"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="border-t border-siphon-border pt-3">
            {/* Show macro preview in macro mode */}
            {isMacroMode && (
              <pre className="bg-siphon-bg border border-siphon-border rounded px-3 py-2 text-xs text-text-secondary font-mono mb-3 whitespace-pre-wrap">
                {macroText}
              </pre>
            )}
            <div className="flex gap-2">
              <button
                className="flex-1 py-2 text-sm rounded bg-siphon-accent/20 border border-siphon-accent/50 text-siphon-accent hover:bg-siphon-accent/30 transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={handleConfirmDirect}
                disabled={!canConfirm}
              >
                {isMacroMode ? 'Roll in Foundry' : 'Activate'}
              </button>
              <button
                className="flex-1 py-2 text-sm rounded border border-siphon-border text-text-muted hover:border-ep-negative/50 hover:text-ep-negative transition-colors"
                onClick={onCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
