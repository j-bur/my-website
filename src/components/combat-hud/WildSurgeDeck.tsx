import { useState, useCallback } from 'react';
import { useSettingsStore } from '../../store';

export function WildSurgeDeck() {
  const wildSurgeDiceMode = useSettingsStore((s) => s.diceMode.wildSurge);
  const [result, setResult] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const macroText = '/r 1d100';

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(macroText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [macroText]);

  const handleRoll = useCallback(() => {
    const roll = Math.floor(Math.random() * 100) + 1;
    setResult(roll);
  }, []);

  return (
    <div aria-label="Wild Surge" role="region">
      <div className="text-[10px] uppercase tracking-widest text-text-muted mb-2">
        Wild Surge
      </div>

      {wildSurgeDiceMode === 'macro' ? (
        <button
          className="w-full text-left px-2 py-1.5 rounded border border-siphon-border/50 bg-siphon-bg font-mono text-xs text-warp hover:border-warp/40 transition-colors"
          onClick={handleCopy}
          title="Click to copy macro"
        >
          {copied ? 'Copied!' : macroText}
        </button>
      ) : (
        <button
          className="w-full px-3 py-2 rounded border border-siphon-border/50 bg-siphon-bg text-xs text-warp hover:border-warp/40 hover:bg-warp/5 transition-colors"
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
