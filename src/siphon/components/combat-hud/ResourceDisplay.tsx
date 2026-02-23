import { FocusCounter } from './FocusCounter';
import { EchoPointsBar } from './EchoPointsBar';
import { HitDiceDisplay } from './HitDiceDisplay';
import { SiphonCapacitanceTracker } from './SiphonCapacitanceTracker';

export function ResourceDisplay() {
  return (
    <div className="flex flex-col gap-3 p-3 border border-siphon-border/50 rounded-lg bg-siphon-surface/50">
      <FocusCounter />
      <EchoPointsBar />
      <HitDiceDisplay />
      <SiphonCapacitanceTracker />
    </div>
  );
}
