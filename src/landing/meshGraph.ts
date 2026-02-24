/** Canonical edge key for a pair of vertex indices. */
export function edgeKey(a: number, b: number): number {
  return a < b ? a * 1_000_000 + b : b * 1_000_000 + a;
}

/** Graph data structure built from Delaunay triangulation. */
export interface MeshGraph {
  /** Flat XZ positions [x0, z0, x1, z1, ...] */
  positions: Float32Array;
  /** Total vertex count */
  vertexCount: number;
  /** adjacency[i] = array of vertex indices connected to vertex i */
  adjacency: number[][];
  /** Deduplicated edge list as [vertA, vertB] pairs */
  edges: [number, number][];
  /** Delaunay triangle indices (triplets) */
  triangles: Uint32Array;
}

/**
 * Build a graph from Delaunay triangulation output.
 * Extracts adjacency lists and a deduplicated edge list from triangle indices.
 */
export function buildMeshGraph(
  pts2d: number[],
  delaunayTriangles: Uint32Array,
): MeshGraph {
  const vertexCount = pts2d.length / 2;

  // Store flat XZ positions
  const positions = new Float32Array(pts2d);

  // Build adjacency lists and collect unique edges
  const adjacency: number[][] = Array.from({ length: vertexCount }, () => []);
  const edges: [number, number][] = [];
  const edgeKeys = new Map<number, true>();

  for (let i = 0; i < delaunayTriangles.length; i += 3) {
    const a = delaunayTriangles[i];
    const b = delaunayTriangles[i + 1];
    const c = delaunayTriangles[i + 2];

    for (const [p, q] of [[a, b], [b, c], [c, a]] as [number, number][]) {
      const key = edgeKey(p, q);
      if (!edgeKeys.has(key)) {
        edgeKeys.set(key, true);
        edges.push([p, q]);
        adjacency[p].push(q);
        adjacency[q].push(p);
      }
    }
  }

  return {
    positions,
    vertexCount,
    adjacency,
    edges,
    triangles: delaunayTriangles,
  };
}
