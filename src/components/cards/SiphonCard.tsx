import type { SiphonFeature } from '../../types';
import { formatCost, isVariableCost } from '../../utils';
import { useCharacterStore } from '../../store';

interface SiphonCardProps {
  feature: SiphonFeature;
  isSelected?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  showActions?: boolean;
  onActivate?: () => void;
  onBestow?: () => void;
  isWarpActive?: boolean;
}

export function SiphonCard({
  feature,
  isSelected = false,
  isDisabled = false,
  onClick,
  showActions = false,
  onActivate,
  onBestow,
  isWarpActive = false
}: SiphonCardProps) {
  const { level, proficiencyBonus } = useCharacterStore();

  const costContext = { pb: proficiencyBonus, level };

  return (
    <div
      onClick={onClick}
      className={`
        relative p-4 rounded-lg border-2 transition-all duration-200
        ${isSelected
          ? 'border-card-selected bg-siphon-surface shadow-[0_0_10px_rgba(0,212,170,0.3)]'
          : 'border-card-border bg-card-bg hover:border-siphon-accent-dim'}
        ${isDisabled && !isSelected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isWarpActive ? 'warp-active' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-medium text-text-primary leading-tight">
          {feature.name}
        </h3>
        {feature.isSpecialCost && (
          <span className="text-xs text-warp ml-2 shrink-0">*</span>
        )}
      </div>

      {/* Stats Row */}
      <div className="flex flex-wrap gap-2 text-xs mb-3">
        <span className="px-2 py-1 bg-siphon-bg rounded text-siphon-accent">
          Cost: {isVariableCost(feature.cost)
            ? formatCost(feature.cost)
            : formatCost(feature.cost, costContext)}
        </span>
        <span className="px-2 py-1 bg-siphon-bg rounded text-focus">
          {feature.focusDice}
        </span>
        <span className="px-2 py-1 bg-siphon-bg rounded text-text-secondary">
          {feature.duration}
        </span>
        {feature.activation !== 'None' && (
          <span className="px-2 py-1 bg-siphon-bg rounded text-text-secondary">
            {feature.activation}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-text-secondary leading-relaxed line-clamp-4">
        {feature.description}
      </p>

      {/* Warp Effect */}
      {feature.warpEffect && (
        <div className={`mt-3 pt-3 border-t border-siphon-border ${isWarpActive ? 'text-warp' : 'text-text-muted'}`}>
          <p className="text-xs">
            <span className="font-medium">Warp:</span> {feature.warpEffect}
          </p>
        </div>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-card-selected flex items-center justify-center">
          <svg className="w-4 h-4 text-siphon-bg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Action buttons (for Combat HUD) */}
      {showActions && (
        <div className="mt-4 pt-3 border-t border-siphon-border flex gap-2">
          {!feature.isSpecialCost && onBestow && (
            <button
              onClick={(e) => { e.stopPropagation(); onBestow(); }}
              className="flex-1 py-2 text-sm bg-siphon-bg hover:bg-siphon-border rounded text-text-secondary hover:text-text-primary transition-colors"
            >
              Bestow
            </button>
          )}
          {onActivate && (
            <button
              onClick={(e) => { e.stopPropagation(); onActivate(); }}
              className="flex-1 py-2 text-sm bg-siphon-accent hover:bg-siphon-accent-dim rounded text-siphon-bg font-medium transition-colors"
            >
              Activate
            </button>
          )}
        </div>
      )}
    </div>
  );
}
