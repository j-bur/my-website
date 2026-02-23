import { useState, useRef, useEffect } from 'react';
import { useSiphonStore, useSettingsStore } from '../../store';
import { getCardDragData, isCardDrag, getActiveDragData } from '../../types/dragData';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useCardDragDetection } from '../../hooks/useCardDragDetection';
import { FEATURE_MAP } from '../../data/featureConstants';
import { activateFeature, computeActivationPreview } from '../../utils/activateFeature';
import { isVariableCost } from '../../utils/costCalculator';
import type { SelfActiveEffect, SiphonFeature } from '../../types';

interface ActiveEffectsPanelProps {
  onWarpTriggered?: () => void;
}

interface EffectRowProps {
  effect: SelfActiveEffect;
  panelRef: React.RefObject<HTMLDivElement | null>;
  isNew?: boolean;
}

function EffectRow({ effect, panelRef, isNew }: EffectRowProps) {
  const removeActiveEffect = useSiphonStore((s) => s.removeActiveEffect);
  const skipAnimations = useReducedMotion();

  const [dragState, setDragState] = useState<'idle' | 'grabbed' | 'dragging' | 'dismissing'>('idle');
  const [offsetX, setOffsetX] = useState(0);
  const [isOutside, setIsOutside] = useState(false);
  const startXRef = useRef(0);

  // Handle dismiss animation completion
  useEffect(() => {
    if (dragState === 'dismissing') {
      const timer = setTimeout(
        () => removeActiveEffect(effect.id),
        skipAnimations ? 0 : 400
      );
      return () => clearTimeout(timer);
    }
  }, [dragState, effect.id, removeActiveEffect, skipAnimations]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return; // Only left click
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    startXRef.current = e.clientX;
    setDragState('grabbed');
    setOffsetX(0);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragState !== 'grabbed' && dragState !== 'dragging') return;
    const dx = e.clientX - startXRef.current;
    if (dragState === 'grabbed' && Math.abs(dx) < 4) return; // Dead zone
    setDragState('dragging');
    setOffsetX(dx);

    // Check if pointer is outside panel bounds
    if (panelRef.current) {
      const panelRect = panelRef.current.getBoundingClientRect();
      const outside = e.clientX < panelRect.left || e.clientX > panelRect.right;
      setIsOutside(outside);
    }
  };

  const handlePointerUp = () => {
    if (isOutside && dragState === 'dragging') {
      // Dismiss: snap back then animate out
      setDragState('dismissing');
      setOffsetX(0);
    } else {
      // Cancel: snap back
      setDragState('idle');
      setOffsetX(0);
      setIsOutside(false);
    }
  };

  return (
    <div
      className={`
        group flex items-center gap-2 px-2 py-1 rounded bg-siphon-bg/50 text-xs
        ${dragState === 'idle' ? 'cursor-grab hover:bg-siphon-bg/70' : ''}
        ${dragState === 'grabbed' || dragState === 'dragging' ? 'cursor-grabbing shadow-lg scale-[1.02]' : ''}
        ${isOutside && dragState === 'dragging' ? 'opacity-40 saturate-50' : ''}
        ${dragState === 'dismissing' ? 'effect-dismiss' : ''}
        ${isNew && effect.warpActive ? 'warp-flash' : ''}
      `}
      style={{
        transform: dragState === 'dragging' ? `translateX(${offsetX}px)` : undefined,
        transition: dragState === 'dragging' ? 'none' : undefined,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      data-testid={`effect-row-${effect.id}`}
    >
      {/* Source icon */}
      <span className="shrink-0">
        {effect.sourceType === 'siphon' ? '\u26A1' : effect.sourceType === 'manifold' ? '\u25CE' : '\u2726'}
      </span>

      {/* Name and source */}
      <span className="text-text-primary truncate flex-1">
        {effect.sourceName}
        {effect.sourceType === 'manifold' && (
          <span className="text-text-muted ml-1">({effect.sourceType})</span>
        )}
      </span>

      {/* Duration */}
      <span className="text-text-secondary shrink-0">
        {effect.totalDuration}
      </span>

      {/* Concentration indicator */}
      {effect.requiresConcentration && (
        <span className="text-capacitance shrink-0" title="Concentration">
          CONC
        </span>
      )}

      {/* Warp indicator */}
      {effect.warpActive && (
        <span className="text-warp shrink-0" title="Warp active">
          W
        </span>
      )}

      {/* Drag handle — appears on hover */}
      <span
        className={`shrink-0 text-text-muted/40 select-none ${
          dragState === 'idle' ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
        } transition-opacity`}
        aria-hidden="true"
      >
        &#x205E;&#x205E;
      </span>
    </div>
  );
}

interface GhostPreviewRowProps {
  feature: SiphonFeature;
  onVariesCostChange?: (cost: number) => void;
  variesCost?: number;
}

function GhostPreviewRow({ feature, onVariesCostChange, variesCost }: GhostPreviewRowProps) {
  const currentEP = useSiphonStore((s) => s.currentEP);
  const isVaries = isVariableCost(feature.cost);
  const preview = computeActivationPreview(feature, isVaries ? variesCost : undefined);

  return (
    <div
      className="flex flex-col gap-1 px-2 py-1.5 rounded border border-dashed border-siphon-accent/40 bg-siphon-accent/5 text-xs ghost-glow"
      data-testid="ghost-preview-row"
    >
      <div className="flex items-center gap-2">
        <span className="shrink-0 text-siphon-accent/60">&#x27E1;</span>
        <span className="text-text-primary/60 truncate flex-1">{feature.name}</span>
        {preview && (
          <>
            <span className="text-ep-positive/60 shrink-0">{preview.effectiveCost} EP</span>
            <span className="text-focus/60 shrink-0">{preview.focusDice}</span>
          </>
        )}
      </div>

      {/* EP change preview */}
      <div className="flex items-center gap-2 pl-6">
        {isVaries ? (
          <div className="flex items-center gap-1">
            <span className="text-text-muted">EP Cost:</span>
            <input
              type="number"
              min="1"
              value={variesCost || ''}
              onChange={(e) => onVariesCostChange?.(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-14 px-1 py-0.5 text-xs bg-siphon-bg border border-siphon-border rounded text-text-primary tabular-nums text-right focus:border-siphon-accent focus:outline-none"
              placeholder="0"
              aria-label="Choose EP cost"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ) : null}

        {preview && (
          <span className="text-text-muted">
            EP:{' '}
            <span className={currentEP < 0 ? 'text-ep-negative' : 'text-ep-positive'}>
              {currentEP}
            </span>
            {' \u2192 '}
            <span className={preview.newEP < 0 ? 'text-ep-negative font-bold' : 'text-ep-positive'}>
              {preview.newEP}
            </span>
            {preview.warpWillTrigger && (
              <span className="text-warp font-bold ml-1">(WARP)</span>
            )}
          </span>
        )}
        {isVaries && !preview && (
          <span className="text-text-muted/40 italic">enter cost above</span>
        )}
      </div>
    </div>
  );
}

interface VariesActivationFormProps {
  feature: SiphonFeature;
  onActivate: (chosenCost: number) => void;
  onCancel: () => void;
}

function VariesActivationForm({ feature, onActivate, onCancel }: VariesActivationFormProps) {
  const [cost, setCost] = useState(0);
  const currentEP = useSiphonStore((s) => s.currentEP);
  const preview = computeActivationPreview(feature, cost);

  return (
    <div
      className="flex flex-col gap-1.5 px-2 py-2 rounded border border-siphon-accent/30 bg-siphon-surface/50 text-xs"
      data-testid="varies-activation-form"
    >
      <div className="flex items-center gap-2">
        <span className="shrink-0">{'\u26A1'}</span>
        <span className="text-text-primary truncate flex-1">{feature.name}</span>
      </div>

      <div className="flex items-center gap-2 pl-6">
        <span className="text-text-muted">EP Cost:</span>
        <input
          type="number"
          min="1"
          value={cost || ''}
          onChange={(e) => setCost(Math.max(0, parseInt(e.target.value, 10) || 0))}
          className="w-14 px-1 py-0.5 text-xs bg-siphon-bg border border-siphon-border rounded text-text-primary tabular-nums text-right focus:border-siphon-accent focus:outline-none"
          placeholder="0"
          aria-label="Choose EP cost"
          autoFocus
        />
        {preview && (
          <span className="text-text-muted">
            EP:{' '}
            <span className={currentEP < 0 ? 'text-ep-negative' : 'text-ep-positive'}>
              {currentEP}
            </span>
            {' \u2192 '}
            <span className={preview.newEP < 0 ? 'text-ep-negative font-bold' : 'text-ep-positive'}>
              {preview.newEP}
            </span>
            {preview.warpWillTrigger && (
              <span className="text-warp font-bold ml-1">(WARP)</span>
            )}
          </span>
        )}
      </div>

      <div className="flex gap-2 pl-6">
        <button
          className="px-2 py-0.5 rounded bg-siphon-accent/20 border border-siphon-accent/50 text-siphon-accent hover:bg-siphon-accent/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={cost <= 0}
          onClick={() => onActivate(cost)}
        >
          Activate
        </button>
        <button
          className="px-2 py-0.5 rounded border border-siphon-border text-text-muted hover:border-ep-negative/50 hover:text-ep-negative transition-colors"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function ActiveEffectsPanel({ onWarpTriggered }: ActiveEffectsPanelProps) {
  const activeEffects = useSiphonStore((s) => s.activeEffects);
  const highlightDropTargets = useSettingsStore((s) => s.highlightDropTargets);
  const [isDragTarget, setIsDragTarget] = useState(false);
  const isCardBeingDragged = useCardDragDetection(() => setIsDragTarget(false));
  const panelRef = useRef<HTMLDivElement>(null);
  const [ghostVariesCost, setGhostVariesCost] = useState(0);
  const [newEffectIds, setNewEffectIds] = useState<Set<string>>(new Set());
  const prevEffectCountRef = useRef(activeEffects.length);

  // Pending Varies cost activation (card dropped but needs cost input)
  const [pendingVaries, setPendingVaries] = useState<{ featureId: string; feature: SiphonFeature } | null>(null);

  // Track newly added effects for warp flash animation
  useEffect(() => {
    if (activeEffects.length > prevEffectCountRef.current) {
      const newIds = new Set(activeEffects.slice(prevEffectCountRef.current).map((e) => e.id));
      setNewEffectIds(newIds);
      const timer = setTimeout(() => setNewEffectIds(new Set()), 900);
      prevEffectCountRef.current = activeEffects.length;
      return () => clearTimeout(timer);
    }
    prevEffectCountRef.current = activeEffects.length;
  }, [activeEffects]);

  // Read ghost preview data from active drag data during dragover
  const activeDragData = isDragTarget ? getActiveDragData() : null;
  const ghostFeature = activeDragData?.source === 'hand'
    ? FEATURE_MAP.get(activeDragData.featureId) ?? null
    : null;

  const handleDragOver = (e: React.DragEvent) => {
    if (isCardDrag(e.dataTransfer)) {
      e.preventDefault();
      if (!isDragTarget) {
        setIsDragTarget(true);
        setGhostVariesCost(0);
      }
    }
  };

  const handleDragLeave = () => {
    setIsDragTarget(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragTarget(false);
    const data = getCardDragData(e.dataTransfer);
    if (data?.source !== 'hand') return;

    const feature = FEATURE_MAP.get(data.featureId);
    if (!feature) return;

    // For Varies cost features, show inline form instead of activating immediately
    if (isVariableCost(feature.cost)) {
      setPendingVaries({ featureId: data.featureId, feature });
      return;
    }

    // Immediate activation
    const result = activateFeature(data.featureId);
    if (result?.warpTriggered) {
      onWarpTriggered?.();
    }
  };

  const handleVariesActivate = (chosenCost: number) => {
    if (!pendingVaries) return;
    const result = activateFeature(pendingVaries.featureId, { chosenCost });
    setPendingVaries(null);
    if (result?.warpTriggered) {
      onWarpTriggered?.();
    }
  };

  const handleVariesCancel = () => {
    setPendingVaries(null);
  };

  const showAmbientHighlight = highlightDropTargets && isCardBeingDragged && !isDragTarget;
  const showActiveHighlight = isDragTarget;

  const hasContent = activeEffects.length > 0 || ghostFeature || pendingVaries;

  return (
    <div
      ref={panelRef}
      className={`border rounded-lg bg-siphon-surface/30 p-3 min-h-24 h-full flex flex-col transition-all ${
        showActiveHighlight
          ? 'border-siphon-accent shadow-[0_0_20px_rgba(0,212,170,0.3)]'
          : showAmbientHighlight
            ? 'border-siphon-accent/40 shadow-[0_0_12px_rgba(0,212,170,0.15)] drop-zone-glow'
            : 'border-siphon-border'
      }`}
      role="region"
      aria-label="Active Effects"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="text-[10px] uppercase tracking-widest text-text-muted mb-2 text-center">
        Active Effects
      </div>

      {!hasContent ? (
        <div className="flex items-center justify-center flex-1 text-text-muted/50 text-xs italic">
          (drag cards here to activate)
        </div>
      ) : (
        <div className="flex flex-col gap-1 flex-1 overflow-y-auto">
          {activeEffects.map((effect) => (
            <EffectRow
              key={effect.id}
              effect={effect}
              panelRef={panelRef}
              isNew={newEffectIds.has(effect.id)}
            />
          ))}

          {/* Pending Varies cost form */}
          {pendingVaries && (
            <VariesActivationForm
              feature={pendingVaries.feature}
              onActivate={handleVariesActivate}
              onCancel={handleVariesCancel}
            />
          )}

          {/* Ghost preview row during drag-over */}
          {ghostFeature && !pendingVaries && (
            <GhostPreviewRow
              feature={ghostFeature}
              variesCost={ghostVariesCost}
              onVariesCostChange={setGhostVariesCost}
            />
          )}
        </div>
      )}
    </div>
  );
}
