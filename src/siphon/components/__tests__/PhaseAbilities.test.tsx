import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act, fireEvent } from '@testing-library/react';
import { PhaseAbilities } from '../combat-hud/PhaseAbilities';
import { useManifoldStore } from '../../store';

function resetStore() {
  useManifoldStore.setState({
    currentPhase: 'Constellation',
    motes: 0,
    maxMotes: 8,
    phaseSwitchAvailable: true,
    hitDiceSpentOnSwitch: 0,
    activeAbilities: [],
  });
}

describe('PhaseAbilities', () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders phase abilities as compact bars', () => {
    render(<PhaseAbilities />);

    // Constellation phase has 3 abilities
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
  });

  it('shows ability names', () => {
    render(<PhaseAbilities />);

    expect(screen.getByText('Echo Conduit')).toBeInTheDocument();
    expect(screen.getByText('Siphon Suffering')).toBeInTheDocument();
    expect(screen.getByText('Temporal Reprise')).toBeInTheDocument();
  });

  it('shows mote costs', () => {
    render(<PhaseAbilities />);

    expect(screen.getByText('1m')).toBeInTheDocument();
    expect(screen.getByText('2m')).toBeInTheDocument();
    expect(screen.getByText('3m')).toBeInTheDocument();
  });

  it('shows activation type badges', () => {
    render(<PhaseAbilities />);

    // Echo Conduit = Bonus Action → "BA"
    expect(screen.getByText('BA')).toBeInTheDocument();
    // Siphon Suffering = Reaction → "R"
    expect(screen.getByText('R')).toBeInTheDocument();
    // Temporal Reprise = Action → "A"
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('updates when phase changes', () => {
    render(<PhaseAbilities />);

    expect(screen.getByText('Echo Conduit')).toBeInTheDocument();

    // Switch to Oblivion phase
    act(() => {
      useManifoldStore.setState({ currentPhase: 'Oblivion' });
    });

    // Oblivion abilities should now be rendered
    expect(screen.getByText('Echo Surge')).toBeInTheDocument();
  });

  it('has accessible list structure', () => {
    render(<PhaseAbilities />);

    expect(screen.getByRole('list', { name: 'Phase abilities' })).toBeInTheDocument();
  });

  it('shows description on hover', () => {
    render(<PhaseAbilities />);

    const items = screen.getAllByRole('listitem');
    fireEvent.mouseEnter(items[0]);

    expect(screen.getByText(/one ally within the next minute/i)).toBeInTheDocument();
  });

  it('shows limitation on hover', () => {
    render(<PhaseAbilities />);

    const items = screen.getAllByRole('listitem');
    fireEvent.mouseEnter(items[0]);

    const detail = screen.getByTestId('ability-detail-echo-conduit');
    expect(detail.textContent).toContain('Limit');
    expect(detail.textContent).toMatch(/the action may only be used/i);
  });

  it('detail section is collapsed when not hovered', () => {
    render(<PhaseAbilities />);

    const detail = screen.getByTestId('ability-detail-echo-conduit');
    expect(detail.style.maxHeight).toBe('0px');
  });

  it('does not use title attribute for description', () => {
    render(<PhaseAbilities />);

    const items = screen.getAllByRole('listitem');
    items.forEach((item) => {
      expect(item).not.toHaveAttribute('title');
    });
  });
});
