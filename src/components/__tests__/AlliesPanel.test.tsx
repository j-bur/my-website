import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { AlliesPanel } from '../combat-hud/AlliesPanel';
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

describe('AlliesPanel', () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders empty allies panel with add button', () => {
    render(<AlliesPanel selectedAllyId={null} onSelectAlly={vi.fn()} />);

    expect(screen.getByText('Allies:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add ally/i })).toBeInTheDocument();
  });

  it('adds a new ally via [+] button and name input', () => {
    render(<AlliesPanel selectedAllyId={null} onSelectAlly={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /add ally/i }));

    const input = screen.getByLabelText(/new ally name/i);
    fireEvent.change(input, { target: { value: 'Briar' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    const state = useSiphonStore.getState();
    expect(state.allies).toHaveLength(1);
    expect(state.allies[0].name).toBe('Briar');
  });

  it('renders ally chips with names', () => {
    useSiphonStore.setState({
      allies: [
        { id: 'a1', name: 'Briar' },
        { id: 'a2', name: 'Asmo' },
      ],
    });

    render(<AlliesPanel selectedAllyId={null} onSelectAlly={vi.fn()} />);

    expect(screen.getByText('Briar')).toBeInTheDocument();
    expect(screen.getByText('Asmo')).toBeInTheDocument();
  });

  it('shows bestowed card count badge', () => {
    useSiphonStore.setState({
      allies: [{ id: 'a1', name: 'Briar' }],
      allyBestowments: [
        { id: 'b1', allyId: 'a1', featureId: 'subtle-luck', isFromSelectedDeck: true, bestowedAt: 1 },
        { id: 'b2', allyId: 'a1', featureId: 'temporal-surge', isFromSelectedDeck: true, bestowedAt: 2 },
      ],
    });

    render(<AlliesPanel selectedAllyId={null} onSelectAlly={vi.fn()} />);

    expect(screen.getByText('(2)')).toBeInTheDocument();
  });

  it('selects ally as bestow target on click', () => {
    useSiphonStore.setState({
      allies: [{ id: 'a1', name: 'Briar' }],
    });

    const onSelectAlly = vi.fn();
    render(<AlliesPanel selectedAllyId={null} onSelectAlly={onSelectAlly} />);

    fireEvent.click(screen.getByRole('button', { name: 'Briar' }));

    expect(onSelectAlly).toHaveBeenCalledWith('a1');
  });

  it('deselects ally on second click', () => {
    useSiphonStore.setState({
      allies: [{ id: 'a1', name: 'Briar' }],
    });

    const onSelectAlly = vi.fn();
    render(<AlliesPanel selectedAllyId="a1" onSelectAlly={onSelectAlly} />);

    fireEvent.click(screen.getByRole('button', { name: /briar.*selected as bestow target/i }));

    expect(onSelectAlly).toHaveBeenCalledWith(null);
  });

  it('highlights selected ally', () => {
    useSiphonStore.setState({
      allies: [{ id: 'a1', name: 'Briar' }],
    });

    render(<AlliesPanel selectedAllyId="a1" onSelectAlly={vi.fn()} />);

    const chip = screen.getByRole('button', { name: /briar.*selected as bestow target/i });
    expect(chip).toHaveAttribute('aria-pressed', 'true');
  });

  it('removes ally and clears their bestowments (RULE-ALLY-002)', () => {
    useSiphonStore.setState({
      allies: [
        { id: 'a1', name: 'Briar' },
        { id: 'a2', name: 'Asmo' },
      ],
      allyBestowments: [
        { id: 'b1', allyId: 'a1', featureId: 'subtle-luck', isFromSelectedDeck: true, bestowedAt: 1 },
        { id: 'b2', allyId: 'a2', featureId: 'temporal-surge', isFromSelectedDeck: true, bestowedAt: 2 },
      ],
    });

    render(<AlliesPanel selectedAllyId={null} onSelectAlly={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /remove briar/i }));

    const state = useSiphonStore.getState();
    expect(state.allies).toHaveLength(1);
    expect(state.allies[0].name).toBe('Asmo');
    // Briar's bestowments should be cleared
    expect(state.allyBestowments).toHaveLength(1);
    expect(state.allyBestowments[0].allyId).toBe('a2');
  });

  it('renames ally via pencil button', () => {
    useSiphonStore.setState({
      allies: [{ id: 'a1', name: 'Briar' }],
    });

    render(<AlliesPanel selectedAllyId={null} onSelectAlly={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /rename briar/i }));

    const input = screen.getByLabelText(/rename ally/i);
    fireEvent.change(input, { target: { value: 'Rosemary' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    const state = useSiphonStore.getState();
    expect(state.allies[0].name).toBe('Rosemary');
  });

  it('cancels rename on Escape', () => {
    useSiphonStore.setState({
      allies: [{ id: 'a1', name: 'Briar' }],
    });

    render(<AlliesPanel selectedAllyId={null} onSelectAlly={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /rename briar/i }));

    const input = screen.getByLabelText(/rename ally/i);
    fireEvent.change(input, { target: { value: 'Rosemary' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    const state = useSiphonStore.getState();
    expect(state.allies[0].name).toBe('Briar');
  });

  it('cancels add ally on Escape', () => {
    render(<AlliesPanel selectedAllyId={null} onSelectAlly={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /add ally/i }));
    const input = screen.getByLabelText(/new ally name/i);
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    // Should not add the ally
    const state = useSiphonStore.getState();
    expect(state.allies).toHaveLength(0);
    // Add button should reappear
    expect(screen.getByRole('button', { name: /add ally/i })).toBeInTheDocument();
  });

  it('clears selectedAllyId when removing the selected ally', () => {
    useSiphonStore.setState({
      allies: [{ id: 'a1', name: 'Briar' }],
    });

    const onSelectAlly = vi.fn();
    render(<AlliesPanel selectedAllyId="a1" onSelectAlly={onSelectAlly} />);

    fireEvent.click(screen.getByRole('button', { name: /remove briar/i }));

    expect(onSelectAlly).toHaveBeenCalledWith(null);
  });

  it('does not add ally with empty name', () => {
    render(<AlliesPanel selectedAllyId={null} onSelectAlly={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /add ally/i }));

    const input = screen.getByLabelText(/new ally name/i);
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    const state = useSiphonStore.getState();
    expect(state.allies).toHaveLength(0);
  });

  it('calls onHoverAlly after 500ms hover on ally chip', () => {
    vi.useFakeTimers();

    useSiphonStore.setState({
      allies: [{ id: 'a1', name: 'Briar' }],
    });

    const onHoverAlly = vi.fn();
    render(
      <AlliesPanel selectedAllyId={null} onSelectAlly={vi.fn()} onHoverAlly={onHoverAlly} />
    );

    const chip = screen.getByRole('button', { name: 'Briar' });
    fireEvent.mouseEnter(chip);

    // Should not fire immediately
    expect(onHoverAlly).not.toHaveBeenCalled();

    // Advance past 500ms delay
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onHoverAlly).toHaveBeenCalledWith('a1');

    vi.useRealTimers();
  });

  it('cancels hover timer on mouse leave before 500ms', () => {
    vi.useFakeTimers();

    useSiphonStore.setState({
      allies: [{ id: 'a1', name: 'Briar' }],
    });

    const onHoverAlly = vi.fn();
    render(
      <AlliesPanel selectedAllyId={null} onSelectAlly={vi.fn()} onHoverAlly={onHoverAlly} />
    );

    const chip = screen.getByRole('button', { name: 'Briar' });
    fireEvent.mouseEnter(chip);

    // Leave before 500ms
    act(() => {
      vi.advanceTimersByTime(300);
    });
    fireEvent.mouseLeave(chip);

    // Advance past when it would have fired
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onHoverAlly).not.toHaveBeenCalled();

    vi.useRealTimers();
  });
});
