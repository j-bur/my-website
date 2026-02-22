export function WildSurgeDeck() {
  return (
    <div
      className="w-44 border border-siphon-border rounded-lg bg-card-bg p-3 cursor-pointer hover:border-warp/60 transition-colors self-start justify-self-end"
      role="button"
      tabIndex={0}
      aria-label="Wild Surge deck"
    >
      <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1">
        Wild Surge
      </div>
      <div className="text-sm font-bold text-warp mb-1">
        Echo Surge
      </div>
      <p className="text-[10px] leading-tight text-text-muted">
        Click to trigger surge roll
      </p>
    </div>
  );
}
