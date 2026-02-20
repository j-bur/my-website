import { useSiphonStore } from '../../store';

export function FocusCounter() {
  const { focus, currentEP, setFocus } = useSiphonStore();

  const isDoubled = currentEP < 0;
  const isHighFocus = focus >= 50;
  const isCriticalFocus = focus >= 75;

  const handleAdjust = (amount: number) => {
    const newFocus = Math.max(0, focus + amount);
    setFocus(newFocus);
  };

  return (
    <div className={`bg-siphon-surface border rounded-lg p-4 ${
      isCriticalFocus ? 'border-warp weavers-watch' :
      isHighFocus ? 'border-focus' :
      'border-siphon-border'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-text-secondary">Focus</h3>
        {isDoubled && (
          <span className="px-2 py-0.5 bg-ep-negative/20 text-ep-negative text-xs rounded font-medium">
            x2 DICE
          </span>
        )}
      </div>

      {/* Main counter */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => handleAdjust(-5)}
          className="w-10 h-10 rounded bg-siphon-bg hover:bg-siphon-border text-text-secondary hover:text-text-primary transition-colors"
        >
          -5
        </button>
        <button
          onClick={() => handleAdjust(-1)}
          className="w-10 h-10 rounded bg-siphon-bg hover:bg-siphon-border text-text-secondary hover:text-text-primary transition-colors"
        >
          -1
        </button>

        <div className={`text-5xl font-bold min-w-[100px] text-center ${
          isCriticalFocus ? 'text-warp animate-pulse' :
          isHighFocus ? 'text-focus' :
          'text-text-primary'
        }`}>
          {focus}
        </div>

        <button
          onClick={() => handleAdjust(1)}
          className="w-10 h-10 rounded bg-siphon-bg hover:bg-siphon-border text-text-secondary hover:text-text-primary transition-colors"
        >
          +1
        </button>
        <button
          onClick={() => handleAdjust(5)}
          className="w-10 h-10 rounded bg-siphon-bg hover:bg-siphon-border text-text-secondary hover:text-text-primary transition-colors"
        >
          +5
        </button>
      </div>

      {/* Focus thresholds */}
      <div className="mt-4 flex justify-between text-xs text-text-muted">
        <span className={focus >= 25 ? 'text-focus' : ''}>25: Minor</span>
        <span className={focus >= 50 ? 'text-focus' : ''}>50: Moderate</span>
        <span className={focus >= 75 ? 'text-warp' : ''}>75: Severe</span>
        <span className={focus >= 100 ? 'text-ep-critical' : ''}>100: Critical</span>
      </div>

      {/* Warnings */}
      {isHighFocus && (
        <div className={`mt-3 p-2 rounded text-xs ${
          isCriticalFocus
            ? 'bg-warp/20 border border-warp text-warp'
            : 'bg-focus/20 border border-focus text-focus'
        }`}>
          {isCriticalFocus
            ? 'The Weavers are watching. Reality frays at the edges of your perception.'
            : 'High Focus detected. Be cautious with further Siphon activation.'
          }
        </div>
      )}

      {/* Reset button */}
      <button
        onClick={() => setFocus(0)}
        className="mt-3 w-full py-2 text-sm text-text-muted hover:text-text-secondary transition-colors"
      >
        Reset Focus (Long Rest)
      </button>
    </div>
  );
}
