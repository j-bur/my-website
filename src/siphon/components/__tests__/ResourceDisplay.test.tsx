import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import { ResourceDisplay } from '../combat-hud/ResourceDisplay';
import { useSiphonStore, useCharacterStore } from '../../store';

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
    name: '',
    level: 5,
    proficiencyBonus: 3,
    maxHP: 45,

    reducedMaxHP: 45,
    spellSaveDC: 13,
    hitDice: 5,
    maxHitDice: 5,
  });
}

describe('ResourceDisplay', () => {
  beforeEach(() => {
    resetStores();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders all resource components', () => {
    render(<ResourceDisplay />);

    expect(screen.getByRole('group', { name: /focus/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /echo points/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /hit dice/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /capacitance/i })).toBeInTheDocument();
  });

  it('displays EP value correctly', () => {
    useSiphonStore.setState({ currentEP: 3 });
    render(<ResourceDisplay />);

    const epGroup = screen.getByRole('group', { name: /echo points/i });
    expect(within(epGroup).getByText('3')).toBeInTheDocument();
  });

  it('displays negative EP correctly', () => {
    useSiphonStore.setState({ currentEP: -2 });
    render(<ResourceDisplay />);

    const epGroup = screen.getByRole('group', { name: /echo points/i });
    expect(within(epGroup).getByText('-2')).toBeInTheDocument();
  });

  it('displays Focus value', () => {
    useSiphonStore.setState({ focus: 7 });
    render(<ResourceDisplay />);

    const focusGroup = screen.getByRole('group', { name: /focus/i });
    expect(within(focusGroup).getByText('7')).toBeInTheDocument();
  });

  it('displays Hit Dice as current/max', () => {
    useCharacterStore.setState({ hitDice: 3, maxHitDice: 5 });
    render(<ResourceDisplay />);

    const hdGroup = screen.getByRole('group', { name: /hit dice/i });
    expect(within(hdGroup).getByText('3/5')).toBeInTheDocument();
  });

  it('displays Capacitance as current/max', () => {
    useSiphonStore.setState({ siphonCapacitance: 2 });
    useCharacterStore.setState({ proficiencyBonus: 3 });
    render(<ResourceDisplay />);

    const capGroup = screen.getByRole('group', { name: /capacitance/i });
    expect(within(capGroup).getByText('2/3')).toBeInTheDocument();
  });
});
