import { useState, useCallback } from 'react';
import { useSettingsStore } from '../../store';

interface WildSurgeDeckProps {
  warpPulse?: boolean;
}

export function WildSurgeDeck({ warpPulse }: WildSurgeDeckProps) {
  const wildSurgeDiceMode = useSettingsStore((s) => s.diceMode.wildSurge);
  const [result, setResult] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const macroText = '/r 1d100';

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(macroText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access denied — silently ignore
    }
  }, [macroText]);

  const handleRoll = useCallback(() => {
    const roll = Math.floor(Math.random() * 100) + 1;
    setResult(roll);
  }, []);

  return (
    <div
      aria-label="Wild Surge"
      role="region"
      className={warpPulse ? 'warp-pulse' : ''}
    >
      <div className={`text-[10px] uppercase tracking-widest mb-2 ${
        warpPulse ? 'text-warp font-bold' : 'text-text-muted'
      }`}>
        Wild Surge{warpPulse ? ' \u2014 Roll Needed!' : ''}
      </div>

      {wildSurgeDiceMode === 'macro' ? (
        <button
          className={`w-full text-left px-2 py-1.5 rounded border bg-siphon-bg font-mono text-xs transition-colors ${
            warpPulse
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
            warpPulse
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
