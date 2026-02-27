import { useSiphonStore } from '../../store';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';
import { getFocusThreshold } from '../../utils/focusCalculator';

export function FocusCounter() {
  const focus = useSiphonStore((s) => s.focus);
  const displayedFocus = useAnimatedNumber(focus, 400);

  const threshold = getFocusThreshold(focus);

  return (
    <div
      className="flex flex-col gap-1"
      role="group"
      aria-label={`Focus: ${focus}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-text-muted uppercase tracking-wider text-[10px]">Focus</span>
        <span
          className="text-xl font-bold tabular-nums transition-colors duration-300"
          style={{ color: threshold.color }}
        >
          {displayedFocus}
        </span>
      </div>
    </div>
  );
}
