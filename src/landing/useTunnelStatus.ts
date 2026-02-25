import { useEffect, useState } from 'react';

const PROBE_URL = 'https://foundry.jamesburns.cc/icons/vtt.png';
const POLL_INTERVAL = 60_000; // re-check every 60s
const TIMEOUT = 5_000;        // give up after 5s

export type TunnelStatus = 'up' | 'down' | 'checking';

export function useTunnelStatus(): TunnelStatus {
  const [status, setStatus] = useState<TunnelStatus>('checking');

  useEffect(() => {
    let cancelled = false;

    function probe() {
      const img = new Image();
      const timer = setTimeout(() => {
        img.onload = img.onerror = null;
        if (!cancelled) setStatus('down');
      }, TIMEOUT);

      img.onload = () => {
        clearTimeout(timer);
        if (!cancelled) setStatus('up');
      };
      img.onerror = () => {
        clearTimeout(timer);
        if (!cancelled) setStatus('down');
      };

      // Cache-bust so we always get a fresh check
      img.src = `${PROBE_URL}?_t=${Date.now()}`;
    }

    probe();
    const interval = setInterval(probe, POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return status;
}
