import { useEffect } from 'react';
import { useSettingsStore } from '../../store';
import { DiceModeToggle } from './DiceModeToggle';
import { ManualOverrides } from './ManualOverrides';
import { DataManagement } from './DataManagement';

interface SettingsModalProps {
  onClose: () => void;
}

function BooleanToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-text-secondary">{label}</span>
      <div className="flex gap-0.5 rounded border border-siphon-border overflow-hidden">
        <button
          className={`px-3 py-1 text-xs font-medium transition-colors ${
            value
              ? 'bg-siphon-accent/20 text-siphon-accent'
              : 'text-text-muted hover:text-text-secondary'
          }`}
          onClick={() => onChange(true)}
          aria-pressed={value}
        >
          On
        </button>
        <button
          className={`px-3 py-1 text-xs font-medium transition-colors ${
            !value
              ? 'bg-siphon-accent/20 text-siphon-accent'
              : 'text-text-muted hover:text-text-secondary'
          }`}
          onClick={() => onChange(false)}
          aria-pressed={!value}
        >
          Off
        </button>
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] uppercase tracking-widest text-text-muted mt-4 mb-2 first:mt-0">
      {children}
    </h3>
  );
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const diceMode = useSettingsStore((s) => s.diceMode);
  const setDiceMode = useSettingsStore((s) => s.setDiceMode);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled);
  const animationsEnabled = useSettingsStore((s) => s.animationsEnabled);
  const setAnimationsEnabled = useSettingsStore((s) => s.setAnimationsEnabled);
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);
  const setReducedMotion = useSettingsStore((s) => s.setReducedMotion);
  const confirmBeforeActivation = useSettingsStore((s) => s.confirmBeforeActivation);
  const setConfirmBeforeActivation = useSettingsStore((s) => s.setConfirmBeforeActivation);
  const autoTriggerSurgeOnWarp = useSettingsStore((s) => s.autoTriggerSurgeOnWarp);
  const setAutoTriggerSurgeOnWarp = useSettingsStore((s) => s.setAutoTriggerSurgeOnWarp);
  const shortRestClearEffects = useSettingsStore((s) => s.shortRestClearEffects);
  const setShortRestClearEffects = useSettingsStore((s) => s.setShortRestClearEffects);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-label="Settings"
    >
      <div
        className="bg-siphon-surface border border-siphon-border rounded-lg p-5 w-full max-w-md max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text-primary">Settings</h2>
          <button
            className="text-text-muted hover:text-text-primary transition-colors text-lg leading-none"
            onClick={onClose}
            aria-label="Close settings"
          >
            &times;
          </button>
        </div>

        {/* Dice Rolls */}
        <SectionHeading>Dice Rolls</SectionHeading>
        <div className="space-y-1">
          <DiceModeToggle
            label="Wild Echo Surge"
            value={diceMode.wildSurge}
            onChange={(mode) => setDiceMode('wildSurge', mode)}
          />
          <DiceModeToggle
            label="Siphon Feature rolls"
            value={diceMode.siphonFeature}
            onChange={(mode) => setDiceMode('siphonFeature', mode)}
          />
          <DiceModeToggle
            label="Phase Ability rolls"
            value={diceMode.phaseAbility}
            onChange={(mode) => setDiceMode('phaseAbility', mode)}
          />
          <DiceModeToggle
            label="Long Rest Focus reduction"
            value={diceMode.longRestFocus}
            onChange={(mode) => setDiceMode('longRestFocus', mode)}
          />
        </div>

        {/* Sound */}
        <SectionHeading>Sound</SectionHeading>
        <BooleanToggle
          label="Enable sound effects"
          value={soundEnabled}
          onChange={setSoundEnabled}
        />

        {/* Visual */}
        <SectionHeading>Visual</SectionHeading>
        <div className="space-y-1">
          <BooleanToggle
            label="Enable animations"
            value={animationsEnabled}
            onChange={setAnimationsEnabled}
          />
          <BooleanToggle
            label="Reduced motion"
            value={reducedMotion}
            onChange={setReducedMotion}
          />
        </div>

        {/* Gameplay */}
        <SectionHeading>Gameplay</SectionHeading>
        <div className="space-y-1">
          <BooleanToggle
            label="Confirm before activation"
            value={confirmBeforeActivation}
            onChange={setConfirmBeforeActivation}
          />
          <BooleanToggle
            label="Auto-trigger surge on warp"
            value={autoTriggerSurgeOnWarp}
            onChange={setAutoTriggerSurgeOnWarp}
          />
          <BooleanToggle
            label="Short rest clears effects"
            value={shortRestClearEffects}
            onChange={setShortRestClearEffects}
          />
        </div>

        {/* Manual Overrides */}
        <SectionHeading>Manual Overrides</SectionHeading>
        <ManualOverrides />

        {/* Data */}
        <SectionHeading>Data</SectionHeading>
        <DataManagement />
      </div>
    </div>
  );
}
