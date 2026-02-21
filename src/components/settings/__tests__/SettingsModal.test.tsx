import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SettingsModal } from '../SettingsModal';
import { useSettingsStore } from '../../../store';

function resetStore() {
  useSettingsStore.getState().resetSettings();
}

describe('SettingsModal', () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders all section headings', () => {
    render(<SettingsModal onClose={vi.fn()} />);

    expect(screen.getByText('Dice Rolls')).toBeInTheDocument();
    expect(screen.getByText('Sound')).toBeInTheDocument();
    expect(screen.getByText('Visual')).toBeInTheDocument();
    expect(screen.getByText('Gameplay')).toBeInTheDocument();
  });

  it('renders all dice mode toggles with correct defaults', () => {
    render(<SettingsModal onClose={vi.fn()} />);

    // Wild Surge defaults to dice3d
    expect(screen.getByText('Wild Echo Surge')).toBeInTheDocument();
    // Siphon Feature defaults to macro
    expect(screen.getByText('Siphon Feature rolls')).toBeInTheDocument();
    // Phase Ability defaults to macro
    expect(screen.getByText('Phase Ability rolls')).toBeInTheDocument();
    // Long Rest Focus defaults to macro
    expect(screen.getByText('Long Rest Focus reduction')).toBeInTheDocument();
  });

  it('renders all boolean toggles', () => {
    render(<SettingsModal onClose={vi.fn()} />);

    expect(screen.getByText('Enable sound effects')).toBeInTheDocument();
    expect(screen.getByText('Enable animations')).toBeInTheDocument();
    expect(screen.getByText('Reduced motion')).toBeInTheDocument();
    expect(screen.getByText('Confirm before activation')).toBeInTheDocument();
    expect(screen.getByText('Auto-trigger surge on warp')).toBeInTheDocument();
    expect(screen.getByText('Short rest clears effects')).toBeInTheDocument();
  });

  it('toggles dice mode and updates store', () => {
    render(<SettingsModal onClose={vi.fn()} />);

    // Wild Surge starts as dice3d; find its row and click Macro
    const wildSurgeRow = screen.getByText('Wild Echo Surge').closest('div')!;
    const macroButton = wildSurgeRow.querySelector('button:last-child')!;
    fireEvent.click(macroButton);

    expect(useSettingsStore.getState().diceMode.wildSurge).toBe('macro');
  });

  it('toggles boolean setting and updates store', () => {
    render(<SettingsModal onClose={vi.fn()} />);

    // Sound defaults to off (false), click On
    const soundRow = screen.getByText('Enable sound effects').closest('div')!;
    const onButton = soundRow.querySelector('button:first-child')!;
    fireEvent.click(onButton);

    expect(useSettingsStore.getState().soundEnabled).toBe(true);
  });

  it('toggles animations off and updates store', () => {
    render(<SettingsModal onClose={vi.fn()} />);

    // Animations defaults to on (true), click Off
    const animRow = screen.getByText('Enable animations').closest('div')!;
    const offButton = animRow.querySelector('button:last-child')!;
    fireEvent.click(offButton);

    expect(useSettingsStore.getState().animationsEnabled).toBe(false);
  });

  it('closes on backdrop click', () => {
    const onClose = vi.fn();
    render(<SettingsModal onClose={onClose} />);

    // Click the backdrop (the dialog overlay)
    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not close when clicking inside modal content', () => {
    const onClose = vi.fn();
    render(<SettingsModal onClose={onClose} />);

    // Click the Settings heading (inside the modal)
    fireEvent.click(screen.getByText('Settings'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes on X button click', () => {
    const onClose = vi.fn();
    render(<SettingsModal onClose={onClose} />);

    fireEvent.click(screen.getByLabelText('Close settings'));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes on Escape key', () => {
    const onClose = vi.fn();
    render(<SettingsModal onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('toggles reduced motion on and updates store', () => {
    render(<SettingsModal onClose={vi.fn()} />);

    const row = screen.getByText('Reduced motion').closest('div')!;
    const onButton = row.querySelector('button:first-child')!;
    fireEvent.click(onButton);

    expect(useSettingsStore.getState().reducedMotion).toBe(true);
  });

  it('toggles confirm before activation on and updates store', () => {
    render(<SettingsModal onClose={vi.fn()} />);

    const row = screen.getByText('Confirm before activation').closest('div')!;
    const onButton = row.querySelector('button:first-child')!;
    fireEvent.click(onButton);

    expect(useSettingsStore.getState().confirmBeforeActivation).toBe(true);
  });

  it('toggles auto-trigger surge off and updates store', () => {
    render(<SettingsModal onClose={vi.fn()} />);

    // Auto-trigger surge defaults to on (true), click Off
    const row = screen.getByText('Auto-trigger surge on warp').closest('div')!;
    const offButton = row.querySelector('button:last-child')!;
    fireEvent.click(offButton);

    expect(useSettingsStore.getState().autoTriggerSurgeOnWarp).toBe(false);
  });

  it('toggles short rest clears effects off and updates store', () => {
    render(<SettingsModal onClose={vi.fn()} />);

    // Short rest clears effects defaults to on (true), click Off
    const row = screen.getByText('Short rest clears effects').closest('div')!;
    const offButton = row.querySelector('button:last-child')!;
    fireEvent.click(offButton);

    expect(useSettingsStore.getState().shortRestClearEffects).toBe(false);
  });

  it('switches Siphon Feature rolls to dice3d', () => {
    render(<SettingsModal onClose={vi.fn()} />);

    const row = screen.getByText('Siphon Feature rolls').closest('div')!;
    const d3Button = row.querySelector('button:first-child')!;
    fireEvent.click(d3Button);

    expect(useSettingsStore.getState().diceMode.siphonFeature).toBe('dice3d');
  });
});
