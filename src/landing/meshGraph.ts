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
 * Triangles with any edge longer than maxEdgeLength are discarded to remove
 * convex hull artifacts at the mesh boundary.
 */
export function buildMeshGraph(
  pts2d: number[],
  delaunayTriangles: Uint32Array,
  maxEdgeLength: number,
): MeshGraph {
  const vertexCount = pts2d.length / 2;
  const maxLenSq = maxEdgeLength * maxEdgeLength;

  // Store flat XZ positions
  const positions = new Float32Array(pts2d);

  // Build adjacency lists and collect unique edges
  const adjacency: number[][] = Array.from({ length: vertexCount }, () => []);
  const edges: [number, number][] = [];
  const edgeKeys = new Map<number, true>();
  const filteredTris: number[] = [];

  for (let i = 0; i < delaunayTriangles.length; i += 3) {
    const a = delaunayTriangles[i];
    const b = delaunayTriangles[i + 1];
    const c = delaunayTriangles[i + 2];

    // Skip triangle if any edge exceeds max length
    const pairs: [number, number][] = [[a, b], [b, c], [c, a]];
    let tooLong = false;
    for (const [p, q] of pairs) {
      const dx = pts2d[p * 2] - pts2d[q * 2];
      const dz = pts2d[p * 2 + 1] - pts2d[q * 2 + 1];
      if (dx * dx + dz * dz > maxLenSq) {
        tooLong = true;
        break;
      }
    }
    if (tooLong) continue;

    filteredTris.push(a, b, c);
    for (const [p, q] of pairs) {
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
    triangles: new Uint32Array(filteredTris),
  };
}
