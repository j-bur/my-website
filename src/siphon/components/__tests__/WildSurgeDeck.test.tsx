import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { WildSurgeDeck } from '../combat-hud/WildSurgeDeck';
import { useSettingsStore } from '../../store';

function resetStore() {
  useSettingsStore.getState().resetSettings();
}

describe('WildSurgeDeck', () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders Wild Surge label', () => {
    render(<WildSurgeDeck />);

    expect(screen.getByText('Wild Surge')).toBeInTheDocument();
  });

  it('shows Roll d100 button in dice3d mode (default)', () => {
    render(<WildSurgeDeck />);

    expect(screen.getByText('Roll d100')).toBeInTheDocument();
  });

  it('shows macro text in macro mode', () => {
    useSettingsStore.getState().setDiceMode('wildSurge', 'macro');

    render(<WildSurgeDeck />);

    expect(screen.getByText('/r 1d100')).toBeInTheDocument();
  });

  it('displays result after clicking Roll', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.41); // → 42

    render(<WildSurgeDeck />);

    fireEvent.click(screen.getByText('Roll d100'));

    expect(screen.getByText('42')).toBeInTheDocument();

    vi.restoreAllMocks();
  });

  it('copies macro text in macro mode', async () => {
    useSettingsStore.getState().setDiceMode('wildSurge', 'macro');

    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<WildSurgeDeck />);

    fireEvent.click(screen.getByText('/r 1d100'));

    expect(writeText).toHaveBeenCalledWith('/r 1d100');
  });

  it('has accessible region role', () => {
    render(<WildSurgeDeck />);

    expect(screen.getByRole('region', { name: 'Wild Surge' })).toBeInTheDocument();
  });

  // --- Persistent warp notification ---

  it('shows "Roll Needed!" when pendingWarps > 0', () => {
    render(<WildSurgeDeck pendingWarps={1} />);

    expect(screen.getByText(/roll needed/i)).toBeInTheDocument();
  });

  it('does NOT show "Roll Needed!" when pendingWarps is 0', () => {
    render(<WildSurgeDeck pendingWarps={0} />);

    expect(screen.queryByText(/roll needed/i)).not.toBeInTheDocument();
  });

  it('shows count badge when pendingWarps > 1', () => {
    render(<WildSurgeDeck pendingWarps={3} />);

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('does NOT show count badge when pendingWarps is 1', () => {
    render(<WildSurgeDeck pendingWarps={1} />);

    // Only "Roll Needed!" text, no numeric badge
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('calls onDismissWarp when Roll is clicked', () => {
    const onDismiss = vi.fn();
    render(<WildSurgeDeck pendingWarps={2} onDismissWarp={onDismiss} />);

    fireEvent.click(screen.getByText('Roll d100'));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('calls onDismissWarp when macro is copied', () => {
    useSettingsStore.getState().setDiceMode('wildSurge', 'macro');
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    const onDismiss = vi.fn();
    render(<WildSurgeDeck pendingWarps={1} onDismissWarp={onDismiss} />);

    fireEvent.click(screen.getByText('/r 1d100'));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('applies warp-pulse class when pendingWarps > 0', () => {
    render(<WildSurgeDeck pendingWarps={1} />);

    const region = screen.getByRole('region', { name: 'Wild Surge' });
    expect(region.className).toContain('warp-pulse');
  });
});
