import { useEffect, useRef } from 'react';
import { MeshScene } from './MeshScene';
import { ANCHORS } from './meshConfig';

export function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement!;
    const scene = new MeshScene(canvas);
    scene.resize(container.clientWidth, container.clientHeight);

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

      {ANCHORS.map((anchor) => (
        <a
          key={anchor.label}
          href={anchor.url}
          className="anchor"
          style={{ position: 'absolute', ...anchor.style }}
          {...(anchor.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          <span className="anchor-dot" />
          {anchor.label}
        </a>
      ))}
    </div>
  );
}
