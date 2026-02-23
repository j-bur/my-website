import { useState, useMemo } from 'react';
import { SIPHON_FEATURES } from '../../data/siphonFeatures';
import { useSiphonStore } from '../../store';
import { useCharacterStore } from '../../store';
import { SiphonCard } from '../cards/SiphonCard';

const ALL_TAGS = Array.from(
  new Set(SIPHON_FEATURES.flatMap((f) => f.tags))
).sort();

export function CollectionGrid() {
  const [selectedTag, setSelectedTag] = useState('All');
  const [searchText, setSearchText] = useState('');

  const selectedCardIds = useSiphonStore((s) => s.selectedCardIds);
  const selectCard = useSiphonStore((s) => s.selectCard);
  const deselectCard = useSiphonStore((s) => s.deselectCard);
  const isCardSelected = useSiphonStore((s) => s.isCardSelected);
  const proficiencyBonus = useCharacterStore((s) => s.proficiencyBonus);

  const selectedSet = useMemo(() => new Set(selectedCardIds), [selectedCardIds]);
  const hasSupercapacitance = useMemo(
    () => selectedCardIds.includes('supercapacitance'),
    [selectedCardIds]
  );

  const filteredFeatures = useMemo(() => {
    let features = SIPHON_FEATURES;

    if (selectedTag !== 'All') {
      features = features.filter((f) => f.tags.includes(selectedTag));
    }

    if (searchText.trim()) {
      const search = searchText.trim().toLowerCase();
      features = features.filter((f) =>
        f.name.toLowerCase().includes(search)
      );
    }

    return features;
  }, [selectedTag, searchText]);

  const toggleSelect = (cardId: string) => {
    if (isCardSelected(cardId)) {
      deselectCard(cardId);
    } else {
      const maxCards = hasSupercapacitance ? 42 : proficiencyBonus;
      selectCard(cardId, maxCards);
    }
  };

  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          Filter:
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-2 py-1 text-sm bg-siphon-bg border border-siphon-border rounded text-text-primary focus:outline-none focus:border-siphon-accent"
            aria-label="Filter by tag"
          >
            <option value="All">All</option>
            {ALL_TAGS.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm text-text-secondary">
          Search:
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by name..."
            className="px-2 py-1 text-sm bg-siphon-bg border border-siphon-border rounded text-text-primary placeholder:text-text-muted focus:outline-none focus:border-siphon-accent"
            aria-label="Search by name"
          />
        </label>
      </div>

      {/* Grid */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))' }}
        role="grid"
        aria-label="Feature collection"
      >
        {filteredFeatures.map((feature) => (
          <div
            key={feature.id}
            className={
              selectedSet.has(feature.id)
                ? 'ring-2 ring-ep-positive rounded-lg'
                : ''
            }
          >
            <SiphonCard
              feature={feature}
              onClick={() => toggleSelect(feature.id)}
            />
          </div>
        ))}
      </div>

      {filteredFeatures.length === 0 && (
        <p className="text-text-muted text-sm text-center py-4">
          No features match your filters.
        </p>
      )}
    </div>
  );
}
