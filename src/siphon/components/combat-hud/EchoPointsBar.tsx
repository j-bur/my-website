import { useSiphonStore } from '../../store';
import { useCharacterStore } from '../../store';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';

export function EchoPointsBar() {
  const currentEP = useSiphonStore((s) => s.currentEP);
  const level = useCharacterStore((s) => s.level);
  const maxEP = level; // EP Max equals Level
  const displayedEP = useAnimatedNumber(currentEP, 300);

  // Bar extends right (positive) or left (negative) from center zero-point
  const isNegative = currentEP < 0;
  const absEP = Math.abs(currentEP);
  const barRange = Math.max(maxEP, absEP); // scale bar to fit current value
  const fillPercent = barRange > 0 ? (absEP / barRange) * 50 : 0;

  return (
    <div className="flex flex-col gap-1" role="group" aria-label={`Echo Points: ${currentEP}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-muted uppercase tracking-wider text-[10px]">EP</span>
        <span
          className={`font-bold tabular-nums ${
            isNegative ? 'text-ep-negative' : currentEP > 0 ? 'text-ep-positive' : 'text-text-secondary'
          }`}
        >
          {displayedEP}
        </span>
      </div>
      <div className="relative h-2 bg-siphon-surface rounded-full border border-siphon-border/50 overflow-hidden">
        {/* Center marker */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-text-muted/40 z-10" />
        {/* Fill bar */}
        <div
          className={`absolute top-0 bottom-0 rounded-full transition-all duration-300 ease-out ${
            isNegative ? 'bg-ep-negative' : 'bg-ep-positive'
          }`}
          style={{
            width: `${fillPercent}%`,
            ...(isNegative
              ? { right: '50%' }
              : { left: '50%' }),
          }}
        />
      </div>
    </div>
  );
}
