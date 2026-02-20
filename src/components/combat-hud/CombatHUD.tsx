import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore, useSiphonStore } from '../../store';
import { EchoPointsBar } from './EchoPointsBar';
import { FocusCounter } from './FocusCounter';
import { SiphonCapacitanceTracker } from './SiphonCapacitanceTracker';
import { ActiveCardHand } from './ActiveCardHand';
import { SurgeTableModal } from './SurgeTableModal';
import { EchoManifold } from '../echo-manifold';

export function CombatHUD() {
  const navigate = useNavigate();
  const { name, level } = useCharacterStore();
  const { currentEP } = useSiphonStore();

  const [showSurgeModal, setShowSurgeModal] = useState(false);
  const [showManifold, setShowManifold] = useState(false);

  const isNegativeEP = currentEP < 0;

  return (
    <div className={`min-h-screen bg-siphon-bg ${isNegativeEP ? 'chromatic-aberration' : ''}`}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-siphon-surface border-b border-siphon-border p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium text-text-primary">{name}</h1>
            <p className="text-sm text-text-secondary">Level {level} Siphon Wielder</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSurgeModal(true)}
              className="px-4 py-2 bg-warp/20 hover:bg-warp/30 border border-warp rounded text-warp text-sm transition-colors"
            >
              Wild Surge
            </button>
            <button
              onClick={() => setShowManifold(!showManifold)}
              className="px-4 py-2 bg-siphon-bg hover:bg-siphon-border border border-siphon-border rounded text-text-secondary text-sm transition-colors"
            >
              Echo Manifold
            </button>
            <button
              onClick={() => navigate('/deck-builder')}
              className="px-4 py-2 bg-siphon-bg hover:bg-siphon-border border border-siphon-border rounded text-text-secondary text-sm transition-colors"
            >
              Edit Deck
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Resources */}
          <aside className="space-y-4">
            <EchoPointsBar />
            <FocusCounter />
            <SiphonCapacitanceTracker />
          </aside>

          {/* Main Content - Cards */}
          <main className="lg:col-span-2">
            <ActiveCardHand onSurgeTriggered={() => setShowSurgeModal(true)} />
          </main>
        </div>

        {/* Echo Manifold Panel (collapsible) */}
        <EchoManifold isOpen={showManifold} onClose={() => setShowManifold(false)} />
      </div>

      {/* Surge Modal */}
      <SurgeTableModal
        isOpen={showSurgeModal}
        onClose={() => setShowSurgeModal(false)}
      />

      {/* Negative EP Warning Overlay */}
      {isNegativeEP && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 p-3 bg-ep-negative/90 border border-ep-negative rounded-lg text-white text-sm z-30">
          <strong>Negative Echo Points</strong>
          <p className="mt-1 text-white/80">
            Focus dice doubled. Warp effects active. Approach Echo Drain at -{level} EP.
          </p>
        </div>
      )}
    </div>
  );
}
