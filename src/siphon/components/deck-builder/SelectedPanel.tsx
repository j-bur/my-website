import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FEATURE_MAP } from '../../data/featureConstants';
import { useSiphonStore, useCharacterStore } from '../../store';
import { SiphonCard } from '../cards/SiphonCard';
import { LongRestDialog } from '../combat-hud/LongRestDialog';
import { ShortRestDialog } from '../combat-hud/ShortRestDialog';

export function SelectedPanel() {
  const navigate = useNavigate();
  const [showLongRest, setShowLongRest] = useState(false);
  const [showShortRest, setShowShortRest] = useState(false);

  const selectedCardIds = useSiphonStore((s) => s.selectedCardIds);
  const deselectCard = useSiphonStore((s) => s.deselectCard);
  const proficiencyBonus = useCharacterStore((s) => s.proficiencyBonus);

  const hasSupercapacitance = useMemo(
    () => selectedCardIds.includes('supercapacitance'),
    [selectedCardIds]
  );

  const count = selectedCardIds.length;
  const overflow = count - proficiencyBonus;

  const selectedFeatures = useMemo(
    () =>
      selectedCardIds
        .map((id) => FEATURE_MAP.get(id))
        .filter((f): f is NonNullable<typeof f> => f != null),
    [selectedCardIds]
  );

  return (
    <div
      className="border-t border-siphon-border bg-siphon-surface/50 px-4 py-3"
      role="region"
      aria-label="Selected cards"
    >
      {/* Counter */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-text-secondary">
          Selected ({count}/{proficiencyBonus})
        </span>
        {hasSupercapacitance && overflow > 0 && (
          <span className="text-xs text-capacitance">
            (Supercapacitance +{overflow})
          </span>
        )}
      </div>

      {/* Selected cards (horizontal scroll) */}
      <div className="flex gap-2 overflow-x-auto pb-2 min-h-[9.5rem]">
        {selectedFeatures.length === 0 ? (
          <p className="text-text-muted text-xs italic self-center">
            Click cards above to select features for your deck.
          </p>
        ) : (
          selectedFeatures.map((feature) => (
            <div key={feature.id} className="flex-shrink-0">
              <SiphonCard
                feature={feature}
                compact
                onClick={() => deselectCard(feature.id)}
              />
            </div>
          ))
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 mt-2">
        <button
          className="px-3 py-1.5 text-xs rounded border border-siphon-border text-text-muted hover:border-siphon-accent/50 hover:text-siphon-accent transition-colors"
          onClick={() => setShowShortRest(true)}
        >
          Short Rest
        </button>
        <button
          className="px-3 py-1.5 text-xs rounded border border-siphon-border text-text-muted hover:border-siphon-accent/50 hover:text-siphon-accent transition-colors"
          onClick={() => setShowLongRest(true)}
        >
          Long Rest
        </button>
        <div className="flex-1" />
        <button
          className="px-4 py-1.5 text-sm rounded bg-siphon-accent/20 border border-siphon-accent text-siphon-accent hover:bg-siphon-accent/30 transition-colors font-medium"
          onClick={() => navigate('/combat')}
        >
          Enter Combat
        </button>
      </div>

      {/* Rest Dialogs */}
      {showLongRest && (
        <LongRestDialog onClose={() => setShowLongRest(false)} />
      )}
      {showShortRest && (
        <ShortRestDialog onClose={() => setShowShortRest(false)} />
      )}
    </div>
  );
}
