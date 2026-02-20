import { useState } from 'react';
import { useSiphonStore, useCharacterStore } from '../../store';
import { SIPHON_FEATURES } from '../../data';
import { SiphonCard } from '../cards/SiphonCard';
import { resolveCost, rollFromNotation, calculateFocusGain } from '../../utils';

interface ActiveCardHandProps {
  onSurgeTriggered: () => void;
}

export function ActiveCardHand({ onSurgeTriggered }: ActiveCardHandProps) {
  const { selectedCardIds, currentEP, spendEP, addFocus, bestowFeature, bestowedFeatures, removeBestowed } = useSiphonStore();
  const { level, proficiencyBonus } = useCharacterStore();
  const [lastRoll, setLastRoll] = useState<{ featureName: string; rolls: number[]; total: number; doubled: boolean } | null>(null);

  const selectedFeatures = SIPHON_FEATURES.filter(f => selectedCardIds.includes(f.id));
  const isNegativeEP = currentEP < 0;

  const handleActivate = (featureId: string) => {
    const feature = SIPHON_FEATURES.find(f => f.id === featureId);
    if (!feature) return;

    // Calculate and spend EP cost
    const cost = resolveCost(feature.cost, { pb: proficiencyBonus, level });
    spendEP(cost, level);

    // Roll focus dice
    const focusContext = { pb: proficiencyBonus, level, cost };
    const rollResult = rollFromNotation(feature.focusDice, focusContext);

    // Calculate actual focus gain (doubled if negative EP)
    const isNowNegative = currentEP - cost < 0;
    const focusGainResult = calculateFocusGain(rollResult, isNowNegative);
    addFocus(focusGainResult.baseRoll);  // addFocus handles doubling internally

    // Store last roll for display
    setLastRoll({
      featureName: feature.name,
      rolls: rollResult.rolls,
      total: rollResult.total,
      doubled: isNowNegative
    });

    // Check if warp effect triggers (activating while negative EP)
    if (isNegativeEP && feature.warpEffect) {
      onSurgeTriggered();
    }
  };

  const handleBestow = (featureId: string) => {
    const feature = SIPHON_FEATURES.find(f => f.id === featureId);
    if (!feature || feature.isSpecialCost) return;

    // Calculate and spend EP cost
    const cost = resolveCost(feature.cost, { pb: proficiencyBonus, level });
    spendEP(cost, level);

    // Bestow doesn't add focus to the Siphon Wielder
    // Use 'ally' as a placeholder target, and 10 minutes (default duration) for expiration
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    bestowFeature(featureId, 'ally', expiresAt);
  };

  const isBestowed = (featureId: string) => bestowedFeatures.some(bf => bf.featureId === featureId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-text-primary">Active Cards</h3>
        <span className="text-sm text-text-secondary">
          {selectedFeatures.length} selected
        </span>
      </div>

      {/* Last roll display */}
      {lastRoll && (
        <div className={`p-3 rounded-lg border ${
          lastRoll.doubled
            ? 'bg-ep-negative/10 border-ep-negative'
            : 'bg-siphon-surface border-siphon-border'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">{lastRoll.featureName}</span>
            {lastRoll.doubled && (
              <span className="text-xs text-ep-negative font-medium">DOUBLED</span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-text-muted">Rolled:</span>
            <span className="font-mono text-text-primary">
              [{lastRoll.rolls.join(', ')}]
            </span>
            <span className="text-text-muted">=</span>
            <span className={`font-bold ${lastRoll.doubled ? 'text-ep-negative' : 'text-focus'}`}>
              {lastRoll.doubled ? lastRoll.total * 2 : lastRoll.total} Focus
            </span>
          </div>
        </div>
      )}

      {/* Card hand */}
      {selectedFeatures.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedFeatures.map(feature => (
            <SiphonCard
              key={feature.id}
              feature={feature}
              isSelected={false}
              showActions={true}
              onActivate={() => handleActivate(feature.id)}
              onBestow={!feature.isSpecialCost && !isBestowed(feature.id) ? () => handleBestow(feature.id) : undefined}
              isWarpActive={isNegativeEP}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-text-muted border border-dashed border-siphon-border rounded-lg">
          No cards selected. Visit the Deck Builder to select your Siphon Features.
        </div>
      )}

      {/* Bestowed features tracker */}
      {bestowedFeatures.length > 0 && (
        <div className="mt-4 p-3 bg-siphon-bg rounded-lg">
          <h4 className="text-sm font-medium text-text-secondary mb-2">Bestowed to Allies</h4>
          <div className="flex flex-wrap gap-2">
            {bestowedFeatures.map(bf => {
              const feature = SIPHON_FEATURES.find(f => f.id === bf.featureId);
              return feature ? (
                <span
                  key={bf.id}
                  className="px-2 py-1 bg-siphon-surface rounded text-xs text-text-primary flex items-center gap-2"
                >
                  {feature.name}
                  <button
                    onClick={() => removeBestowed(bf.id)}
                    className="text-text-muted hover:text-text-secondary"
                  >
                    ×
                  </button>
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
