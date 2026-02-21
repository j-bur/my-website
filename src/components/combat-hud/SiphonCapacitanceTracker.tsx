import { useState, useEffect, useRef } from 'react';
import { useSiphonStore } from '../../store';
import { useCharacterStore } from '../../store';

const TIME_PRESETS: { label: string; minutes: number; icon?: string }[] = [
  { label: 'Dawn', minutes: 360, icon: '☀' },
  { label: 'Morning', minutes: 540 },
  { label: 'Midday', minutes: 720 },
  { label: 'Afternoon', minutes: 900 },
  { label: 'Dusk', minutes: 1080, icon: '🌅' },
  { label: 'Evening', minutes: 1260 },
  { label: 'Night', minutes: 1380 },
  { label: 'Midnight', minutes: 0, icon: '🌙' },
];

function formatInGameTime(minutes: number): string {
  const wrapped = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(wrapped / 60);
  const mins = wrapped % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHour}:${mins.toString().padStart(2, '0')} ${period}`;
}

export function SiphonCapacitanceTracker() {
  const capacitance = useSiphonStore((s) => s.siphonCapacitance);
  const pb = useCharacterStore((s) => s.proficiencyBonus);
  const maxCapacitance = pb;
  const inGameTime = useSiphonStore((s) => s.capacitanceInGameTime);
  const expiresAt = useSiphonStore((s) => s.capacitanceExpiresAt);
  const setTimer = useSiphonStore((s) => s.setCapacitanceTimer);
  const extendTimer = useSiphonStore((s) => s.extendCapacitanceTimer);
  const clearCapacitance = useSiphonStore((s) => s.clearCapacitance);

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [prevCap, setPrevCap] = useState(capacitance);
  const [animatingPips, setAnimatingPips] = useState<Map<number, 'fill' | 'drain'>>(new Map());
  const clearRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Detect capacitance changes during render (React's "adjust state from previous renders" pattern)
  if (prevCap !== capacitance) {
    setPrevCap(capacitance);
    const anims = new Map<number, 'fill' | 'drain'>();
    if (capacitance > prevCap) {
      for (let i = prevCap; i < capacitance; i++) anims.set(i, 'fill');
    } else {
      for (let i = capacitance; i < prevCap; i++) anims.set(i, 'drain');
    }
    setAnimatingPips(anims);
  }

  // Clear animation classes after duration
  useEffect(() => {
    if (animatingPips.size === 0) return;
    clearTimeout(clearRef.current);
    clearRef.current = setTimeout(() => setAnimatingPips(new Map()), 350);
    return () => clearTimeout(clearRef.current);
  }, [animatingPips]);

  return (
    <div className="flex flex-col gap-1" role="group" aria-label={`Capacitance: ${capacitance} of ${maxCapacitance}`}>
      <div className="flex items-center justify-between">
        <span className="text-text-muted uppercase tracking-wider text-[10px]">Capacitance</span>
        <span className="text-xs tabular-nums text-capacitance font-medium">
          {capacitance}/{maxCapacitance}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: maxCapacitance }, (_, i) => {
          const animClass = animatingPips.get(i);
          return (
            <div
              key={i}
              className={`w-3 h-3 rounded-sm border transition-all duration-200 ${
                i < capacitance
                  ? 'bg-capacitance border-capacitance shadow-sm shadow-capacitance/30'
                  : 'bg-transparent border-siphon-border/60'
              }${animClass === 'fill' ? ' pip-fill' : ''}${animClass === 'drain' ? ' pip-drain' : ''}`}
              style={animClass ? { '--pip-color': 'var(--color-capacitance)' } as React.CSSProperties : undefined}
            />
          );
        })}
      </div>

      {/* Timer section — only show when there are charges */}
      {capacitance > 0 && (
        <div className="mt-1">
          {inGameTime !== null && expiresAt !== null ? (
            /* Timer is set — show current time, expiry, and action buttons */
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2">
                <button
                  className="w-5 h-5 rounded border border-siphon-border text-text-muted hover:text-text-primary text-[10px]"
                  onClick={() => setTimer(inGameTime - 60)}
                  aria-label="Decrease time by 1 hour"
                >
                  ◄
                </button>
                <button
                  className="text-xs font-medium text-capacitance tabular-nums cursor-pointer hover:text-text-primary"
                  onClick={() => setShowTimePicker(!showTimePicker)}
                  aria-label="Current in-game time"
                >
                  {formatInGameTime(inGameTime)}
                </button>
                <button
                  className="w-5 h-5 rounded border border-siphon-border text-text-muted hover:text-text-primary text-[10px]"
                  onClick={() => setTimer(inGameTime + 60)}
                  aria-label="Increase time by 1 hour"
                >
                  ►
                </button>
              </div>
              <div className="text-center text-[10px] text-text-muted">
                Expires at: <span className="text-capacitance font-medium">{formatInGameTime(expiresAt)}</span>
              </div>
              <div className="flex gap-1 justify-center">
                <button
                  className="px-1.5 py-0.5 text-[10px] rounded border border-siphon-border text-text-muted hover:text-ep-negative hover:border-ep-negative transition-colors"
                  onClick={clearCapacitance}
                >
                  Timer Expired
                </button>
                <button
                  className="px-1.5 py-0.5 text-[10px] rounded border border-siphon-border text-text-muted hover:text-capacitance hover:border-capacitance transition-colors"
                  onClick={extendTimer}
                >
                  Extend +8 hrs
                </button>
                <button
                  className="px-1.5 py-0.5 text-[10px] rounded border border-siphon-border text-text-muted hover:text-text-primary hover:border-text-muted transition-colors"
                  onClick={clearCapacitance}
                >
                  Clear
                </button>
              </div>

              {/* Collapsible time presets */}
              {showTimePicker && (
                <div className="grid grid-cols-4 gap-0.5" role="group" aria-label="Time presets">
                  {TIME_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      className={`px-1 py-0.5 text-[10px] rounded border transition-colors ${
                        inGameTime === preset.minutes
                          ? 'border-capacitance text-capacitance bg-capacitance/10'
                          : 'border-siphon-border text-text-muted hover:text-text-primary hover:border-text-muted'
                      }`}
                      onClick={() => {
                        setTimer(preset.minutes);
                        setShowTimePicker(false);
                      }}
                    >
                      {preset.icon ? `${preset.icon} ` : ''}{preset.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* No timer set — show preset picker to set the time */
            <div className="space-y-1">
              <div className="text-center text-[10px] text-text-muted">Set acquisition time:</div>
              <div className="grid grid-cols-4 gap-0.5" role="group" aria-label="Time presets">
                {TIME_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    className="px-1 py-0.5 text-[10px] rounded border border-siphon-border text-text-muted hover:text-capacitance hover:border-capacitance transition-colors"
                    onClick={() => setTimer(preset.minutes)}
                  >
                    {preset.icon ? `${preset.icon} ` : ''}{preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
