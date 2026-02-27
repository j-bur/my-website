import { useState } from 'react';
import type { SiphonFeature } from '../../types';

interface SiphonCardProps {
  feature: SiphonFeature;
  onClick?: () => void;
  onDoubleClick?: () => void;
  isRaised?: boolean;
  isUnplayable?: boolean;
  compact?: boolean;
  showDetails?: boolean;
  allyName?: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

export function SiphonCard({
  feature,
  onClick,
  onDoubleClick,
  isRaised = false,
  isUnplayable = false,
  compact = false,
  showDetails,
  allyName,
  draggable: isDraggable,
  onDragStart,
  onDragEnd,
}: SiphonCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const details = showDetails ?? !compact;
  const costDisplay =
    typeof feature.cost === 'number' ? `${feature.cost} EP` : `${feature.cost}`;

  return (
    <div
      className={`
        relative flex flex-col border rounded-lg select-none
        transition-all duration-200
        ${isRaised ? 'border-siphon-accent shadow-lg shadow-siphon-accent/20 -translate-y-2 z-10' : 'border-card-border'}
        ${isUnplayable ? 'opacity-40 saturate-50' : ''}
        ${isDragging ? 'opacity-50' : ''}
        ${compact ? 'w-[160px] min-h-[224px]' : `w-[200px] ${isRaised ? 'h-[280px]' : 'min-h-[280px]'}`}
        ${isDraggable && !isUnplayable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
        bg-card-bg hover:border-siphon-accent/60
      `}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      draggable={isDraggable}
      onDragStart={(e) => {
        setIsDragging(true);
        onDragStart?.(e);
      }}
      onDragEnd={(e) => {
        setIsDragging(false);
        onDragEnd?.(e);
      }}
      role="button"
      tabIndex={0}
      aria-label={feature.name}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && onClick) onClick();
      }}
    >
      {/* Name */}
      <div className="px-3 py-2 border-b border-card-border text-center">
        <span className={`font-bold tracking-wide uppercase text-text-primary ${compact ? 'text-xs' : 'text-sm'}`}>
          {feature.name}
        </span>
      </div>

      {/* Stats */}
      <div className={`px-3 py-2 space-y-1 ${compact ? 'text-xs' : 'text-sm'}`}>
        <div className="flex justify-between">
          <span className="text-text-muted">Cost</span>
          <span className="text-ep-positive font-medium">{costDisplay}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Focus</span>
          <span className="text-focus font-medium">{feature.focusDice}</span>
        </div>
        {details && (
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

      {/* Description */}
      {details ? (
        <div className={`px-3 py-2 border-t border-card-border flex-1 ${isRaised ? 'overflow-y-auto min-h-0' : ''}`}>
          <p className={`text-xs leading-snug text-text-secondary ${isRaised ? '' : 'line-clamp-5'}`}>
            {feature.description}
          </p>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Warp badge */}
      {feature.warpEffect && (
        <div className={`px-3 ${compact ? 'py-1' : 'py-1.5'} border-t border-warp/30 bg-warp/5`} title={feature.warpEffect}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-warp/80">
            Warp
          </span>
        </div>
      )}

      {/* Ally bestowed badge */}
      {allyName && (
        <div className="px-3 py-1 border-t border-siphon-border/30 bg-siphon-surface/20">
          <span className="text-[10px] text-text-muted">
            &rarr; {allyName}
          </span>
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
