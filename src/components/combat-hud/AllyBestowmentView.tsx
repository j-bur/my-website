import { useMemo } from 'react';
import { useSiphonStore } from '../../store';
import { FEATURE_MAP } from '../../data/featureConstants';
import { SiphonCard } from '../cards/SiphonCard';

interface AllyBestowmentViewProps {
  allyId: string;
  allyName: string;
  onDismiss: () => void;
}

export function AllyBestowmentView({ allyId, allyName, onDismiss }: AllyBestowmentViewProps) {
  const allyBestowments = useSiphonStore((s) => s.allyBestowments);
  const removeAllyBestowment = useSiphonStore((s) => s.removeAllyBestowment);

  const bestowments = useMemo(
    () => allyBestowments.filter((b) => b.allyId === allyId),
    [allyBestowments, allyId]
  );

  // Use the isFromSelectedDeck flag captured at bestow time (not current selectedCardIds)
  const fromSelected = useMemo(
    () => bestowments.filter((b) => b.isFromSelectedDeck),
    [bestowments]
  );

  const fromAllFeatures = useMemo(
    () => bestowments.filter((b) => !b.isFromSelectedDeck),
    [bestowments]
  );

  if (bestowments.length === 0) {
    return (
      <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-siphon-bg/80 backdrop-blur-sm"
        onClick={onDismiss}
        role="dialog"
        aria-label={`Bestowments for ${allyName}`}
      >
        <div
          className="border border-siphon-border/50 rounded-lg bg-siphon-bg/95 p-6 max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <h3 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-2">
              Viewing: {allyName}
            </h3>
            <p className="text-xs text-text-muted">No features bestowed to this ally.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-siphon-bg/80 backdrop-blur-sm"
      onClick={onDismiss}
      role="dialog"
      aria-label={`Bestowments for ${allyName}`}
    >
      <div
        className="border border-siphon-border/50 rounded-lg bg-siphon-bg/95 p-4 max-w-4xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-bold uppercase tracking-widest text-text-primary text-center mb-4">
          Viewing: {allyName}
        </h3>

        <div className="flex gap-6 justify-center">
          {/* Left: Cards from Selected Deck */}
          {fromSelected.length > 0 && (
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-text-muted">
                From Selected Deck
              </span>
              <div className="flex gap-2 flex-wrap justify-center" role="list" aria-label="Bestowed from selected deck">
                {fromSelected.map((b) => {
                  const feature = FEATURE_MAP.get(b.featureId);
                  if (!feature) return null;
                  return (
                    <div key={b.id} className="relative" role="listitem">
                      <SiphonCard
                        feature={feature}
                        compact
                        allyName={allyName}
                      />
                      <button
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-ep-negative/80 text-white text-xs flex items-center justify-center hover:bg-ep-negative transition-colors"
                        onClick={() => removeAllyBestowment(b.id)}
                        aria-label={`Remove ${feature.name} from ${allyName}`}
                        title="Remove bestowment"
                      >
                        &#x2715;
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Right: Cards from All Features (no longer in selected deck) */}
          {fromAllFeatures.length > 0 && (
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-text-muted">
                From All Features
              </span>
              <div className="flex gap-2 flex-wrap justify-center" role="list" aria-label="Bestowed from all features">
                {fromAllFeatures.map((b) => {
                  const feature = FEATURE_MAP.get(b.featureId);
                  if (!feature) return null;
                  return (
                    <div key={b.id} className="relative" role="listitem">
                      <SiphonCard
                        feature={feature}
                        compact
                        allyName={allyName}
                      />
                      <button
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-ep-negative/80 text-white text-xs flex items-center justify-center hover:bg-ep-negative transition-colors"
                        onClick={() => removeAllyBestowment(b.id)}
                        aria-label={`Remove ${feature.name} from ${allyName}`}
                        title="Remove bestowment"
                      >
                        &#x2715;
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
