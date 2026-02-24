import { useEffect, useRef } from 'react';
import { MeshScene } from './MeshScene';
import { NAV_NODES } from './meshConfig';

export function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement!;
    const scene = new MeshScene(canvas);
    scene.resize(container.clientWidth, container.clientHeight);

    // Frame callback: update label positions via direct DOM manipulation (no React re-render)
    scene.setFrameCallback((projections) => {
      for (let i = 0; i < projections.length; i++) {
        const el = labelRefs.current[i];
        if (!el) continue;
        const { screenX, screenY } = projections[i];
        el.style.transform = `translate(${screenX}px, ${screenY - 24}px)`;
      }
    });

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      scene.resize(width, height);
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      scene.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full" />

      {NAV_NODES.map((node, i) => (
        <div
          key={node.label}
          ref={(el) => { labelRefs.current[i] = el; }}
          className="nav-label"
        >
          <a
            href={node.url}
            {...(node.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {node.label}
          </a>
        </div>
      ))}
    </div>
  );
}
