import { useState, useMemo, useRef, useEffect } from 'react';
import { useSiphonStore, useSettingsStore } from '../../store';
import { TRIGGERED_FEATURE_IDS, FEATURE_MAP } from '../../data/featureConstants';
import { setCardDragData, getCardDragData, isCardDrag } from '../../types/dragData';
import { SiphonCard } from '../cards/SiphonCard';

interface HandAreaProps {
  onActivateCard?: (featureId: string) => void;
  selectedAllyId?: string | null;
  onAllyBestowed?: () => void;
}

export function HandArea({ onActivateCard, selectedAllyId, onAllyBestowed }: HandAreaProps) {
  const handCardIds = useSiphonStore((s) => s.handCardIds);
  const selectedCardIds = useSiphonStore((s) => s.selectedCardIds);
  const bestowToSelf = useSiphonStore((s) => s.bestowToSelf);
  const bestowToAlly = useSiphonStore((s) => s.bestowToAlly);
  const highlightDropTargets = useSettingsStore((s) => s.highlightDropTargets);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [enteringCards, setEnteringCards] = useState<Set<string>>(new Set());
  const prevHandRef = useRef<string[]>([]);
  const [isCardBeingDragged, setIsCardBeingDragged] = useState(false);
  const [isDragTarget, setIsDragTarget] = useState(false);

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

  // Global drag listeners for drop zone highlighting
  useEffect(() => {
    const handleGlobalDragStart = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes('text/x-card-type')) {
        setIsCardBeingDragged(true);
      }
    };
    const handleGlobalDragEnd = () => {
      setIsCardBeingDragged(false);
      setIsDragTarget(false);
    };
    window.addEventListener('dragstart', handleGlobalDragStart);
    window.addEventListener('dragend', handleGlobalDragEnd);
    return () => {
      window.removeEventListener('dragstart', handleGlobalDragStart);
      window.removeEventListener('dragend', handleGlobalDragEnd);
    };
  }, []);

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
        onActivateCard?.(data.featureId);
      }
    }
  };

  const showAmbientHighlight = highlightDropTargets && isCardBeingDragged && !isDragTarget;
  const showActiveHighlight = isDragTarget;

  if (handCards.length === 0) {
    return (
      <div
        className={`flex items-end h-full min-h-36 rounded-lg transition-all ${
          showActiveHighlight ? 'ring-2 ring-ep-positive/60 ring-inset bg-ep-positive/5' :
          showAmbientHighlight ? 'ring-2 ring-ep-positive/30 ring-inset' : ''
        }`}
        role="list"
        aria-label="Hand (empty)"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-text-muted/30 text-xs italic px-4 pb-4">
          No cards in hand. Bestow features from the Selected deck.
        </div>
      </div>
    );
  }

  // Overlap calculation: compress when hand is large
  const isLargeHand = handCards.length > 7;
  const overlapPx = isLargeHand ? -80 : -20;

  return (
    <div
      className={`flex flex-col justify-end h-full min-h-36 px-2 pb-2 rounded-lg transition-all ${
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
        className="flex items-end"
        role="list"
        aria-label={`Hand: ${handCards.length} cards`}
      >
      {handCards.map((cardId, index) => {
        const feature = FEATURE_MAP.get(cardId);
        if (!feature) return null;

        const isHovered = hoveredCardId === cardId;
        const isUnplayable = !!selectedAllyId && feature.isSpecialCost;
        const isDraggable = !isUnplayable;

        return (
          <div
            key={cardId}
            className={`relative transition-all duration-300 ease-out${enteringCards.has(cardId) ? ' card-enter' : ''}`}
            style={{
              marginLeft: index === 0 ? 0 : overlapPx,
              zIndex: isHovered ? 50 : index,
            }}
            onMouseEnter={() => setHoveredCardId(cardId)}
            onMouseLeave={() => setHoveredCardId(null)}
          >
            <SiphonCard
              feature={feature}
              isRaised={isHovered}
              compact={isLargeHand && !isHovered}
              isUnplayable={isUnplayable}
              onClick={selectedAllyId && !feature.isSpecialCost ? () => {
                bestowToAlly(cardId, selectedAllyId);
                onAllyBestowed?.();
              } : undefined}
              onDoubleClick={selectedAllyId ? undefined : () => onActivateCard?.(cardId)}
              draggable={isDraggable}
              onDragStart={(e) => {
                setCardDragData(e.dataTransfer, {
                  type: 'card',
                  featureId: cardId,
                  source: 'hand',
                });
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
