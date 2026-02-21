import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { CharacterHeader } from '../CharacterHeader';
import { useCharacterStore } from '../../../store';

function resetStore() {
  useCharacterStore.setState({
    level: 5,
    proficiencyBonus: 3,
    maxHP: 45,

    reducedMaxHP: 45,
    hitDice: 5,
    maxHitDice: 5,
  });
}

describe('CharacterHeader', () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders Level and Max HP inputs with current store values', () => {
    render(<CharacterHeader />);

    const levelInput = screen.getByLabelText('Level') as HTMLInputElement;
    const maxHPInput = screen.getByLabelText('Max HP') as HTMLInputElement;

    expect(levelInput.value).toBe('5');
    expect(maxHPInput.value).toBe('45');
  });

  it('updates characterStore.level when Level input changes', () => {
    render(<CharacterHeader />);

    const levelInput = screen.getByLabelText('Level');
    fireEvent.change(levelInput, { target: { value: '10' } });

    expect(useCharacterStore.getState().level).toBe(10);
  });

  it('clamps Level input to 1-20', () => {
    render(<CharacterHeader />);

    const levelInput = screen.getByLabelText('Level');

    fireEvent.change(levelInput, { target: { value: '25' } });
    expect(useCharacterStore.getState().level).toBe(20);

    fireEvent.change(levelInput, { target: { value: '0' } });
    expect(useCharacterStore.getState().level).toBe(1);
  });

  it('updates characterStore.maxHP when Max HP input changes', () => {
    render(<CharacterHeader />);

    const maxHPInput = screen.getByLabelText('Max HP');
    fireEvent.change(maxHPInput, { target: { value: '60' } });

    expect(useCharacterStore.getState().maxHP).toBe(60);
  });

  it('displays PB correctly for the level', () => {
    render(<CharacterHeader />);

    // Level 5 → PB 3
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('(auto)')).toBeInTheDocument();
  });

  it('displays EP Max equal to Level', () => {
    render(<CharacterHeader />);

    // Level 5 → EP Max 5
    expect(screen.getByText('EP Max:')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows Current Max HP without Echo Drain text when not reduced', () => {
    render(<CharacterHeader />);

    expect(screen.getByText('Current Max HP:')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.queryByText(/Echo Drain/)).not.toBeInTheDocument();
  });

  it('shows Echo Drain reduction when reducedMaxHP < maxHP', () => {
    useCharacterStore.setState({ reducedMaxHP: 38 });

    render(<CharacterHeader />);

    expect(screen.getByText(/45 → 38/)).toBeInTheDocument();
    expect(screen.getByText(/\(-7 from Echo Drain\)/)).toBeInTheDocument();
  });
});
