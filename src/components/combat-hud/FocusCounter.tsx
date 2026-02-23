import { useSiphonStore } from '../../store';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';

export function FocusCounter() {
  const focus = useSiphonStore((s) => s.focus);
  const displayedFocus = useAnimatedNumber(focus, 400);

  // Glow intensity scales with focus value
  const glowIntensity = Math.min(1, focus / 30);
  // const isHighFocus = focus >= 15;

  return (
    <div className="flex flex-col gap-1" role="group" aria-label={`Focus: ${focus}`}>
      <div className="flex items-center justify-between">
        <span className="text-text-muted uppercase tracking-wider text-[10px]">Focus</span>
        <span
          className="text-xl font-bold tabular-nums text-focus transition-all duration-300"
          style={{
            textShadow: glowIntensity > 0
              ? `0 0 ${8 + glowIntensity * 16}px rgba(122, 66, 224, ${0.3 + glowIntensity * 0.5})`
              : 'none',
          }}
        >
          {displayedFocus}
        </span>
      </div>
      {/* {isHighFocus && (
        <div className="text-[10px] text-focus-warning">
          The Weavers are watching...
        </div>
      )} */}
    </div>
  );
}
