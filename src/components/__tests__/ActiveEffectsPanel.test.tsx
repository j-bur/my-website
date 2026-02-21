import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ActiveEffectsPanel } from '../combat-hud/ActiveEffectsPanel';
import { useSiphonStore } from '../../store';
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
}

describe('ActiveEffectsPanel', () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows placeholder text when no effects', () => {
    render(<ActiveEffectsPanel />);
    expect(screen.getByText(/drag cards here to activate/i)).toBeInTheDocument();
  });

  it('shows active effects with name and duration', () => {
    const effect: SelfActiveEffect = {
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
    };

    useSiphonStore.setState({ activeEffects: [effect] });
    render(<ActiveEffectsPanel />);

    expect(screen.getByText('Temporal Surge')).toBeInTheDocument();
    expect(screen.getByText('10 min')).toBeInTheDocument();
  });

  it('shows concentration indicator', () => {
    const effect: SelfActiveEffect = {
      id: 'test-2',
      sourceType: 'manifold',
      sourceId: 'echo-intuition',
      sourceName: 'Echo Intuition',
      description: 'Cost halved',
      startedAt: Date.now(),
      totalDuration: '8 hours',
      durationMs: 28800000,
      requiresConcentration: true,
      warpActive: false,
    };

    useSiphonStore.setState({ activeEffects: [effect] });
    render(<ActiveEffectsPanel />);

    expect(screen.getByText('CONC')).toBeInTheDocument();
  });

  it('shows warp indicator', () => {
    const effect: SelfActiveEffect = {
      id: 'test-3',
      sourceType: 'siphon',
      sourceId: 'temporal-surge',
      sourceName: 'Temporal Surge',
      description: 'Extra action',
      startedAt: Date.now(),
      totalDuration: '10 min',
      durationMs: 600000,
      requiresConcentration: false,
      warpActive: true,
    };

    useSiphonStore.setState({ activeEffects: [effect] });
    render(<ActiveEffectsPanel />);

    expect(screen.getByText('W')).toBeInTheDocument();
  });

  it('shows multiple effects', () => {
    const effects: SelfActiveEffect[] = [
      {
        id: 'test-a',
        sourceType: 'siphon',
        sourceId: 'temporal-surge',
        sourceName: 'Temporal Surge',
        description: 'Extra action',
        startedAt: Date.now(),
        totalDuration: '10 min',
        durationMs: 600000,
        requiresConcentration: false,
        warpActive: false,
      },
      {
        id: 'test-b',
        sourceType: 'siphon',
        sourceId: 'subtle-luck',
        sourceName: 'Subtle Luck',
        description: '+1 to rolls',
        startedAt: Date.now(),
        totalDuration: '1 hour',
        durationMs: 3600000,
        requiresConcentration: false,
        warpActive: false,
      },
    ];

    useSiphonStore.setState({ activeEffects: effects });
    render(<ActiveEffectsPanel />);

    expect(screen.getByText('Temporal Surge')).toBeInTheDocument();
    expect(screen.getByText('Subtle Luck')).toBeInTheDocument();
  });
});
