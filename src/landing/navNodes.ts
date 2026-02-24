import * as THREE from 'three';
import type { NavNodeDef } from './meshConfig';
import { NAV_PLACEMENT, HUB_NODE_INDEX } from './meshConfig';
import type { MeshGraph } from './meshGraph';

export interface PlacedNavNode extends NavNodeDef {
  vertexIndex: number;
  baseX: number;
  baseZ: number;
}

export interface NavProjection {
  node: PlacedNavNode;
  screenX: number;
  screenY: number;
}

/**
 * Place nav nodes on mesh vertices using BFS from a central hub.
 * Hub is placed at the vertex nearest to world origin (0,0) in XZ.
 * Other nodes are placed at BFS hop distance [minHops, maxHops] from hub,
 * filtered to the upper screen region and scored by angular spread.
 */
export function placeNavNodes(
  graph: MeshGraph,
  navDefs: NavNodeDef[],
): PlacedNavNode[] {
  const { positions, vertexCount, adjacency } = graph;
  const { minHops, maxHops, minAngularSpread } = NAV_PLACEMENT;

  // Find vertex nearest to world (0, 0) in XZ for the hub
  let hubVertex = 0;
  let hubDistSq = Infinity;
  for (let i = 0; i < vertexCount; i++) {
    const x = positions[i * 2];
    const z = positions[i * 2 + 1];
    const dSq = x * x + z * z;
    if (dSq < hubDistSq) {
      hubDistSq = dSq;
      hubVertex = i;
    }
  }

  // BFS from hub to compute hop distances
  const hopDist = new Int32Array(vertexCount).fill(-1);
  hopDist[hubVertex] = 0;
  const queue: number[] = [hubVertex];
  let head = 0;
  while (head < queue.length) {
    const v = queue[head++];
    const d = hopDist[v];
    if (d >= maxHops) continue; // no need to go further
    for (const neighbor of adjacency[v]) {
      if (hopDist[neighbor] === -1) {
        hopDist[neighbor] = d + 1;
        queue.push(neighbor);
      }
    }
  }

  const hubDef = navDefs[HUB_NODE_INDEX];
  const placed: PlacedNavNode[] = [
    {
      ...hubDef,
      vertexIndex: hubVertex,
      baseX: positions[hubVertex * 2],
      baseZ: positions[hubVertex * 2 + 1],
    },
  ];

  const hubX = positions[hubVertex * 2];
  const hubZ = positions[hubVertex * 2 + 1];

  // Place remaining nav nodes
  const otherDefs = navDefs.filter((_, i) => i !== HUB_NODE_INDEX);

  for (const def of otherDefs) {
    // Collect candidate vertices within hop range
    const candidates: number[] = [];
    for (let i = 0; i < vertexCount; i++) {
      const hops = hopDist[i];
      if (hops < minHops || hops > maxHops) continue;
      // Filter to upper mesh portion (negative Z = upper screen since camera looks from +Z toward -Z)
      const z = positions[i * 2 + 1];
      if (z >= 0) continue; // skip lower half
      candidates.push(i);
    }

    if (candidates.length === 0) continue;

    // Score candidates
    let bestVertex = candidates[0];
    let bestScore = -Infinity;

    // Angles of already-placed non-hub nodes relative to hub
    const placedAngles: number[] = [];
    for (let p = 1; p < placed.length; p++) {
      placedAngles.push(
        Math.atan2(placed[p].baseZ - hubZ, placed[p].baseX - hubX),
      );
    }

    for (const ci of candidates) {
      const cx = positions[ci * 2];
      const cz = positions[ci * 2 + 1];

      // Score by distance from already-placed nodes in XZ
      let minDistToPlaced = Infinity;
      for (const p of placed) {
        const dx = cx - p.baseX;
        const dz = cz - p.baseZ;
        minDistToPlaced = Math.min(minDistToPlaced, Math.sqrt(dx * dx + dz * dz));
      }

      // Score by angular spread from hub relative to other placed nodes
      const angle = Math.atan2(cz - hubZ, cx - hubX);
      let minAngleDiff = Math.PI; // max possible
      for (const pa of placedAngles) {
        let diff = Math.abs(angle - pa);
        if (diff > Math.PI) diff = 2 * Math.PI - diff;
        minAngleDiff = Math.min(minAngleDiff, diff);
      }

      // Skip if too close angularly to an existing node
      if (placedAngles.length > 0 && minAngleDiff < minAngularSpread) continue;

      // Combined score: favor distance separation and angular spread
      const score = minDistToPlaced * 0.5 + minAngleDiff * 200;

      if (score > bestScore) {
        bestScore = score;
        bestVertex = ci;
      }
    }

    placed.push({
      ...def,
      vertexIndex: bestVertex,
      baseX: positions[bestVertex * 2],
      baseZ: positions[bestVertex * 2 + 1],
    });
  }

  return placed;
}

// Reusable vector to avoid per-frame allocation
const _vec3 = new THREE.Vector3();

/**
 * Project placed nav nodes from 3D world space to screen pixel coordinates.
 * Accepts pre-computed Y heights (sampled from the GPU height map texture)
 * so the labels track the actual displaced mesh position exactly.
 */
export function projectNavNodes(
  nodes: PlacedNavNode[],
  heights: ArrayLike<number>,
  camera: THREE.PerspectiveCamera,
  width: number,
  height: number,
): NavProjection[] {
  const projections: NavProjection[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    _vec3.set(node.baseX, heights[i], node.baseZ);
    _vec3.project(camera);
    // NDC to pixel coords
    const screenX = ((_vec3.x + 1) / 2) * width;
    const screenY = ((1 - _vec3.y) / 2) * height;
    projections.push({ node, screenX, screenY });
  }
  return projections;
}
