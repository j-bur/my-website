import type { SurgeResult } from '../../types';

interface SurgeResultModalProps {
  result: SurgeResult;
  onDismiss: () => void;
  featureWarpEffect?: string;
}

export function SurgeResultModal({ result, onDismiss, featureWarpEffect }: SurgeResultModalProps) {
  const severityColor =
    result.severity === 'Extreme'
      ? 'text-ep-negative'
      : result.severity === 'Moderate'
        ? 'text-focus-warning'
        : 'text-siphon-accent';

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onDismiss}
      role="dialog"
      aria-label="Wild Echo Surge result"
    >
      <div
        className="bg-siphon-surface border border-warp/50 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl shadow-warp/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warp header (shown when triggered by activation) */}
        {featureWarpEffect && (
          <div className="text-center mb-3">
            <div className="text-sm font-bold text-warp mb-1">Warp Triggered!</div>
            <p className="text-xs text-warp/80">{featureWarpEffect}</p>
          </div>
        )}

        {/* Surge details */}
        <div className={featureWarpEffect ? 'border-t border-siphon-border pt-3' : ''}>
          <div className="text-center mb-4">
            <div className="text-[10px] uppercase tracking-widest text-warp mb-1">
              Wild Echo Surge
            </div>
            <div className="text-2xl font-bold text-warp">
              #{result.tableRoll}
            </div>
          </div>

          <div className="flex justify-center gap-6 mb-4 text-sm">
            <div className="text-center">
              <div className="text-text-muted text-[10px] uppercase">d100</div>
              <div className="text-text-primary font-bold">{result.tableRoll}</div>
            </div>
            <div className="text-center">
              <div className="text-text-muted text-[10px] uppercase">d20</div>
              <div className="text-text-primary font-bold">{result.severityRoll}</div>
            </div>
            <div className="text-center">
              <div className="text-text-muted text-[10px] uppercase">Severity</div>
              <div className={`font-bold ${severityColor}`}>{result.severity}</div>
            </div>
          </div>

          <div className="border-t border-siphon-border pt-3 mb-4">
            <p className="text-sm text-text-secondary leading-relaxed">
              {result.effect}
            </p>
          </div>
        </div>

        <button
          className="w-full py-2 text-sm rounded bg-warp/20 border border-warp/40 text-warp hover:bg-warp/30 transition-colors"
          onClick={onDismiss}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
