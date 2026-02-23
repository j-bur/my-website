import { useState } from 'react';
import { CharacterHeader } from './CharacterHeader';
import { CollectionGrid } from './CollectionGrid';
import { SelectedPanel } from './SelectedPanel';
import { SettingsModal } from '../settings';

export function DeckBuilder() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="flex flex-col h-screen max-w-5xl mx-auto">
      <div className="relative">
        <CharacterHeader />
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1.5 text-sm rounded border border-siphon-border text-text-muted hover:border-siphon-accent/50 hover:text-siphon-accent transition-colors"
          onClick={() => setShowSettings(true)}
          aria-label="Settings"
        >
          &#x2699;
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <CollectionGrid />
      </div>
      <SelectedPanel />

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
