import { useState, useMemo } from 'react';
import { useSiphonStore } from '../../store';
import { SIPHON_FEATURES } from '../../data/siphonFeatures';
import { SiphonCard } from '../cards/SiphonCard';

const TRIGGERED_FEATURE_IDS = new Set(
  SIPHON_FEATURES.filter((f) => f.duration === 'Triggered').map((f) => f.id)
);

const featureMap = new Map(SIPHON_FEATURES.map((f) => [f.id, f]));

interface HandAreaProps {
  onActivateCard?: (featureId: string) => void;
  selectedAllyId?: string | null;
  onAllyBestowed?: () => void;
}

export function HandArea({ onActivateCard, selectedAllyId, onAllyBestowed }: HandAreaProps) {
  const handCardIds = useSiphonStore((s) => s.handCardIds);
  const selectedCardIds = useSiphonStore((s) => s.selectedCardIds);
  const bestowToAlly = useSiphonStore((s) => s.bestowToAlly);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  // Compute hand cards: explicit hand + triggered features in selected
  const handCards = useMemo(() => {
    const triggeredInSelected = selectedCardIds.filter((id) =>
      TRIGGERED_FEATURE_IDS.has(id)
    );
    return [...handCardIds, ...triggeredInSelected];
  }, [handCardIds, selectedCardIds]);

  if (handCards.length === 0) {
    return (
      <div
        className="flex items-end h-full min-h-36"
        role="list"
        aria-label="Hand (empty)"
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
      className="flex flex-col justify-end h-full min-h-36 px-2 pb-2"
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
        const feature = featureMap.get(cardId);
        if (!feature) return null;

        const isHovered = hoveredCardId === cardId;

        return (
          <div
            key={cardId}
            className="transition-all duration-200"
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
              onClick={selectedAllyId && !feature.isSpecialCost ? () => {
                bestowToAlly(cardId, selectedAllyId);
                onAllyBestowed?.();
              } : undefined}
              onDoubleClick={selectedAllyId ? undefined : () => onActivateCard?.(cardId)}
            />
          </div>
        );
      })}
      </div>
    </div>
  );
}
