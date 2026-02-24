# Phase 1: Integrated Navigation Nodes

## Goal

Replace CSS-positioned HTML overlay anchors with navigation nodes that are actual mesh vertices, placed via BFS hop distance from a central hub node. Labels are projected from 3D positions and follow the wave animation.

## Depends on: Phase 0

---

## Entry Conditions

- [ ] Phase 0 exit conditions met
- [ ] `MeshScene.getGraph()` returns a valid `MeshGraph`
- [ ] `heightAt()` in TypeScript is working

## Exit Conditions

- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] Old CSS-positioned anchor overlays are removed
- [ ] FoundryVTT hub node is a mesh vertex near center, rendered as a brighter/larger point
- [ ] Gauldurg nav node is a mesh vertex 8-25 hops from hub, in the upper portion of the screen
- [ ] Nav node labels are HTML elements positioned via 3D projection, following wave motion
- [ ] Nav nodes are spaced apart (not clustered) and in visually reasonable positions
- [ ] Landing page loads without errors

---

## Tasks

### 1. Update `src/landing/meshConfig.ts`

- Remove `AnchorNode` interface and `ANCHORS` array
- Add:

```typescript
export interface NavNodeDef {
  label: string;
  url: string;
  external: boolean;
}

export const NAV_NODES: NavNodeDef[] = [
  { label: 'FoundryVTT', url: 'https://foundry.jamesburns.cc', external: true },
  { label: 'Gauldurg', url: '/#/deck-builder', external: false },
];

export const HUB_NODE_INDEX = 0; // FoundryVTT is always the hub
```

- Add placement config constants:

```typescript
export const NAV_PLACEMENT = {
  minHops: 8,
  maxHops: 25,
  minAngularSpread: Math.PI / 3, // 60 degrees minimum between non-hub nodes
};
```

### 2. Create `src/landing/navNodes.ts`

```typescript
export interface PlacedNavNode extends NavNodeDef {
  vertexIndex: number;
  baseX: number;
  baseZ: number;
}
```

- `placeNavNodes(graph: MeshGraph, hub: NavNodeDef, others: NavNodeDef[], options): PlacedNavNode[]`
  1. Find vertex nearest to world `(0, 0)` in XZ as hub -> set hub's `vertexIndex`
  2. BFS outward from hub vertex, record hop distances
  3. For each other nav node:
     - Collect candidate vertices at `[minHops, maxHops]` distance
     - Filter to upper mesh portion (negative Z values in world space -> upper screen since camera looks from +Z toward -Z)
     - Score candidates by: (a) distance from already-placed nodes in XZ, (b) angular spread from hub relative to other placed nodes
     - Select highest-scoring candidate
  4. Return all placed nodes (hub first)

- `projectNavNodes(nodes: PlacedNavNode[], time: number, camera: THREE.PerspectiveCamera, width: number, height: number): NavProjection[]`
  - For each node: compute `y = heightAt(baseX, baseZ, time)`, create `THREE.Vector3(baseX, y, baseZ)`, project with camera, convert NDC to pixel coords
  - Return `{ node, screenX, screenY }[]`

### 3. Add nav node vertex attribute to `MeshScene.ts`

- After placing nav nodes, create a `Float32Array(vertexCount)` initialized to `0.0`
- Set `1.0` at each nav node's vertex index
- Add as `aIsNavNode` attribute to the **point geometry**
- In the point vertex shader, read `attribute float aIsNavNode`:
  - If `aIsNavNode > 0.5`: increase `gl_PointSize` by 4-6px, boost alpha to ~0.9, optionally add slow pulse (`sin(uTime * 2.0)`)
  - Otherwise: existing behavior

### 4. Add frame callback to `MeshScene.ts`

```typescript
private frameCallback: ((projections: NavProjection[], time: number) => void) | null = null;
private placedNavNodes: PlacedNavNode[] = [];
private canvasWidth = 0;
private canvasHeight = 0;

setFrameCallback(cb: (projections: NavProjection[], time: number) => void): void {
  this.frameCallback = cb;
}

// In animate():
if (this.frameCallback && this.placedNavNodes.length > 0) {
  const projections = projectNavNodes(this.placedNavNodes, t, this.camera, this.canvasWidth, this.canvasHeight);
  this.frameCallback(projections, t);
}
```

Update `resize()` to store `canvasWidth` and `canvasHeight`.

### 5. Rewrite nav label rendering in `LandingPage.tsx`

- Remove the static `ANCHORS.map(...)` JSX
- After `MeshScene` init:
  - Access `scene.getGraph()`, call `placeNavNodes(...)`, pass result to `scene.setNavNodes(...)`
- Create `useRef<HTMLDivElement[]>` for label DOM elements (one per nav node)
- Set frame callback that directly manipulates each label's `style.transform` (bypass React render cycle):
  ```typescript
  labelRefs.current[i].style.transform = `translate(${screenX}px, ${screenY - 24}px)`;
  ```
- Render label elements with `position: absolute`, `pointer-events: none`, styled as uppercase monospace white text (matching current `.anchor` styling)
- Nav node dot rendered by the shader (not CSS) -- remove `.anchor-dot` span

### Files to Create

- `src/landing/navNodes.ts`

### Files to Modify

- `src/landing/meshConfig.ts` -- replace ANCHORS with NAV_NODES
- `src/landing/MeshScene.ts` -- add aIsNavNode attribute, frame callback, nav node storage
- `src/landing/LandingPage.tsx` -- rewrite nav label rendering, remove CSS overlays
- `src/landing/meshConfig.ts` shaders -- point vertex shader reads `aIsNavNode`

---

## Out of Scope

- DO NOT implement cursor-to-node connection line (Phase 3)
- DO NOT implement click navigation via canvas (Phase 3 -- labels are non-interactive for now, they're just visual)
- DO NOT implement path highlighting (Phase 2)
- DO NOT modify wave simulation

## Key References

- `src/landing/meshConfig.ts` lines 31-53 (current anchor definitions)
- `src/landing/LandingPage.tsx` lines 32-43 (current anchor rendering)
- `src/landing/MeshScene.ts` lines 182-186 (point geometry setup)
