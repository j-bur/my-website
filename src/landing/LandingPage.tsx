import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MeshScene } from './MeshScene';
import { NAV_NODES, HUB_NODE_INDEX } from './meshConfig';

export function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sceneRef = useRef<MeshScene | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement!;
    const scene = new MeshScene(canvas);
    sceneRef.current = scene;
    scene.resize(container.clientWidth, container.clientHeight);

    // Frame callback: update label positions + hover glow via direct DOM manipulation
    scene.setFrameCallback((projections) => {
      const hovered = scene.getHoveredNode();
      for (let i = 0; i < projections.length; i++) {
        const el = labelRefs.current[i];
        if (!el) continue;
        const { screenX, screenY, node } = projections[i];
        el.style.transform = `translate(${screenX - 4}px, ${screenY - 30}px)`;

        const isHub = i === HUB_NODE_INDEX;
        const isHovered = hovered !== null && node.vertexIndex === hovered.vertexIndex;

        // Non-hub labels hidden until cursor is within range
        el.style.opacity = (isHub || isHovered) ? '1' : '0';

        // Toggle hover glow class
        el.classList.toggle('nav-label-hovered', isHovered);
      }

      // Update cursor style
      canvas.style.cursor = hovered ? 'pointer' : 'default';
    });

    // Mouse tracking
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
      } else {
        // Strip /# prefix for hash router (meshConfig URLs are /#/path format)
        const path = hovered.url.replace(/^\/#/, '');
        navigate(path);
      }
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);
    canvas.addEventListener('click', onClick);

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      scene.resize(width, height);
    });
    observer.observe(container);

    return () => {
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      canvas.removeEventListener('click', onClick);
      observer.disconnect();
      scene.dispose();
      sceneRef.current = null;
    };
  }, [navigate]);

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
