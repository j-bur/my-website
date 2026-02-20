import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/landing/LandingPage';
import { DeckBuilder } from './components/deck-builder/DeckBuilder';
import { CombatHUD } from './components/combat-hud/CombatHUD';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/deck-builder" element={<DeckBuilder />} />
        <Route path="/combat" element={<CombatHUD />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
