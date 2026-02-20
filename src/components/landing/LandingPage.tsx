import { useNavigate } from 'react-router-dom';
import { GlitchButton } from './GlitchButton';
import { useCharacterStore } from '../../store';
import { useSiphonStore } from '../../store';

export function LandingPage() {
  const navigate = useNavigate();
  const { name, level, currentHP, reducedMaxHP } = useCharacterStore();
  const { currentEP, focus } = useSiphonStore();

  const hasExistingState = currentEP !== 5 || focus !== 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-siphon-bg">
      {/* Title */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-light tracking-widest text-text-primary mb-4">
          THE SIPHON
        </h1>
        <p className="text-text-muted text-lg italic">
          This demiplane holds only a door.
        </p>
      </div>

      {/* Existing state indicator */}
      {hasExistingState && (
        <div className="mb-8 p-4 border border-siphon-border rounded-lg bg-siphon-surface text-center">
          <p className="text-text-secondary text-sm mb-2">Active Session</p>
          <p className="text-text-primary">
            {name} • Level {level}
          </p>
          <p className="text-sm text-text-secondary">
            HP: {currentHP}/{reducedMaxHP} • EP: {currentEP}/{level} • Focus: {focus}
          </p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-col gap-6 w-full max-w-xs">
        <a
          href="https://foundry.jamesburns.cc"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-4 px-8 text-center text-text-primary bg-siphon-surface border border-siphon-border rounded-lg hover:border-siphon-accent transition-colors duration-200"
        >
          Launch FoundryVTT
        </a>

        <GlitchButton
          onClick={() => navigate(hasExistingState ? '/combat' : '/deck-builder')}
        >
          {hasExistingState ? 'Continue Session' : 'Open Siphon'}
        </GlitchButton>

        {hasExistingState && (
          <button
            onClick={() => navigate('/deck-builder')}
            className="py-3 px-6 text-text-muted hover:text-text-secondary text-sm transition-colors"
          >
            Deck Builder
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="mt-16 text-text-muted text-xs text-center">
        <p>Echo Knight • Dunamancy • The Weave Between</p>
      </div>
    </div>
  );
}
