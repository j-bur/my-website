interface DiceModeToggleProps {
  label: string;
  value: 'dice3d' | 'macro';
  onChange: (mode: 'dice3d' | 'macro') => void;
}

export function DiceModeToggle({ label, value, onChange }: DiceModeToggleProps) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-text-secondary">{label}</span>
      <div className="flex gap-0.5 rounded border border-siphon-border overflow-hidden">
        <button
          className={`px-3 py-1 text-xs font-medium transition-colors ${
            value === 'dice3d'
              ? 'bg-siphon-accent/20 text-siphon-accent'
              : 'text-text-muted hover:text-text-secondary'
          }`}
          onClick={() => onChange('dice3d')}
          aria-pressed={value === 'dice3d'}
        >
          3D
        </button>
        <button
          className={`px-3 py-1 text-xs font-medium transition-colors ${
            value === 'macro'
              ? 'bg-siphon-accent/20 text-siphon-accent'
              : 'text-text-muted hover:text-text-secondary'
          }`}
          onClick={() => onChange('macro')}
          aria-pressed={value === 'macro'}
        >
          Macro
        </button>
      </div>
    </div>
  );
}
