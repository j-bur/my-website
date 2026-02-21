import { useState, useRef, useEffect } from 'react';
import { useSiphonStore, useSettingsStore } from '../../store';
import { getCardDragData, isCardDrag } from '../../types/dragData';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useCardDragDetection } from '../../hooks/useCardDragDetection';
import type { SelfActiveEffect } from '../../types';

interface ActiveEffectsPanelProps {
  onActivateCard?: (featureId: string) => void;
}

interface EffectRowProps {
  effect: SelfActiveEffect;
  panelRef: React.RefObject<HTMLDivElement | null>;
}

function EffectRow({ effect, panelRef }: EffectRowProps) {
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

export function ActiveEffectsPanel({ onActivateCard }: ActiveEffectsPanelProps) {
  const activeEffects = useSiphonStore((s) => s.activeEffects);
  const highlightDropTargets = useSettingsStore((s) => s.highlightDropTargets);
  const [isDragTarget, setIsDragTarget] = useState(false);
  const isCardBeingDragged = useCardDragDetection(() => setIsDragTarget(false));
  const panelRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    if (isCardDrag(e.dataTransfer)) {
      e.preventDefault();
      setIsDragTarget(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragTarget(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragTarget(false);
    const data = getCardDragData(e.dataTransfer);
    if (data?.source === 'hand' && onActivateCard) {
      onActivateCard(data.featureId);
    }
  };

  const showAmbientHighlight = highlightDropTargets && isCardBeingDragged && !isDragTarget;
  const showActiveHighlight = isDragTarget;

  return (
    <div
      ref={panelRef}
      className={`border rounded-lg bg-siphon-surface/30 p-3 min-h-24 transition-all ${
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

      {activeEffects.length === 0 ? (
        <div className="flex items-center justify-center h-16 text-text-muted/50 text-xs italic">
          (drag cards here to activate)
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {activeEffects.map((effect) => (
            <EffectRow key={effect.id} effect={effect} panelRef={panelRef} />
          ))}
        </div>
      )}
    </div>
  );
}
