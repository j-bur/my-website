export interface CardDragData {
  type: 'card';
  featureId: string;
  source: 'deck' | 'hand';
}

/** Set card drag data on a DataTransfer object */
export function setCardDragData(dt: DataTransfer, data: CardDragData): void {
  dt.setData('application/json', JSON.stringify(data));
  dt.setData('text/x-card-type', data.type);
  dt.effectAllowed = 'move';
}

/** Read card drag data from a DataTransfer object (only works on drop, not dragover) */
export function getCardDragData(dt: DataTransfer): CardDragData | null {
  try {
    const json = dt.getData('application/json');
    const data = JSON.parse(json);
    if (data?.type === 'card' && typeof data.featureId === 'string') {
      return data as CardDragData;
    }
  } catch { /* ignore parse errors */ }
  return null;
}

/** Check during dragover (when getData is restricted) if this is a card drag */
export function isCardDrag(dt: DataTransfer): boolean {
  return dt.types.includes('text/x-card-type');
}

/**
 * Module-level state for the currently dragged card.
 * Needed because dragover events restrict getData() access —
 * the drop target can't read drag data during dragover.
 * Set in onDragStart, cleared in onDragEnd.
 */
let _activeDragData: CardDragData | null = null;

export function setActiveDragData(data: CardDragData | null): void {
  _activeDragData = data;
}

export function getActiveDragData(): CardDragData | null {
  return _activeDragData;
}
