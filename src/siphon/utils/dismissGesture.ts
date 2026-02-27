const DISMISS_THRESHOLD_PX = 120;
const FLICK_VELOCITY = 0.8; // px/ms
const FLICK_DISTANCE_PX = 60;

export function shouldDismiss(totalDx: number, recentVelocity: number): boolean {
  const absDx = Math.abs(totalDx);
  if (absDx >= DISMISS_THRESHOLD_PX) return true;
  // Flick: fast release while moving outward past minimum distance
  if (absDx >= FLICK_DISTANCE_PX && Math.abs(recentVelocity) >= FLICK_VELOCITY) return true;
  return false;
}

export { DISMISS_THRESHOLD_PX };
