import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { DeckBuilder } from '../DeckBuilder';
import { useSiphonStore, useCharacterStore, useSettingsStore, useManifoldStore } from '../../../store';

function resetStores() {
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
  useCharacterStore.setState({
    level: 5,
    proficiencyBonus: 3,
    maxHP: 45,
    currentHP: 45,
    reducedMaxHP: 45,
    hitDice: 5,
    maxHitDice: 5,
  });
  useManifoldStore.setState({
    motes: 8,
    phaseSwitchAvailable: true,
  });
  useSettingsStore.setState({
    diceMode: {
      wildSurge: 'dice3d',
      siphonFeature: 'macro',
      phaseAbility: 'macro',
      longRestFocus: 'dice3d',
    },
  });
}

function renderWithRouter() {
  const router = createMemoryRouter(
    [{ path: '/', element: <DeckBuilder /> }],
    { initialEntries: ['/'] }
  );
  return render(<RouterProvider router={router} />);
}

describe('DeckBuilder', () => {
  beforeEach(() => {
    resetStores();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders CharacterHeader, CollectionGrid, and SelectedPanel', () => {
    renderWithRouter();

    // CharacterHeader: Level input
    expect(screen.getByLabelText('Level')).toBeInTheDocument();

    // CollectionGrid: feature cards
    expect(screen.getByLabelText('Subtle Luck')).toBeInTheDocument();

    // SelectedPanel: counter
    expect(screen.getByText('Selected (0/3)')).toBeInTheDocument();
  });

  it('full flow: select a card, see it in SelectedPanel, deselect it', () => {
    renderWithRouter();

    // Initially 0 selected
    expect(screen.getByText('Selected (0/3)')).toBeInTheDocument();

    // Click a card in the collection to select it
    const card = screen.getByLabelText('Subtle Luck');
    fireEvent.click(card);

    // Counter updates
    expect(screen.getByText('Selected (1/3)')).toBeInTheDocument();

    // The card should appear in the SelectedPanel (compact version)
    // There should now be 2 elements with this label: one in grid, one in panel
    const allCards = screen.getAllByLabelText('Subtle Luck');
    expect(allCards.length).toBe(2);

    // Click the compact card in SelectedPanel to deselect
    // The second one is the compact card in the panel
    fireEvent.click(allCards[1]);

    // Back to 0
    expect(screen.getByText('Selected (0/3)')).toBeInTheDocument();
  });

  it('shows filter and search controls', () => {
    renderWithRouter();

    expect(screen.getByLabelText('Filter by tag')).toBeInTheDocument();
    expect(screen.getByLabelText('Search by name')).toBeInTheDocument();
  });

  it('shows rest and combat buttons', () => {
    renderWithRouter();

    expect(screen.getByRole('button', { name: 'Short Rest' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Long Rest' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enter Combat' })).toBeInTheDocument();
  });
});
