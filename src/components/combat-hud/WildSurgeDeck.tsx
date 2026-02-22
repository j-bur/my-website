import { useState, useCallback } from 'react';
import { useSettingsStore } from '../../store';

interface WildSurgeDeckProps {
  pendingWarps?: number;
  onDismissWarp?: () => void;
}

export function WildSurgeDeck({ pendingWarps = 0, onDismissWarp }: WildSurgeDeckProps) {
  const wildSurgeDiceMode = useSettingsStore((s) => s.diceMode.wildSurge);
  const [result, setResult] = useState<number | null>(null);
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
    const roll = Math.floor(Math.random() * 100) + 1;
    setResult(roll);
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
        <div className="mt-2 text-center">
          <span className="text-2xl font-bold text-warp">{result}</span>
        </div>
      )}
    </div>
  );
}
