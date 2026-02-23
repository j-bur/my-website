/**
 * Converts duration strings to milliseconds for timers
 */
export function parseDurationToMs(duration: string): number | null {
  // Handle special durations
  const lowerDuration = duration.toLowerCase();
  if (
    lowerDuration === 'triggered' ||
    lowerDuration === 'while selected' ||
    lowerDuration === 'permanent' ||
    lowerDuration === 'special' ||
    lowerDuration === 'instant'
  ) {
    return null; // No automatic expiration
  }

  // Parse "X minute(s)" or "X hour(s)"
  const minuteMatch = duration.match(/(\d+)\s*minute/i);
  if (minuteMatch) {
    return parseInt(minuteMatch[1], 10) * 60 * 1000;
  }

  const hourMatch = duration.match(/(\d+)\s*hour/i);
  if (hourMatch) {
    return parseInt(hourMatch[1], 10) * 60 * 60 * 1000;
  }

  // Handle "8 hours" specifically
  const hoursMatch = duration.match(/(\d+)\s*hours/i);
  if (hoursMatch) {
    return parseInt(hoursMatch[1], 10) * 60 * 60 * 1000;
  }

  return null;
}

/**
 * Formats remaining time for display
 */
export function formatRemainingTime(ms: number): string {
  if (ms <= 0) return 'Expired';

  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((ms % (60 * 1000)) / 1000);

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

/**
 * Calculate remaining time from start timestamp and duration
 */
export function calculateRemainingTime(
  startedAt: number,
  durationMs: number
): number {
  const now = Date.now();
  const elapsed = now - startedAt;
  return Math.max(0, durationMs - elapsed);
}

/**
 * Check if an effect has expired
 */
export function isExpired(startedAt: number, durationMs: number | null): boolean {
  if (durationMs === null) return false; // Never expires
  return Date.now() >= startedAt + durationMs;
}

/**
 * Format duration for display (from original string)
 */
export function formatDuration(duration: string): string {
  const lower = duration.toLowerCase();

  if (lower === 'triggered') return 'Until triggered';
  if (lower === 'while selected') return 'While selected';
  if (lower === 'permanent') return 'Permanent';
  if (lower === 'special') return 'Special';
  if (lower === 'instant') return 'Instant';

  return duration;
}
