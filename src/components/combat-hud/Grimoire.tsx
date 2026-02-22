import { useNavigate } from 'react-router-dom';
import { FEATURE_MAP } from '../../data/featureConstants';

export function Grimoire() {
  const navigate = useNavigate();
  const featureCount = FEATURE_MAP.size;

  return (
    <div className="mt-auto flex flex-col items-center">
      <button
        onClick={() => navigate('/deck-builder')}
        className="grimoire group relative cursor-pointer border-0 bg-transparent p-0"
        aria-label={`Open Siphon Features (${featureCount} features)`}
        title="Browse Siphon Features"
      >
        {/* Book body */}
        <div
          className="relative overflow-hidden rounded-r-sm rounded-l-none transition-all duration-300 group-hover:scale-[1.03]"
          style={{
            width: 200,
            height: 280,
            background: 'linear-gradient(135deg, #2a1f2e 0%, #1e1524 40%, #261a2d 70%, #201828 100%)',
            boxShadow: '2px 4px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
            borderRight: '3px solid rgba(200, 190, 180, 0.15)',
          }}
        >
          {/* Spine */}
          <div
            className="absolute top-0 left-0 h-full"
            style={{
              width: 16,
              background: 'linear-gradient(90deg, #1a1220 0%, #241830 50%, #1e1428 100%)',
              borderRight: '1px solid rgba(255,187,51,0.12)',
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 10px,
                rgba(255,187,51,0.06) 10px,
                rgba(255,187,51,0.06) 11px
              )`,
            }}
          />

          {/* Page edges (right side) */}
          <div
            className="absolute top-[4px] right-0 bottom-[4px]"
            style={{
              width: 4,
              background: 'repeating-linear-gradient(180deg, rgba(200,190,170,0.2) 0px, rgba(200,190,170,0.1) 1px, rgba(200,190,170,0.2) 2px)',
            }}
          />

          {/* Decorative border on cover */}
          <div
            className="absolute"
            style={{
              top: 14,
              left: 26,
              right: 14,
              bottom: 14,
              border: '1px solid rgba(255,187,51,0.15)',
              borderRadius: 2,
            }}
          />

          {/* Inner decorative border */}
          <div
            className="absolute"
            style={{
              top: 22,
              left: 34,
              right: 22,
              bottom: 22,
              border: '1px solid rgba(255,187,51,0.08)',
              borderRadius: 1,
            }}
          />

          {/* Title text on cover */}
          <div
            className="absolute left-0 right-0 flex flex-col items-center"
            style={{ top: 40, paddingLeft: 16 }}
          >
            <span
              className="text-[11px] font-semibold tracking-[0.15em] uppercase"
              style={{ color: 'rgba(255,187,51,0.55)' }}
            >
              Siphon
            </span>
            <span
              className="text-[11px] font-semibold tracking-[0.15em] uppercase"
              style={{ color: 'rgba(255,187,51,0.55)' }}
            >
              Features
            </span>
          </div>

          {/* Center seal with feature count */}
          <div
            className="absolute flex items-center justify-center"
            style={{
              top: '55%',
              left: 'calc(50% + 8px)',
              transform: 'translate(-50%, -50%)',
              width: 52,
              height: 52,
              borderRadius: '50%',
              border: '2px solid rgba(255,187,51,0.3)',
              background: 'radial-gradient(circle, rgba(255,187,51,0.08) 0%, transparent 70%)',
            }}
          >
            <span
              className="text-base font-bold"
              style={{ color: 'rgba(255,187,51,0.7)' }}
            >
              {featureCount}
            </span>
          </div>

          {/* Decorative line below seal */}
          <div
            className="absolute left-1/2"
            style={{
              bottom: 40,
              transform: 'translateX(calc(-50% + 8px))',
              width: 60,
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(255,187,51,0.2), transparent)',
            }}
          />
        </div>

        {/* Hover glow overlay */}
        <div
          className="pointer-events-none absolute inset-0 rounded-r-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            boxShadow: '0 0 20px rgba(255,187,51,0.25), 0 0 6px rgba(255,187,51,0.15)',
          }}
        />
      </button>
    </div>
  );
}
