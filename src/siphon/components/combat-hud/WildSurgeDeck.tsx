import { useState, useCallback } from 'react';
import { useSettingsStore } from '../../store';

interface SurgeRollResult {
  d100: number;
  d20: number;
}

interface WildSurgeDeckProps {
  pendingWarps?: number;
  onDismissWarp?: () => void;
}

export function WildSurgeDeck({ pendingWarps = 0, onDismissWarp }: WildSurgeDeckProps) {
  const wildSurgeDiceMode = useSettingsStore((s) => s.diceMode.wildSurge);
  const [result, setResult] = useState<SurgeRollResult | null>(null);
  const [copied, setCopied] = useState(false);

  const macroText = '/r 1d100';
  const hasWarps = pendingWarps > 0;

  const handleCopy = useCallback(async () => {
    onDismissWarp?.();
    try {
      await navigator.clipboard.writeText(macroText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access denied — silently ignore
    }
  }, [macroText, onDismissWarp]);

  const handleRoll = useCallback(() => {
    const d100 = Math.floor(Math.random() * 100) + 1;
    const d20 = Math.floor(Math.random() * 20) + 1;
    setResult({ d100, d20 });
    onDismissWarp?.();
  }, [onDismissWarp]);

  return (
    <div
      aria-label="Wild Surge"
      role="region"
      className={hasWarps ? 'warp-pulse' : ''}
    >
      <div className={`text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2 ${
        hasWarps ? 'text-warp font-bold' : 'text-text-muted'
      }`}>
        <span>Wild Surge{hasWarps ? ' \u2014 Roll Needed!' : ''}</span>
        {pendingWarps > 1 && (
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-warp text-siphon-bg text-[9px] font-bold">
            {pendingWarps}
          </span>
        )}
      </div>

      {wildSurgeDiceMode === 'macro' ? (
        <button
          className={`w-full text-left px-2 py-1.5 rounded border bg-siphon-bg font-mono text-xs transition-colors ${
            hasWarps
              ? 'border-warp/60 text-warp hover:border-warp/80'
              : 'border-siphon-border/50 text-warp hover:border-warp/40'
          }`}
          onClick={handleCopy}
          title="Click to copy macro"
        >
          {copied ? 'Copied!' : macroText}
        </button>
      ) : (
        <button
          className={`w-full px-3 py-2 rounded border bg-siphon-bg text-xs transition-colors ${
            hasWarps
              ? 'border-warp/60 text-warp hover:border-warp/80 hover:bg-warp/10'
              : 'border-siphon-border/50 text-warp hover:border-warp/40 hover:bg-warp/5'
          }`}
          onClick={handleRoll}
        >
          Roll d100
        </button>
      )}

      {result !== null && (
        <div className="mt-3 flex items-end justify-around">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest text-text-muted mb-0.5">Effect</span>
            <span className="text-2xl font-bold tabular-nums text-warp">{result.d100}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest text-text-muted mb-0.5">Severity</span>
            <span className="text-3xl font-bold tabular-nums text-warp">{result.d20}</span>
          </div>
        </div>
      )}
    </div>
  );
}
