import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ActivationPanel } from '../combat-hud/ActivationPanel';
import { useSiphonStore } from '../../store';
import { useCharacterStore } from '../../store';
import { useSettingsStore } from '../../store';
import type { SiphonFeature } from '../../types';

const makeFeature = (overrides: Partial<SiphonFeature> = {}): SiphonFeature => ({
  id: 'test-feature',
  name: 'Test Feature',
  cost: 3,
  isSpecialCost: false,
  focusDice: '2d6',
  duration: '10 minutes',
  activation: 'Action',
  description: 'A test feature description.',
  warpEffect: null,
  tags: ['combat'],
  ...overrides,
});

function resetStores() {
  useSiphonStore.setState({
    currentEP: 10,
    focus: 0,
    siphonCapacitance: 0,
    capacitanceTimerStart: null,
    selectedCardIds: [],
    handCardIds: ['test-feature'],
    allies: [],
    allyBestowments: [],
    activeEffects: [],
    echoIntuitionActive: false,
  });
  useCharacterStore.setState({
    level: 5,
    proficiencyBonus: 3,
  });
  useSettingsStore.setState({
    diceMode: {
      wildSurge: 'dice3d',
      siphonFeature: 'macro',
      phaseAbility: 'macro',
      longRestFocus: 'macro',
    },
    autoTriggerSurgeOnWarp: true,
  });
}

describe('ActivationPanel', () => {
  const onComplete = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    resetStores();
    onComplete.mockClear();
    onCancel.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('displays feature name and description', () => {
    const feature = makeFeature({ name: 'Echo Relocation', description: 'Teleport up to 30 feet.' });
    render(<ActivationPanel feature={feature} onComplete={onComplete} onCancel={onCancel} />);

    expect(screen.getByText('Echo Relocation')).toBeInTheDocument();
    expect(screen.getByText('Teleport up to 30 feet.')).toBeInTheDocument();
  });

  it('shows EP cost and EP change preview', () => {
    useSiphonStore.setState({ currentEP: 8 });
    const feature = makeFeature({ cost: 3 });
    render(<ActivationPanel feature={feature} onComplete={onComplete} onCancel={onCancel} />);

    // Current EP shown
    expect(screen.getByText('8')).toBeInTheDocument();
    // New EP shown (8 - 3 = 5)
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows focus dice', () => {
    const feature = makeFeature({ focusDice: '2d6' });
    render(<ActivationPanel feature={feature} onComplete={onComplete} onCancel={onCancel} />);

    expect(screen.getByText('2d6')).toBeInTheDocument();
  });

  it('shows duration', () => {
    const feature = makeFeature({ duration: '10 minutes' });
    render(<ActivationPanel feature={feature} onComplete={onComplete} onCancel={onCancel} />);

    expect(screen.getByText('10 minutes')).toBeInTheDocument();
  });

  it('shows WARP WILL TRIGGER warning when EP will go negative', () => {
    useSiphonStore.setState({ currentEP: 2 });
    const feature = makeFeature({ cost: 5 });
    render(<ActivationPanel feature={feature} onComplete={onComplete} onCancel={onCancel} />);

    expect(screen.getByText('WARP WILL TRIGGER')).toBeInTheDocument();
  });

  it('does NOT show warp warning when EP stays non-negative', () => {
    useSiphonStore.setState({ currentEP: 10 });
    const feature = makeFeature({ cost: 3 });
    render(<ActivationPanel feature={feature} onComplete={onComplete} onCancel={onCancel} />);

    expect(screen.queryByText('WARP WILL TRIGGER')).not.toBeInTheDocument();
  });

  it('shows warp effect text in warp warning when present', () => {
    useSiphonStore.setState({ currentEP: 1 });
    const feature = makeFeature({ cost: 3, warpEffect: 'Reality flickers around you.' });
    render(<ActivationPanel feature={feature} onComplete={onComplete} onCancel={onCancel} />);

    expect(screen.getByText('Reality flickers around you.')).toBeInTheDocument();
  });

  it('shows Echo Intuition modifier badge when active', () => {
    useSiphonStore.setState({ currentEP: 10, echoIntuitionActive: true });
    const feature = makeFeature({ cost: 6 });
    render(<ActivationPanel feature={feature} onComplete={onComplete} onCancel={onCancel} />);

    expect(screen.getByText(/echo intuition/i)).toBeInTheDocument();
  });

  it('shows Siphon Greed modifier badge when applicable', () => {
    // Siphon Greed requires: selected + echo drained (EP <= -level)
    useSiphonStore.setState({
      currentEP: -6,
      selectedCardIds: ['siphon-greed'],
    });
    useCharacterStore.setState({ level: 5 });
    const feature = makeFeature({ cost: 4 });
    render(<ActivationPanel feature={feature} onComplete={onComplete} onCancel={onCancel} />);

    expect(screen.getByText(/siphon greed/i)).toBeInTheDocument();
  });

  it('calls onCancel when Cancel button is clicked', () => {
    const feature = makeFeature();
    render(<ActivationPanel feature={feature} onComplete={onComplete} onCancel={onCancel} />);

    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onCancel when backdrop is clicked', () => {
    const feature = makeFeature();
    render(<ActivationPanel feature={feature} onComplete={onComplete} onCancel={onCancel} />);

    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('shows "Roll in Foundry" button in macro mode', () => {
    useSettingsStore.setState({
      diceMode: {
        wildSurge: 'dice3d',
        siphonFeature: 'macro',
        phaseAbility: 'macro',
        longRestFocus: 'macro',
      },
    });
    const feature = makeFeature();
    render(<ActivationPanel feature={feature} onComplete={onComplete} onCancel={onCancel} />);

    expect(screen.getByText('Roll in Foundry')).toBeInTheDocument();
  });

  it('shows "Activate" button in dice3d mode', () => {
    useSettingsStore.setState({
      diceMode: {
        wildSurge: 'dice3d',
        siphonFeature: 'dice3d',
        phaseAbility: 'macro',
        longRestFocus: 'macro',
      },
    });
    const feature = makeFeature();
    render(<ActivationPanel feature={feature} onComplete={onComplete} onCancel={onCancel} />);

    expect(screen.getByText('Activate')).toBeInTheDocument();
  });

  it('shows macro preview text in macro mode', () => {
    const feature = makeFeature({ name: 'Subtle Luck', cost: 3, focusDice: '2d6' });
    render(<ActivationPanel feature={feature} onComplete={onComplete} onCancel={onCancel} />);

    // Macro format: /roll 2d6 # Focus for Subtle Luck (Cost: 3 EP)
    expect(screen.getByText(/\/roll 2d6 # Focus for Subtle Luck/)).toBeInTheDocument();
  });

  it('transitions to awaiting-result state in macro mode on confirm', () => {
    const feature = makeFeature();
    render(<ActivationPanel feature={feature} onComplete={onComplete} onCancel={onCancel} />);

    fireEvent.click(screen.getByText('Roll in Foundry'));

    // Now shows the MacroDisplay with result input
    expect(screen.getByLabelText('Focus roll result')).toBeInTheDocument();
  });

  it('completes activation when result entered in macro mode', () => {
    useSiphonStore.setState({ currentEP: 10, handCardIds: ['test-feature'] });
    const feature = makeFeature({ cost: 3, duration: 'Instant' });
    render(<ActivationPanel feature={feature} onComplete={onComplete} onCancel={onCancel} />);

    // Enter macro mode
    fireEvent.click(screen.getByText('Roll in Foundry'));

    // Enter focus result
    const input = screen.getByLabelText('Focus roll result');
    fireEvent.change(input, { target: { value: '7' } });
    fireEvent.click(screen.getByText('Apply'));

    // EP should be deducted (10 - 3 = 7), no warp
    expect(useSiphonStore.getState().currentEP).toBe(7);
    // Focus should be added
    expect(useSiphonStore.getState().focus).toBe(7);
    // onComplete called with null (no warp)
    expect(onComplete).toHaveBeenCalledWith(null);
  });

  it('doubles focus when EP is negative after cost deduction', () => {
    useSiphonStore.setState({ currentEP: 1, handCardIds: ['test-feature'] });
    const feature = makeFeature({ cost: 3, duration: 'Instant' });
    render(<ActivationPanel feature={feature} onComplete={onComplete} onCancel={onCancel} />);

    fireEvent.click(screen.getByText('Roll in Foundry'));

    const input = screen.getByLabelText('Focus roll result');
    fireEvent.change(input, { target: { value: '5' } });
    fireEvent.click(screen.getByText('Apply'));

    // EP: 1 - 3 = -2 (negative, warp triggers)
    expect(useSiphonStore.getState().currentEP).toBe(-2);
    // Focus should be doubled: 5 * 2 = 10
    expect(useSiphonStore.getState().focus).toBe(10);
  });

  it('shows warp result inline when autoSurge is on', () => {
    useSiphonStore.setState({ currentEP: 1, handCardIds: ['test-feature'] });
    useSettingsStore.setState({ autoTriggerSurgeOnWarp: true });
    const feature = makeFeature({ cost: 5, duration: 'Instant', warpEffect: 'Energy backlash!' });
    render(<ActivationPanel feature={feature} onComplete={onComplete} onCancel={onCancel} />);

    fireEvent.click(screen.getByText('Roll in Foundry'));

    const input = screen.getByLabelText('Focus roll result');
    fireEvent.change(input, { target: { value: '3' } });
    fireEvent.click(screen.getByText('Apply'));

    // Warp triggered, auto-surge is on -> inline warp result shown
    expect(screen.getByText('Warp Triggered!')).toBeInTheDocument();
    expect(screen.getByText('Wild Echo Surge')).toBeInTheDocument();
    // onComplete NOT called yet (waiting for dismiss)
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('dismiss warp result calls onComplete with surge', () => {
    useSiphonStore.setState({ currentEP: 1, handCardIds: ['test-feature'] });
    useSettingsStore.setState({ autoTriggerSurgeOnWarp: true });
    const feature = makeFeature({ cost: 5, duration: 'Instant' });
    render(<ActivationPanel feature={feature} onComplete={onComplete} onCancel={onCancel} />);

    fireEvent.click(screen.getByText('Roll in Foundry'));

    const input = screen.getByLabelText('Focus roll result');
    fireEvent.change(input, { target: { value: '3' } });
    fireEvent.click(screen.getByText('Apply'));

    // Dismiss the warp result
    fireEvent.click(screen.getByText('Dismiss'));
    expect(onComplete).toHaveBeenCalledOnce();
    // Should have a surge result (not null)
    expect(onComplete.mock.calls[0][0]).not.toBeNull();
    expect(onComplete.mock.calls[0][0]).toHaveProperty('tableRoll');
    expect(onComplete.mock.calls[0][0]).toHaveProperty('severity');
  });

  it('passes surge to onComplete when autoSurge is off', () => {
    useSiphonStore.setState({ currentEP: 1, handCardIds: ['test-feature'] });
    useSettingsStore.setState({ autoTriggerSurgeOnWarp: false });
    const feature = makeFeature({ cost: 5, duration: 'Instant' });
    render(<ActivationPanel feature={feature} onComplete={onComplete} onCancel={onCancel} />);

    fireEvent.click(screen.getByText('Roll in Foundry'));

    const input = screen.getByLabelText('Focus roll result');
    fireEvent.change(input, { target: { value: '3' } });
    fireEvent.click(screen.getByText('Apply'));

    // autoSurge off -> onComplete called directly with surge result
    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete.mock.calls[0][0]).not.toBeNull();
  });

  it('adds active effect for duration-based features', () => {
    useSiphonStore.setState({ currentEP: 10, handCardIds: ['test-feature'] });
    const feature = makeFeature({ duration: '10 minutes', requiresConcentration: true });
    render(<ActivationPanel feature={feature} onComplete={onComplete} onCancel={onCancel} />);

    fireEvent.click(screen.getByText('Roll in Foundry'));

    const input = screen.getByLabelText('Focus roll result');
    fireEvent.change(input, { target: { value: '4' } });
    fireEvent.click(screen.getByText('Apply'));

    const effects = useSiphonStore.getState().activeEffects;
    expect(effects).toHaveLength(1);
    expect(effects[0].sourceName).toBe('Test Feature');
    expect(effects[0].requiresConcentration).toBe(true);
    expect(effects[0].totalDuration).toBe('10 minutes');
  });

  it('does NOT add active effect for Instant features', () => {
    useSiphonStore.setState({ currentEP: 10, handCardIds: ['test-feature'] });
    const feature = makeFeature({ duration: 'Instant' });
    render(<ActivationPanel feature={feature} onComplete={onComplete} onCancel={onCancel} />);

    fireEvent.click(screen.getByText('Roll in Foundry'));

    const input = screen.getByLabelText('Focus roll result');
    fireEvent.change(input, { target: { value: '4' } });
    fireEvent.click(screen.getByText('Apply'));

    expect(useSiphonStore.getState().activeEffects).toHaveLength(0);
  });

  it('returns card to deck after activation', () => {
    useSiphonStore.setState({
      currentEP: 10,
      handCardIds: ['test-feature'],
      selectedCardIds: [],
    });
    const feature = makeFeature({ duration: 'Instant' });
    render(<ActivationPanel feature={feature} onComplete={onComplete} onCancel={onCancel} />);

    fireEvent.click(screen.getByText('Roll in Foundry'));

    const input = screen.getByLabelText('Focus roll result');
    fireEvent.change(input, { target: { value: '4' } });
    fireEvent.click(screen.getByText('Apply'));

    const state = useSiphonStore.getState();
    expect(state.handCardIds).not.toContain('test-feature');
    expect(state.selectedCardIds).toContain('test-feature');
  });

  // --- Varies cost tests ---

  it('shows cost input for Varies cost features', () => {
    const feature = makeFeature({ cost: 'Varies' });
    render(<ActivationPanel feature={feature} onComplete={onComplete} onCancel={onCancel} />);

    expect(screen.getByLabelText('Choose EP cost')).toBeInTheDocument();
  });

  it('disables confirm button when Varies cost is 0', () => {
    const feature = makeFeature({ cost: 'Varies' });
    render(<ActivationPanel feature={feature} onComplete={onComplete} onCancel={onCancel} />);

    const confirmBtn = screen.getByText('Roll in Foundry');
    expect(confirmBtn).toBeDisabled();
  });

  it('enables confirm button when Varies cost is entered', () => {
    const feature = makeFeature({ cost: 'Varies' });
    render(<ActivationPanel feature={feature} onComplete={onComplete} onCancel={onCancel} />);

    const costInput = screen.getByLabelText('Choose EP cost');
    fireEvent.change(costInput, { target: { value: '5' } });

    const confirmBtn = screen.getByText('Roll in Foundry');
    expect(confirmBtn).not.toBeDisabled();
  });

  it('uses chosen cost for EP deduction with Varies features', () => {
    useSiphonStore.setState({ currentEP: 10, handCardIds: ['test-feature'] });
    const feature = makeFeature({ cost: 'Varies', duration: 'Instant' });
    render(<ActivationPanel feature={feature} onComplete={onComplete} onCancel={onCancel} />);

    // Set cost to 4
    const costInput = screen.getByLabelText('Choose EP cost');
    fireEvent.change(costInput, { target: { value: '4' } });

    // Confirm and enter focus result
    fireEvent.click(screen.getByText('Roll in Foundry'));
    const focusInput = screen.getByLabelText('Focus roll result');
    fireEvent.change(focusInput, { target: { value: '6' } });
    fireEvent.click(screen.getByText('Apply'));

    // EP: 10 - 4 = 6
    expect(useSiphonStore.getState().currentEP).toBe(6);
    expect(onComplete).toHaveBeenCalledWith(null);
  });

  it('updates focus dice display reactively when Varies cost changes', () => {
    // Feature with [Cost]d8 focus dice — focus changes with cost
    const feature = makeFeature({ cost: 'Varies', focusDice: '[Cost]d8' });
    render(<ActivationPanel feature={feature} onComplete={onComplete} onCancel={onCancel} />);

    // Initially cost is 0, so focus dice shows "0d8" or similar
    const costInput = screen.getByLabelText('Choose EP cost');
    fireEvent.change(costInput, { target: { value: '3' } });

    // Focus dice should show "3d8"
    expect(screen.getByText('3d8')).toBeInTheDocument();
  });
});
