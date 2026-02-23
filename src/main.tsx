import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { HomeRedirect } from './siphon/components/HomeRedirect.tsx'
import { CombatHUD } from './siphon/components/combat-hud'
import { DeckBuilder } from './siphon/components/deck-builder'

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomeRedirect /> },
      { path: 'combat', element: <CombatHUD /> },
      { path: 'deck-builder', element: <DeckBuilder /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
