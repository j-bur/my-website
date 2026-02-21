import type { SiphonFeature } from '../../types';

interface SiphonCardProps {
  feature: SiphonFeature;
  onClick?: () => void;
  onDoubleClick?: () => void;
  isRaised?: boolean;
  isUnplayable?: boolean;
  compact?: boolean;
}

export function SiphonCard({
  feature,
  onClick,
  onDoubleClick,
  isRaised = false,
  isUnplayable = false,
  compact = false,
}: SiphonCardProps) {
  const costDisplay =
    typeof feature.cost === 'number' ? `${feature.cost} EP` : `${feature.cost}`;

  return (
    <div
      className={`
        relative flex flex-col border rounded-lg select-none
        transition-all duration-200 cursor-pointer
        ${isRaised ? 'border-siphon-accent shadow-lg shadow-siphon-accent/20 -translate-y-2 z-10' : 'border-card-border'}
        ${isUnplayable ? 'opacity-40 saturate-50' : ''}
        ${compact ? 'w-28 min-h-36' : 'w-40 min-h-48'}
        bg-card-bg hover:border-siphon-accent/60
      `}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      role="button"
      tabIndex={0}
      aria-label={feature.name}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && onClick) onClick();
      }}
    >
      {/* Name */}
      <div className="px-2 py-1.5 border-b border-card-border text-center">
        <span className="text-xs font-bold tracking-wide uppercase text-text-primary">
          {feature.name}
        </span>
      </div>

      {/* Stats */}
      <div className="px-2 py-1.5 text-xs space-y-0.5">
        <div className="flex justify-between">
          <span className="text-text-muted">Cost</span>
          <span className="text-ep-positive font-medium">{costDisplay}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Focus</span>
          <span className="text-focus font-medium">{feature.focusDice}</span>
        </div>
        {!compact && (
          <>
            <div className="flex justify-between">
              <span className="text-text-muted">Duration</span>
              <span className="text-text-secondary">{feature.duration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Activation</span>
              <span className="text-text-secondary">{feature.activation}</span>
            </div>
          </>
        )}
      </div>

      {/* Description (only when not compact) */}
      {!compact && (
        <div className="px-2 py-1.5 border-t border-card-border flex-1">
          <p className="text-[10px] leading-tight text-text-secondary line-clamp-4">
            {feature.description}
          </p>
        </div>
      )}

      {/* Warp effect */}
      {!compact && feature.warpEffect && (
        <div className="px-2 py-1 border-t border-warp/30 bg-warp/5">
          <p className="text-[10px] leading-tight text-warp/80 line-clamp-2">
            <span className="font-bold">WARP:</span> {feature.warpEffect}
          </p>
        </div>
      )}

      {/* Special cost indicator */}
      {feature.isSpecialCost && (
        <div className="absolute top-1 right-1 text-[10px] text-capacitance" title="Cannot bestow to allies">
          *
        </div>
      )}
    </div>
  );
}
