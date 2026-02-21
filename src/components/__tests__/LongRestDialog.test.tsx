import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { LongRestDialog } from '../combat-hud/LongRestDialog';
import { useSiphonStore, useCharacterStore, useManifoldStore, useSettingsStore } from '../../store';

function resetStores() {
  useSiphonStore.setState({
    currentEP: 0,
    focus: 5,
    siphonCapacitance: 0,
    capacitanceTimerStart: null,
    selectedCardIds: ['a', 'c'],
    handCardIds: ['b'],
    allies: [],
    allyBestowments: [],
    activeEffects: [],
    echoIntuitionActive: false,
  });
  useCharacterStore.setState({
    level: 5,
    proficiencyBonus: 3,
    maxHP: 40,
    currentHP: 40,
    reducedMaxHP: 40,
    hitDice: 2,
    maxHitDice: 5,
  });
  useManifoldStore.setState({
    motes: 3,
    phaseSwitchAvailable: false,
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

describe('LongRestDialog', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    resetStores();
    onClose.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders Long Rest preview dialog', () => {
    render(<LongRestDialog onClose={onClose} />);

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Long Rest');
    expect(screen.getByText('Rest Preview')).toBeInTheDocument();
  });

  it('shows EP recovery preview', () => {
    useSiphonStore.setState({ currentEP: 1 });
    render(<LongRestDialog onClose={onClose} />);

    // +3 EP (PB=3)
    expect(screen.getByText(/\+3 EP/)).toBeInTheDocument();
  });

  it('shows Focus reduction info', () => {
    render(<LongRestDialog onClose={onClose} />);

    expect(screen.getByText(/d4 roll/)).toBeInTheDocument();
  });

  it('shows motes restoration', () => {
    render(<LongRestDialog onClose={onClose} />);

    // Motes: 3 → 8/8
    expect(screen.getByText(/8\/8/)).toBeInTheDocument();
  });

  it('shows hit dice restoration', () => {
    render(<LongRestDialog onClose={onClose} />);

    // Hit Dice: 2/5 → 5/5
    expect(screen.getByText(/5\/5/)).toBeInTheDocument();
  });

  it('shows bestowment clearing count', () => {
    useSiphonStore.setState({
      handCardIds: ['b'],
      allyBestowments: [
        {
          id: 'best-1',
          allyId: 'ally-1',
          featureId: 'x',
          isFromSelectedDeck: true,
          bestowedAt: Date.now(),
        },
      ],
    });
    render(<LongRestDialog onClose={onClose} />);

    expect(screen.getByText(/2 bestowments/)).toBeInTheDocument();
  });

  it('shows capacitance clearing when non-zero', () => {
    useSiphonStore.setState({ siphonCapacitance: 2 });
    render(<LongRestDialog onClose={onClose} />);

    // Capacitance row should appear
    expect(screen.getByText('Capacitance')).toBeInTheDocument();
  });

  it('does not show capacitance row when zero', () => {
    useSiphonStore.setState({ siphonCapacitance: 0 });
    render(<LongRestDialog onClose={onClose} />);

    expect(screen.queryByText('Capacitance')).toBeNull();
  });

  it('confirms in dice3d mode: auto-rolls d4, applies changes, shows results', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // rollD(4) = floor(0.5*4)+1 = 3
    useSettingsStore.setState({
      diceMode: {
        wildSurge: 'dice3d',
        siphonFeature: 'macro',
        phaseAbility: 'macro',
        longRestFocus: 'dice3d',
      },
    });

    render(<LongRestDialog onClose={onClose} />);
    fireEvent.click(screen.getByText('Confirm Long Rest'));

    // Should show completion dialog
    expect(screen.getByText('Rest Results')).toBeInTheDocument();
    expect(screen.getByText('Long Rest Complete')).toBeInTheDocument();

    // EP recovered and Focus reduced are shown in the result summary
    // Use getAllByText since +3 could appear in multiple contexts
    expect(screen.getByText('EP Recovered')).toBeInTheDocument();
    expect(screen.getByText('Focus Reduced')).toBeInTheDocument();

    // Store state updated
    expect(useSiphonStore.getState().currentEP).toBe(3);
    expect(useSiphonStore.getState().focus).toBe(2); // 5 - 3
    expect(useSiphonStore.getState().handCardIds).toEqual([]);
    expect(useCharacterStore.getState().hitDice).toBe(5);
    expect(useManifoldStore.getState().motes).toBe(8);
    expect(useManifoldStore.getState().phaseSwitchAvailable).toBe(true);

    vi.restoreAllMocks();
  });

  it('shows macro mode with "Roll in Foundry" button', () => {
    useSettingsStore.setState({
      diceMode: {
        wildSurge: 'dice3d',
        siphonFeature: 'macro',
        phaseAbility: 'macro',
        longRestFocus: 'macro',
      },
    });

    render(<LongRestDialog onClose={onClose} />);

    expect(screen.getByText('Roll in Foundry')).toBeInTheDocument();
  });

  it('in macro mode: transitions to awaiting-focus-roll state', () => {
    useSettingsStore.setState({
      diceMode: {
        wildSurge: 'dice3d',
        siphonFeature: 'macro',
        phaseAbility: 'macro',
        longRestFocus: 'macro',
      },
    });

    render(<LongRestDialog onClose={onClose} />);
    fireEvent.click(screen.getByText('Roll in Foundry'));

    // Should show macro text and result input
    expect(screen.getByText(/1d4/)).toBeInTheDocument();
    expect(screen.getByLabelText('Focus roll result')).toBeInTheDocument();
  });

  it('in macro mode: applies long rest after entering focus result', () => {
    useSettingsStore.setState({
      diceMode: {
        wildSurge: 'dice3d',
        siphonFeature: 'macro',
        phaseAbility: 'macro',
        longRestFocus: 'macro',
      },
    });

    render(<LongRestDialog onClose={onClose} />);
    fireEvent.click(screen.getByText('Roll in Foundry'));

    // Enter focus result
    const input = screen.getByLabelText('Focus roll result');
    fireEvent.change(input, { target: { value: '2' } });
    fireEvent.click(screen.getByText('Apply'));

    // Should show completion
    expect(screen.getByText('Rest Results')).toBeInTheDocument();
    expect(useSiphonStore.getState().focus).toBe(3); // 5 - 2
  });

  it('closes on Done button', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    render(<LongRestDialog onClose={onClose} />);
    fireEvent.click(screen.getByText('Confirm Long Rest'));
    fireEvent.click(screen.getByText('Done'));

    expect(onClose).toHaveBeenCalledTimes(1);

    vi.restoreAllMocks();
  });

  it('closes on Cancel button', () => {
    render(<LongRestDialog onClose={onClose} />);
    fireEvent.click(screen.getByText('Cancel'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on backdrop click', () => {
    render(<LongRestDialog onClose={onClose} />);
    fireEvent.click(screen.getByRole('dialog'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
