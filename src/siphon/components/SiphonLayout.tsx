import { Outlet } from 'react-router-dom';
import { useReducedMotion } from '../hooks/useReducedMotion';

/** Layout wrapper for siphon routes — applies bg and reduce-motion class */
export function SiphonLayout() {
  const skipAnimations = useReducedMotion();
  return (
    <div className={`min-h-screen bg-siphon-bg${skipAnimations ? ' reduce-motion' : ''}`}>
      <Outlet />
    </div>
  );
}
