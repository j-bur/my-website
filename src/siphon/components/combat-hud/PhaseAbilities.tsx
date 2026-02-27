import { useState, useRef, useCallback } from 'react';
import { useManifoldStore } from '../../store';
import { getAbilitiesByPhase } from '../../data/echoManifold';
import type { ManifoldAbility } from '../../types';

const ACTIVATION_ABBREV: Record<string, string> = {
  'Action': 'A',
  'Bonus Action': 'BA',
  'Reaction': 'R',
  'None': '—',
};

const COLLAPSE_DELAY_MS = 150;

interface AbilityBarProps {
  ability: ManifoldAbility;
  isExpanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function AbilityBar({ ability, isExpanded, onMouseEnter, onMouseLeave }: AbilityBarProps) {
  return (
    <div
      className="border border-siphon-border/50 rounded bg-card-bg/50 overflow-hidden"
      role="listitem"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Compact header — always visible */}
      <div className="flex items-center justify-between px-3 py-2.5 min-h-[50px]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs text-siphon-accent font-medium shrink-0">
            {ability.moteCost}m
          </span>
          <span className="text-xs font-medium text-text-secondary truncate">
            {ability.name}
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-text-muted bg-siphon-surface/30 px-1.5 py-0.5 rounded shrink-0 ml-2">
          {ACTIVATION_ABBREV[ability.activation] ?? ability.activation}
        </span>
      </div>

      {/* Expandable detail section */}
      <div
        className="transition-[max-height] duration-200 ease-in-out"
        style={{ maxHeight: isExpanded ? '200px' : '0px' }}
        data-testid={`ability-detail-${ability.id}`}
      >
        <div className="px-3 pb-2.5 flex flex-col gap-1">
          <p className="text-[11px] text-text-secondary leading-snug">
            {ability.description}
          </p>
          {ability.limitation && (
            <p className="text-[11px] text-text-secondary leading-snug italic">
              <span className="text-ep-negative not-italic font-medium">Limit</span>{' '}
              {ability.limitation}
            </p>
          )}
          {ability.overdriveRemovesLimitation && (
            <p className="text-[11px] text-warp leading-snug">
              Overdrive removes limitation
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function PhaseAbilities() {
  const currentPhase = useManifoldStore((s) => s.currentPhase);
  const abilities = getAbilitiesByPhase(currentPhase);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleMouseEnter = useCallback((id: string) => {
    clearTimeout(collapseTimerRef.current);
    setExpandedId(id);
  }, []);

  const handleMouseLeave = useCallback(() => {
    collapseTimerRef.current = setTimeout(() => setExpandedId(null), COLLAPSE_DELAY_MS);
  }, []);

  return (
    <div className="flex flex-col gap-1.5" role="list" aria-label="Phase abilities">
      {abilities.map((ability) => (
        <AbilityBar
          key={ability.id}
          ability={ability}
          isExpanded={expandedId === ability.id}
          onMouseEnter={() => handleMouseEnter(ability.id)}
          onMouseLeave={handleMouseLeave}
        />
      ))}
    </div>
  );
}
