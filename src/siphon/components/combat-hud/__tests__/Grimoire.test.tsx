import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { Grimoire } from '../Grimoire';
import { FEATURE_MAP } from '../../../data/featureConstants';

function renderWithRouter(ui: React.ReactElement) {
  const router = createMemoryRouter(
    [
      { path: '/', element: ui },
      { path: '/deck-builder', element: <div data-testid="deck-builder">Deck Builder</div> },
    ],
    { initialEntries: ['/'] }
  );
  return render(<RouterProvider router={router} />);
}

describe('Grimoire', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the grimoire with accessible label', () => {
    renderWithRouter(<Grimoire />);

    expect(
      screen.getByRole('button', { name: /open siphon features/i })
    ).toBeInTheDocument();
  });

  it('displays the feature count from FEATURE_MAP', () => {
    renderWithRouter(<Grimoire />);

    expect(screen.getByText(String(FEATURE_MAP.size))).toBeInTheDocument();
  });

  it('shows "Siphon Features" title on the cover', () => {
    renderWithRouter(<Grimoire />);

    expect(screen.getByText('Siphon')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
  });

  it('navigates to /deck-builder on click', () => {
    renderWithRouter(<Grimoire />);

    fireEvent.click(screen.getByRole('button', { name: /open siphon features/i }));

    expect(screen.getByTestId('deck-builder')).toBeInTheDocument();
  });

  it('has a hover title for tooltip', () => {
    renderWithRouter(<Grimoire />);

    expect(
      screen.getByRole('button', { name: /open siphon features/i })
    ).toHaveAttribute('title', 'Browse Siphon Features');
  });
});
