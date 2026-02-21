import { useState } from 'react';
import type { SiphonFeature, SurgeResult } from '../../types';
import { useSiphonStore, useCharacterStore, useSettingsStore } from '../../store';
import { resolveFocusDice, generateActivationMacro, resolveBaseCost } from '../../utils/macroGenerator';
import { parseDurationToMs } from '../../utils/durationParser';
import { parseDiceExpression, rollDice } from '../../utils/diceRoller';
import { rollSurge } from '../../utils/surgeRoller';
import { MacroDisplay } from './MacroDisplay';

interface ActivationPanelProps {
  feature: SiphonFeature;
  onComplete: (surgeResult: SurgeResult | null) => void;
  onCancel: () => void;
}

type PanelState = 'preview' | 'awaiting-result' | 'warp-result';

export function ActivationPanel({ feature, onComplete, onCancel }: ActivationPanelProps) {
  const [panelState, setPanelState] = useState<PanelState>('preview');
  const [warpResult, setWarpResult] = useState<SurgeResult | null>(null);

  // Store selectors (primitives — safe for selectors)
  const currentEP = useSiphonStore((s) => s.currentEP);
  const echoIntuitionActive = useSiphonStore((s) => s.echoIntuitionActive);
  const spendEP = useSiphonStore((s) => s.spendEP);
  const addFocus = useSiphonStore((s) => s.addFocus);
  const activateFromHand = useSiphonStore((s) => s.activateFromHand);
  const addActiveEffect = useSiphonStore((s) => s.addActiveEffect);
  const getEffectiveCost = useSiphonStore((s) => s.getEffectiveCost);
  const getEffectiveFocusDice = useSiphonStore((s) => s.getEffectiveFocusDice);
  const hasSiphonGreedSelected = useSiphonStore((s) => s.hasSiphonGreedSelected);
  const isEchoDrained = useSiphonStore((s) => s.isEchoDrained);

  const level = useCharacterStore((s) => s.level);
  const pb = useCharacterStore((s) => s.proficiencyBonus);
  const diceMode = useSettingsStore((s) => s.diceMode);
  const autoSurge = useSettingsStore((s) => s.autoTriggerSurgeOnWarp);

  // Compute costs
  const baseCost = resolveBaseCost(feature.cost, { pb, level });
  const effectiveCost = getEffectiveCost(baseCost, level);
  const newEP = currentEP - effectiveCost;
  const warpWillTrigger = newEP < 0;

  // Compute focus dice
  const resolvedFocusDice = resolveFocusDice(feature.focusDice, { pb, cost: effectiveCost });
  const effectiveFocusDice = getEffectiveFocusDice(resolvedFocusDice);

  // Modifiers display
  const siphonGreedApplies = hasSiphonGreedSelected() && isEchoDrained(level);

  // Macro text
  const macroText = generateActivationMacro(feature, effectiveCost, effectiveFocusDice);

  const isMacroMode = diceMode.siphonFeature === 'macro';

  const executeActivation = (focusRollResult: number) => {
    // 1. Spend EP
    const spendResult = spendEP(effectiveCost, level);

    // 2. Add focus (doubling is handled by the store if EP is negative)
    addFocus(focusRollResult);

    // 3. Add active effect if duration-based
    const durationMs = parseDurationToMs(feature.duration);
    if (feature.duration !== 'Instant' && feature.duration !== 'Triggered') {
      addActiveEffect({
        sourceType: 'siphon',
        sourceId: feature.id,
        sourceName: feature.name,
        description: feature.description,
        totalDuration: feature.duration,
        durationMs,
        requiresConcentration: feature.requiresConcentration ?? false,
        warpActive: spendResult.warpTriggered,
        warpDescription: spendResult.warpTriggered ? (feature.warpEffect ?? undefined) : undefined,
      });
    }

    // 4. Return card to deck
    activateFromHand(feature.id);

    // 5. Handle warp
    if (spendResult.warpTriggered && autoSurge) {
      const surge = rollSurge();
      setWarpResult(surge);
      setPanelState('warp-result');
      return; // Don't call onComplete yet — wait for user to dismiss surge
    }

    // If warp triggered but auto-surge is off, still report it
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

  // Warp result sub-view
  if (panelState === 'warp-result' && warpResult) {
    return (
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
        role="dialog"
        aria-label="Activation complete with warp"
      >
        <div className="bg-siphon-surface border border-warp/50 rounded-lg p-5 max-w-md w-full mx-4 shadow-2xl">
          <div className="text-center mb-3">
            <div className="text-sm font-bold text-warp mb-1">Warp Triggered!</div>
            {feature.warpEffect && (
              <p className="text-xs text-warp/80 mb-3">{feature.warpEffect}</p>
            )}
          </div>

          <div className="border-t border-siphon-border pt-3 mb-3">
            <div className="text-[10px] uppercase tracking-widest text-warp mb-2 text-center">
              Wild Echo Surge
            </div>
            <div className="flex justify-center gap-6 mb-3 text-sm">
              <div className="text-center">
                <div className="text-text-muted text-[10px]">d100</div>
                <div className="font-bold text-text-primary">{warpResult.tableRoll}</div>
              </div>
              <div className="text-center">
                <div className="text-text-muted text-[10px]">d20</div>
                <div className="font-bold text-text-primary">{warpResult.severityRoll}</div>
              </div>
              <div className="text-center">
                <div className="text-text-muted text-[10px]">Severity</div>
                <div className={`font-bold ${
                  warpResult.severity === 'Extreme' ? 'text-ep-negative' :
                  warpResult.severity === 'Moderate' ? 'text-focus-warning' : 'text-siphon-accent'
                }`}>{warpResult.severity}</div>
              </div>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              {warpResult.effect}
            </p>
          </div>

          <button
            className="w-full py-2 text-sm rounded bg-warp/20 border border-warp/40 text-warp hover:bg-warp/30 transition-colors"
            onClick={handleDismissWarp}
          >
            Dismiss
          </button>
        </div>
      </div>
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
          {/* EP Cost */}
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
                className="flex-1 py-2 text-sm rounded bg-siphon-accent/20 border border-siphon-accent/50 text-siphon-accent hover:bg-siphon-accent/30 transition-colors font-medium"
                onClick={handleConfirmDirect}
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
