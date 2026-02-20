import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore, useSiphonStore } from '../../store';
import { SIPHON_FEATURES } from '../../data';
import { SiphonCard } from '../cards/SiphonCard';
import { CharacterSetup } from './CharacterSetup';
import { FilterControls, type FilterState } from './FilterControls';
import { SelectionSummary } from './SelectionSummary';

export function DeckBuilder() {
  const navigate = useNavigate();
  const { level, proficiencyBonus, name } = useCharacterStore();
  const { selectedCardIds, selectCard, deselectCard, isCardSelected } = useSiphonStore();

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    activationType: 'all',
    costRange: 'all',
    showSpecialOnly: false,
  });

  const maxCards = proficiencyBonus;

  // Filter features
  const filteredFeatures = SIPHON_FEATURES.filter(feature => {
    // Search filter
    if (filters.search && !feature.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Activation type filter
    if (filters.activationType !== 'all' && feature.activation !== filters.activationType) {
      return false;
    }

    // Special cost filter
    if (filters.showSpecialOnly && !feature.isSpecialCost) {
      return false;
    }

    return true;
  });

  const handleCardClick = (featureId: string) => {
    if (isCardSelected(featureId)) {
      deselectCard(featureId);
    } else {
      selectCard(featureId, maxCards);
    }
  };

  const handleConfirm = () => {
    navigate('/combat');
  };

  return (
    <div className="min-h-screen bg-siphon-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-siphon-surface border-b border-siphon-border p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light text-text-primary">Deck Builder</h1>
            <p className="text-sm text-text-secondary">{name} • Level {level}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-siphon-accent font-medium">
              {selectedCardIds.length} / {maxCards} Selected
            </span>
            <button
              onClick={handleConfirm}
              disabled={selectedCardIds.length === 0}
              className="px-6 py-2 bg-siphon-accent text-siphon-bg rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-siphon-accent-dim transition-colors"
            >
              Enter Combat
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <CharacterSetup />
          <FilterControls filters={filters} onChange={setFilters} />
          <SelectionSummary onConfirm={handleConfirm} />
        </aside>

        {/* Card Gallery */}
        <main className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredFeatures.map(feature => (
              <SiphonCard
                key={feature.id}
                feature={feature}
                isSelected={isCardSelected(feature.id)}
                isDisabled={!isCardSelected(feature.id) && selectedCardIds.length >= maxCards}
                onClick={() => handleCardClick(feature.id)}
              />
            ))}
          </div>

          {filteredFeatures.length === 0 && (
            <div className="text-center py-12 text-text-muted">
              No features match your filters.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
