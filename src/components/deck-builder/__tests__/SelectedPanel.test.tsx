import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { SelectedPanel } from '../SelectedPanel';
import { useSiphonStore, useCharacterStore, useSettingsStore, useManifoldStore } from '../../../store';

function resetStores() {
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
  useCharacterStore.setState({
    level: 5,
    proficiencyBonus: 3,
    maxHP: 45,
    currentHP: 45,
    reducedMaxHP: 45,
    hitDice: 5,
    maxHitDice: 5,
  });
  useManifoldStore.setState({
    motes: 8,
    phaseSwitchAvailable: true,
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

function renderWithRouter(ui: React.ReactElement) {
  const router = createMemoryRouter(
    [{ path: '/', element: ui }, { path: '/combat', element: <div>Combat</div> }],
    { initialEntries: ['/'] }
  );
  return render(<RouterProvider router={router} />);
}

describe('SelectedPanel', () => {
  beforeEach(() => {
    resetStores();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows "Selected (0/PB)" when no cards selected', () => {
    renderWithRouter(<SelectedPanel />);

    expect(screen.getByText('Selected (0/3)')).toBeInTheDocument();
  });

  it('shows selected cards as compact SiphonCards', () => {
    useSiphonStore.setState({
      selectedCardIds: ['subtle-luck', 'temporal-surge'],
    });

    renderWithRouter(<SelectedPanel />);

    expect(screen.getByLabelText('Subtle Luck')).toBeInTheDocument();
    expect(screen.getByLabelText('Temporal Surge')).toBeInTheDocument();
  });

  it('counter updates: "Selected (N/PB)"', () => {
    useSiphonStore.setState({
      selectedCardIds: ['subtle-luck', 'temporal-surge'],
    });

    renderWithRouter(<SelectedPanel />);

    expect(screen.getByText('Selected (2/3)')).toBeInTheDocument();
  });

  it('Supercapacitance counter: "Selected (N/PB) (Supercapacitance +M)"', () => {
    useSiphonStore.setState({
      selectedCardIds: ['supercapacitance', 'subtle-luck', 'temporal-surge', 'echo-relocation'],
    });

    renderWithRouter(<SelectedPanel />);

    expect(screen.getByText('Selected (4/3)')).toBeInTheDocument();
    expect(screen.getByText('(Supercapacitance +1)')).toBeInTheDocument();
  });

  it('clicking a card deselects it', () => {
    useSiphonStore.setState({
      selectedCardIds: ['subtle-luck', 'temporal-surge'],
    });

    renderWithRouter(<SelectedPanel />);

    const card = screen.getByLabelText('Subtle Luck');
    fireEvent.click(card);

    expect(useSiphonStore.getState().selectedCardIds).not.toContain('subtle-luck');
  });

  it('Long Rest button opens LongRestDialog', () => {
    renderWithRouter(<SelectedPanel />);

    const longRestBtn = screen.getByRole('button', { name: 'Long Rest' });
    fireEvent.click(longRestBtn);

    // LongRestDialog renders with a confirm button
    expect(screen.getByText('Confirm Long Rest')).toBeInTheDocument();
  });

  it('Short Rest button opens ShortRestDialog', () => {
    renderWithRouter(<SelectedPanel />);

    const shortRestBtn = screen.getByRole('button', { name: 'Short Rest' });
    fireEvent.click(shortRestBtn);

    // ShortRestDialog renders with a confirm button
    expect(screen.getByText('Confirm Short Rest')).toBeInTheDocument();
  });

  it('Enter Combat button triggers navigation', () => {
    renderWithRouter(<SelectedPanel />);

    const enterCombatBtn = screen.getByRole('button', { name: 'Enter Combat' });
    fireEvent.click(enterCombatBtn);

    // After navigation, we should see the combat route content
    expect(screen.getByText('Combat')).toBeInTheDocument();
  });
});
