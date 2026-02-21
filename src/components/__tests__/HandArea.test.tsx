import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { HandArea } from '../combat-hud/HandArea';
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

describe('HandArea', () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows empty state when no cards in hand', () => {
    render(<HandArea />);
    expect(screen.getByText(/no cards in hand/i)).toBeInTheDocument();
  });

  it('shows hand cards from getHandCards()', () => {
    useSiphonStore.setState({
      handCardIds: ['subtle-luck', 'temporal-surge'],
    });

    render(<HandArea />);

    expect(screen.getByText('Subtle Luck')).toBeInTheDocument();
    expect(screen.getByText('Temporal Surge')).toBeInTheDocument();
  });

  it('includes triggered features that are selected', () => {
    // "discharge" has duration 'Triggered' — it should appear in hand
    // when it's in selectedCardIds (per getHandCards logic)
    useSiphonStore.setState({
      selectedCardIds: ['discharge'],
      handCardIds: [],
    });

    render(<HandArea />);

    expect(screen.getByText('Discharge')).toBeInTheDocument();
  });

  it('displays correct card count in aria label', () => {
    useSiphonStore.setState({
      handCardIds: ['subtle-luck', 'temporal-surge', 'echo-relocation'],
    });

    render(<HandArea />);

    expect(screen.getByRole('list', { name: /hand: 3 cards/i })).toBeInTheDocument();
  });

  it('bestows hand card to ally when ally is selected and card is clicked', () => {
    useSiphonStore.setState({
      handCardIds: ['subtle-luck'],
      allies: [{ id: 'a1', name: 'Briar' }],
    });

    const onAllyBestowed = vi.fn();
    render(
      <HandArea
        selectedAllyId="a1"
        onAllyBestowed={onAllyBestowed}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Subtle Luck' }));

    const state = useSiphonStore.getState();
    expect(state.allyBestowments).toHaveLength(1);
    expect(state.allyBestowments[0].featureId).toBe('subtle-luck');
    expect(state.allyBestowments[0].allyId).toBe('a1');
    expect(onAllyBestowed).toHaveBeenCalled();
  });

  it('shows instruction text when ally is selected', () => {
    useSiphonStore.setState({
      handCardIds: ['subtle-luck'],
    });

    render(<HandArea selectedAllyId="a1" />);

    expect(screen.getByText(/click a card to bestow to ally/i)).toBeInTheDocument();
  });
});
