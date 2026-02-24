import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { LandingPage } from './landing/LandingPage.tsx'
import { SiphonLayout } from './siphon/components/SiphonLayout.tsx'
import { CombatHUD } from './siphon/components/combat-hud'
import { DeckBuilder } from './siphon/components/deck-builder'

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      {
        element: <SiphonLayout />,
        children: [
          { path: 'combat', element: <CombatHUD /> },
          { path: 'deck-builder', element: <DeckBuilder /> },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
