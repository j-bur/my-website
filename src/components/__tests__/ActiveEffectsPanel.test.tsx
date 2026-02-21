import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { ActiveEffectsPanel } from '../combat-hud/ActiveEffectsPanel';
import { useSiphonStore, useSettingsStore } from '../../store';
import type { SelfActiveEffect } from '../../types';

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
  useSettingsStore.getState().resetSettings();
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

  // --- Drag-and-drop ---

  it('activates card when hand card is dropped on panel', () => {
    const onActivateCard = vi.fn();
    render(<ActiveEffectsPanel onActivateCard={onActivateCard} />);

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

    expect(onActivateCard).toHaveBeenCalledWith('temporal-surge');
  });

  it('does NOT activate when deck card is dropped (wrong source)', () => {
    const onActivateCard = vi.fn();
    render(<ActiveEffectsPanel onActivateCard={onActivateCard} />);

    const panel = screen.getByRole('region', { name: /active effects/i });
    fireEvent.drop(panel, {
      dataTransfer: {
        types: ['text/x-card-type', 'application/json'],
        getData: () => JSON.stringify({ type: 'card', featureId: 'temporal-surge', source: 'deck' }),
      },
    });

    expect(onActivateCard).not.toHaveBeenCalled();
  });

  it('shows drag handle on effect row', () => {
    useSiphonStore.setState({ activeEffects: [makeEffect()] });
    render(<ActiveEffectsPanel />);

    // The drag handle is always in the DOM (hidden via opacity)
    const row = screen.getByTestId('effect-row-test-1');
    expect(row).toBeInTheDocument();
    // Check the row has grab cursor style
    expect(row.className).toContain('cursor-grab');
  });

  it('dismisses effect when dragged outside panel and released', () => {
    useSiphonStore.setState({ activeEffects: [makeEffect()] });
    render(<ActiveEffectsPanel />);

    // Mock getBoundingClientRect on the panel
    const panel = screen.getByRole('region', { name: /active effects/i });
    vi.spyOn(panel, 'getBoundingClientRect').mockReturnValue({
      left: 100, right: 500, top: 0, bottom: 200, width: 400, height: 200, x: 100, y: 0,
      toJSON: () => ({}),
    });

    const row = screen.getByTestId('effect-row-test-1');
    // Mock setPointerCapture since jsdom doesn't implement it
    row.setPointerCapture = vi.fn();

    // Pointer down → move outside → release
    fireEvent.pointerDown(row, { clientX: 300, button: 0 });
    fireEvent.pointerMove(row, { clientX: 600 }); // Outside panel right edge
    fireEvent.pointerUp(row);

    // Wait for dismiss animation timer
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Effect should be removed from store
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

    // Pointer down → move inside → release
    fireEvent.pointerDown(row, { clientX: 300, button: 0 });
    fireEvent.pointerMove(row, { clientX: 350 }); // Still inside panel
    fireEvent.pointerUp(row);

    // Effect should still be in store
    expect(useSiphonStore.getState().activeEffects).toHaveLength(1);
  });
});
