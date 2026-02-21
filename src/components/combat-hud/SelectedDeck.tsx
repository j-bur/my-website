import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSiphonStore } from '../../store';
import { SIPHON_FEATURES } from '../../data/siphonFeatures';
import { SiphonCard } from '../cards/SiphonCard';

const TRIGGERED_FEATURE_IDS = new Set(
  SIPHON_FEATURES.filter((f) => f.duration === 'Triggered').map((f) => f.id)
);

const featureMap = new Map(SIPHON_FEATURES.map((f) => [f.id, f]));

export function SelectedDeck() {
  const [isExpanded, setIsExpanded] = useState(false);
  const selectedCardIds = useSiphonStore((s) => s.selectedCardIds);
  const handCardIds = useSiphonStore((s) => s.handCardIds);
  const bestowToSelf = useSiphonStore((s) => s.bestowToSelf);
  const panelRef = useRef<HTMLDivElement>(null);

  // Compute deck cards: selected minus hand minus triggered
  const deckCards = useMemo(() => {
    const handSet = new Set(handCardIds);
    return selectedCardIds.filter(
      (id) => !handSet.has(id) && !TRIGGERED_FEATURE_IDS.has(id)
    );
  }, [selectedCardIds, handCardIds]);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    },
    [isExpanded]
  );

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (isExpanded && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    },
    [isExpanded]
  );

  useEffect(() => {
    if (isExpanded) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, handleEscape, handleClickOutside]);

  const handleBestow = (featureId: string) => {
    bestowToSelf(featureId);
    // If no more deck cards after bestow, collapse
    if (deckCards.length <= 1) {
      setIsExpanded(false);
    }
  };

  return (
    <div ref={panelRef} className="relative flex flex-col items-start">
      {/* Expanded card fan (above the deck) */}
      {isExpanded && deckCards.length > 0 && (
        <div
          className="flex gap-2 flex-wrap mb-2 p-2 border border-siphon-border/50 rounded-lg bg-siphon-bg/80 backdrop-blur-sm"
          role="list"
          aria-label="Selected deck cards"
        >
          {deckCards.map((cardId) => {
            const feature = featureMap.get(cardId);
            if (!feature) return null;
            return (
              <SiphonCard
                key={cardId}
                feature={feature}
                compact
                onClick={() => handleBestow(cardId)}
              />
            );
          })}
        </div>
      )}

      {/* Deck icon */}
      <button
        className={`
          w-28 h-36 border-2 rounded-lg flex flex-col items-center justify-center gap-1
          transition-all cursor-pointer
          ${isExpanded
            ? 'border-siphon-accent bg-siphon-accent/10'
            : 'border-siphon-border bg-card-bg hover:border-siphon-accent/60'
          }
        `}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={`Selected deck: ${deckCards.length} cards${isExpanded ? ' (expanded)' : ''}`}
        aria-expanded={isExpanded}
      >
        <div className="text-[10px] uppercase tracking-widest text-text-muted">
          Selected
        </div>
        <div className="text-sm font-bold text-text-primary">
          Deck
        </div>
        <div className="text-lg font-bold tabular-nums text-siphon-accent">
          {deckCards.length}
        </div>
      </button>
    </div>
  );
}
