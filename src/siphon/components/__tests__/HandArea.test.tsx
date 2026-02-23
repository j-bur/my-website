import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { HandArea } from '../combat-hud/HandArea';
import { useSiphonStore, useSettingsStore } from '../../store';

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

  // --- Drag-and-drop ---

  it('bestows to self when deck card is dropped on hand', () => {
    // Use gravity-well (Bonus Action activation) so it stays in hand after bestow
    useSiphonStore.setState({
      selectedCardIds: ['gravity-well', 'temporal-surge'],
    });

    render(<HandArea />);

    const handArea = screen.getByRole('list', { name: /hand \(empty\)/i });
    fireEvent.dragOver(handArea, {
      dataTransfer: { types: ['text/x-card-type'] },
    });
    fireEvent.drop(handArea, {
      dataTransfer: {
        types: ['text/x-card-type', 'application/json'],
        getData: () => JSON.stringify({ type: 'card', featureId: 'gravity-well', source: 'deck' }),
      },
    });

    const state = useSiphonStore.getState();
    expect(state.handCardIds).toContain('gravity-well');
  });

  it('auto-activates None-activation cards on drop (deducts EP)', () => {
    // subtle-luck has activation: 'None', cost: 2
    useSiphonStore.setState({
      currentEP: 10,
      selectedCardIds: ['subtle-luck', 'temporal-surge'],
    });

    render(<HandArea />);

    const handArea = screen.getByRole('list', { name: /hand \(empty\)/i });
    fireEvent.drop(handArea, {
      dataTransfer: {
        types: ['text/x-card-type', 'application/json'],
        getData: () => JSON.stringify({ type: 'card', featureId: 'subtle-luck', source: 'deck' }),
      },
    });

    // EP should be deducted (activation happened)
    expect(useSiphonStore.getState().currentEP).toBeLessThan(10);
  });

  it('hand cards have draggable attribute', () => {
    useSiphonStore.setState({
      handCardIds: ['subtle-luck'],
    });

    render(<HandArea />);

    expect(screen.getByLabelText('Subtle Luck').getAttribute('draggable')).toBe('true');
  });

  it('special cost hand cards NOT draggable when ally selected', () => {
    // recursion has isSpecialCost: true
    useSiphonStore.setState({
      handCardIds: ['recursion'],
      allies: [{ id: 'a1', name: 'Briar' }],
    });

    render(<HandArea selectedAllyId="a1" />);

    expect(screen.getByLabelText('Recursion').getAttribute('draggable')).not.toBe('true');
  });

  it('centers cards with justify-center', () => {
    useSiphonStore.setState({
      handCardIds: ['subtle-luck', 'temporal-surge'],
    });

    render(<HandArea />);

    const cardRow = screen.getByRole('list', { name: /hand: 2 cards/i });
    expect(cardRow.className).toContain('justify-center');
  });

  it('renders many cards without error', () => {
    // Supercapacitance scenario: 8 cards in hand
    useSiphonStore.setState({
      handCardIds: [
        'subtle-luck', 'temporal-surge', 'echo-relocation',
        'reject-fate', 'resonant-weapon', 'altered-form',
        'paracast', 'superconduction',
      ],
    });

    render(<HandArea />);

    expect(screen.getByRole('list', { name: /hand: 8 cards/i })).toBeInTheDocument();
    expect(screen.getByText('Subtle Luck')).toBeInTheDocument();
    expect(screen.getByText('Superconduction')).toBeInTheDocument();
  });

  it('does not highlight when highlightDropTargets is false', () => {
    useSettingsStore.getState().setHighlightDropTargets(false);
    useSiphonStore.setState({
      handCardIds: ['subtle-luck'],
    });

    const { container } = render(<HandArea />);

    // Simulate a global dragstart to set isCardBeingDragged
    const dragStartEvent = new Event('dragstart', { bubbles: true });
    Object.defineProperty(dragStartEvent, 'dataTransfer', {
      value: { types: ['text/x-card-type'] },
    });
    window.dispatchEvent(dragStartEvent);

    // Should NOT have the ambient highlight ring class
    const wrapper = container.firstElementChild!;
    expect(wrapper.className).not.toContain('ring-ep-positive/30');
  });
});
