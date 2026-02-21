import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Smoothly interpolates a displayed number toward a target value using requestAnimationFrame.
 * When reduced motion is active, returns the target value immediately.
 */
export function useAnimatedNumber(target: number, durationMs = 400): number {
  const skipAnimation = useReducedMotion();
  const [displayed, setDisplayed] = useState(target);
  const prevTarget = useRef(target);
  const rafId = useRef<number>(0);

  useEffect(() => {
    if (skipAnimation || prevTarget.current === target) {
      prevTarget.current = target;
      return;
    }

    const from = prevTarget.current;
    prevTarget.current = target;
    const delta = target - from;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + delta * eased);
      setDisplayed(current);

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      }
    }

    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, [target, durationMs, skipAnimation]);

  // When animations are skipped, return target directly (no stale displayed value)
  if (skipAnimation) return target;

  return displayed;
}
