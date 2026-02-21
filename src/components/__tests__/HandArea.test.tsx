import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
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
});
