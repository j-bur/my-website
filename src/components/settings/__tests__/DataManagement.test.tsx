import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { DataManagement } from '../DataManagement';
import { useSiphonStore } from '../../../store/siphonStore';
import { useCharacterStore } from '../../../store/characterStore';
import { useManifoldStore } from '../../../store/manifoldStore';
import { useSettingsStore } from '../../../store/settingsStore';

function resetStores() {
  useCharacterStore.getState().resetCharacter();
  useSiphonStore.getState().resetSiphon();
  useManifoldStore.getState().resetManifold();
  useSettingsStore.getState().resetSettings();
}

describe('DataManagement', () => {
  beforeEach(() => {
    resetStores();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders all four buttons', () => {
    render(<DataManagement />);

    expect(screen.getByText('Export Data')).toBeInTheDocument();
    expect(screen.getByText('Import Data')).toBeInTheDocument();
    expect(screen.getByText('Reset Session')).toBeInTheDocument();
    expect(screen.getByText('Clear All Data')).toBeInTheDocument();
  });

  it('export creates a download link', () => {
    const mockClick = vi.fn();
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    // Save original before spying
    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        return { click: mockClick, href: '', download: '' } as unknown as HTMLAnchorElement;
      }
      return origCreateElement(tag);
    });

    render(<DataManagement />);
    fireEvent.click(screen.getByText('Export Data'));

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test');
  });

  it('import reads a JSON file and restores state', async () => {
    const exportData = JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      character: { level: 15, proficiencyBonus: 5, maxHP: 10, currentHP: 10, reducedMaxHP: 10, hitDice: 15, maxHitDice: 15, name: '', spellSaveDC: 13 },
    });

    render(<DataManagement />);

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement;
    const file = new File([exportData], 'test.json', { type: 'application/json' });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
      // Wait for FileReader to complete
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(useCharacterStore.getState().level).toBe(15);
  });

  it('reset session sets EP to PB and clears combat state', () => {
    useCharacterStore.getState().setLevel(5); // PB = 3
    useSiphonStore.getState().setEP(-5);
    useSiphonStore.getState().setFocus(20);

    render(<DataManagement />);
    fireEvent.click(screen.getByText('Reset Session'));

    expect(useSiphonStore.getState().currentEP).toBe(3); // EP → PB
    expect(useSiphonStore.getState().focus).toBe(0);
  });

  it('clear all data requires confirmation', () => {
    useCharacterStore.getState().setLevel(10);

    render(<DataManagement />);

    // First click shows confirmation
    fireEvent.click(screen.getByText('Clear All Data'));
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(useCharacterStore.getState().level).toBe(10); // Not cleared yet

    // Second click actually clears
    fireEvent.click(screen.getByText('Are you sure?'));
    expect(useCharacterStore.getState().level).toBe(1); // Reset to default
  });

  it('clear all data confirmation resets on blur', () => {
    render(<DataManagement />);

    fireEvent.click(screen.getByText('Clear All Data'));
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();

    // Blur the button
    fireEvent.blur(screen.getByText('Are you sure?'));
    expect(screen.getByText('Clear All Data')).toBeInTheDocument();
  });
});
