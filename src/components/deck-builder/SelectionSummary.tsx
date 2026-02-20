import { useSiphonStore, useCharacterStore } from '../../store';
import { getFeatureById } from '../../data';

interface SelectionSummaryProps {
  onConfirm: () => void;
}

export function SelectionSummary({ onConfirm }: SelectionSummaryProps) {
  const { selectedCardIds, deselectCard, clearSelection } = useSiphonStore();
  const { proficiencyBonus } = useCharacterStore();

  const selectedFeatures = selectedCardIds
    .map(id => getFeatureById(id))
    .filter(Boolean);

  return (
    <div className="bg-siphon-surface border border-siphon-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-text-primary">
          Selected ({selectedCardIds.length}/{proficiencyBonus})
        </h2>
        {selectedCardIds.length > 0 && (
          <button
            onClick={clearSelection}
            className="text-xs text-text-muted hover:text-ep-negative transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {selectedFeatures.length === 0 ? (
        <p className="text-sm text-text-muted py-4 text-center">
          Select cards from the gallery
        </p>
      ) : (
        <ul className="space-y-2">
          {selectedFeatures.map(feature => feature && (
            <li
              key={feature.id}
              className="flex items-center justify-between py-2 px-3 bg-siphon-bg rounded group"
            >
              <span className="text-sm text-text-primary truncate">
                {feature.name}
              </span>
              <button
                onClick={() => deselectCard(feature.id)}
                className="text-text-muted hover:text-ep-negative opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={onConfirm}
        disabled={selectedCardIds.length === 0}
        className="w-full mt-4 py-3 bg-siphon-accent text-siphon-bg rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-siphon-accent-dim transition-colors"
      >
        Enter Combat Mode
      </button>
    </div>
  );
}
