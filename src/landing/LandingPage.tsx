import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MeshScene } from './MeshScene';
import { NAV_NODES, HUB_NODE_INDEX } from './meshConfig';
import { useTunnelStatus } from './useTunnelStatus';

/** Index of FoundryVTT in NAV_NODES (tunnel-dependent visibility). */
const FOUNDRY_NODE_INDEX = NAV_NODES.findIndex((n) => n.url === 'https://foundry.jamesburns.cc');


export function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sceneRef = useRef<MeshScene | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const navigate = useNavigate();
  const tunnelUp = useTunnelStatus() === 'up';

  // Sync tunnel visibility to MeshScene whenever it changes
  useEffect(() => {
    if (FOUNDRY_NODE_INDEX >= 0) {
      sceneRef.current?.setNavNodeVisible(FOUNDRY_NODE_INDEX, tunnelUp);
    }
  }, [tunnelUp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement!;
    const scene = new MeshScene(canvas, container.clientWidth, container.clientHeight);
    sceneRef.current = scene;
    scene.resize(container.clientWidth, container.clientHeight);

    // FoundryVTT starts hidden until the tunnel probe succeeds
    if (FOUNDRY_NODE_INDEX >= 0) {
      scene.setNavNodeVisible(FOUNDRY_NODE_INDEX, false);
    }


    // Defer reveal animation if loading in portrait on mobile — play after rotating to landscape
    let orientationCleanup: (() => void) | null = null;
    const portraitMobileQuery = window.matchMedia('(orientation: portrait) and (max-width: 768px)');
    if (portraitMobileQuery.matches) {
      scene.deferReveal();
      let revealTimer: ReturnType<typeof setTimeout> | null = null;
      const onChange = (e: MediaQueryListEvent) => {
        if (!e.matches) {
          revealTimer = setTimeout(() => scene.startReveal(), 250);
          portraitMobileQuery.removeEventListener('change', onChange);
        }
      };
      portraitMobileQuery.addEventListener('change', onChange);
      orientationCleanup = () => {
        portraitMobileQuery.removeEventListener('change', onChange);
        if (revealTimer !== null) clearTimeout(revealTimer);
      };
    }

    // Frame callback: update label positions + hover glow via direct DOM manipulation
    scene.setFrameCallback((projections) => {
      const hovered = scene.getHoveredNode();
      for (let i = 0; i < projections.length; i++) {
        const el = labelRefs.current[i];
        if (!el) continue;
        const { screenX, screenY, labelOffsetY, node } = projections[i];
        el.style.transform = `translate(${screenX - 4}px, ${screenY - labelOffsetY}px)`;

        const isHub = i === HUB_NODE_INDEX;
        const isHovered = hovered !== null && node.vertexIndex === hovered.vertexIndex;

        // Hub always visible; other labels hidden until cursor is within range
        el.style.opacity = (isHub || isHovered) ? '1' : '0';

        // Toggle hover glow class
        el.classList.toggle('nav-label-hovered', isHovered);
      }

      // Update cursor style
      canvas.style.cursor = hovered ? 'pointer' : 'default';
    });

    // Mouse tracking
    const onMouseEnter = () => {
      scene.setCursorActive(true);
    };
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      scene.setMouseScreenPos(e.clientX - rect.left, e.clientY - rect.top);
    };
    const onMouseLeave = () => {
      scene.clearMouse();
      canvas.style.cursor = 'default';
    };

    // Click navigation
    const onClick = () => {
      const hovered = scene.getHoveredNode();
      if (!hovered) return;
      if (hovered.external) {
        window.open(hovered.url, '_blank', 'noopener,noreferrer');
      } else if (hovered.url) {
        // Strip /# prefix for hash router (meshConfig URLs are /#/path format)
        const path = hovered.url.replace(/^\/#/, '');
        navigate(path);
      }
    };

    // Touch tracking (mobile)
    const TAP_MAX_DURATION = 300; // ms
    const TAP_MAX_DISTANCE = 20;  // px

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault(); // suppress ghost mouse events
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      touchStartRef.current = { x, y, time: performance.now() };
      scene.setCursorActive(true);
      scene.setMouseScreenPos(x, y);
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      scene.setMouseScreenPos(touch.clientX - rect.left, touch.clientY - rect.top);
    };

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      // Stop ripple/lightning spawning but keep hover active (linger)
      scene.setCursorActive(false);

      // Tap detection: short duration + small distance = navigate
      const start = touchStartRef.current;
      if (start && e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const rect = canvas.getBoundingClientRect();
        const endX = touch.clientX - rect.left;
        const endY = touch.clientY - rect.top;
        const duration = performance.now() - start.time;
        const distance = Math.sqrt((endX - start.x) ** 2 + (endY - start.y) ** 2);

        if (duration < TAP_MAX_DURATION && distance < TAP_MAX_DISTANCE) {
          const hovered = scene.getHoveredNode();
          if (hovered) {
            if (hovered.external) {
              window.open(hovered.url, '_blank', 'noopener,noreferrer');
            } else if (hovered.url) {
              const path = hovered.url.replace(/^\/#/, '');
              navigate(path);
            }
          }
        }
      }
      touchStartRef.current = null;
    };

    // Dev-mode: press ] to cycle fractal shaders
    const onKeyDown = import.meta.env.DEV ? (e: KeyboardEvent) => {
      if (e.key === ']') {
        const name = scene.cycleFractalShader();
        console.log(`Fractal shader: ${name}`);
      }
    } : null;

    canvas.addEventListener('mouseenter', onMouseEnter);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    if (onKeyDown) window.addEventListener('keydown', onKeyDown);

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      scene.resize(width, height);
    });
    observer.observe(container);

    return () => {
      canvas.removeEventListener('mouseenter', onMouseEnter);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      if (onKeyDown) window.removeEventListener('keydown', onKeyDown);
      observer.disconnect();
      orientationCleanup?.();
      scene.dispose();
      sceneRef.current = null;
    };
  }, [navigate]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full landing-canvas" />

      {NAV_NODES.map((node, i) => {
        const isHub = i === HUB_NODE_INDEX;
        const navigable = node.url !== '';
        return (
          <div
            key={node.label}
            ref={(el) => { labelRefs.current[i] = el; }}
            className="nav-label"
          >
            {navigable ? (
              <a
                href={node.url}
                {...(node.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {node.label}
              </a>
            ) : (
              <span>{isHub ? node.label : ''}</span>
            )}
          </div>
        );
      })}

      {/* Portrait orientation overlay — CSS shows only on small portrait screens */}
      <div className="portrait-overlay">
        <svg className="portrait-overlay-icon" width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="12" y="4" width="24" height="40" rx="3" stroke="white" strokeWidth="2" fill="none" />
          <circle cx="24" cy="38" r="2" fill="white" />
        </svg>
        <div className="portrait-overlay-text">Rotate your device to landscape</div>
      </div>
    </div>
  );
}
