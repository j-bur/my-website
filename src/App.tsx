import { Outlet } from 'react-router-dom';
import { useReducedMotion } from './siphon/hooks/useReducedMotion';

function App() {
  const skipAnimations = useReducedMotion();

  return (
    <div className={`min-h-screen bg-siphon-bg text-white${skipAnimations ? ' reduce-motion' : ''}`}>
      <Outlet />
    </div>
  );
}

export default App;
