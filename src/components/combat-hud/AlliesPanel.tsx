import { useState, useRef, useEffect, useCallback } from 'react';
import { useSiphonStore, useSettingsStore } from '../../store';
import { getCardDragData, isCardDrag } from '../../types/dragData';
import { FEATURE_MAP } from '../../data/featureConstants';

interface AlliesPanelProps {
  selectedAllyId: string | null;
  onSelectAlly: (allyId: string | null) => void;
  onHoverAlly?: (allyId: string | null) => void;
}

export function AlliesPanel({ selectedAllyId, onSelectAlly, onHoverAlly }: AlliesPanelProps) {
  const allies = useSiphonStore((s) => s.allies);
  const allyBestowments = useSiphonStore((s) => s.allyBestowments);
  const addAlly = useSiphonStore((s) => s.addAlly);
  const removeAlly = useSiphonStore((s) => s.removeAlly);
  const renameAlly = useSiphonStore((s) => s.renameAlly);
  const bestowToAlly = useSiphonStore((s) => s.bestowToAlly);
  const highlightDropTargets = useSettingsStore((s) => s.highlightDropTargets);

  const [isAddingAlly, setIsAddingAlly] = useState(false);
  const [newAllyName, setNewAllyName] = useState('');
  const [renamingAllyId, setRenamingAllyId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [chipDragOver, setChipDragOver] = useState<string | null>(null);
  const [isCardBeingDragged, setIsCardBeingDragged] = useState(false);

  const addInputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback((allyId: string) => {
    if (!onHoverAlly) return;
    hoverTimerRef.current = setTimeout(() => {
      onHoverAlly(allyId);
    }, 500);
  }, [onHoverAlly]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  // Global drag listeners for ambient drop zone highlighting
  useEffect(() => {
    const handleGlobalDragStart = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes('text/x-card-type')) {
        setIsCardBeingDragged(true);
      }
    };
    const handleGlobalDragEnd = () => {
      setIsCardBeingDragged(false);
      setChipDragOver(null);
    };
    window.addEventListener('dragstart', handleGlobalDragStart);
    window.addEventListener('dragend', handleGlobalDragEnd);
    return () => {
      window.removeEventListener('dragstart', handleGlobalDragStart);
      window.removeEventListener('dragend', handleGlobalDragEnd);
    };
  }, []);

  useEffect(() => {
    if (isAddingAlly && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [isAddingAlly]);

  useEffect(() => {
    if (renamingAllyId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingAllyId]);

  const bestowmentCounts = new Map<string, number>();
  for (const b of allyBestowments) {
    bestowmentCounts.set(b.allyId, (bestowmentCounts.get(b.allyId) ?? 0) + 1);
  }

  const handleAddConfirm = () => {
    const trimmed = newAllyName.trim();
    if (trimmed) {
      addAlly(trimmed);
    }
    setNewAllyName('');
    setIsAddingAlly(false);
  };

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddConfirm();
    } else if (e.key === 'Escape') {
      setNewAllyName('');
      setIsAddingAlly(false);
    }
  };

  const handleRenameStart = (allyId: string, currentName: string) => {
    setRenamingAllyId(allyId);
    setRenameValue(currentName);
  };

  const handleRenameConfirm = () => {
    if (renamingAllyId) {
      const trimmed = renameValue.trim();
      if (trimmed) {
        renameAlly(renamingAllyId, trimmed);
      }
    }
    setRenamingAllyId(null);
    setRenameValue('');
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameConfirm();
    } else if (e.key === 'Escape') {
      setRenamingAllyId(null);
      setRenameValue('');
    }
  };

  const handleRemove = (allyId: string) => {
    if (selectedAllyId === allyId) {
      onSelectAlly(null);
    }
    removeAlly(allyId);
  };

  const handleAllyClick = (allyId: string) => {
    if (renamingAllyId === allyId) return;
    onSelectAlly(selectedAllyId === allyId ? null : allyId);
  };

  const handleChipDragOver = (e: React.DragEvent, allyId: string) => {
    if (isCardDrag(e.dataTransfer)) {
      e.preventDefault();
      setChipDragOver(allyId);
    }
  };

  const handleChipDragLeave = () => {
    setChipDragOver(null);
  };

  const handleChipDrop = (e: React.DragEvent, allyId: string) => {
    e.preventDefault();
    setChipDragOver(null);
    const data = getCardDragData(e.dataTransfer);
    if (data?.source === 'deck') {
      const feature = FEATURE_MAP.get(data.featureId);
      if (feature && !feature.isSpecialCost) {
        bestowToAlly(data.featureId, allyId);
        onSelectAlly(null);
      }
    }
  };

  return (
    <div
      className="flex items-center gap-2 px-2 py-1 border border-siphon-border/30 rounded-lg bg-siphon-surface/20 min-h-8 flex-wrap"
      role="region"
      aria-label="Allies"
    >
      <span className="text-[10px] uppercase tracking-widest text-text-muted">
        Allies:
      </span>

      {allies.map((ally) => {
        const count = bestowmentCounts.get(ally.id) ?? 0;
        const isSelected = selectedAllyId === ally.id;
        const isRenaming = renamingAllyId === ally.id;
        const isDraggedOver = chipDragOver === ally.id;
        const showAmbientHighlight = highlightDropTargets && isCardBeingDragged && !isDraggedOver;

        return (
          <div
            key={ally.id}
            className={`
              group inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs
              transition-all cursor-pointer
              ${isSelected
                ? 'bg-ep-positive/20 border border-ep-positive/60 text-ep-positive'
                : 'bg-siphon-surface/40 border border-siphon-border/40 text-text-primary hover:border-siphon-border/80'
              }
              ${isDraggedOver ? 'ring-2 ring-ep-positive/60 scale-105' : ''}
              ${showAmbientHighlight ? 'ring-1 ring-ep-positive/20' : ''}
            `}
            role="button"
            aria-label={`${ally.name}${count > 0 ? ` (${count} bestowed)` : ''}${isSelected ? ' (selected as bestow target)' : ''}`}
            aria-pressed={isSelected}
            onClick={() => handleAllyClick(ally.id)}
            onMouseEnter={() => handleMouseEnter(ally.id)}
            onMouseLeave={handleMouseLeave}
            onDragOver={(e) => handleChipDragOver(e, ally.id)}
            onDragLeave={handleChipDragLeave}
            onDrop={(e) => handleChipDrop(e, ally.id)}
          >
            {isRenaming ? (
              <input
                ref={renameInputRef}
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={handleRenameConfirm}
                onKeyDown={handleRenameKeyDown}
                onClick={(e) => e.stopPropagation()}
                className="bg-transparent border-b border-text-primary text-text-primary text-xs w-20 outline-none"
                aria-label="Rename ally"
              />
            ) : (
              <span className="select-none">{ally.name}</span>
            )}

            {count > 0 && !isRenaming && (
              <span className="text-text-muted">({count})</span>
            )}

            {/* Rename button - visible on hover */}
            {!isRenaming && (
              <button
                className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-text-muted hover:text-text-primary transition-opacity ml-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRenameStart(ally.id, ally.name);
                }}
                aria-label={`Rename ${ally.name}`}
                title="Rename"
              >
                &#x270E;
              </button>
            )}

            {/* Remove button - visible on hover */}
            {!isRenaming && (
              <button
                className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-text-muted hover:text-ep-negative transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(ally.id);
                }}
                aria-label={`Remove ${ally.name}`}
                title="Remove"
              >
                &#x2715;
              </button>
            )}
          </div>
        );
      })}

      {/* Add ally button / inline input */}
      {isAddingAlly ? (
        <div className="inline-flex items-center gap-1">
          <input
            ref={addInputRef}
            type="text"
            value={newAllyName}
            onChange={(e) => setNewAllyName(e.target.value)}
            onBlur={handleAddConfirm}
            onKeyDown={handleAddKeyDown}
            placeholder="Ally name..."
            className="bg-transparent border-b border-siphon-border text-text-primary text-xs w-24 outline-none placeholder:text-text-muted/50"
            aria-label="New ally name"
          />
        </div>
      ) : (
        <button
          className="inline-flex items-center justify-center w-6 h-6 rounded border border-siphon-border/40 text-text-muted hover:border-siphon-accent/50 hover:text-siphon-accent transition-colors text-xs"
          onClick={() => setIsAddingAlly(true)}
          aria-label="Add ally"
        >
          +
        </button>
      )}
    </div>
  );
}
