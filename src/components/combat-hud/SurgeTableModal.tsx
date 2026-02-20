import { useState } from 'react';
import { rollSurge } from '../../utils';
import type { SurgeResult, SurgeSeverity } from '../../types';

interface SurgeTableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SurgeTableModal({ isOpen, onClose }: SurgeTableModalProps) {
  const [result, setResult] = useState<SurgeResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const handleRoll = () => {
    setIsRolling(true);

    // Animate for effect
    setTimeout(() => {
      const surgeResult = rollSurge();
      setResult(surgeResult);
      setIsRolling(false);
    }, 500);
  };

  const handleClose = () => {
    setResult(null);
    onClose();
  };

  if (!isOpen) return null;

  const severityColors: Record<SurgeSeverity, string> = {
    Extreme: 'text-ep-critical border-ep-critical bg-ep-critical/10',
    Moderate: 'text-ep-negative border-ep-negative bg-ep-negative/10',
    Nuisance: 'text-focus border-focus bg-focus/10'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-siphon-surface border border-siphon-border rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-medium text-text-primary mb-4">Wild Echo Surge Table</h2>

        <p className="text-sm text-text-secondary mb-6">
          When you activate a Siphon Feature while at negative Echo Points, roll on the Wild Echo Surge table
          to determine the chaotic effect.
        </p>

        {!result ? (
          <div className="text-center py-8">
            <button
              onClick={handleRoll}
              disabled={isRolling}
              className={`px-8 py-4 rounded-lg font-medium text-lg transition-all ${
                isRolling
                  ? 'bg-siphon-border text-text-muted cursor-wait'
                  : 'bg-warp text-siphon-bg hover:bg-warp/80 glitch-hover'
              }`}
            >
              {isRolling ? 'Rolling...' : 'Roll d100 + d20'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Roll results */}
            <div className="flex justify-center gap-8 text-center">
              <div>
                <div className="text-xs text-text-muted mb-1">d100 (Effect)</div>
                <div className="text-3xl font-bold text-text-primary">{result.tableRoll}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted mb-1">d20 (Severity)</div>
                <div className={`text-3xl font-bold ${
                  result.severity === 'Extreme' ? 'text-ep-critical' :
                  result.severity === 'Moderate' ? 'text-ep-negative' :
                  'text-focus'
                }`}>
                  {result.severityRoll}
                </div>
              </div>
            </div>

            {/* Severity indicator */}
            <div className={`text-center py-2 px-4 rounded border ${severityColors[result.severity]}`}>
              <span className="font-medium uppercase">{result.severity}</span>
              <span className="text-xs ml-2 opacity-70">
                ({result.severity === 'Extreme' ? '1-3' : result.severity === 'Moderate' ? '4-9' : '10-20'})
              </span>
            </div>

            {/* Effect text */}
            <div className="p-4 bg-siphon-bg rounded-lg">
              <div className="text-xs text-text-muted mb-2">Effect #{result.tableRoll}</div>
              <p className="text-text-primary">{result.effect}</p>
            </div>

            {/* Roll again button */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleRoll}
                className="flex-1 py-2 bg-siphon-bg hover:bg-siphon-border rounded text-text-secondary hover:text-text-primary transition-colors"
              >
                Roll Again
              </button>
              <button
                onClick={handleClose}
                className="flex-1 py-2 bg-siphon-accent hover:bg-siphon-accent-dim rounded text-siphon-bg font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
