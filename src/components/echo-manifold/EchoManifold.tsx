import { useManifoldStore } from '../../store';
import { getAbilitiesByPhase, getAbilityById } from '../../data/echoManifold';
import { PhaseSelector } from './PhaseSelector';
import { MoteTracker } from './MoteTracker';
import { ManifoldAbilityCard } from './ManifoldAbilityCard';

interface EchoManifoldProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EchoManifold({ isOpen, onClose }: EchoManifoldProps) {
  const { currentPhase, activeAbilities, deactivateAbility } = useManifoldStore();

  const phaseAbilities = getAbilitiesByPhase(currentPhase);

  if (!isOpen) return null;

  return (
    <div className="mt-6 bg-siphon-surface border border-siphon-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-siphon-border">
        <h2 className="text-lg font-medium text-text-primary">Echo Manifold</h2>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-secondary"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Phase & Motes */}
          <div className="space-y-4">
            <PhaseSelector />
            <MoteTracker />
          </div>

          {/* Middle: Phase Abilities */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-medium text-text-secondary">
              {currentPhase} Abilities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {phaseAbilities.map(ability => (
                <ManifoldAbilityCard key={ability.id} ability={ability} />
              ))}
            </div>
          </div>
        </div>

        {/* Active Abilities */}
        {activeAbilities.length > 0 && (
          <div className="mt-6 pt-4 border-t border-siphon-border">
            <h3 className="text-sm font-medium text-text-secondary mb-3">Active Manifold Abilities</h3>
            <div className="flex flex-wrap gap-2">
              {activeAbilities.map(active => {
                const ability = getAbilityById(active.abilityId);
                if (!ability) return null;

                return (
                  <div
                    key={active.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm ${
                      active.isOverdriven
                        ? 'bg-warp/20 border border-warp text-warp'
                        : 'bg-siphon-accent/20 border border-siphon-accent text-siphon-accent'
                    }`}
                  >
                    <span>{ability.name}</span>
                    {active.isOverdriven && <span className="text-xs">⚡</span>}
                    {active.requiresConcentration && <span className="text-xs opacity-70">(C)</span>}
                    <button
                      onClick={() => deactivateAbility(active.id)}
                      className="opacity-50 hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
