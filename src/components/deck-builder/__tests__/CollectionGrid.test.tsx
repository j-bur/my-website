import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { CollectionGrid } from '../CollectionGrid';
import { useSiphonStore, useCharacterStore } from '../../../store';
import { SIPHON_FEATURES } from '../../../data/siphonFeatures';

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
}

describe('CollectionGrid', () => {
  beforeEach(() => {
    resetStores();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders all 42 feature cards', () => {
    render(<CollectionGrid />);

    const cards = screen.getAllByRole('button');
    expect(cards.length).toBe(SIPHON_FEATURES.length);
  });

  it('filter dropdown shows tag options', () => {
    render(<CollectionGrid />);

    const select = screen.getByLabelText('Filter by tag') as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.value);

    expect(options).toContain('All');
    expect(options).toContain('combat');
    expect(options).toContain('utility');
    expect(options).toContain('healing');
  });

  it('selecting a tag filters to only matching features', () => {
    render(<CollectionGrid />);

    const select = screen.getByLabelText('Filter by tag');
    fireEvent.change(select, { target: { value: 'healing' } });

    const healingFeatures = SIPHON_FEATURES.filter((f) =>
      f.tags?.includes('healing')
    );
    const cards = screen.getAllByRole('button');
    expect(cards.length).toBe(healingFeatures.length);
  });

  it('search input filters by name (case-insensitive)', () => {
    render(<CollectionGrid />);

    const searchInput = screen.getByLabelText('Search by name');
    fireEvent.change(searchInput, { target: { value: 'subtle' } });

    expect(screen.getByText('Subtle Luck')).toBeInTheDocument();
    // Other cards should be filtered out
    expect(screen.queryByText('Temporal Surge')).not.toBeInTheDocument();
  });

  it('combined filter + search works', () => {
    render(<CollectionGrid />);

    const select = screen.getByLabelText('Filter by tag');
    fireEvent.change(select, { target: { value: 'buff' } });

    const searchInput = screen.getByLabelText('Search by name');
    fireEvent.change(searchInput, { target: { value: 'subtle' } });

    // Only Subtle Luck should match both "buff" tag and "subtle" search
    const cards = screen.getAllByRole('button');
    expect(cards.length).toBe(1);
    expect(screen.getByText('Subtle Luck')).toBeInTheDocument();
  });

  it('clicking an unselected card calls selectCard', () => {
    render(<CollectionGrid />);

    const card = screen.getByLabelText('Subtle Luck');
    fireEvent.click(card);

    expect(useSiphonStore.getState().selectedCardIds).toContain('subtle-luck');
  });

  it('clicking a selected card calls deselectCard', () => {
    useSiphonStore.setState({ selectedCardIds: ['subtle-luck'] });

    render(<CollectionGrid />);

    const card = screen.getByLabelText('Subtle Luck');
    fireEvent.click(card);

    expect(useSiphonStore.getState().selectedCardIds).not.toContain('subtle-luck');
  });

  it('selected cards have glowing border (ring class)', () => {
    useSiphonStore.setState({ selectedCardIds: ['subtle-luck'] });

    render(<CollectionGrid />);

    const card = screen.getByLabelText('Subtle Luck');
    // The ring wrapper is the parent div
    const wrapper = card.closest('.ring-2');
    expect(wrapper).not.toBeNull();
  });

  it('selection blocked when at PB limit', () => {
    // PB = 3, fill with 3 cards
    useSiphonStore.setState({
      selectedCardIds: ['subtle-luck', 'temporal-surge', 'echo-relocation'],
    });

    render(<CollectionGrid />);

    // Try selecting a 4th card
    const card = screen.getByLabelText('Resonant Weapon');
    fireEvent.click(card);

    // selectCard returns false when at limit — card should not be added
    expect(useSiphonStore.getState().selectedCardIds).not.toContain('resonant-weapon');
  });

  it('Supercapacitance allows exceeding PB limit', () => {
    // PB = 3, select supercapacitance + 2 others = 3 cards
    useSiphonStore.setState({
      selectedCardIds: ['supercapacitance', 'subtle-luck', 'temporal-surge'],
    });

    render(<CollectionGrid />);

    // With supercapacitance selected, maxCards = 42, so a 4th card should work
    const card = screen.getByLabelText('Resonant Weapon');
    fireEvent.click(card);

    expect(useSiphonStore.getState().selectedCardIds).toContain('resonant-weapon');
  });
});
