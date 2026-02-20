import { useCharacterStore } from '../../store';

export function CharacterSetup() {
  const {
    name, setName,
    level, setLevel,
    maxHP, setMaxHP,
    spellSaveDC, setSpellSaveDC,
    proficiencyBonus
  } = useCharacterStore();

  return (
    <div className="bg-siphon-surface border border-siphon-border rounded-lg p-4">
      <h2 className="text-lg font-medium text-text-primary mb-4">Character</h2>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm text-text-secondary mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-siphon-bg border border-siphon-border rounded text-text-primary focus:border-siphon-accent focus:outline-none"
          />
        </div>

        {/* Level */}
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            Level <span className="text-text-muted">(PB: +{proficiencyBonus})</span>
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={level}
            onChange={(e) => setLevel(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 bg-siphon-bg border border-siphon-border rounded text-text-primary focus:border-siphon-accent focus:outline-none"
          />
        </div>

        {/* Max HP */}
        <div>
          <label className="block text-sm text-text-secondary mb-1">Max HP</label>
          <input
            type="number"
            min={1}
            value={maxHP}
            onChange={(e) => setMaxHP(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 bg-siphon-bg border border-siphon-border rounded text-text-primary focus:border-siphon-accent focus:outline-none"
          />
        </div>

        {/* Spell Save DC */}
        <div>
          <label className="block text-sm text-text-secondary mb-1">Spell Save DC</label>
          <input
            type="number"
            min={8}
            max={30}
            value={spellSaveDC}
            onChange={(e) => setSpellSaveDC(parseInt(e.target.value) || 13)}
            className="w-full px-3 py-2 bg-siphon-bg border border-siphon-border rounded text-text-primary focus:border-siphon-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 pt-4 border-t border-siphon-border">
        <p className="text-xs text-text-muted">
          Max EP: {level} • Cards: {proficiencyBonus}
        </p>
      </div>
    </div>
  );
}
