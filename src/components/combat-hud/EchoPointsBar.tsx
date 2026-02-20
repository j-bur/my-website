import { useSiphonStore, useCharacterStore } from '../../store';
import { getEPStatus } from '../../utils';

export function EchoPointsBar() {
  const { currentEP } = useSiphonStore();
  const { level } = useCharacterStore();

  const maxEP = level;
  const status = getEPStatus(currentEP, level);

  // Calculate bar widths
  const positiveWidth = currentEP >= 0 ? (currentEP / maxEP) * 100 : 0;
  const negativeWidth = currentEP < 0 ? (Math.abs(currentEP) / level) * 100 : 0;

  // Determine display status
  const isCritical = status.isEchoDrained || (status.isNegative && Math.abs(currentEP) > level * 0.75);
  const isNegative = status.isNegative;
  const isLow = currentEP >= 0 && currentEP <= maxEP * 0.25;

  return (
    <div className="bg-siphon-surface border border-siphon-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-text-secondary">Echo Points</h3>
        <span className={`text-lg font-bold ${
          isCritical ? 'text-ep-critical' :
          isNegative ? 'text-ep-negative' :
          isLow ? 'text-ep-low' :
          'text-ep-positive'
        }`}>
          {currentEP} / {maxEP}
        </span>
      </div>

      {/* Bar container */}
      <div className="relative h-6 rounded overflow-hidden">
        {/* Background gradient showing zones */}
        <div className="absolute inset-0 flex">
          {/* Negative zone (left side) */}
          <div className="w-1/3 bg-ep-critical/20 border-r border-ep-critical/50" />
          {/* Positive zone (right side) */}
          <div className="w-2/3 bg-siphon-bg" />
        </div>

        {/* Actual bar */}
        <div className="absolute inset-0 flex">
          {/* Negative bar (grows left from center) */}
          <div className="w-1/3 flex justify-end">
            <div
              className="h-full bg-gradient-to-l from-ep-negative to-ep-critical transition-all duration-300"
              style={{ width: `${Math.min(negativeWidth, 100)}%` }}
            />
          </div>

          {/* Positive bar (grows right from center) */}
          <div className="w-2/3">
            <div
              className="h-full bg-gradient-to-r from-ep-positive to-siphon-accent transition-all duration-300"
              style={{ width: `${positiveWidth}%` }}
            />
          </div>
        </div>

        {/* Center line (0 EP marker) */}
        <div className="absolute left-1/3 top-0 bottom-0 w-0.5 bg-text-muted" />

        {/* Echo Drain threshold marker */}
        {currentEP < 0 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-ep-critical animate-pulse"
            style={{
              left: `0%`,
            }}
          />
        )}
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-1 text-xs text-text-muted">
        <span>-{level} (Drain)</span>
        <span>0</span>
        <span>{maxEP}</span>
      </div>

      {/* Status warnings */}
      {isCritical && (
        <div className="mt-2 p-2 bg-ep-critical/20 border border-ep-critical rounded text-xs text-ep-critical">
          Warning: Echo Drain imminent! At -{level} EP, you suffer {level}d6 psychic damage and gain an Echo Scar.
        </div>
      )}

      {isNegative && !isCritical && (
        <div className="mt-2 p-2 bg-ep-negative/20 border border-ep-negative rounded text-xs text-ep-negative">
          Negative EP: Focus dice are doubled. Warp effects active on card activation.
        </div>
      )}
    </div>
  );
}
