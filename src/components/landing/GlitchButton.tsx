import type { ReactNode } from 'react';

interface GlitchButtonProps {
  onClick: () => void;
  children: ReactNode;
  className?: string;
}

export function GlitchButton({ onClick, children, className = '' }: GlitchButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative py-4 px-8
        text-siphon-accent font-medium tracking-wider
        bg-siphon-surface border-2 border-siphon-accent rounded-lg
        transition-all duration-200
        hover:bg-siphon-accent hover:text-siphon-bg
        hover:shadow-[0_0_20px_rgba(0,212,170,0.4)]
        glitch-hover
        ${className}
      `}
    >
      {/* Glitch layers for chromatic effect */}
      <span className="relative z-10">{children}</span>

      {/* Decorative corner elements */}
      <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-siphon-accent" />
      <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-siphon-accent" />
      <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-siphon-accent" />
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-siphon-accent" />
    </button>
  );
}
