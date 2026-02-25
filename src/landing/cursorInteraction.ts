import type { MeshGraph } from './meshGraph';
import { buildSpatialHash, findNearestVertex, type SpatialHash } from './meshGraph';

/** BFS max depth for lightning propagation. */
const MAX_HOPS = 6;

/** Per-frame multiplicative decay (energy *= DECAY each frame). */
const DECAY = 0.92;

/** Per-hop energy falloff: energy at hop h = base * HOP_FALLOFF^h. */
const HOP_FALLOFF = 0.55;

/** Minimum cursor speed (world units/sec) to trigger lightning. */
const SPEED_THRESHOLD = 50;

/** Energy threshold below which we consider a vertex inactive. */
const ENERGY_EPSILON = 0.01;

/**
 * Graph-based lightning effect: BFS energy dispersal from the nearest
 * mesh vertex to the cursor. Energy propagates along graph edges,
 * creating branching bright paths that decay rapidly.
 */
export class LightningEffect {
  private energy: Float32Array;
  private edgeEnergy: Float32Array;
  private graph: MeshGraph;
  private spatialHash: SpatialHash;
  constructor(graph: MeshGraph) {
    this.graph = graph;
    this.energy = new Float32Array(graph.vertexCount);
    // 2 vertices per edge (LineSegments format)
    this.edgeEnergy = new Float32Array(graph.edges.length * 2);
    this.spatialHash = buildSpatialHash(graph.positions, graph.vertexCount, 80);
  }

  /**
   * Called each frame. Decays existing energy and optionally injects
   * new energy via BFS from the nearest vertex to the cursor.
   * Returns true if any energy > epsilon (signals GPU upload needed).
   */
  update(
    cursorX: number,
    cursorZ: number,
    cursorSpeed: number,
    cursorActive: boolean,
  ): boolean {
    // Decay all vertex energy
    let anyActive = false;
    for (let i = 0; i < this.energy.length; i++) {
      this.energy[i] *= DECAY;
      if (this.energy[i] < ENERGY_EPSILON) {
        this.energy[i] = 0;
      } else {
        anyActive = true;
      }
    }

    // Inject energy via BFS if cursor is active and fast enough
    if (cursorActive && cursorSpeed > SPEED_THRESHOLD) {
      const nearest = findNearestVertex(
        this.spatialHash,
        this.graph.positions,
        cursorX,
        cursorZ,
      );
      if (nearest >= 0) {
        const baseEnergy = Math.min(cursorSpeed * 0.005, 1.0);
        this.bfsInject(nearest, baseEnergy);
        anyActive = true;
      }
    }

    // Map vertex energy to edge energy
    if (anyActive) {
      const edges = this.graph.edges;
      for (let i = 0; i < edges.length; i++) {
        const [a, b] = edges[i];
        const e = Math.max(this.energy[a], this.energy[b]);
        this.edgeEnergy[i * 2] = e;
        this.edgeEnergy[i * 2 + 1] = e;
      }
    } else {
      // Fast zero when nothing is active
      this.edgeEnergy.fill(0);
    }

    return anyActive;
  }

  /** BFS from source vertex, injecting decaying energy at each hop. */
  private bfsInject(source: number, baseEnergy: number): void {
    const adj = this.graph.adjacency;

    // BFS queue: [vertexIndex, hopDepth]
    const queue: [number, number][] = [[source, 0]];
    const visited = new Set<number>();
    visited.add(source);
    this.energy[source] = Math.max(this.energy[source], baseEnergy);

    let head = 0;
    while (head < queue.length) {
      const [vertex, depth] = queue[head++];
      if (depth >= MAX_HOPS) continue;

      const nextDepth = depth + 1;
      const hopEnergy = baseEnergy * Math.pow(HOP_FALLOFF, nextDepth);
      if (hopEnergy < ENERGY_EPSILON) continue;

      for (const neighbor of adj[vertex]) {
        if (visited.has(neighbor)) continue;
        visited.add(neighbor);
        this.energy[neighbor] = Math.max(this.energy[neighbor], hopEnergy);
        queue.push([neighbor, nextDepth]);
      }
    }
  }

  /** Per-vertex energy buffer (for point aEnergy attribute). */
  getVertexEnergy(): Float32Array {
    return this.energy;
  }

  /** Per-edge-vertex energy buffer (for edge aEnergy attribute). */
  getEdgeEnergy(): Float32Array {
    return this.edgeEnergy;
  }
}
