import { Navigate } from 'react-router-dom';
import { useSiphonStore } from '../store';

export function HomeRedirect() {
  const hasCards = useSiphonStore((s) => s.selectedCardIds.length > 0);
  return <Navigate to={hasCards ? '/combat' : '/deck-builder'} replace />;
}
