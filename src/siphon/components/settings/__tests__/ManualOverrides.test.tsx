import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ManualOverrides } from '../ManualOverrides';
import { useSiphonStore } from '../../../store/siphonStore';
import { useCharacterStore } from '../../../store/characterStore';
import { useManifoldStore } from '../../../store/manifoldStore';

function resetStores() {
  useCharacterStore.getState().resetCharacter();
  useSiphonStore.getState().resetSiphon();
  useManifoldStore.getState().resetManifold();
}

describe('ManualOverrides', () => {
  beforeEach(() => {
    resetStores();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders all override inputs', () => {
    render(<ManualOverrides />);

    expect(screen.getByLabelText('Echo Points (EP)')).toBeInTheDocument();
    expect(screen.getByLabelText('Focus')).toBeInTheDocument();
    expect(screen.getByLabelText('Motes')).toBeInTheDocument();
    expect(screen.getByLabelText('Hit Dice')).toBeInTheDocument();
    expect(screen.getByLabelText('Max HP Reduction')).toBeInTheDocument();
  });

  it('updates EP via input', () => {
    render(<ManualOverrides />);

    const input = screen.getByLabelText('Echo Points (EP)');
    fireEvent.change(input, { target: { value: '-3' } });

    expect(useSiphonStore.getState().currentEP).toBe(-3);
  });

  it('updates Focus via + button', () => {
    useSiphonStore.getState().setFocus(5);
    render(<ManualOverrides />);

    const btn = screen.getByLabelText('Increase Focus');
    fireEvent.click(btn);

    expect(useSiphonStore.getState().focus).toBe(6);
  });

  it('updates Motes via − button', () => {
    render(<ManualOverrides />);

    const btn = screen.getByLabelText('Decrease Motes');
    fireEvent.click(btn);

    // Default motes is 8, after decrease it should be 7
    expect(useManifoldStore.getState().motes).toBe(7);
  });

  it('clamps Motes to 0-8 range', () => {
    useManifoldStore.getState().setMotes(0);
    render(<ManualOverrides />);

    const btn = screen.getByLabelText('Decrease Motes');
    fireEvent.click(btn);

    expect(useManifoldStore.getState().motes).toBe(0);
  });

  it('updates Hit Dice via input', () => {
    useCharacterStore.getState().setLevel(10);
    render(<ManualOverrides />);

    const input = screen.getByLabelText('Hit Dice');
    fireEvent.change(input, { target: { value: '3' } });

    expect(useCharacterStore.getState().hitDice).toBe(3);
  });

  it('clamps Hit Dice to 0-level range', () => {
    useCharacterStore.getState().setLevel(5);
    render(<ManualOverrides />);

    const input = screen.getByLabelText('Hit Dice');
    fireEvent.change(input, { target: { value: '99' } });

    expect(useCharacterStore.getState().hitDice).toBe(5);
  });

  it('updates Max HP Reduction and adjusts reducedMaxHP', () => {
    useCharacterStore.getState().setMaxHP(45);
    render(<ManualOverrides />);

    const input = screen.getByLabelText('Max HP Reduction');
    fireEvent.change(input, { target: { value: '7' } });

    expect(useCharacterStore.getState().reducedMaxHP).toBe(38);
  });

  it('shows Echo Drained note when EP <= -level', () => {
    useCharacterStore.getState().setLevel(5);
    useSiphonStore.getState().setEP(-5);
    render(<ManualOverrides />);

    expect(screen.getByText('Echo Drained')).toBeInTheDocument();
  });
});
