import type { ActivationType } from '../../types';

export interface FilterState {
  search: string;
  activationType: ActivationType | 'all';
  costRange: 'all' | 'low' | 'medium' | 'high';
  showSpecialOnly: boolean;
}

interface FilterControlsProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export function FilterControls({ filters, onChange }: FilterControlsProps) {
  const update = (partial: Partial<FilterState>) => {
    onChange({ ...filters, ...partial });
  };

  return (
    <div className="bg-siphon-surface border border-siphon-border rounded-lg p-4">
      <h2 className="text-lg font-medium text-text-primary mb-4">Filters</h2>

      <div className="space-y-4">
        {/* Search */}
        <div>
          <label className="block text-sm text-text-secondary mb-1">Search</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="Feature name..."
            className="w-full px-3 py-2 bg-siphon-bg border border-siphon-border rounded text-text-primary placeholder:text-text-muted focus:border-siphon-accent focus:outline-none"
          />
        </div>

        {/* Activation Type */}
        <div>
          <label className="block text-sm text-text-secondary mb-1">Activation</label>
          <select
            value={filters.activationType}
            onChange={(e) => update({ activationType: e.target.value as FilterState['activationType'] })}
            className="w-full px-3 py-2 bg-siphon-bg border border-siphon-border rounded text-text-primary focus:border-siphon-accent focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="None">None (Passive)</option>
            <option value="Action">Action</option>
            <option value="Bonus Action">Bonus Action</option>
            <option value="Reaction">Reaction</option>
          </select>
        </div>

        {/* Special Cost Only */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="specialOnly"
            checked={filters.showSpecialOnly}
            onChange={(e) => update({ showSpecialOnly: e.target.checked })}
            className="w-4 h-4 rounded border-siphon-border bg-siphon-bg text-siphon-accent focus:ring-siphon-accent"
          />
          <label htmlFor="specialOnly" className="text-sm text-text-secondary">
            Special Cost (*) Only
          </label>
        </div>

        {/* Clear Filters */}
        <button
          onClick={() => onChange({
            search: '',
            activationType: 'all',
            costRange: 'all',
            showSpecialOnly: false
          })}
          className="w-full py-2 text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
