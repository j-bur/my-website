import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ShortRestDialog } from '../combat-hud/ShortRestDialog';
import { useSiphonStore, useCharacterStore, useManifoldStore, useSettingsStore } from '../../store';

function resetStores() {
  useSiphonStore.setState({
    currentEP: -3,
    focus: 15,
    siphonCapacitance: 0,
    capacitanceTimerStart: null,
    selectedCardIds: ['a'],
    handCardIds: ['b'],
    allies: [],
    allyBestowments: [
      {
        id: 'best-1',
        allyId: 'ally-1',
        featureId: 'x',
        isFromSelectedDeck: true,
        bestowedAt: Date.now(),
      },
    ],
    activeEffects: [],
    echoIntuitionActive: false,
  });
  useCharacterStore.setState({
    level: 5,
    proficiencyBonus: 3,
    maxHP: 40,
    reducedMaxHP: 40,
    hitDice: 5,
    maxHitDice: 5,
  });
  useManifoldStore.setState({
    motes: 3,
    phaseSwitchAvailable: false,
  });
  useSettingsStore.setState({
    shortRestClearEffects: true,
  });
}

describe('ShortRestDialog', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    resetStores();
    onClose.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders Short Rest dialog', () => {
    render(<ShortRestDialog onClose={onClose} />);

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Short Rest');
    expect(screen.getByText('Rest Options')).toBeInTheDocument();
  });

  it('shows available hit dice', () => {
    render(<ShortRestDialog onClose={onClose} />);

    expect(screen.getByText('5 available')).toBeInTheDocument();
  });

  it('increments and decrements hit dice to spend', () => {
    render(<ShortRestDialog onClose={onClose} />);

    const incButton = screen.getByLabelText('Increase hit dice');
    const decButton = screen.getByLabelText('Decrease hit dice');

    // Start at 0
    expect(screen.getByText('0')).toBeInTheDocument();

    // Increment
    fireEvent.click(incButton);
    expect(screen.getByText('1')).toBeInTheDocument();

    fireEvent.click(incButton);
    expect(screen.getByText('2')).toBeInTheDocument();

    // Decrement
    fireEvent.click(decButton);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('cannot increment beyond available hit dice', () => {
    useCharacterStore.setState({ hitDice: 1, maxHitDice: 5 });
    render(<ShortRestDialog onClose={onClose} />);

    const incButton = screen.getByLabelText('Increase hit dice');
    fireEvent.click(incButton);
    fireEvent.click(incButton); // Should be capped at 1

    // Should show 1, not 2
    expect(incButton).toBeDisabled();
  });

  it('effect clearing toggle defaults from settings', () => {
    useSettingsStore.setState({ shortRestClearEffects: true });
    render(<ShortRestDialog onClose={onClose} />);

    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('effect clearing toggle defaults to off when setting is off', () => {
    useSettingsStore.setState({ shortRestClearEffects: false });
    render(<ShortRestDialog onClose={onClose} />);

    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('toggles effect clearing', () => {
    render(<ShortRestDialog onClose={onClose} />);

    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('shows phase switch restoration when unavailable', () => {
    useManifoldStore.setState({ phaseSwitchAvailable: false });
    render(<ShortRestDialog onClose={onClose} />);

    expect(screen.getByText('Will be restored')).toBeInTheDocument();
  });

  it('does not show phase switch when already available', () => {
    useManifoldStore.setState({ phaseSwitchAvailable: true });
    render(<ShortRestDialog onClose={onClose} />);

    expect(screen.queryByText('Will be restored')).toBeNull();
  });

  it('RULE-REST-005: confirm does NOT affect EP or Focus', () => {
    useSiphonStore.setState({ currentEP: -3, focus: 15 });

    render(<ShortRestDialog onClose={onClose} />);
    fireEvent.click(screen.getByText('Confirm Short Rest'));

    expect(useSiphonStore.getState().currentEP).toBe(-3);
    expect(useSiphonStore.getState().focus).toBe(15);
  });

  it('does NOT affect bestowments', () => {
    render(<ShortRestDialog onClose={onClose} />);
    fireEvent.click(screen.getByText('Confirm Short Rest'));

    expect(useSiphonStore.getState().handCardIds).toEqual(['b']);
    expect(useSiphonStore.getState().allyBestowments).toHaveLength(1);
  });

  it('does NOT affect motes', () => {
    render(<ShortRestDialog onClose={onClose} />);
    fireEvent.click(screen.getByText('Confirm Short Rest'));

    expect(useManifoldStore.getState().motes).toBe(3);
  });

  it('RULE-REST-004: restores phase switch', () => {
    useManifoldStore.setState({ phaseSwitchAvailable: false });

    render(<ShortRestDialog onClose={onClose} />);
    fireEvent.click(screen.getByText('Confirm Short Rest'));

    expect(useManifoldStore.getState().phaseSwitchAvailable).toBe(true);
  });

  it('spends hit dice on confirm', () => {
    render(<ShortRestDialog onClose={onClose} />);

    // Spend 2 HD
    fireEvent.click(screen.getByLabelText('Increase hit dice'));
    fireEvent.click(screen.getByLabelText('Increase hit dice'));

    fireEvent.click(screen.getByText('Confirm Short Rest'));

    expect(useCharacterStore.getState().hitDice).toBe(3); // 5 - 2
  });

  it('RULE-REST-006: clears short-duration effects when toggle is on', () => {
    const now = Date.now();
    useSiphonStore.setState({
      activeEffects: [
        {
          id: 'short-effect',
          sourceType: 'siphon',
          sourceId: 'a',
          sourceName: 'Short',
          description: 'A short effect',
          totalDuration: '10 minutes',
          durationMs: 600_000,
          startedAt: now,
          requiresConcentration: false,
          warpActive: false,
        },
        {
          id: 'long-effect',
          sourceType: 'siphon',
          sourceId: 'b',
          sourceName: 'Long',
          description: 'A long effect',
          totalDuration: '8 hours',
          durationMs: 28_800_000,
          startedAt: now,
          requiresConcentration: false,
          warpActive: false,
        },
      ],
    });

    render(<ShortRestDialog onClose={onClose} />);
    // Toggle should default to on
    fireEvent.click(screen.getByText('Confirm Short Rest'));

    const effects = useSiphonStore.getState().activeEffects;
    expect(effects).toHaveLength(1);
    expect(effects[0].id).toBe('long-effect');
  });

  it('shows completion summary after confirm', () => {
    useManifoldStore.setState({ phaseSwitchAvailable: false });

    render(<ShortRestDialog onClose={onClose} />);

    // Spend 1 HD
    fireEvent.click(screen.getByLabelText('Increase hit dice'));

    fireEvent.click(screen.getByText('Confirm Short Rest'));

    // Should show completion
    expect(screen.getByText('Short Rest Complete')).toBeInTheDocument();
    expect(screen.getByText('Rest Results')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // HD spent
    expect(screen.getByText('Restored')).toBeInTheDocument(); // Phase switch
  });

  it('closes on Done button after completion', () => {
    render(<ShortRestDialog onClose={onClose} />);
    fireEvent.click(screen.getByText('Confirm Short Rest'));
    fireEvent.click(screen.getByText('Done'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Cancel button', () => {
    render(<ShortRestDialog onClose={onClose} />);
    fireEvent.click(screen.getByText('Cancel'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
