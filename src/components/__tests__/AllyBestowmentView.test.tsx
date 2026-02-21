import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { AllyBestowmentView } from '../combat-hud/AllyBestowmentView';
import { useSiphonStore } from '../../store';

function resetStore() {
  useSiphonStore.setState({
    currentEP: 0,
    focus: 0,
    siphonCapacitance: 0,
    capacitanceTimerStart: null,
    selectedCardIds: [],
    handCardIds: [],
    allies: [{ id: 'a1', name: 'Briar' }],
    allyBestowments: [],
    activeEffects: [],
    echoIntuitionActive: false,
  });
}

describe('AllyBestowmentView', () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows empty state when ally has no bestowments', () => {
    render(
      <AllyBestowmentView allyId="a1" allyName="Briar" onDismiss={vi.fn()} />
    );

    expect(screen.getByText('Viewing: Briar')).toBeInTheDocument();
    expect(screen.getByText(/no features bestowed/i)).toBeInTheDocument();
  });

  it('displays bestowed cards as SiphonCard components', () => {
    useSiphonStore.setState({
      selectedCardIds: ['subtle-luck', 'temporal-surge'],
      allyBestowments: [
        { id: 'b1', allyId: 'a1', featureId: 'subtle-luck', isFromSelectedDeck: true, bestowedAt: 1 },
        { id: 'b2', allyId: 'a1', featureId: 'temporal-surge', isFromSelectedDeck: true, bestowedAt: 2 },
      ],
    });

    render(
      <AllyBestowmentView allyId="a1" allyName="Briar" onDismiss={vi.fn()} />
    );

    expect(screen.getByText('Viewing: Briar')).toBeInTheDocument();
    // Cards should be visible (by name in SiphonCard)
    expect(screen.getByText('Subtle Luck')).toBeInTheDocument();
    expect(screen.getByText('Temporal Surge')).toBeInTheDocument();
  });

  it('groups cards into Selected Deck and All Features sections', () => {
    useSiphonStore.setState({
      selectedCardIds: ['subtle-luck'], // Only subtle-luck is still selected
      allyBestowments: [
        { id: 'b1', allyId: 'a1', featureId: 'subtle-luck', isFromSelectedDeck: true, bestowedAt: 1 },
        { id: 'b2', allyId: 'a1', featureId: 'temporal-surge', isFromSelectedDeck: true, bestowedAt: 2 },
      ],
    });

    render(
      <AllyBestowmentView allyId="a1" allyName="Briar" onDismiss={vi.fn()} />
    );

    expect(screen.getByText('From Selected Deck')).toBeInTheDocument();
    expect(screen.getByText('From All Features')).toBeInTheDocument();
  });

  it('removes a bestowment when remove button is clicked', () => {
    useSiphonStore.setState({
      selectedCardIds: ['subtle-luck'],
      allyBestowments: [
        { id: 'b1', allyId: 'a1', featureId: 'subtle-luck', isFromSelectedDeck: true, bestowedAt: 1 },
      ],
    });

    render(
      <AllyBestowmentView allyId="a1" allyName="Briar" onDismiss={vi.fn()} />
    );

    fireEvent.click(screen.getByRole('button', { name: /remove subtle luck from briar/i }));

    const state = useSiphonStore.getState();
    expect(state.allyBestowments).toHaveLength(0);
  });

  it('only shows bestowments for the specified ally', () => {
    useSiphonStore.setState({
      allies: [
        { id: 'a1', name: 'Briar' },
        { id: 'a2', name: 'Asmo' },
      ],
      selectedCardIds: ['subtle-luck', 'temporal-surge'],
      allyBestowments: [
        { id: 'b1', allyId: 'a1', featureId: 'subtle-luck', isFromSelectedDeck: true, bestowedAt: 1 },
        { id: 'b2', allyId: 'a2', featureId: 'temporal-surge', isFromSelectedDeck: true, bestowedAt: 2 },
      ],
    });

    render(
      <AllyBestowmentView allyId="a1" allyName="Briar" onDismiss={vi.fn()} />
    );

    expect(screen.getByText('Subtle Luck')).toBeInTheDocument();
    expect(screen.queryByText('Temporal Surge')).not.toBeInTheDocument();
  });

  it('calls onDismiss when backdrop is clicked', () => {
    useSiphonStore.setState({
      allyBestowments: [
        { id: 'b1', allyId: 'a1', featureId: 'subtle-luck', isFromSelectedDeck: true, bestowedAt: 1 },
      ],
      selectedCardIds: ['subtle-luck'],
    });

    const onDismiss = vi.fn();
    render(
      <AllyBestowmentView allyId="a1" allyName="Briar" onDismiss={onDismiss} />
    );

    // Click the backdrop (dialog overlay)
    fireEvent.click(screen.getByRole('dialog'));

    expect(onDismiss).toHaveBeenCalled();
  });

  it('shows ally name badge on cards', () => {
    useSiphonStore.setState({
      selectedCardIds: ['subtle-luck'],
      allyBestowments: [
        { id: 'b1', allyId: 'a1', featureId: 'subtle-luck', isFromSelectedDeck: true, bestowedAt: 1 },
      ],
    });

    render(
      <AllyBestowmentView allyId="a1" allyName="Briar" onDismiss={vi.fn()} />
    );

    // The SiphonCard should show the ally badge with → Briar
    expect(screen.getByText(/→ Briar/)).toBeInTheDocument();
  });

  it('shows only From All Features when no bestowed cards are in selected deck', () => {
    useSiphonStore.setState({
      selectedCardIds: [], // No cards selected
      allyBestowments: [
        { id: 'b1', allyId: 'a1', featureId: 'subtle-luck', isFromSelectedDeck: true, bestowedAt: 1 },
      ],
    });

    render(
      <AllyBestowmentView allyId="a1" allyName="Briar" onDismiss={vi.fn()} />
    );

    expect(screen.queryByText('From Selected Deck')).not.toBeInTheDocument();
    expect(screen.getByText('From All Features')).toBeInTheDocument();
  });
});
