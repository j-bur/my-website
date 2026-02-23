import { useSyncExternalStore } from 'react';
import { useSettingsStore } from '../store';

const mediaQuery =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

function subscribe(callback: () => void) {
  mediaQuery?.addEventListener('change', callback);
  return () => mediaQuery?.removeEventListener('change', callback);
}

function getSnapshot() {
  return mediaQuery?.matches ?? false;
}

/**
 * Returns true when animations should be disabled.
 * Combines: settingsStore.reducedMotion, !settingsStore.animationsEnabled,
 * and the OS-level prefers-reduced-motion media query.
 */
export function useReducedMotion(): boolean {
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);
  const animationsEnabled = useSettingsStore((s) => s.animationsEnabled);
  const prefersReduced = useSyncExternalStore(subscribe, getSnapshot, () => false);

  return reducedMotion || !animationsEnabled || prefersReduced;
}
