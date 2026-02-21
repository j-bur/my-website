import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { HomeRedirect } from '../../HomeRedirect';
import { useSiphonStore } from '../../../store';

function resetStore() {
  useSiphonStore.setState({
    currentEP: 0,
    focus: 0,
    siphonCapacitance: 0,
    capacitanceTimerStart: null,
    selectedCardIds: [],
    handCardIds: [],
    allies: [],
    allyBestowments: [],
    activeEffects: [],
    echoIntuitionActive: false,
  });
}

describe('HomeRedirect', () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    cleanup();
  });

  it('redirects to /deck-builder when no cards selected', () => {
    const router = createMemoryRouter(
      [
        { path: '/', element: <HomeRedirect /> },
        { path: '/deck-builder', element: <div>Deck Builder</div> },
        { path: '/combat', element: <div>Combat</div> },
      ],
      { initialEntries: ['/'] }
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByText('Deck Builder')).toBeInTheDocument();
  });

  it('redirects to /combat when cards are selected', () => {
    useSiphonStore.setState({
      selectedCardIds: ['subtle-luck'],
    });

    const router = createMemoryRouter(
      [
        { path: '/', element: <HomeRedirect /> },
        { path: '/deck-builder', element: <div>Deck Builder</div> },
        { path: '/combat', element: <div>Combat</div> },
      ],
      { initialEntries: ['/'] }
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByText('Combat')).toBeInTheDocument();
  });
});
