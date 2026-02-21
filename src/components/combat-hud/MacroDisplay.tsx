import { useState } from 'react';

interface MacroDisplayProps {
  macroText: string;
  focusLabel: string;
  onResultEntered: (result: number) => void;
}

export function MacroDisplay({ macroText, focusLabel, onResultEntered }: MacroDisplayProps) {
  const [resultInput, setResultInput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(macroText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSubmit = () => {
    const value = parseInt(resultInput, 10);
    if (!isNaN(value) && value >= 0) {
      onResultEntered(value);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Macro text block */}
      <div className="relative">
        <pre className="bg-siphon-bg border border-siphon-border rounded px-3 py-2 text-xs text-text-secondary font-mono whitespace-pre-wrap">
          {macroText}
        </pre>
        <button
          className="absolute top-1 right-1 px-2 py-0.5 text-[10px] rounded bg-siphon-surface border border-siphon-border hover:border-siphon-accent/60 text-text-muted transition-colors"
          onClick={handleCopy}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Result input */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-text-muted">{focusLabel} result:</label>
        <input
          type="number"
          min="0"
          value={resultInput}
          onChange={(e) => setResultInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
          className="w-20 px-2 py-1 text-sm bg-siphon-bg border border-siphon-border rounded text-text-primary tabular-nums focus:border-siphon-accent focus:outline-none"
          placeholder="0"
          aria-label="Focus roll result"
        />
        <button
          className="px-3 py-1 text-xs rounded bg-siphon-accent/20 border border-siphon-accent/50 text-siphon-accent hover:bg-siphon-accent/30 transition-colors disabled:opacity-40"
          onClick={handleSubmit}
          disabled={resultInput === '' || isNaN(parseInt(resultInput, 10))}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
