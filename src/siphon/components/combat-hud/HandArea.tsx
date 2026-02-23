import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSiphonStore, useSettingsStore } from '../../store';
import { TRIGGERED_FEATURE_IDS, FEATURE_MAP } from '../../data/featureConstants';
import { setCardDragData, getCardDragData, isCardDrag, setActiveDragData } from '../../types/dragData';
import { useCardDragDetection } from '../../hooks/useCardDragDetection';
import { activateFeature } from '../../utils/activateFeature';
import { isVariableCost } from '../../utils/costCalculator';
import { SiphonCard } from '../cards/SiphonCard';

const CARD_WIDTH = 200;
const CARD_GAP = 16; // gap-4

interface HandAreaProps {
  onWarpTriggered?: () => void;
  selectedAllyId?: string | null;
  onAllyBestowed?: () => void;
}

export function HandArea({ onWarpTriggered, selectedAllyId, onAllyBestowed }: HandAreaProps) {
  const handCardIds = useSiphonStore((s) => s.handCardIds);
  const selectedCardIds = useSiphonStore((s) => s.selectedCardIds);
  const bestowToSelf = useSiphonStore((s) => s.bestowToSelf);
  const bestowToAlly = useSiphonStore((s) => s.bestowToAlly);
  const highlightDropTargets = useSettingsStore((s) => s.highlightDropTargets);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [enteringCards, setEnteringCards] = useState<Set<string>>(new Set());
  const prevHandRef = useRef<string[]>([]);
  const [isDragTarget, setIsDragTarget] = useState(false);
  const isCardBeingDragged = useCardDragDetection(() => setIsDragTarget(false));
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Measure container width for overlap calculation
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Synchronous initial read to avoid first-frame layout shift
    setContainerWidth(el.clientWidth);
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Compute hand cards: explicit hand + triggered features in selected
  const handCards = useMemo(() => {
    const triggeredInSelected = selectedCardIds.filter((id) =>
      TRIGGERED_FEATURE_IDS.has(id)
    );
    return [...handCardIds, ...triggeredInSelected];
  }, [handCardIds, selectedCardIds]);

  // Detect newly entering cards for slide-in animation
  useEffect(() => {
    const prevSet = new Set(prevHandRef.current);
    const newIds = handCards.filter((id) => !prevSet.has(id));
    prevHandRef.current = handCards;

    if (newIds.length === 0) return;

    setEnteringCards(new Set(newIds));
    const timeout = setTimeout(() => setEnteringCards(new Set()), 350);
    return () => clearTimeout(timeout);
  }, [handCards]);

  // Overlap logic: do cards fit normally, or do we need to compress?
  const cardCount = handCards.length;
  const normalWidth = cardCount * CARD_WIDTH + (cardCount - 1) * CARD_GAP;
  const needsOverlap = containerWidth > 0 && normalWidth > containerWidth;

  const getMarginLeft = useCallback(
    (index: number) => {
      if (index === 0) return 0;
      if (!needsOverlap) return CARD_GAP;
      // Overlap mode: spread cards evenly across available width
      const overlapOffset = (containerWidth - CARD_WIDTH) / (cardCount - 1);
      return overlapOffset - CARD_WIDTH;
    },
    [needsOverlap, containerWidth, cardCount]
  );

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
    if (data?.source === 'deck') {
      const feature = FEATURE_MAP.get(data.featureId);
      if (!feature) return;
      bestowToSelf(data.featureId);
      // Activation:None auto-activate after bestow
      if (feature.activation === 'None') {
        const result = activateFeature(data.featureId);
        if (result?.warpTriggered) {
          onWarpTriggered?.();
        }
      }
    }
  };

  const handleDoubleClickActivate = (cardId: string) => {
    const feature = FEATURE_MAP.get(cardId);
    if (!feature) return;
    // Varies cost features cannot be activated via double-click
    if (isVariableCost(feature.cost)) return;
    const result = activateFeature(cardId);
    if (result?.warpTriggered) {
      onWarpTriggered?.();
    }
  };

  const showAmbientHighlight = highlightDropTargets && isCardBeingDragged && !isDragTarget;
  const showActiveHighlight = isDragTarget;

  if (handCards.length === 0) {
    return (
      <div
        ref={containerRef}
        className={`flex items-center justify-center h-full min-h-36 rounded-lg transition-all ${
          showActiveHighlight ? 'ring-2 ring-ep-positive/60 ring-inset bg-ep-positive/5' :
          showAmbientHighlight ? 'ring-2 ring-ep-positive/30 ring-inset' : ''
        }`}
        role="list"
        aria-label="Hand (empty)"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-text-muted/30 text-xs italic">
          No cards in hand. Bestow features from the Selected deck.
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex flex-col justify-end h-full min-h-36 pb-2 rounded-lg transition-all ${
        showActiveHighlight ? 'ring-2 ring-ep-positive/60 ring-inset bg-ep-positive/5' :
        showAmbientHighlight ? 'ring-2 ring-ep-positive/30 ring-inset' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {selectedAllyId && (
        <div className="text-[10px] uppercase tracking-widest text-ep-positive mb-1 px-2">
          Click a card to bestow to ally
        </div>
      )}
      <div
        className="flex items-end justify-center"
        role="list"
        aria-label={`Hand: ${handCards.length} cards`}
      >
      {handCards.map((cardId, index) => {
        const feature = FEATURE_MAP.get(cardId);
        if (!feature) return null;

        const isHovered = hoveredCardId === cardId;
        const isUnplayable = !!selectedAllyId && feature.isSpecialCost;
        const isDraggable = !isUnplayable;
        const dragData = { type: 'card' as const, featureId: cardId, source: 'hand' as const };

        return (
          <div
            key={cardId}
            className={`relative transition-all duration-300 ease-out${enteringCards.has(cardId) ? ' card-enter' : ''}`}
            style={{
              marginLeft: index === 0 ? 0 : getMarginLeft(index),
              zIndex: isHovered ? 50 : index,
            }}
            onMouseEnter={() => setHoveredCardId(cardId)}
            onMouseLeave={() => setHoveredCardId(null)}
          >
            <SiphonCard
              feature={feature}
              isRaised={isHovered}
              compact={needsOverlap && !isHovered}
              isUnplayable={isUnplayable}
              onClick={selectedAllyId && !feature.isSpecialCost ? () => {
                bestowToAlly(cardId, selectedAllyId);
                onAllyBestowed?.();
              } : undefined}
              onDoubleClick={selectedAllyId ? undefined : () => handleDoubleClickActivate(cardId)}
              draggable={isDraggable}
              onDragStart={(e) => {
                setCardDragData(e.dataTransfer, dragData);
                setActiveDragData(dragData);
              }}
              onDragEnd={() => {
                setActiveDragData(null);
              }}
            />
            {isUnplayable && (
              <div
                className="absolute inset-0 flex items-end justify-center pb-1 pointer-events-none"
                title="Cannot bestow to allies"
              >
                <span className="text-[9px] text-ep-negative bg-siphon-bg/90 px-1 rounded">
                  Cannot bestow to allies
                </span>
              </div>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}
