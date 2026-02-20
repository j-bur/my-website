import { useManifoldStore } from '../../store';
import { MAX_MOTES } from '../../data/echoManifold';

export function MoteTracker() {
  const { motes, setMotes, regainMote } = useManifoldStore();

  return (
    <div className="bg-siphon-bg rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-text-secondary">Echo Motes</h4>
        <span className="text-sm text-siphon-accent">{motes} / {MAX_MOTES}</span>
      </div>

      {/* Mote indicators */}
      <div className="flex gap-1.5 mb-3">
        {Array.from({ length: MAX_MOTES }).map((_, i) => (
          <button
            key={i}
            onClick={() => setMotes(i + 1 === motes ? motes - 1 : i + 1)}
            className={`flex-1 h-6 rounded transition-all ${
              i < motes
                ? 'bg-siphon-accent shadow-[0_0_8px_rgba(0,212,170,0.4)]'
                : 'bg-siphon-border hover:bg-siphon-accent/20'
            }`}
            title={`${i + 1} motes`}
          />
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <button
          onClick={regainMote}
          disabled={motes >= MAX_MOTES}
          className="flex-1 py-1.5 text-xs bg-siphon-surface hover:bg-siphon-border rounded text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          +1 Mote
        </button>
        <button
          onClick={() => setMotes(MAX_MOTES)}
          className="flex-1 py-1.5 text-xs bg-siphon-surface hover:bg-siphon-border rounded text-text-secondary transition-colors"
        >
          Long Rest
        </button>
      </div>

      <p className="mt-2 text-xs text-text-muted">
        Regain 1 mote on crit, enemy failed save, or echo destroyed (max 1/turn)
      </p>
    </div>
  );
}
