import { useState, useRef } from 'react';
import { useCharacterStore } from '../../store';
import { exportAllState, importAllState, resetAllStores, resetSession } from '../../utils/dataExport';

export function DataManagement() {
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pb = useCharacterStore((s) => s.proficiencyBonus);

  const handleExport = () => {
    const json = exportAllState();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `siphon-interface-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(false);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = importAllState(ev.target?.result as string);
      if (result.success) {
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      } else {
        setImportError(result.error ?? 'Unknown error');
      }
    };
    reader.readAsText(file);

    // Reset file input so the same file can be re-imported
    e.target.value = '';
  };

  const handleResetSession = () => {
    resetSession(pb);
  };

  const handleClearAll = () => {
    if (!confirmingClear) {
      setConfirmingClear(true);
      return;
    }
    resetAllStores();
    setConfirmingClear(false);
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <button
          className="px-3 py-1.5 text-xs font-medium rounded border border-siphon-border text-text-secondary hover:text-text-primary hover:border-text-muted transition-colors"
          onClick={handleExport}
        >
          Export Data
        </button>
        <button
          className="px-3 py-1.5 text-xs font-medium rounded border border-siphon-border text-text-secondary hover:text-text-primary hover:border-text-muted transition-colors"
          onClick={handleImport}
        >
          Import Data
        </button>
        <button
          className="px-3 py-1.5 text-xs font-medium rounded border border-siphon-border text-text-secondary hover:text-text-primary hover:border-text-muted transition-colors"
          onClick={handleResetSession}
        >
          Reset Session
        </button>
        <button
          className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
            confirmingClear
              ? 'border-ep-negative text-ep-negative hover:bg-ep-negative/10'
              : 'border-siphon-border text-text-secondary hover:text-text-primary hover:border-text-muted'
          }`}
          onClick={handleClearAll}
          onBlur={() => setConfirmingClear(false)}
        >
          {confirmingClear ? 'Are you sure?' : 'Clear All Data'}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileSelected}
        data-testid="file-input"
      />

      {importError && (
        <p className="text-xs text-ep-negative">{importError}</p>
      )}
      {importSuccess && (
        <p className="text-xs text-ep-positive">Data imported successfully</p>
      )}
    </div>
  );
}
