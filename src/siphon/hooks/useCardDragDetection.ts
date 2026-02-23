import { useState, useEffect, useRef } from 'react';

/**
 * Detects when a card is being dragged anywhere in the window.
 * Uses the sentinel MIME type `text/x-card-type` set by setCardDragData().
 * @param onDragEnd Optional callback invoked when the drag ends (for component-specific cleanup)
 */
export function useCardDragDetection(onDragEnd?: () => void): boolean {
  const [isCardBeingDragged, setIsCardBeingDragged] = useState(false);
  const onDragEndRef = useRef(onDragEnd);
  useEffect(() => { onDragEndRef.current = onDragEnd; });

  useEffect(() => {
    const handleGlobalDragStart = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes('text/x-card-type')) {
        setIsCardBeingDragged(true);
      }
    };
    const handleGlobalDragEnd = () => {
      setIsCardBeingDragged(false);
      onDragEndRef.current?.();
    };
    window.addEventListener('dragstart', handleGlobalDragStart);
    window.addEventListener('dragend', handleGlobalDragEnd);
    return () => {
      window.removeEventListener('dragstart', handleGlobalDragStart);
      window.removeEventListener('dragend', handleGlobalDragEnd);
    };
  }, []);

  return isCardBeingDragged;
}
