import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { ActiveEffectsPanel } from '../combat-hud/ActiveEffectsPanel';
import { useSiphonStore, useSettingsStore, useCharacterStore } from '../../store';
import { setActiveDragData } from '../../types/dragData';
import type { SelfActiveEffect } from '../../types';

function resetStore() {
  useSiphonStore.setState({
    currentEP: 10,
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
  });
  useSettingsStore.getState().resetSettings();
  // Clear any lingering active drag data
  setActiveDragData(null);
}

function makeEffect(overrides: Partial<SelfActiveEffect> = {}): SelfActiveEffect {
  return {
    id: 'test-1',
    sourceType: 'siphon',
    sourceId: 'temporal-surge',
    sourceName: 'Temporal Surge',
    description: 'Extra action',
    startedAt: Date.now(),
    totalDuration: '10 min',
    durationMs: 600000,
    requiresConcentration: false,
    warpActive: false,
    ...overrides,
  };
}

describe('ActiveEffectsPanel', () => {
  beforeEach(() => {
    resetStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('shows placeholder text when no effects', () => {
    render(<ActiveEffectsPanel />);
    expect(screen.getByText(/drag cards here to activate/i)).toBeInTheDocument();
  });

  it('shows active effects with name and duration', () => {
    useSiphonStore.setState({ activeEffects: [makeEffect()] });
    render(<ActiveEffectsPanel />);

    expect(screen.getByText('Temporal Surge')).toBeInTheDocument();
    expect(screen.getByText('10 min')).toBeInTheDocument();
  });

  it('shows concentration indicator', () => {
    useSiphonStore.setState({
      activeEffects: [makeEffect({
        id: 'test-2',
        sourceType: 'manifold',
        sourceId: 'echo-intuition',
        sourceName: 'Echo Intuition',
        requiresConcentration: true,
      })],
    });
    render(<ActiveEffectsPanel />);

    expect(screen.getByText('CONC')).toBeInTheDocument();
  });

  it('shows warp indicator', () => {
    useSiphonStore.setState({
      activeEffects: [makeEffect({ id: 'test-3', warpActive: true })],
    });
    render(<ActiveEffectsPanel />);

    expect(screen.getByText('W')).toBeInTheDocument();
  });

  it('shows multiple effects', () => {
    useSiphonStore.setState({
      activeEffects: [
        makeEffect({ id: 'test-a' }),
        makeEffect({ id: 'test-b', sourceId: 'subtle-luck', sourceName: 'Subtle Luck', totalDuration: '1 hour' }),
      ],
    });
    render(<ActiveEffectsPanel />);

    expect(screen.getByText('Temporal Surge')).toBeInTheDocument();
    expect(screen.getByText('Subtle Luck')).toBeInTheDocument();
  });

  // --- Drag handle and dismiss ---

  it('shows drag handle on effect row', () => {
    useSiphonStore.setState({ activeEffects: [makeEffect()] });
    render(<ActiveEffectsPanel />);

    const row = screen.getByTestId('effect-row-test-1');
    expect(row).toBeInTheDocument();
    expect(row.className).toContain('cursor-grab');
  });

  it('dismisses effect when dragged outside panel and released', () => {
    useSiphonStore.setState({ activeEffects: [makeEffect()] });
    render(<ActiveEffectsPanel />);

    const panel = screen.getByRole('region', { name: /active effects/i });
    vi.spyOn(panel, 'getBoundingClientRect').mockReturnValue({
      left: 100, right: 500, top: 0, bottom: 200, width: 400, height: 200, x: 100, y: 0,
      toJSON: () => ({}),
    });

    const row = screen.getByTestId('effect-row-test-1');
    row.setPointerCapture = vi.fn();

    fireEvent.pointerDown(row, { clientX: 300, button: 0 });
    fireEvent.pointerMove(row, { clientX: 600 });
    fireEvent.pointerUp(row);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(useSiphonStore.getState().activeEffects).toHaveLength(0);
  });

  it('snaps back when released inside panel (cancel)', () => {
    useSiphonStore.setState({ activeEffects: [makeEffect()] });
    render(<ActiveEffectsPanel />);

    const panel = screen.getByRole('region', { name: /active effects/i });
    vi.spyOn(panel, 'getBoundingClientRect').mockReturnValue({
      left: 100, right: 500, top: 0, bottom: 200, width: 400, height: 200, x: 100, y: 0,
      toJSON: () => ({}),
    });

    const row = screen.getByTestId('effect-row-test-1');
    row.setPointerCapture = vi.fn();

    fireEvent.pointerDown(row, { clientX: 300, button: 0 });
    fireEvent.pointerMove(row, { clientX: 350 });
    fireEvent.pointerUp(row);

    expect(useSiphonStore.getState().activeEffects).toHaveLength(1);
  });

  // --- Inline activation via drop ---

  it('activates card when hand card is dropped on panel (deducts EP)', () => {
    // Use 'temporal-surge' — a real feature with numeric cost
    useSiphonStore.setState({ currentEP: 10, handCardIds: ['temporal-surge'] });

    render(<ActiveEffectsPanel />);

    const panel = screen.getByRole('region', { name: /active effects/i });
    fireEvent.dragOver(panel, {
      dataTransfer: { types: ['text/x-card-type'] },
    });
    fireEvent.drop(panel, {
      dataTransfer: {
        types: ['text/x-card-type', 'application/json'],
        getData: () => JSON.stringify({ type: 'card', featureId: 'temporal-surge', source: 'hand' }),
      },
    });

    // EP should be reduced from activation
    expect(useSiphonStore.getState().currentEP).toBeLessThan(10);
  });

  it('does NOT activate when deck card is dropped (wrong source)', () => {
    useSiphonStore.setState({ currentEP: 10 });

    render(<ActiveEffectsPanel />);

    const panel = screen.getByRole('region', { name: /active effects/i });
    fireEvent.drop(panel, {
      dataTransfer: {
        types: ['text/x-card-type', 'application/json'],
        getData: () => JSON.stringify({ type: 'card', featureId: 'temporal-surge', source: 'deck' }),
      },
    });

    // EP should be unchanged
    expect(useSiphonStore.getState().currentEP).toBe(10);
  });

  it('calls onWarpTriggered when activation triggers warp', () => {
    const onWarpTriggered = vi.fn();
    useSiphonStore.setState({ currentEP: 1, handCardIds: ['temporal-surge'] });

    render(<ActiveEffectsPanel onWarpTriggered={onWarpTriggered} />);

    const panel = screen.getByRole('region', { name: /active effects/i });
    fireEvent.dragOver(panel, {
      dataTransfer: { types: ['text/x-card-type'] },
    });
    fireEvent.drop(panel, {
      dataTransfer: {
        types: ['text/x-card-type', 'application/json'],
        getData: () => JSON.stringify({ type: 'card', featureId: 'temporal-surge', source: 'hand' }),
      },
    });

    expect(onWarpTriggered).toHaveBeenCalledOnce();
  });

  // --- Ghost preview row ---

  it('shows ghost preview row during drag-over of hand card', () => {
    useSiphonStore.setState({ currentEP: 10 });
    // Set active drag data (simulates what HandArea does on dragStart)
    setActiveDragData({ type: 'card', featureId: 'temporal-surge', source: 'hand' });

    render(<ActiveEffectsPanel />);

    const panel = screen.getByRole('region', { name: /active effects/i });
    fireEvent.dragOver(panel, {
      dataTransfer: { types: ['text/x-card-type'] },
    });

    expect(screen.getByTestId('ghost-preview-row')).toBeInTheDocument();
  });

  it('ghost preview shows EP change', () => {
    useSiphonStore.setState({ currentEP: 10 });
    setActiveDragData({ type: 'card', featureId: 'temporal-surge', source: 'hand' });

    render(<ActiveEffectsPanel />);

    const panel = screen.getByRole('region', { name: /active effects/i });
    fireEvent.dragOver(panel, {
      dataTransfer: { types: ['text/x-card-type'] },
    });

    // Current EP "10" should be displayed in the ghost row
    const ghostRow = screen.getByTestId('ghost-preview-row');
    expect(ghostRow.textContent).toContain('10');
  });

  it('ghost preview shows WARP warning when EP will go negative', () => {
    useSiphonStore.setState({ currentEP: 1 });
    setActiveDragData({ type: 'card', featureId: 'temporal-surge', source: 'hand' });

    render(<ActiveEffectsPanel />);

    const panel = screen.getByRole('region', { name: /active effects/i });
    fireEvent.dragOver(panel, {
      dataTransfer: { types: ['text/x-card-type'] },
    });

    const ghostRow = screen.getByTestId('ghost-preview-row');
    expect(ghostRow.textContent).toContain('WARP');
  });

  it('hides ghost preview when drag leaves', () => {
    setActiveDragData({ type: 'card', featureId: 'temporal-surge', source: 'hand' });

    render(<ActiveEffectsPanel />);

    const panel = screen.getByRole('region', { name: /active effects/i });
    fireEvent.dragOver(panel, {
      dataTransfer: { types: ['text/x-card-type'] },
    });
    expect(screen.getByTestId('ghost-preview-row')).toBeInTheDocument();

    fireEvent.dragLeave(panel);
    expect(screen.queryByTestId('ghost-preview-row')).not.toBeInTheDocument();
  });

  it('does NOT show ghost preview for deck card drag', () => {
    setActiveDragData({ type: 'card', featureId: 'temporal-surge', source: 'deck' });

    render(<ActiveEffectsPanel />);

    const panel = screen.getByRole('region', { name: /active effects/i });
    fireEvent.dragOver(panel, {
      dataTransfer: { types: ['text/x-card-type'] },
    });

    expect(screen.queryByTestId('ghost-preview-row')).not.toBeInTheDocument();
  });

  // --- Varies cost inline form ---

  it('shows Varies cost form when Varies card is dropped', () => {
    // Find a Varies cost feature
    useSiphonStore.setState({ currentEP: 10, handCardIds: ['doublecast'] });

    render(<ActiveEffectsPanel />);

    const panel = screen.getByRole('region', { name: /active effects/i });
    fireEvent.drop(panel, {
      dataTransfer: {
        types: ['text/x-card-type', 'application/json'],
        getData: () => JSON.stringify({ type: 'card', featureId: 'doublecast', source: 'hand' }),
      },
    });

    expect(screen.getByTestId('varies-activation-form')).toBeInTheDocument();
    expect(screen.getByLabelText('Choose EP cost')).toBeInTheDocument();
  });

  it('activates Varies card after cost is entered and Activate clicked', () => {
    useSiphonStore.setState({ currentEP: 10, handCardIds: ['doublecast'] });

    render(<ActiveEffectsPanel />);

    const panel = screen.getByRole('region', { name: /active effects/i });
    fireEvent.drop(panel, {
      dataTransfer: {
        types: ['text/x-card-type', 'application/json'],
        getData: () => JSON.stringify({ type: 'card', featureId: 'doublecast', source: 'hand' }),
      },
    });

    // Enter cost
    const costInput = screen.getByLabelText('Choose EP cost');
    fireEvent.change(costInput, { target: { value: '4' } });

    // Click Activate
    fireEvent.click(screen.getByText('Activate'));

    // EP should be reduced
    expect(useSiphonStore.getState().currentEP).toBeLessThanOrEqual(6);
    // Form should be gone
    expect(screen.queryByTestId('varies-activation-form')).not.toBeInTheDocument();
  });

  it('cancels Varies activation when Cancel clicked', () => {
    useSiphonStore.setState({ currentEP: 10, handCardIds: ['doublecast'] });

    render(<ActiveEffectsPanel />);

    const panel = screen.getByRole('region', { name: /active effects/i });
    fireEvent.drop(panel, {
      dataTransfer: {
        types: ['text/x-card-type', 'application/json'],
        getData: () => JSON.stringify({ type: 'card', featureId: 'doublecast', source: 'hand' }),
      },
    });

    fireEvent.click(screen.getByText('Cancel'));

    // EP should be unchanged
    expect(useSiphonStore.getState().currentEP).toBe(10);
    expect(screen.queryByTestId('varies-activation-form')).not.toBeInTheDocument();
  });
});
