import { useCharacterStore } from '../store/characterStore';
import { useSiphonStore } from '../store/siphonStore';
import { useManifoldStore } from '../store/manifoldStore';
import { useSettingsStore } from '../store/settingsStore';

const EXPORT_VERSION = 1;

interface ExportData {
  version: number;
  exportedAt: string;
  character: Record<string, unknown>;
  siphon: Record<string, unknown>;
  manifold: Record<string, unknown>;
  settings: Record<string, unknown>;
}

function extractState(store: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(store)) {
    if (typeof value !== 'function') {
      result[key] = value;
    }
  }
  return result;
}

export function exportAllState(): string {
  const data: ExportData = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    character: extractState(useCharacterStore.getState() as unknown as Record<string, unknown>),
    siphon: extractState(useSiphonStore.getState() as unknown as Record<string, unknown>),
    manifold: extractState(useManifoldStore.getState() as unknown as Record<string, unknown>),
    settings: extractState(useSettingsStore.getState() as unknown as Record<string, unknown>),
  };
  return JSON.stringify(data, null, 2);
}

export function importAllState(json: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(json) as Partial<ExportData>;

    if (!data.version || typeof data.version !== 'number') {
      return { success: false, error: 'Invalid export file: missing version' };
    }

    if (data.version > EXPORT_VERSION) {
      return { success: false, error: `Unsupported version: ${data.version}` };
    }

    if (data.character) {
      useCharacterStore.setState(data.character);
    }
    if (data.siphon) {
      useSiphonStore.setState(data.siphon);
    }
    if (data.manifold) {
      useManifoldStore.setState(data.manifold);
    }
    if (data.settings) {
      useSettingsStore.setState(data.settings);
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Failed to parse JSON file' };
  }
}

export function resetAllStores(): void {
  useCharacterStore.getState().resetCharacter();
  useSiphonStore.getState().resetSiphon();
  useManifoldStore.getState().resetManifold();
  useSettingsStore.getState().resetSettings();
}

/**
 * Reset combat state while preserving character setup, selected features, and settings.
 * Per DESIGN.md: EP → PB, Focus → 0, bestowments cleared, motes → 0.
 */
export function resetSession(proficiencyBonus: number): void {
  useSiphonStore.setState({
    currentEP: proficiencyBonus,
    focus: 0,
    siphonCapacitance: 0,
    capacitanceTimerStart: null,
    capacitanceInGameTime: null,
    capacitanceExpiresAt: null,
    handCardIds: [],
    allyBestowments: [],
    activeEffects: [],
    echoIntuitionActive: false,
  });
  useManifoldStore.setState({
    motes: 0,
    phaseSwitchAvailable: true,
    hitDiceSpentOnSwitch: 0,
    activeAbilities: [],
  });
}
