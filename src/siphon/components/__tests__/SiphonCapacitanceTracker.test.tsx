import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SiphonCapacitanceTracker } from '../combat-hud/SiphonCapacitanceTracker';
import { useSiphonStore } from '../../store/siphonStore';
import { useCharacterStore } from '../../store/characterStore';

function resetStores() {
  useCharacterStore.getState().resetCharacter();
  useSiphonStore.getState().resetSiphon();
}

describe('SiphonCapacitanceTracker', () => {
  beforeEach(() => {
    resetStores();
    useCharacterStore.getState().setLevel(5); // PB = 3
  });

  afterEach(() => {
    cleanup();
  });

  it('shows charge pips and count', () => {
    useSiphonStore.getState().addCapacitance();
    useSiphonStore.getState().addCapacitance();

    render(<SiphonCapacitanceTracker />);

    expect(screen.getByText('2/3')).toBeInTheDocument();
  });

  it('does not show timer when no charges', () => {
    render(<SiphonCapacitanceTracker />);

    expect(screen.queryByText('Set acquisition time:')).not.toBeInTheDocument();
  });

  it('shows time preset picker when charges exist but no timer set', () => {
    useSiphonStore.getState().addCapacitance();

    render(<SiphonCapacitanceTracker />);

    expect(screen.getByText('Set acquisition time:')).toBeInTheDocument();
    expect(screen.getByText(/Dawn/)).toBeInTheDocument();
    expect(screen.getByText(/Midnight/)).toBeInTheDocument();
  });

  it('clicking a preset sets the timer', () => {
    useSiphonStore.getState().addCapacitance();

    render(<SiphonCapacitanceTracker />);

    fireEvent.click(screen.getByText('Morning'));

    // Morning = 9:00 AM, expires at 5:00 PM
    expect(screen.getByText('9:00 AM')).toBeInTheDocument();
    expect(screen.getByText('5:00 PM')).toBeInTheDocument();
  });

  it('clicking arrow adjusts time by 1 hour', () => {
    useSiphonStore.getState().addCapacitance();
    useSiphonStore.getState().setCapacitanceTimer(540); // 9:00 AM

    render(<SiphonCapacitanceTracker />);

    fireEvent.click(screen.getByLabelText('Increase time by 1 hour'));

    // Should now show 10:00 AM, expires at 6:00 PM
    expect(screen.getByText('10:00 AM')).toBeInTheDocument();
    expect(screen.getByText('6:00 PM')).toBeInTheDocument();
  });

  it('extend +8 hrs adds 8 hours to expiry', () => {
    useSiphonStore.getState().addCapacitance();
    useSiphonStore.getState().setCapacitanceTimer(540); // 9:00 AM, expires 5:00 PM

    render(<SiphonCapacitanceTracker />);

    fireEvent.click(screen.getByText('Extend +8 hrs'));

    // Expiry should now be 1:00 AM (5PM + 8hrs = 1AM next day)
    expect(screen.getByText('1:00 AM')).toBeInTheDocument();
  });

  it('timer expired clears charges and timer', () => {
    useSiphonStore.getState().addCapacitance();
    useSiphonStore.getState().addCapacitance();
    useSiphonStore.getState().setCapacitanceTimer(540);

    render(<SiphonCapacitanceTracker />);

    fireEvent.click(screen.getByText('Timer Expired'));

    expect(useSiphonStore.getState().siphonCapacitance).toBe(0);
    expect(useSiphonStore.getState().capacitanceInGameTime).toBeNull();
    expect(useSiphonStore.getState().capacitanceExpiresAt).toBeNull();
  });

  it('clear button removes charges and timer', () => {
    useSiphonStore.getState().addCapacitance();
    useSiphonStore.getState().setCapacitanceTimer(540);

    render(<SiphonCapacitanceTracker />);

    fireEvent.click(screen.getByText('Clear'));

    expect(useSiphonStore.getState().siphonCapacitance).toBe(0);
    expect(useSiphonStore.getState().capacitanceInGameTime).toBeNull();
  });

  it('shows action buttons when timer is set', () => {
    useSiphonStore.getState().addCapacitance();
    useSiphonStore.getState().setCapacitanceTimer(360); // Dawn

    render(<SiphonCapacitanceTracker />);

    expect(screen.getByText('Timer Expired')).toBeInTheDocument();
    expect(screen.getByText('Extend +8 hrs')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });
});
