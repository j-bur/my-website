import { useState } from 'react';
import type { SurgeResult } from '../../types';
import { SIPHON_FEATURES } from '../../data/siphonFeatures';
import { EchoManifoldDeck } from './EchoManifoldDeck';
import { WildSurgeDeck } from './WildSurgeDeck';
import { PhaseAbilities } from './PhaseAbilities';
import { ActiveEffectsPanel } from './ActiveEffectsPanel';
import { ResourceDisplay } from './ResourceDisplay';
import { SelectedDeck } from './SelectedDeck';
import { HandArea } from './HandArea';
import { ActivationPanel } from './ActivationPanel';
import { SurgeResultModal } from './SurgeResultModal';
import { LongRestDialog } from './LongRestDialog';
import { ShortRestDialog } from './ShortRestDialog';

const featureMap = new Map(SIPHON_FEATURES.map((f) => [f.id, f]));

export function CombatHUD() {
  const [stagedCardId, setStagedCardId] = useState<string | null>(null);
  const [surgeResult, setSurgeResult] = useState<SurgeResult | null>(null);
  const [showLongRest, setShowLongRest] = useState(false);
  const [showShortRest, setShowShortRest] = useState(false);

  const stagedFeature = stagedCardId ? featureMap.get(stagedCardId) ?? null : null;

  const handleActivateCard = (featureId: string) => {
    setStagedCardId(featureId);
  };

  const handleActivationComplete = (surge: SurgeResult | null) => {
    setStagedCardId(null);
    if (surge) {
      setSurgeResult(surge);
    }
  };

  const handleActivationCancel = () => {
    setStagedCardId(null);
  };

  const handleDismissSurge = () => {
    setSurgeResult(null);
  };

  return (
    <div
      className="grid gap-3 p-4 min-h-screen w-full max-w-5xl mx-auto"
      style={{
        gridTemplateColumns: 'auto 1fr 1fr auto',
        gridTemplateRows: 'auto auto auto auto 1fr',
        gridTemplateAreas: `
          "header    header     header     header"
          "manifold  .          .          surge"
          "abilities abilities  effects    resources"
          "allies    allies     allies     allies"
          "deck      hand       hand       hand"
        `,
      }}
    >
      {/* Header: Rest Buttons */}
      <div
        style={{ gridArea: 'header' }}
        className="flex justify-end gap-2"
        role="toolbar"
        aria-label="Rest actions"
      >
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
      </div>

      {/* Top Left: Echo Manifold */}
      <div style={{ gridArea: 'manifold' }}>
        <EchoManifoldDeck />
      </div>

      {/* Top Right: Wild Surge */}
      <div style={{ gridArea: 'surge' }} className="flex justify-end">
        <WildSurgeDeck />
      </div>

      {/* Left: Phase Abilities */}
      <div style={{ gridArea: 'abilities' }} className="flex items-start">
        <PhaseAbilities />
      </div>

      {/* Center: Active Effects */}
      <div style={{ gridArea: 'effects' }}>
        <ActiveEffectsPanel />
      </div>

      {/* Right: Resources */}
      <div style={{ gridArea: 'resources' }} className="w-48">
        <ResourceDisplay />
      </div>

      {/* Allies row (placeholder for Phase 6) */}
      <div
        style={{ gridArea: 'allies' }}
        className="flex items-center gap-2 px-2 py-1 border border-siphon-border/30 rounded-lg bg-siphon-surface/20 min-h-8"
        role="region"
        aria-label="Allies"
      >
        <span className="text-[10px] uppercase tracking-widest text-text-muted">
          Allies:
        </span>
        <span className="text-text-muted/40 text-xs italic">
          (Phase 6)
        </span>
      </div>

      {/* Bottom Left: Selected Deck */}
      <div style={{ gridArea: 'deck' }} className="flex items-end">
        <SelectedDeck onActivateCard={handleActivateCard} />
      </div>

      {/* Bottom: Hand */}
      <div style={{ gridArea: 'hand' }}>
        <HandArea onActivateCard={handleActivateCard} />
      </div>

      {/* Activation Panel overlay */}
      {stagedFeature && (
        <ActivationPanel
          feature={stagedFeature}
          onComplete={handleActivationComplete}
          onCancel={handleActivationCancel}
        />
      )}

      {/* Surge Result Modal (shown after activation with warp, when autoSurge is off) */}
      {surgeResult && (
        <SurgeResultModal
          result={surgeResult}
          onDismiss={handleDismissSurge}
        />
      )}

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
