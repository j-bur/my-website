import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSiphonStore } from '../../store';
import { EchoManifoldDeck } from './EchoManifoldDeck';
import { WildSurgeDeck } from './WildSurgeDeck';
import { PhaseAbilities } from './PhaseAbilities';
import { ActiveEffectsPanel } from './ActiveEffectsPanel';
import { ResourceDisplay } from './ResourceDisplay';
import { SelectedDeck } from './SelectedDeck';
import { HandArea } from './HandArea';
import { LongRestDialog } from './LongRestDialog';
import { ShortRestDialog } from './ShortRestDialog';
import { AlliesPanel } from './AlliesPanel';
import { AllyBestowmentView } from './AllyBestowmentView';
import { Grimoire } from './Grimoire';

const WARP_PULSE_DURATION = 3000;

export function CombatHUD() {
  const [showLongRest, setShowLongRest] = useState(false);
  const [showShortRest, setShowShortRest] = useState(false);
  const [selectedAllyId, setSelectedAllyId] = useState<string | null>(null);
  const [hoveredAllyId, setHoveredAllyId] = useState<string | null>(null);
  const [warpPulse, setWarpPulse] = useState(false);

  const allies = useSiphonStore((s) => s.allies);
  const hoveredAlly = useMemo(
    () => (hoveredAllyId ? allies.find((a) => a.id === hoveredAllyId) ?? null : null),
    [hoveredAllyId, allies]
  );

  const handleWarpTriggered = useCallback(() => {
    setWarpPulse(true);
  }, []);

  // Auto-clear warp pulse after duration
  useEffect(() => {
    if (!warpPulse) return;
    const timer = setTimeout(() => setWarpPulse(false), WARP_PULSE_DURATION);
    return () => clearTimeout(timer);
  }, [warpPulse]);

  return (
    <div
      className="grid gap-4 p-4 min-h-screen w-full"
      style={{
        gridTemplateColumns: '260px 1fr 260px',
        gridTemplateRows: '1fr auto auto',
        gridTemplateAreas: `
          "left    effects  right"
          "left    allies   right"
          "deck    hand     right"
        `,
      }}
    >
      {/* Left Sidebar: Echo Manifold + Phase Abilities */}
      <div
        style={{ gridArea: 'left' }}
        className="flex flex-col gap-4 min-h-0"
      >
        <EchoManifoldDeck />
        <PhaseAbilities />
      </div>

      {/* Bottom Left: Selected Deck (aligned with hand row) */}
      <div style={{ gridArea: 'deck' }} className="flex items-end">
        <SelectedDeck
          onWarpTriggered={handleWarpTriggered}
          selectedAllyId={selectedAllyId}
          onAllyBestowed={() => setSelectedAllyId(null)}
        />
      </div>

      {/* Center: Active Effects */}
      <div style={{ gridArea: 'effects' }} className="min-h-0">
        <ActiveEffectsPanel onWarpTriggered={handleWarpTriggered} />
      </div>

      {/* Allies row */}
      <div style={{ gridArea: 'allies' }}>
        <AlliesPanel
          selectedAllyId={selectedAllyId}
          onSelectAlly={setSelectedAllyId}
          onHoverAlly={setHoveredAllyId}
        />
      </div>

      {/* Center bottom: Hand */}
      <div style={{ gridArea: 'hand' }}>
        <HandArea
          onWarpTriggered={handleWarpTriggered}
          selectedAllyId={selectedAllyId}
          onAllyBestowed={() => setSelectedAllyId(null)}
        />
      </div>

      {/* Right Sidebar: Resources + Wild Surge + Rest Buttons */}
      <div
        style={{ gridArea: 'right' }}
        className="flex flex-col gap-4 min-h-0"
      >
        <ResourceDisplay />
        <WildSurgeDeck warpPulse={warpPulse} />
        <div className="flex flex-col gap-2">
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
        <Grimoire />
      </div>

      {/* Rest Dialogs */}
      {showLongRest && (
        <LongRestDialog onClose={() => setShowLongRest(false)} />
      )}
      {showShortRest && (
        <ShortRestDialog onClose={() => setShowShortRest(false)} />
      )}

      {/* Ally Bestowment View overlay */}
      {hoveredAlly && (
        <AllyBestowmentView
          allyId={hoveredAlly.id}
          allyName={hoveredAlly.name}
          onDismiss={() => setHoveredAllyId(null)}
        />
      )}
    </div>
  );
}
