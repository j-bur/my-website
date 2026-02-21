import { CharacterHeader } from './CharacterHeader';
import { CollectionGrid } from './CollectionGrid';
import { SelectedPanel } from './SelectedPanel';

export function DeckBuilder() {
  return (
    <div className="flex flex-col h-screen max-w-5xl mx-auto">
      <CharacterHeader />
      <div className="flex-1 overflow-y-auto">
        <CollectionGrid />
      </div>
      <SelectedPanel />
    </div>
  );
}
