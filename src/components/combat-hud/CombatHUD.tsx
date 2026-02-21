import { EchoManifoldDeck } from './EchoManifoldDeck';
import { WildSurgeDeck } from './WildSurgeDeck';
import { PhaseAbilities } from './PhaseAbilities';
import { ActiveEffectsPanel } from './ActiveEffectsPanel';
import { ResourceDisplay } from './ResourceDisplay';
import { SelectedDeck } from './SelectedDeck';
import { HandArea } from './HandArea';

export function CombatHUD() {
  return (
    <div
      className="grid gap-3 p-4 min-h-screen w-full max-w-5xl mx-auto"
      style={{
        gridTemplateColumns: 'auto 1fr 1fr auto',
        gridTemplateRows: 'auto auto auto 1fr',
        gridTemplateAreas: `
          "manifold  .          .          surge"
          "abilities abilities  effects    resources"
          "allies    allies     allies     allies"
          "deck      hand       hand       hand"
        `,
      }}
    >
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
        <SelectedDeck />
      </div>

      {/* Bottom: Hand */}
      <div style={{ gridArea: 'hand' }}>
        <HandArea />
      </div>
    </div>
  );
}
