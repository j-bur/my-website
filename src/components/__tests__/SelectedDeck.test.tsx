import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SelectedDeck } from '../combat-hud/SelectedDeck';
import { useSiphonStore } from '../../store';

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

describe('SelectedDeck', () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows deck with card count', () => {
    useSiphonStore.setState({
      selectedCardIds: ['subtle-luck', 'temporal-surge', 'echo-relocation'],
    });

    render(<SelectedDeck />);

    expect(screen.getByRole('button', { name: /selected deck: 3 cards/i })).toBeInTheDocument();
  });

  it('shows 0 count when deck is empty', () => {
    render(<SelectedDeck />);

    expect(screen.getByRole('button', { name: /selected deck: 0 cards/i })).toBeInTheDocument();
  });

  it('expands on click to show deck cards', () => {
    useSiphonStore.setState({
      selectedCardIds: ['subtle-luck', 'temporal-surge'],
    });

    render(<SelectedDeck />);

    fireEvent.click(screen.getByRole('button', { name: /selected deck/i }));

    expect(screen.getByText('Subtle Luck')).toBeInTheDocument();
    expect(screen.getByText('Temporal Surge')).toBeInTheDocument();
  });

  it('collapses on second click', () => {
    useSiphonStore.setState({
      selectedCardIds: ['subtle-luck'],
    });

    render(<SelectedDeck />);

    const deckButton = screen.getByRole('button', { name: /selected deck/i });
    fireEvent.click(deckButton);
    expect(screen.getByText('Subtle Luck')).toBeInTheDocument();

    fireEvent.click(deckButton);
    expect(screen.queryByText('Subtle Luck')).not.toBeInTheDocument();
  });

  it('collapses on Escape key', () => {
    useSiphonStore.setState({
      selectedCardIds: ['subtle-luck'],
    });

    render(<SelectedDeck />);

    fireEvent.click(screen.getByRole('button', { name: /selected deck/i }));
    expect(screen.getByText('Subtle Luck')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Subtle Luck')).not.toBeInTheDocument();
  });

  it('does NOT show cards already in hand', () => {
    useSiphonStore.setState({
      selectedCardIds: ['subtle-luck', 'temporal-surge'],
      handCardIds: ['subtle-luck'],
    });

    render(<SelectedDeck />);

    fireEvent.click(screen.getByRole('button', { name: /selected deck/i }));

    // Only temporal-surge should be visible (subtle-luck is in hand)
    expect(screen.getByText('Temporal Surge')).toBeInTheDocument();
    expect(screen.queryByText('Subtle Luck')).not.toBeInTheDocument();
  });

  it('clicking a card calls bestowToSelf and moves card to hand', () => {
    useSiphonStore.setState({
      selectedCardIds: ['subtle-luck', 'temporal-surge'],
    });

    render(<SelectedDeck />);

    fireEvent.click(screen.getByRole('button', { name: /selected deck/i }));
    fireEvent.click(screen.getByLabelText('Subtle Luck'));

    const state = useSiphonStore.getState();
    expect(state.handCardIds).toContain('subtle-luck');
    expect(state.selectedCardIds).not.toContain('subtle-luck');
  });

  it('deck count excludes hand cards and triggered features', () => {
    useSiphonStore.setState({
      selectedCardIds: ['subtle-luck', 'temporal-surge'],
      handCardIds: ['subtle-luck'],
    });

    render(<SelectedDeck />);

    // Only temporal-surge is in the deck (subtle-luck is in hand)
    expect(screen.getByRole('button', { name: /selected deck: 1 cards/i })).toBeInTheDocument();
  });

  // --- Activation:None auto-activate ---

  it('calls onActivateCard for Activation:None features after bestow', () => {
    // 'subtle-luck' has activation: 'None'
    useSiphonStore.setState({
      selectedCardIds: ['subtle-luck', 'temporal-surge'],
    });

    const onActivateCard = vi.fn();
    render(<SelectedDeck onActivateCard={onActivateCard} />);

    fireEvent.click(screen.getByRole('button', { name: /selected deck/i }));
    fireEvent.click(screen.getByLabelText('Subtle Luck'));

    expect(onActivateCard).toHaveBeenCalledWith('subtle-luck');
  });

  it('does NOT call onActivateCard for non-None activation features', () => {
    // 'gravity-well' has activation: 'Bonus Action'
    useSiphonStore.setState({
      selectedCardIds: ['gravity-well', 'temporal-surge'],
    });

    const onActivateCard = vi.fn();
    render(<SelectedDeck onActivateCard={onActivateCard} />);

    fireEvent.click(screen.getByRole('button', { name: /selected deck/i }));
    fireEvent.click(screen.getByLabelText('Gravity Well'));

    expect(onActivateCard).not.toHaveBeenCalled();
  });

  // --- While Selected protection ---

  it('renders While Selected features as unplayable in expanded deck', () => {
    // 'siphon-greed' has duration: 'While Selected'
    useSiphonStore.setState({
      selectedCardIds: ['siphon-greed', 'subtle-luck'],
    });

    render(<SelectedDeck />);

    fireEvent.click(screen.getByRole('button', { name: /selected deck/i }));

    // Both should be visible
    expect(screen.getByLabelText('Siphon Greed')).toBeInTheDocument();
    expect(screen.getByLabelText('Subtle Luck')).toBeInTheDocument();
  });

  it('does NOT bestow While Selected features on click', () => {
    useSiphonStore.setState({
      selectedCardIds: ['siphon-greed', 'subtle-luck'],
    });

    render(<SelectedDeck />);

    fireEvent.click(screen.getByRole('button', { name: /selected deck/i }));
    fireEvent.click(screen.getByLabelText('Siphon Greed'));

    const state = useSiphonStore.getState();
    // siphon-greed should still be in selected, not moved to hand
    expect(state.selectedCardIds).toContain('siphon-greed');
    expect(state.handCardIds).not.toContain('siphon-greed');
  });
});
