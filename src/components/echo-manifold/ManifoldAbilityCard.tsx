import { useState } from 'react';
import { useManifoldStore } from '../../store';
import type { ManifoldAbility } from '../../types';

interface ManifoldAbilityCardProps {
  ability: ManifoldAbility;
}

export function ManifoldAbilityCard({ ability }: ManifoldAbilityCardProps) {
  const { motes, spendMotes, activateAbility } = useManifoldStore();
  const [showOverdrive, setShowOverdrive] = useState(false);

  const canAfford = motes >= ability.moteCost;
  const canAffordOverdrive = motes >= ability.moteCost * 2;

  const handleActivate = (isOverdrive: boolean) => {
    const success = spendMotes(ability.moteCost, isOverdrive);
    if (success) {
      // Set expiration based on description (simplified - 1 minute for most)
      const expiresAt = Date.now() + 60 * 1000;
      const requiresConcentration = ability.limitation?.includes('Concentration') || false;
      activateAbility(ability.id, isOverdrive, expiresAt, requiresConcentration);
      setShowOverdrive(false);
    }
  };

  return (
    <div className="bg-siphon-bg rounded-lg p-3 border border-siphon-border">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="text-sm font-medium text-text-primary">{ability.name}</h4>
          <div className="flex gap-2 text-xs text-text-muted">
            <span>{ability.moteCost} Mote{ability.moteCost > 1 ? 's' : ''}</span>
            {ability.activation !== 'None' && (
              <span>• {ability.activation}</span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-text-secondary mb-2">{ability.description}</p>

      {/* Limitation */}
      {ability.limitation && (
        <div className="text-xs text-warp mb-3 p-2 bg-warp/10 rounded">
          <span className="font-medium">Limitation:</span> {ability.limitation}
        </div>
      )}

      {/* Actions */}
      {!showOverdrive ? (
        <div className="flex gap-2">
          <button
            onClick={() => handleActivate(false)}
            disabled={!canAfford}
            className="flex-1 py-1.5 text-xs bg-siphon-accent/20 hover:bg-siphon-accent/30 border border-siphon-accent rounded text-siphon-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Activate ({ability.moteCost})
          </button>
          {ability.overdriveRemovesLimitation && (
            <button
              onClick={() => setShowOverdrive(true)}
              disabled={!canAffordOverdrive}
              className="py-1.5 px-3 text-xs bg-warp/20 hover:bg-warp/30 border border-warp rounded text-warp disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Overdrive removes the limitation"
            >
              ⚡
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-warp text-center">
            Overdrive costs {ability.moteCost * 2} motes but removes the limitation!
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowOverdrive(false)}
              className="flex-1 py-1.5 text-xs bg-siphon-surface hover:bg-siphon-border rounded text-text-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleActivate(true)}
              disabled={!canAffordOverdrive}
              className="flex-1 py-1.5 text-xs bg-warp hover:bg-warp/80 rounded text-siphon-bg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Overdrive ({ability.moteCost * 2})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
